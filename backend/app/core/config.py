import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings

_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
_LOCAL_DATABASE_URL = "sqlite+aiosqlite:///./unipilot.db"

class Settings(BaseSettings):
    PROJECT_NAME: str = "UniPilot Autonomous Copilot API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Secret key for JWT auth (SQLite-backed)
    SECRET_KEY: str = "unipilot-super-secret-key-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # OpenRouter AI (free models) - reads from .env
    OPENROUTER_API_KEY: str = ""

    # Local development uses SQLite. Vercel deployments must set DATABASE_URL
    # to a durable PostgreSQL connection string; serverless disks are ephemeral.
    DATABASE_URL: str = ""

    # CORS Origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
    ]

    class Config:
        case_sensitive = True
        extra = "ignore"
        # Look for .env at project root
        env_file = str(_PROJECT_ROOT / ".env")
        env_file_encoding = "utf-8"

settings = Settings()

if not settings.DATABASE_URL:
    # POSTGRES_URL is the conventional variable provided by many Vercel
    # database integrations. DATABASE_URL remains the preferred explicit name.
    settings.DATABASE_URL = os.getenv("POSTGRES_URL", "") or _LOCAL_DATABASE_URL

if os.getenv("VERCEL") and "sqlite" in settings.DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL must be a PostgreSQL connection string on Vercel. "
        "Configure it in Vercel Project Settings before deploying."
    )
