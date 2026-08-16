import time
import re
import json
from datetime import datetime
import httpx
from typing import List, Dict, Any
from core.config import settings

# 5-minute In-Memory Cache
_EVENTS_CACHE: List[Dict[str, Any]] = []
_CACHE_TIMESTAMP: float = 0
_CACHE_TTL_SECONDS: float = 300  # 5 minutes

def get_cached_events() -> List[Dict[str, Any]]:
    global _EVENTS_CACHE, _CACHE_TIMESTAMP
    now = time.time()
    if _EVENTS_CACHE and (now - _CACHE_TIMESTAMP) < _CACHE_TTL_SECONDS:
        return _EVENTS_CACHE
    return []

def set_cached_events(events: List[Dict[str, Any]]) -> None:
    global _EVENTS_CACHE, _CACHE_TIMESTAMP
    _EVENTS_CACHE = events
    _CACHE_TIMESTAMP = time.time()

def clear_events_cache() -> None:
    global _EVENTS_CACHE, _CACHE_TIMESTAMP
    _EVENTS_CACHE = []
    _CACHE_TIMESTAMP = 0

def format_date_time_string(start_date_raw: Any, end_date_raw: Any = None) -> tuple[str, str, str]:
    """Convert ISO timestamp to human-friendly (date_time, date_str, time_str)."""
    if not start_date_raw or not isinstance(start_date_raw, str):
        return "Upcoming Session", "Upcoming", "TBA"

    try:
        clean_ts = start_date_raw.replace("Z", "+00:00")
        dt = datetime.fromisoformat(clean_ts)
        
        # Human readable format: e.g. "Aug 14, 2026 • 1:00 PM IST"
        month_name = dt.strftime("%b")
        day = dt.strftime("%d").lstrip("0")
        year = dt.strftime("%Y")
        time_str = dt.strftime("%I:%M %p").lstrip("0") + " IST"
        
        formatted_date_time = f"{month_name} {day}, {year} • {time_str}"
        date_only = f"{month_name} {day}, {year}"
        
        return formatted_date_time, date_only, time_str
    except Exception:
        # Fallback split
        if "T" in str(start_date_raw):
            parts = str(start_date_raw).split("T")
            return f"{parts[0]} • {parts[1][:5]} IST", parts[0], f"{parts[1][:5]} IST"
        return str(start_date_raw), str(start_date_raw), "TBA"

def parse_nuxt3_campus_events(html: str) -> List[Dict[str, Any]]:
    """Unflatten Nuxt 3 de-serialization payload from RIT Kottayam Campus (2160) page."""
    m = re.search(r'<script[^>]*id="__NUXT_DATA__"[^>]*>(.*?)</script>', html, re.DOTALL)
    if not m:
        return []
    
    try:
        data = json.loads(m.group(1))
    except Exception:
        return []
    
    seen = {}
    def resolve(val):
        if val is None:
            return None
        if isinstance(val, int):
            if val in seen:
                return seen[val]
            if 0 <= val < len(data):
                item = data[val]
                if isinstance(item, (str, bool, float)) or item is None:
                    seen[val] = item
                    return item
                if isinstance(item, list):
                    resolved_list = [resolve(x) for x in item]
                    seen[val] = resolved_list
                    return resolved_list
                if isinstance(item, dict):
                    resolved_dict = {k: resolve(v) for k, v in item.items()}
                    seen[val] = resolved_dict
                    return resolved_dict
            return val
        if isinstance(val, list):
            return [resolve(x) for x in val]
        if isinstance(val, dict):
            return {k: resolve(v) for k, v in val.items()}
        return val

    events = []
    for item in data:
        # Match events in the serialized tree
        if isinstance(item, dict) and "name" in item and ("startDate" in item or "meetUrl" in item or "type" in item):
            name_val = resolve(item.get("name"))
            desc_val = resolve(item.get("description"))
            start_date = resolve(item.get("startDate"))
            end_date = resolve(item.get("endDate"))
            banner = resolve(item.get("banner"))
            location_val = resolve(item.get("location"))
            event_type = resolve(item.get("type"))
            is_virtual = resolve(item.get("isVirtual"))
            unique_id = resolve(item.get("uniqueId")) or resolve(item.get("id"))
            number_of_seats = resolve(item.get("numberOfSeats")) or 0
            
            # Filter out non-event items like campus name itself
            if name_val and isinstance(name_val, str) and len(name_val.strip()) > 2 and "Rajiv Gandhi Institute" not in name_val:
                mode = "virtual" if is_virtual else "offline"
                if location_val and "hybrid" in str(location_val).lower():
                    mode = "hybrid"

                # Formatted dates
                formatted_dt, date_str, time_str = format_date_time_string(start_date, end_date)

                # Formatted location
                if location_val and isinstance(location_val, str) and len(location_val.strip()) > 2 and not location_val.startswith("http"):
                    loc_text = location_val.strip()
                elif is_virtual:
                    loc_text = "Google Meet Virtual Session"
                else:
                    loc_text = "RIT Kottayam Campus (Velloor)"

                # Official TinkerHub registration link (ALWAYS leading to that TinkerHub event page)
                if unique_id and str(unique_id).isalnum():
                    tinkerhub_event_url = f"https://tinkerhub.org/events/{unique_id}"
                else:
                    tinkerhub_event_url = settings.TINKERHUB_CAMPUS_URL

                # Clean event type
                raw_type = str(event_type).capitalize() if event_type else "Workshop"
                if "talk" in name_val.lower() or "meeting" in name_val.lower():
                    raw_type = "Talk / Meetup"
                elif "hackathon" in name_val.lower() or "challenge" in name_val.lower():
                    raw_type = "Hackathon"

                events.append({
                    "id": f"th-rit-{str(unique_id)}",
                    "title": name_val.strip(),
                    "description": desc_val if (desc_val and isinstance(desc_val, str)) else "Campus session organized with TinkerHub & FOSS Club at RIT Kottayam.",
                    "date_time": formatted_dt,
                    "location": loc_text,
                    "date": date_str,
                    "time": time_str,
                    "venue": loc_text,
                    "mode": mode,
                    "speaker": "TinkerHub RIT Campus Lead",
                    "tags": [raw_type, "RIT Kottayam", "TinkerHub"],
                    "event_type": raw_type,
                    "registration_link": tinkerhub_event_url,
                    "event_url": tinkerhub_event_url,
                    "banner_url": banner if (banner and isinstance(banner, str) and banner.startswith("http")) else "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop",
                    "capacity": number_of_seats if isinstance(number_of_seats, int) else 0,
                    "registered_count": 0,
                    "is_live": True,
                    "is_collab": True,
                    "source": "TinkerHub RIT Campus (2160)"
                })
    return events

def _get_fallback_events() -> List[Dict[str, Any]]:
    """Curated fallback events for FOSS Club & TinkerHub RIT."""
    return [
        {
            "id": "th-rit-live-1",
            "title": "Git & Open Source Kickstart 2026",
            "description": "Genesis hands-on workshop on Git internals, GitHub branching models, and making your first open-source pull request with TinkerHub RIT.",
            "date_time": "Aug 22, 2026 • 4:30 PM IST",
            "location": "CSE Dept Seminar Hall, RIT Kottayam",
            "date": "Aug 22, 2026",
            "time": "4:30 PM - 6:30 PM IST",
            "venue": "CSE Dept Seminar Hall, RIT Kottayam",
            "mode": "hybrid",
            "speaker": "FOSS Club RIT & TinkerHub Leads",
            "tags": ["Workshop", "Git", "Beginner", "RIT Kottayam"],
            "event_type": "Workshop",
            "registration_link": settings.TINKERHUB_CAMPUS_URL,
            "event_url": settings.TINKERHUB_CAMPUS_URL,
            "banner_url": "https://images.unsplash.com/photo-1618401471353-b98aedd04e11?q=80&w=800&auto=format&fit=crop",
            "capacity": 60,
            "registered_count": 42,
            "is_live": True,
            "is_collab": True,
            "source": "TinkerHub RIT Campus"
        },
        {
            "id": "th-rit-live-2",
            "title": "FastAPI & High-Throughput Microservices",
            "description": "Architecting resilient asynchronous APIs, SQLAlchemy ORM with PostgreSQL, and deploying zero-cost containers on Koyeb & Supabase.",
            "date_time": "Aug 29, 2026 • 5:00 PM IST",
            "location": "Google Meet Virtual Session",
            "date": "Aug 29, 2026",
            "time": "5:00 PM - 7:00 PM IST",
            "venue": "Google Meet Virtual Session",
            "mode": "virtual",
            "speaker": "RIT Alumni in Cloud Tech",
            "tags": ["FastAPI", "Python", "Cloud", "Workshop"],
            "event_type": "Workshop",
            "registration_link": settings.TINKERHUB_CAMPUS_URL,
            "event_url": settings.TINKERHUB_CAMPUS_URL,
            "banner_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop",
            "capacity": 100,
            "registered_count": 58,
            "is_live": False,
            "is_collab": True,
            "source": "TinkerHub RIT Campus"
        }
    ]

async def scrape_tinkerhub_events(force_refresh: bool = False) -> List[Dict[str, Any]]:
    """
    Fetch and parse live events specifically from TinkerHub's RIT Kottayam Campus 2160 page.
    Falls back gracefully if offline.
    """
    if not force_refresh:
        cached = get_cached_events()
        if cached:
            return cached

    url = settings.TINKERHUB_CAMPUS_URL
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }

    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=12.0) as client:
            res = await client.get(url, headers=headers)
            
            if res.status_code == 200:
                events = parse_nuxt3_campus_events(res.text)
                if events:
                    set_cached_events(events)
                    return events
    except Exception as e:
        print(f"[TinkerHub Campus Scraper] Error fetching RIT campus events: {e}")

    fallback = _get_fallback_events()
    set_cached_events(fallback)
    return fallback
