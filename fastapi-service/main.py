"""ClearCareAI FastAPI service — OmniDim webhook + Gemini review processing bridge."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import logger
from routers import voice_review, webhook

app = FastAPI(title="ClearCareAI AI Processing Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webhook.router)
app.include_router(voice_review.router)


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "OK", "service": "clearcareai-fastapi"}


@app.on_event("startup")
async def on_startup():
    logger.info("ClearCareAI FastAPI service started.")
