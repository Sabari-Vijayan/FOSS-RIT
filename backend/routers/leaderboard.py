from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from db.session import get_db
from db.models import UserDB, ProjectDB

router = APIRouter(prefix="/api/leaderboard", tags=["Leaderboard & XP"])

def calculate_user_xp_and_tier(user: UserDB, user_projects: List[ProjectDB]):
    """
    Boot.dev-style balanced developer XP & leveling formula.
    Ensures newcomers can level up quickly while recognizing active makers.
    """
    xp = 0

    # 1. Verification Bonus (+50 XP)
    if user.is_verified_student:
        xp += 50

    # 2. Featured Projects (1st: +100 XP, 2nd & 3rd: +75 XP each)
    proj_count = len(user_projects)
    if proj_count >= 1:
        xp += 100
    if proj_count >= 2:
        xp += 75
    if proj_count >= 3:
        xp += 75

    # 3. Community Forks (+20 XP each - someone cloned your code)
    total_forks = sum(p.forks for p in user_projects)
    xp += total_forks * 20

    # 4. GitHub Stars (+5 XP each, capped at 100 XP per repo to prevent viral outlier distortion)
    total_stars = 0
    for p in user_projects:
        total_stars += p.stars
        capped_stars_xp = min(100, p.stars * 5)
        xp += capped_stars_xp

    # 5. Multi-stack Versatility (+15 XP per unique language tag)
    all_techs = set()
    for p in user_projects:
        for t in (p.tech_stack or []):
            all_techs.add(t.lower())
    xp += min(60, len(all_techs) * 15)

    # Calculate Level, Developer Title, and Next Level Threshold
    if xp < 100:
        level = 1
        title = "Script Tinkerer"
        min_xp = 0
        max_xp = 100
    elif xp < 300:
        level = 2
        title = "Open Source Novice"
        min_xp = 100
        max_xp = 300
    elif xp < 700:
        level = 3
        title = "Byte Craftsman"
        min_xp = 300
        max_xp = 700
    elif xp < 1500:
        level = 4
        title = "Systems Architect"
        min_xp = 700
        max_xp = 1500
    else:
        level = 5
        title = "Kernel Overlord"
        min_xp = 1500
        max_xp = 3000

    # Progress percentage toward next tier
    progress = min(100, int(((xp - min_xp) / (max_xp - min_xp)) * 100)) if max_xp > min_xp else 100

    # Achievement Badges
    badges = []
    if user.is_verified_student:
        badges.append({"id": "verified_rit", "name": "Campus Verified", "icon": "🎓", "color": "#08B74F"})
    if proj_count >= 1:
        badges.append({"id": "first_ship", "name": "First Ship", "icon": "🚀", "color": "#2B7FFF"})
    if proj_count >= 3:
        badges.append({"id": "trilogy", "name": "The Trilogy", "icon": "🔱", "color": "#F5C040"})
    if total_forks >= 3:
        badges.append({"id": "peer_forked", "name": "Peer Forked", "icon": "🍴", "color": "#A855F7"})
    if len(all_techs) >= 3:
        badges.append({"id": "polyglot", "name": "Polyglot", "icon": "⚡", "color": "#EC4899"})
    if total_stars >= 10:
        badges.append({"id": "star_hunter", "name": "Star Hunter", "icon": "⭐", "color": "#EAB308"})

    return {
        "xp": xp,
        "level": level,
        "title": title,
        "min_xp": min_xp,
        "max_xp": max_xp,
        "progress": progress,
        "total_projects": proj_count,
        "total_stars": total_stars,
        "total_forks": total_forks,
        "badges": badges
    }

@router.get("")
def get_campus_leaderboard(
    timeframe: Optional[str] = Query("all_time", regex="^(all_time|monthly)$"),
    db: Session = Depends(get_db)
):
    """
    Retrieve ranked student contributor leaderboard with Boot.dev RPG XP, levels, and badges.
    Excludes users who have opted for incognito privacy mode.
    """
    users = db.query(UserDB).filter(UserDB.is_leaderboard_hidden == False).all()
    all_projects = db.query(ProjectDB).all()

    now = datetime.utcnow()
    ranked_list = []

    for u in users:
        # Match user's projects
        user_projects = [
            p for p in all_projects
            if p.submitted_by_id == u.id or (p.submitted_by_username and p.submitted_by_username.lower() == u.username.lower())
        ]

        if timeframe == "monthly":
            # Filter projects created/updated this month or scale score for sprint
            user_projects_monthly = [
                p for p in user_projects
                if p.created_at and p.created_at.year == now.year and p.created_at.month == now.month
            ]
            stats = calculate_user_xp_and_tier(u, user_projects_monthly if user_projects_monthly else user_projects)
        else:
            stats = calculate_user_xp_and_tier(u, user_projects)

        ranked_list.append({
            "user_id": u.id,
            "username": u.username,
            "display_name": u.display_name or u.username,
            "avatar_url": u.avatar_url or f"https://github.com/{u.username}.png",
            "is_verified_student": u.is_verified_student,
            "role": u.role,
            "joined_at": u.created_at,
            "top_projects": [p.name for p in user_projects[:3]],
            **stats
        })

    # Sort descending by XP
    ranked_list.sort(key=lambda x: (x["xp"], x["total_stars"], x["total_forks"]), reverse=True)

    # Assign ranks & medals
    for idx, item in enumerate(ranked_list, start=1):
        item["rank"] = idx
        if idx == 1:
            item["medal"] = "🥇"
        elif idx == 2:
            item["medal"] = "🥈"
        elif idx == 3:
            item["medal"] = "🥉"
        else:
            item["medal"] = None

    return {
        "timeframe": timeframe,
        "total_contributors": len(ranked_list),
        "contributors": ranked_list
    }
