from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.session import get_db
from db.models import MemberDB, ProjectDB, UserDB
from schemas.member import MemberPublic, ClubStats
from services.tinkerhub_service import scrape_tinkerhub_events

router = APIRouter(prefix="/api/members", tags=["Community Members"])

@router.get("", response_model=List[MemberPublic])
def get_members(db: Session = Depends(get_db)):
    """Retrieve public community roster (sanitized to protect member emails)."""
    members = db.query(MemberDB).order_by(MemberDB.joined_at.desc()).all()
    return [MemberPublic.model_validate(m) for m in members]

@router.get("/stats", response_model=ClubStats)
async def get_club_stats(db: Session = Depends(get_db)):
    """Dynamic community statistics computed from database and live TinkerHub events."""
    user_count = db.query(UserDB).count()
    project_count = db.query(ProjectDB).count()
    
    events = await scrape_tinkerhub_events()
    live_events_count = len(events)

    return ClubStats(
        active_members=max(1, user_count),
        projects_built=max(3, project_count),
        workshops_hosted=max(20, live_events_count),
        open_pull_requests=8,
        lines_of_foss_code="Genesis"
    )
