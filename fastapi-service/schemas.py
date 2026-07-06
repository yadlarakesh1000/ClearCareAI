"""Pydantic models for request/response validation.

NOTE: OmniDim's real call.completed webhook (verified against a live test) differs
from the shape originally assumed in COMMANDO.md Section 13. The models below match
what OmniDim ACTUALLY sends:
  - call_status (not status), call_duration (not duration_seconds)
  - summary / sentiment / extracted_variables / full_conversation are nested inside
    a `call_report` object (not top-level)
  - call_id arrives as an integer
Any extra fields OmniDim sends (bot_id, phone numbers, interactions, etc.) are ignored.
"""
from typing import Optional, Union

from pydantic import BaseModel, Field


class OmniDimCallReport(BaseModel):
    """The nested `call_report` object inside OmniDim's webhook payload."""

    summary: Optional[str] = None
    sentiment: Optional[str] = None
    full_conversation: Optional[str] = None
    extracted_variables: dict = Field(default_factory=dict)
    # extracted_variables contains:
    #   rating: str (1-5 or "NA")
    #   recovered: str ("TRUE" / "PARTIAL" / "FALSE" / "NA")
    #   recommend_doctor: str ("TRUE" / "PARTIAL" / "FALSE" / "NA")
    #   patient_feedback: str (detailed text or "NA")
    #   improvement_suggestions: str (text or "NA")


class OmniDimWebhookPayload(BaseModel):
    """Payload OmniDim POSTs to the webhook when a voice call completes.

    OmniDim sends two ids: `call_request_id` (the id returned by the dispatch API,
    which the backend stores as omnidim_call_id) and `call_id` (the completed
    call-log id, assigned later). We match the review on call_request_id.
    """

    call_id: Union[int, str]
    call_request_id: Optional[Union[int, str]] = None
    call_status: Optional[str] = None
    call_duration: Optional[int] = None
    call_report: Optional[OmniDimCallReport] = None


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
