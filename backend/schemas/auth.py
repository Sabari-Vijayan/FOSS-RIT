from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

class UserPublic(BaseModel):
    id: str
    username: str
    display_name: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str
    college_email: Optional[str] = None
    is_verified_student: bool
    is_leaderboard_hidden: bool = False
    created_at: datetime

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic

class VerifyStudentEmail(BaseModel):
    college_email: EmailStr

class PrivacyUpdate(BaseModel):
    is_leaderboard_hidden: bool
