from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, HttpUrl

class Project(BaseModel):
    id: str
    name: str
    description: str
    repo_url: str
    tech_stack: List[str]
    stars: int
    forks: int
    open_issues: int
    submitted_by_username: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProjectCreate(BaseModel):
    repo_url: str
