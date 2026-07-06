"""Gemini client — grammar correction, summarization, sentiment, consistency.

Uses the google-generativeai SDK. The model name comes from settings
(GEMINI_MODEL, default gemini-2.0-flash) because Google retires older names such
as the original gemini-1.5-flash referenced in COMMANDO.md.

If GEMINI_API_KEY is not configured (unset or the placeholder
"your-gemini-api-key"), the functions return mock responses instead of calling
the API so the full pipeline can be tested without a real key
(see BUILD_GUIDE_v2 Phase 3, Adjustment 2).
"""
import asyncio

import google.generativeai as genai

from config import logger, settings

MODEL_NAME = settings.gemini_model

# A key is "configured" only if it is set and not the placeholder value.
_KEY_CONFIGURED = bool(settings.gemini_api_key) and settings.gemini_api_key != "your-gemini-api-key"

if _KEY_CONFIGURED:
    genai.configure(api_key=settings.gemini_api_key)
    _model = genai.GenerativeModel(MODEL_NAME)
else:
    _model = None
    logger.warning(
        "GEMINI_API_KEY not configured. Gemini client will return mock responses."
    )


async def _generate(prompt: str) -> str:
    """Run a synchronous Gemini call off the event loop and return trimmed text."""
    response = await asyncio.to_thread(_model.generate_content, prompt)
    return response.text.strip()


async def correct_grammar(text: str) -> str:
    """Correct grammar and spelling without changing meaning."""
    if not _KEY_CONFIGURED:
        logger.warning("Gemini mock: correct_grammar returning original text.")
        return text
    prompt = (
        "Correct the grammar and spelling in the following patient review.\n"
        "Do not change the meaning. Return only the corrected text.\n"
        f"Text: {text}"
    )
    try:
        return await _generate(prompt)
    except Exception as exc:  # noqa: BLE001 - graceful fallback on any Gemini error
        logger.error("Gemini correct_grammar failed: %s", exc)
        return text


async def summarize_review(text: str) -> str:
    """Summarize the review in 1-2 sentences."""
    if not _KEY_CONFIGURED:
        logger.warning("Gemini mock: summarize_review returning placeholder.")
        return "Review summary pending API key configuration"
    prompt = (
        "Summarize the following patient review in 1-2 sentences.\n"
        "Capture the key points about the doctor and consultation quality.\n"
        f"Text: {text}"
    )
    try:
        return await _generate(prompt)
    except Exception as exc:  # noqa: BLE001
        logger.error("Gemini summarize_review failed: %s", exc)
        return "Review processing failed"


async def analyze_sentiment(text: str) -> str:
    """Return exactly one of POSITIVE, NEUTRAL, or NEGATIVE."""
    if not _KEY_CONFIGURED:
        logger.warning("Gemini mock: analyze_sentiment returning NEUTRAL.")
        return "NEUTRAL"
    prompt = (
        "Analyze the sentiment of the following patient review.\n"
        "Respond with exactly one word: POSITIVE, NEUTRAL, or NEGATIVE.\n"
        f"Text: {text}"
    )
    try:
        result = (await _generate(prompt)).upper()
        if result in ("POSITIVE", "NEUTRAL", "NEGATIVE"):
            return result
        logger.warning("Gemini returned unexpected sentiment '%s'; using NEUTRAL.", result)
        return "NEUTRAL"
    except Exception as exc:  # noqa: BLE001
        logger.error("Gemini analyze_sentiment failed: %s", exc)
        return "NEUTRAL"


async def validate_consistency(text: str) -> bool:
    """Return True if the review reads as consistent/logical, else False."""
    if not _KEY_CONFIGURED:
        logger.warning("Gemini mock: validate_consistency returning True.")
        return True
    prompt = (
        "Check if the following patient review text is consistent and\n"
        "makes logical sense. Respond with exactly: CONSISTENT or INCONSISTENT.\n"
        f"Text: {text}"
    )
    try:
        result = (await _generate(prompt)).upper()
        return "INCONSISTENT" not in result
    except Exception as exc:  # noqa: BLE001
        logger.error("Gemini validate_consistency failed: %s", exc)
        return True
