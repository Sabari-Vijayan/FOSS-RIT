"""
Events Router for FOSS Club.
Handles listing upcoming events, filtering, details, and RSVP registrations.
"""
from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from models import Event, EventRSVP
from database import EVENTS_DB, RSVPS_DB

router = APIRouter(prefix="/api/events", tags=["Events"])

@router.get("", response_model=List[Event])
def list_events():
    """Retrieve all club events."""
    return list(EVENTS_DB.values())

@router.get("/{event_id}", response_model=Event)
def get_event(event_id: str):
    """Get single event details by its ID."""
    if event_id not in EVENTS_DB:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return EVENTS_DB[event_id]

@router.post("/{event_id}/rsvp", status_code=status.HTTP_201_CREATED)
def rsvp_event(event_id: str, rsvp: EventRSVP):
    """RSVP for an event."""
    if event_id not in EVENTS_DB:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    
    event = EVENTS_DB[event_id]
    if not event.is_open:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Event registration is closed")
    
    if event.registered_count >= event.capacity:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Event capacity is full")
    
    # Store RSVP
    if event_id not in RSVPS_DB:
        RSVPS_DB[event_id] = []
    
    # Check if duplicate email already RSVP'd
    existing = [r for r in RSVPS_DB[event_id] if r.get("email") == rsvp.email]
    if existing:
        return {
            "success": True,
            "message": f"You are already registered for {event.title}!",
            "event_title": event.title
        }

    RSVPS_DB[event_id].append(rsvp.model_dump())
    event.registered_count += 1

    return {
        "success": True,
        "message": f"Spot confirmed! We've sent details to {rsvp.email}.",
        "event_title": event.title,
        "seats_remaining": event.capacity - event.registered_count
    }
