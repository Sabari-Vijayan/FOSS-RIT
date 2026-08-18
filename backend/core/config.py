import os
from pathlib import Path
from dotenv import load_dotenv

# Only load local .env if it exists on disk
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path, override=True)

class Settings:
    PROJECT_NAME: str = "FOSS Club RIT API"
    VERSION: str = "2.0.0 (GitOps)"
    API_PREFIX: str = "/api"
    TINKERHUB_EVENTS_URL: str = "https://tinkerhub.org/events"

    @property
    def TINKERHUB_CAMPUS_URL(self) -> str:
        if env_path.exists():
            load_dotenv(dotenv_path=env_path)
        return os.environ.get(
            "TINKERHUB_CAMPUS_URL",
            os.getenv("TINKERHUB_CAMPUS_URL", "https://tinkerhub.org/campus/2160/Rajiv%20Gandhi%20Institute%20of%20Technology,%20Velloor")
        ).strip()

settings = Settings()
