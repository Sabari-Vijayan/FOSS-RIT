import json
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Query

router = APIRouter(prefix="/api/leaderboard", tags=["Leaderboard & XP"])

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
LEADERBOARD_JSON_PATH = ROOT_DIR / "frontend" / "src" / "data" / "leaderboard.json"

def load_leaderboard_json() -> dict:
    """Load pre-computed static leaderboard feed."""
    if LEADERBOARD_JSON_PATH.exists():
        try:
            return json.loads(LEADERBOARD_JSON_PATH.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {
        "status": "success",
        "timeframe": "all_time",
        "total_contributors": 0,
        "contributors": []
    }

@router.get("")
def get_campus_leaderboard(
    timeframe: Optional[str] = Query("all_time", regex="^(all_time|monthly)$")
):
    """
    Retrieve ranked student contributor leaderboard with Boot.dev RPG XP, levels, and badges.
    """
    data = load_leaderboard_json()
    data["timeframe"] = timeframe
    return data
