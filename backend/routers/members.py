"""
Members Router for FOSS Club.
Handles new student member onboarding, membership directory, and club statistics.
"""
from fastapi import APIRouter, HTTPException, status
from typing import List
import uuid
from datetime import datetime
from models import Member, MemberCreate, ClubStats
from database import MEMBERS_DB, get_club_stats

router = APIRouter(prefix="/api/members", tags=["Members & Community"])

@router.get("", response_model=List[Member])
def list_members():
    """List club members & contributors."""
    return list(MEMBERS_DB.values())

@router.post("/join", response_model=Member, status_code=status.HTTP_201_CREATED)
def join_club(member_in: MemberCreate):
    """Join FOSS Club RIT Kottayam as a founding student member."""
    # Check if email is already registered
    for m in MEMBERS_DB.values():
        if m.email.lower() == member_in.email.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A member with this email is already registered in the founding cohort!"
            )
    
    new_id = f"mem-{uuid.uuid4().hex[:6]}"
    new_member = Member(
        id=new_id,
        name=member_in.name,
        email=member_in.email,
        github_username=member_in.github_username,
        department=member_in.department,
        year_of_study=member_in.year_of_study,
        joined_at=datetime.now()
    )
    MEMBERS_DB[new_id] = new_member
    return new_member

@router.get("/stats", response_model=ClubStats)
def get_stats():
    """Get live stats of the FOSS club community."""
    return get_club_stats()
