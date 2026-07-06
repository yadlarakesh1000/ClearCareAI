"""OmniDim webhook router (COMMANDO.md Section 13, routers/webhook.py).

Flow: receive webhook -> look up review by call_id via Spring Boot -> extract
variables (treat "NA" as null) -> Gemini grammar/summary/sentiment -> push the
processed review back to Spring Boot.
"""
from typing import Optional

from fastapi import APIRouter, HTTPException

from clients import gemini_client, spring_client
from config import logger
from schemas import OmniDimWebhookPayload

router = APIRouter(tags=["webhook"])


def _clean(value) -> Optional[str]:
    """Return a stripped string, or None for empty/NA values."""
    if value is None:
        return None
    text = str(value).strip()
    if not text or text.upper() == "NA":
        return None
    return text


def _to_int(value) -> Optional[int]:
    """Parse an integer rating, treating NA/blank/non-numeric as None."""
    cleaned = _clean(value)
    if cleaned is None:
        return None
    try:
        return int(cleaned)
    except ValueError:
        logger.warning("Could not parse rating '%s' as int; ignoring.", cleaned)
        return None


@router.post("/webhook/omnidim")
async def omnidim_webhook(payload: OmniDimWebhookPayload):
    """Receive an OmniDim call-completed webhook and process the review."""
    logger.info(
        "Received OmniDim webhook: call_id=%s status=%s duration=%ss",
        payload.call_id,
        payload.status,
        payload.duration_seconds,
    )

    # 1. Find the review this call belongs to.
    review = await spring_client.get_review_by_omnidim_call_id(payload.call_id)
    if not review:
        logger.error("No review found for call_id '%s'.", payload.call_id)
        raise HTTPException(
            status_code=404,
            detail=f"No review found for call_id '{payload.call_id}'",
        )
    review_id = review.get("id")

    # 2. Extract transcript and OmniDim variables (NA -> null).
    transcript = payload.transcript or ""
    variables = payload.extracted_variables or {}
    rating = _to_int(variables.get("rating"))
    recovered = _clean(variables.get("recovered"))
    recommend_doctor = _clean(variables.get("recommend_doctor"))
    patient_feedback = _clean(variables.get("patient_feedback"))
    improvement_suggestions = _clean(variables.get("improvement_suggestions"))

    # 3. Process the transcript through Gemini.
    cleaned_review = await gemini_client.correct_grammar(transcript)
    summary = await gemini_client.summarize_review(cleaned_review)
    sentiment = await gemini_client.analyze_sentiment(cleaned_review)

    # 4. Push processed data back to Spring Boot.
    updated = await spring_client.update_review(
        review_id=review_id,
        cleaned_review=cleaned_review,
        summary=summary,
        sentiment=sentiment,
        rating=rating,
        recovered=recovered,
        recommend_doctor=recommend_doctor,
        patient_feedback=patient_feedback,
        improvement_suggestions=improvement_suggestions,
    )

    if not updated:
        # Review already completed/converted, or Spring Boot rejected it.
        # Acknowledge the webhook without failing so OmniDim doesn't retry.
        logger.warning("Review %s was not updated (already processed or error).", review_id)
        return {"success": False, "message": "Review not updated", "reviewId": review_id}

    return {"success": True, "message": "Review processed", "reviewId": review_id}
