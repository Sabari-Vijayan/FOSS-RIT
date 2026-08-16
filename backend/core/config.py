import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend directory
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

class Settings:
    PROJECT_NAME: str = "FOSS Club RIT API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    TINKERHUB_EVENTS_URL: str = "https://tinkerhub.org/events"

    @property
    def DATABASE_URL(self) -> str:
        load_dotenv(dotenv_path=env_path, override=True)
        return os.getenv("DATABASE_URL", "").strip()

    @property
    def JWT_SECRET_KEY(self) -> str:
        return os.getenv("JWT_SECRET_KEY", "foss-club-rit-super-secret-jwt-key-change-in-production-2026")

    @property
    def GITHUB_CLIENT_ID(self) -> str:
        load_dotenv(dotenv_path=env_path, override=True)
        return os.getenv("GITHUB_CLIENT_ID", "").strip()

    @property
    def GITHUB_CLIENT_SECRET(self) -> str:
        load_dotenv(dotenv_path=env_path, override=True)
        return os.getenv("GITHUB_CLIENT_SECRET", "").strip()

    @property
    def GITHUB_REDIRECT_URI(self) -> str:
        return os.getenv("GITHUB_REDIRECT_URI", "http://localhost:3000/auth/callback").strip()

    @property
    def TINKERHUB_CAMPUS_URL(self) -> str:
        return os.getenv(
            "TINKERHUB_CAMPUS_URL",
            "https://tinkerhub.org/campus/2160/Rajiv%20Gandhi%20Institute%20of%20Technology,%20Velloor"
        ).strip()

settings = Settings()
