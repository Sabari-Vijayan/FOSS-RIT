import os
from pathlib import Path
from dotenv import load_dotenv

# Only load local .env if it exists on disk
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
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
        if env_path.exists():
            load_dotenv(dotenv_path=env_path)
        return os.environ.get("DATABASE_URL", os.getenv("DATABASE_URL", "")).strip()

    @property
    def JWT_SECRET_KEY(self) -> str:
        if env_path.exists():
            load_dotenv(dotenv_path=env_path)
        return os.environ.get("JWT_SECRET_KEY", os.getenv("JWT_SECRET_KEY", "foss_rit_jwt_super_secret_key_2026_genesis_chapter_launch")).strip()

    @property
    def GITHUB_CLIENT_ID(self) -> str:
        if env_path.exists():
            load_dotenv(dotenv_path=env_path)
        return os.environ.get("GITHUB_CLIENT_ID", os.getenv("GITHUB_CLIENT_ID", "")).strip()

    @property
    def GITHUB_CLIENT_SECRET(self) -> str:
        if env_path.exists():
            load_dotenv(dotenv_path=env_path)
        return os.environ.get("GITHUB_CLIENT_SECRET", os.getenv("GITHUB_CLIENT_SECRET", "")).strip()

    @property
    def GITHUB_REDIRECT_URI(self) -> str:
        if env_path.exists():
            load_dotenv(dotenv_path=env_path)
        return os.environ.get("GITHUB_REDIRECT_URI", os.getenv("GITHUB_REDIRECT_URI", "http://localhost:3000/auth/callback")).strip()

    @property
    def TINKERHUB_CAMPUS_URL(self) -> str:
        if env_path.exists():
            load_dotenv(dotenv_path=env_path)
        return os.environ.get(
            "TINKERHUB_CAMPUS_URL",
            os.getenv("TINKERHUB_CAMPUS_URL", "https://tinkerhub.org/campus/2160/Rajiv%20Gandhi%20Institute%20of%20Technology,%20Velloor")
        ).strip()

settings = Settings()
