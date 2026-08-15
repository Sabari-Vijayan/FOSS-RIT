"""
In-memory mock database & seed store for FOSS Club - Rajiv Gandhi Institute of Technology (RIT) Kottayam.
In collaboration with TinkerHub.
"""
from typing import Dict, List
from datetime import datetime
from models import Member, Event, Project, ClubStats

# Initial clean seed data for Events at RIT Kottayam
EVENTS_DB: Dict[str, Event] = {
    "git-101": Event(
        id="git-101",
        title="Git & GitHub 101: Your First Open Source PR",
        description="Hands-on workshop in collaboration with TinkerHub RIT. Learn branching, fork-and-pull workflows, and make your first open source contribution.",
        date_time="Saturday, Aug 29, 2026 • 1:30 PM - 4:30 PM",
        location="MCA Seminar Hall, RIT Kottayam",
        capacity=80,
        registered_count=38,
        is_open=True
    ),
    "linux-cli": Event(
        id="linux-cli",
        title="Linux & Terminal Essentials for Engineers",
        description="Demystifying shell scripting, SSH, package managers, and terminal productivity tools for all engineering branches.",
        date_time="Wednesday, Sep 02, 2026 • 4:30 PM - 6:30 PM",
        location="CSE Systems Lab, RIT Kottayam",
        capacity=50,
        registered_count=24,
        is_open=True
    ),
    "tinkerhack-26": Event(
        id="tinkerhack-26",
        title="TinkerHack '26: 24hr Campus FOSS Hackathon",
        description="Our inaugural 24-hour hackathon co-hosted with TinkerHub. Build open-source software solutions for campus and public good.",
        date_time="Sep 25 - Sep 26, 2026 • 24 Hours",
        location="Central Computing Facility, RIT Kottayam",
        capacity=100,
        registered_count=52,
        is_open=True
    )
}

# Initial clean seed data for Campus FOSS Projects (Can be auto-scraped from GitHub)
PROJECTS_DB: Dict[str, Project] = {
    "rit-campushub": Project(
        id="rit-campushub",
        name="rit-campushub",
        description="Open-source student notice portal and KTU academic notes directory for RIT Kottayam.",
        repo_url="https://github.com/foss-rit/rit-campushub",
        tech_stack=["React", "TypeScript", "FastAPI", "Python"],
        stars=28,
        forks=8,
        open_issues=4
    ),
    "ktu-calculator": Project(
        id="ktu-calculator",
        name="ktu-calculator",
        description="Fast, ad-free open-source SGPA/CGPA grade and credit calculator for KTU schemes.",
        repo_url="https://github.com/foss-rit/ktu-calculator",
        tech_stack=["TypeScript", "React", "Tailwind"],
        stars=42,
        forks=14,
        open_issues=3
    ),
    "tinker-mesh": Project(
        id="tinker-mesh",
        name="tinker-mesh",
        description="Local LAN peer-to-peer file and resource sharing utility across RIT hostel networks.",
        repo_url="https://github.com/foss-rit/tinker-mesh",
        tech_stack=["Go", "WebSockets", "SQLite"],
        stars=19,
        forks=5,
        open_issues=5
    )
}

# Initial Founding Members
MEMBERS_DB: Dict[str, Member] = {
    "mem-1": Member(
        id="mem-1",
        name="Abhiram K.",
        email="abhiram@rit.ac.in",
        github_username="abhiram-foss",
        department="Computer Science & Engg",
        year_of_study=3,
        joined_at=datetime(2026, 8, 1)
    ),
    "mem-2": Member(
        id="mem-2",
        name="Gopika Nair",
        email="gopika@rit.ac.in",
        github_username="gopika-dev",
        department="Electronics & Comm Engg",
        year_of_study=2,
        joined_at=datetime(2026, 8, 5)
    )
}

# RSVPs list: event_id -> list of RSVP dicts
RSVPS_DB: Dict[str, List[dict]] = {
    "git-101": [],
    "linux-cli": [],
    "tinkerhack-26": []
}

def get_club_stats() -> ClubStats:
    total_stars = sum(p.stars for p in PROJECTS_DB.values())
    total_open_issues = sum(p.open_issues for p in PROJECTS_DB.values())
    return ClubStats(
        active_members=len(MEMBERS_DB) + 40,
        projects_built=len(PROJECTS_DB),
        workshops_hosted=0,
        open_pull_requests=total_open_issues,
        lines_of_foss_code="Genesis"
    )
