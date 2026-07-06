"""Spring Boot client — updates reviews and looks them up by OmniDim call id.

Spring Boot wraps every response as {"success", "message", "data": {...}}
(BUILD_GUIDE_v2 Phase 3, Adjustment 0), so the review payload is read from the
`data` field. update_review treats a 400 as "review no longer PENDING" — it logs
and returns False rather than retrying or crashing the webhook.
"""
from typing import Optional

import httpx

from config import logger, settings

_TIMEOUT = 15.0


async def update_review(
    review_id: int,
    cleaned_review: str,
    summary: str,
    sentiment: str,
    rating: Optional[int] = None,
    recovered: Optional[str] = None,
    recommend_doctor: Optional[str] = None,
    patient_feedback: Optional[str] = None,
    improvement_suggestions: Optional[str] = None,
) -> bool:
    """PUT the processed review back to Spring Boot. Omits None fields.

    Returns True on success, False on failure (including a 400 immutability
    rejection, which is expected when the review was already completed).
    """
    url = f"{settings.spring_boot_url}/api/reviews/{review_id}/process"
    body = {
        "cleanedReview": cleaned_review,
        "summary": summary,
        "sentiment": sentiment,
        "rating": rating,
        "recovered": recovered,
        "recommendDoctor": recommend_doctor,
        "patientFeedback": patient_feedback,
        "improvementSuggestions": improvement_suggestions,
    }
    # Omit fields that are None so we never overwrite existing values with null.
    body = {key: value for key, value in body.items() if value is not None}

    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            response = await client.put(url, json=body)
        if response.status_code == 400:
            logger.warning(
                "Review %s not PENDING (400) — already processed or converted. "
                "Skipping update.",
                review_id,
            )
            return False
        response.raise_for_status()
        logger.info("Review %s updated to COMPLETED via Spring Boot.", review_id)
        return True
    except httpx.HTTPStatusError as exc:
        logger.error(
            "Spring Boot update_review failed for %s: %s %s",
            review_id,
            exc.response.status_code,
            exc.response.text,
        )
        return False
    except httpx.HTTPError as exc:
        logger.error("Spring Boot update_review request error for %s: %s", review_id, exc)
        return False


async def get_review_by_omnidim_call_id(call_id: str) -> Optional[dict]:
    """GET the review matching an OmniDim call id. Returns the `data` object or None."""
    url = f"{settings.spring_boot_url}/api/reviews/by-call-id/{call_id}"
    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            response = await client.get(url)
        response.raise_for_status()
        payload = response.json()
        return payload.get("data")
    except httpx.HTTPStatusError as exc:
        logger.error(
            "Spring Boot get_review_by_omnidim_call_id failed for '%s': %s %s",
            call_id,
            exc.response.status_code,
            exc.response.text,
        )
        return None
    except httpx.HTTPError as exc:
        logger.error(
            "Spring Boot get_review_by_omnidim_call_id request error for '%s': %s",
            call_id,
            exc,
        )
        return None
