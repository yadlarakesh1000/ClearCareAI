"""Application configuration loaded from environment variables."""
import logging

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Loads env vars from the .env file using pydantic-settings."""

    gemini_api_key: str = "your-gemini-api-key"
    # Model name is configurable because Google retires old names (e.g. the original
    # gemini-1.5-flash). Override with GEMINI_MODEL in .env if this default 404s —
    # run the list-models snippet to see what your key supports.
    gemini_model: str = "gemini-2.0-flash"
    spring_boot_url: str = "http://localhost:8080"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

# Configure application-wide logging.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

logger = logging.getLogger("clearcareai-fastapi")
