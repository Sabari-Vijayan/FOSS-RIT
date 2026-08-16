from typing import List, Optional
from pydantic import BaseModel, EmailStr

class Event(BaseModel):
    id: str
    title: str
    description: str
    date_time: str
    location: str
    date: Optional[str] = None
    time: Optional[str] = None
    venue: Optional[str] = None
    mode: str = "offline"  # offline, virtual, hybrid
    speaker: Optional[str] = "TinkerHub RIT Lead"
    tags: List[str] = []
    event_type: Optional[str] = "Workshop"
    registration_link: Optional[str] = None
    event_url: Optional[str] = None
    banner_url: Optional[str] = None
    capacity: int = 0
    registered_count: int = 0
    is_live: bool = True
    is_collab: bool = True
    source: str = "TinkerHub RIT"

class EventRSVP(BaseModel):
    event_id: str
    name: str
    email: EmailStr
    college_id: Optional[str] = None

class RSVPResponse(BaseModel):
    status: str
    message: str
    rsvp_id: str
