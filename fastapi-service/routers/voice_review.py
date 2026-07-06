"""Manual review-processing router (COMMANDO.md Section 13, routers/voice_review.py).

POST /api/process-review runs raw text through Gemini and returns the cleaned
review, summary, and sentiment. Kept for manual/future use — it is NOT called
automatically for text reviews (those are COMPLETED immediately by Spring Boot).
"""
from fastapi import APIRouter

from clients import gemini_client
from config import logger
from schemas import ReviewProcessRequest, ReviewProcessResponse

router = APIRouter(tags=["process-review"])


@router.post("/api/process-review", response_model=ReviewProcessResponse)
async def process_review(request: ReviewProcessRequest):
    """Grammar-correct, summarize, and score the sentiment of raw review text."""
    logger.info("Processing review %s via /api/process-review.", request.review_id)

    cleaned = await gemini_client.correct_grammar(request.raw_text)
    summary = await gemini_client.summarize_review(cleaned)
    sentiment = await gemini_client.analyze_sentiment(cleaned)

    return ReviewProcessResponse(
        cleaned_review=cleaned,
        summary=summary,
        sentiment=sentiment,
    )
