from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

class MemberPublic(BaseModel):
    id: str
    name: str
    github_username: Optional[str] = None
    department: str
    year_of_study: int
    is_verified_student: bool
    joined_at: datetime

    class Config:
        from_attributes = True

class MemberCreate(BaseModel):
    name: str
    email: EmailStr
    department: str
    year_of_study: int
    github_username: Optional[str] = None

class ClubStats(BaseModel):
    active_members: int
    projects_built: int
    workshops_hosted: int
    open_pull_requests: int
    lines_of_foss_code: str
