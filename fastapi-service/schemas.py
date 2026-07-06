"""Pydantic models for request/response validation (COMMANDO.md Section 13)."""
from typing import Optional

from pydantic import BaseModel


class OmniDimWebhookPayload(BaseModel):
    """Payload OmniDim POSTs to the webhook when a voice call completes."""

    call_id: str
    status: str
    transcript: str
    summary: str
    sentiment: str
    duration_seconds: int
    extracted_variables: dict
    # extracted_variables contains:
    #   rating: str (1-5 or "NA")
    #   recovered: str ("TRUE" / "PARTIAL" / "FALSE" / "NA")
    #   recommend_doctor: str ("TRUE" / "PARTIAL" / "FALSE" / "NA")
    #   patient_feedback: str (detailed text or "NA")
    #   improvement_suggestions: str (text or "NA")


class ReviewProcessRequest(BaseModel):
    """Request for the manual /api/process-review endpoint."""

    review_id: int
    raw_text: str


class ReviewProcessResponse(BaseModel):
    """Response from the /api/process-review endpoint."""

    cleaned_review: str
    summary: str
    sentiment: str


class ReviewUpdateRequest(BaseModel):
    """Body sent to Spring Boot PUT /api/reviews/{id}/process."""

    cleaned_review: str
    summary: str
    sentiment: str
    rating: Optional[int] = None
    recovered: Optional[str] = None
    recommend_doctor: Optional[str] = None
    patient_feedback: Optional[str] = None
    improvement_suggestions: Optional[str] = None
