from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from db.session import get_db
from db.models import EventRSVPDB
from schemas.event import Event, EventRSVP, RSVPResponse
from services.tinkerhub_service import scrape_tinkerhub_events, clear_events_cache

router = APIRouter(prefix="/api/events", tags=["Events & Workshops"])

@router.get("", response_model=List[Event])
async def get_events(mode: Optional[str] = None):
    """Retrieve live TinkerHub x FOSS Club workshops and events."""
    events = await scrape_tinkerhub_events()
    
    if mode and mode.lower() != "all":
        events = [e for e in events if e.get("mode", "").lower() == mode.lower()]
        
    return [Event(**e) for e in events]

@router.post("/sync-tinkerhub", response_model=List[Event])
async def sync_tinkerhub_live_events():
    """Flush cache and trigger an instant live re-scrape from tinkerhub.org/events."""
    clear_events_cache()
    events = await scrape_tinkerhub_events(force_refresh=True)
    return [Event(**e) for e in events]

@router.get("/{event_id}", response_model=Event)
async def get_event_by_id(event_id: str):
    """Retrieve details for a single workshop."""
    events = await scrape_tinkerhub_events()
    for e in events:
        if e.get("id") == event_id:
            return Event(**e)
    raise HTTPException(status_code=404, detail="Event not found.")

@router.post("/rsvp", response_model=RSVPResponse)
def rsvp_event(rsvp: EventRSVP, db: Session = Depends(get_db)):
    """RSVP for a campus community workshop."""
    new_rsvp = EventRSVPDB(
        event_id=rsvp.event_id,
        name=rsvp.name,
        email=rsvp.email,
        college_id=rsvp.college_id
    )
    db.add(new_rsvp)
    db.commit()
    db.refresh(new_rsvp)

    return RSVPResponse(
        status="confirmed",
        message=f"Thank you {rsvp.name}! Your RSVP has been confirmed.",
        rsvp_id=new_rsvp.id
    )
