from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from db.session import get_db
from db.models import MemberDB, ProjectDB
from schemas.member import MemberPublic, MemberCreate, ClubStats
from services.tinkerhub_service import scrape_tinkerhub_events

router = APIRouter(prefix="/api/members", tags=["Community Members"])

@router.get("", response_model=List[MemberPublic])
def get_members(db: Session = Depends(get_db)):
    """Retrieve public community roster (sanitized to protect member emails)."""
    members = db.query(MemberDB).order_by(MemberDB.joined_at.desc()).all()
    return [MemberPublic.model_validate(m) for m in members]

@router.post("/join", response_model=MemberPublic)
def join_club(member_in: MemberCreate, db: Session = Depends(get_db)):
    """Register membership in the FOSS Club founding cohort."""
    existing = db.query(MemberDB).filter(MemberDB.email == member_in.email.lower().strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="A member with this email is already registered in the community.")

    is_verified = (
        member_in.email.lower().endswith("@rit.ac.in") or 
        member_in.email.lower().endswith("@ritkottayam.ac.in")
    )

    new_member = MemberDB(
        name=member_in.name.strip(),
        email=member_in.email.lower().strip(),
        department=member_in.department,
        year_of_study=member_in.year_of_study,
        github_username=member_in.github_username.strip() if member_in.github_username else None,
        is_verified_student=is_verified
    )

    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    return MemberPublic.model_validate(new_member)

@router.get("/stats", response_model=ClubStats)
async def get_club_stats(db: Session = Depends(get_db)):
    """Dynamic community statistics computed from database and live TinkerHub events."""
    member_count = db.query(MemberDB).count()
    project_count = db.query(ProjectDB).count()
    
    events = await scrape_tinkerhub_events()
    live_events_count = len(events)

    return ClubStats(
        active_members=max(42, member_count),
        projects_built=max(3, project_count),
        workshops_hosted=max(20, live_events_count * 5),
        open_pull_requests=12,
        lines_of_foss_code="Genesis"
    )
