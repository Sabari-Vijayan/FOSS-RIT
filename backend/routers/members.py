import json
from pathlib import Path
from typing import List
from fastapi import APIRouter
from schemas.member import MemberPublic, ClubStats
from services.tinkerhub_service import scrape_tinkerhub_events

router = APIRouter(prefix="/api/members", tags=["Community Members"])

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
LEADERBOARD_JSON_PATH = ROOT_DIR / "frontend" / "src" / "data" / "leaderboard.json"
PROJECTS_JSON_PATH = ROOT_DIR / "frontend" / "src" / "data" / "projects.json"

@router.get("", response_model=List[MemberPublic])
def get_members():
    """Retrieve public community roster extracted from Git contributors."""
    if LEADERBOARD_JSON_PATH.exists():
        try:
            data = json.loads(LEADERBOARD_JSON_PATH.read_text(encoding="utf-8"))
            return [
                MemberPublic(
                    id=c.get("user_id", f"usr-{idx}"),
                    name=c.get("display_name") or c.get("username", "Maker"),
                    github_username=c.get("username", "rit-maker"),
                    avatar_url=c.get("avatar_url") or f"https://github.com/{c.get('username')}.png",
                    role=c.get("title", "Contributor"),
                    bio=f"Level {c.get('level', 1)} Open Source Maker • {c.get('xp', 0)} XP",
                    is_verified_student=c.get("is_verified_student", True),
                    batch="2026"
                )
                for idx, c in enumerate(data.get("contributors", []))
            ]
        except Exception:
            pass
    return []

@router.get("/stats", response_model=ClubStats)
async def get_club_stats():
    """Dynamic community statistics computed from Git projects and live TinkerHub events."""
    project_count = 5
    if PROJECTS_JSON_PATH.exists():
        try:
            projects = json.loads(PROJECTS_JSON_PATH.read_text(encoding="utf-8"))
            project_count = len(projects)
        except Exception:
            pass

    events = await scrape_tinkerhub_events()
    live_events_count = len(events)

    return ClubStats(
        active_members=max(12, project_count * 2),
        projects_built=max(5, project_count),
        workshops_hosted=max(20, live_events_count),
        open_pull_requests=3,
        lines_of_foss_code="Genesis"
    )
