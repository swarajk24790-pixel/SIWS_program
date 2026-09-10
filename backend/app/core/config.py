import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings

# Resolve project root (two levels up from this file: backend/app/core/ → root)
_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "UniPilot Autonomous Copilot API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Secret key for JWT auth fallback
    SECRET_KEY: str = "unipilot-super-secret-key-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Firebase settings
    FIREBASE_PROJECT_ID: str = ""
    FIREBASE_CREDENTIALS_PATH: str = ""
    FIREBASE_CREDENTIALS_JSON: str = ""

    # OpenRouter AI (free models) - reads from .env
    OPENROUTER_API_KEY: str = ""

    # Database URL
    DATABASE_URL: str = "sqlite+aiosqlite:///./unipilot.db"

    # CORS Origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
    ]

    class Config:
        case_sensitive = True
        # Look for .env at project root
        env_file = str(_PROJECT_ROOT / ".env")
        env_file_encoding = "utf-8"

settings = Settings()
