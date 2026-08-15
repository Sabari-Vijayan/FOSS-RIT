"""
Data models for the FOSS Club Backend API using Pydantic.
These define the data structures with automatic validation.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class MemberCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Full Name")
    email: EmailStr = Field(..., description="College or personal email")
    github_username: Optional[str] = Field(None, description="GitHub profile username")
    department: str = Field("Computer Science & Engg", description="Academic Department/Branch")
    year_of_study: int = Field(2, ge=1, le=5, description="Current year of college (1-5)")

class Member(MemberCreate):
    id: str
    joined_at: datetime = Field(default_factory=datetime.now)

class EventRSVP(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr

class Event(BaseModel):
    id: str
    title: str
    description: str
    date_time: str
    location: str
    capacity: int = 60
    registered_count: int = 0
    is_open: bool = True

class Project(BaseModel):
    id: str
    name: str
    description: str
    repo_url: str
    tech_stack: List[str] = Field(default_factory=list)
    stars: int = 0
    forks: int = 0
    open_issues: int = 0
    last_synced_at: Optional[datetime] = None

class ProjectCreate(BaseModel):
    repo_url: str = Field(..., description="GitHub repository URL")
    name: Optional[str] = None
    description: Optional[str] = None

class ClubStats(BaseModel):
    active_members: int
    projects_built: int
    workshops_hosted: int
    open_pull_requests: int
    lines_of_foss_code: str
