import sys
from pathlib import Path

# Add backend directory to Python sys.path for Vercel Serverless runtime
backend_path = Path(__file__).resolve().parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

# Import the FastAPI application
from main import app
