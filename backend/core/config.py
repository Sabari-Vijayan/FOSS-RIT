import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend directory if present
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    PROJECT_NAME: str = "FOSS Club RIT API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "").strip()
    
    # JWT Authentication
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "foss-club-rit-super-secret-jwt-key-change-in-production-2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    
    # GitHub OAuth
    GITHUB_CLIENT_ID: str = os.getenv("GITHUB_CLIENT_ID", "")
    GITHUB_CLIENT_SECRET: str = os.getenv("GITHUB_CLIENT_SECRET", "")
    GITHUB_REDIRECT_URI: str = os.getenv("GITHUB_REDIRECT_URI", "http://localhost:5173/auth/callback")
    
    # TinkerHub Live Scraper Sources
    TINKERHUB_CAMPUS_URL: str = os.getenv(
        "TINKERHUB_CAMPUS_URL",
        "https://tinkerhub.org/campus/2160/Rajiv%20Gandhi%20Institute%20of%20Technology,%20Velloor"
    )
    TINKERHUB_EVENTS_URL: str = "https://tinkerhub.org/events"

settings = Settings()
