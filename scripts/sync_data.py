#!/usr/bin/env python3
"""
FOSS Club RIT - GitOps Data, Events & Telemetry Engine
1. Reads markdown project files in content/projects/ and queries GitHub API.
2. Computes Boot.dev RPG XP rankings, levels, and badges.
3. Scrapes live campus workshops from TinkerHub RIT Campus (2160).
4. Emits pre-computed static JSON feeds to frontend/src/data and frontend/public/data.
"""

import os
import re
import json
import urllib.request
import urllib.error
from pathlib import Path
from datetime import datetime

ROOT_DIR = Path(__file__).resolve().parent.parent
CONTENT_DIR = ROOT_DIR / "content" / "projects"
FRONTEND_DATA_DIR = ROOT_DIR / "frontend" / "src" / "data"
FRONTEND_PUBLIC_DIR = ROOT_DIR / "frontend" / "public" / "data"

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "").strip()
TINKERHUB_CAMPUS_URL = os.environ.get(
    "TINKERHUB_CAMPUS_URL",
    "https://tinkerhub.org/campus/2160/Rajiv%20Gandhi%20Institute%20of%20Technology,%20Velloor"
)

def parse_markdown_frontmatter(file_path: Path) -> dict:
    """Parse YAML frontmatter from a markdown file."""
    content = file_path.read_text(encoding="utf-8")
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n", content, re.DOTALL)
    if not match:
        return {}

    frontmatter_raw = match.group(1)
    data = {}
    
    for line in frontmatter_raw.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if ":" in line:
            key, val = line.split(":", 1)
            key = key.strip()
            val = val.strip().strip('"').strip("'")
            
            # Parse list syntax like ["Python", "FastAPI"]
            if val.startswith("[") and val.endswith("]"):
                items = [item.strip().strip('"').strip("'") for item in val[1:-1].split(",") if item.strip()]
                data[key] = items
            elif val.lower() == "true":
                data[key] = True
            elif val.lower() == "false":
                data[key] = False
            else:
                data[key] = val

    return data

def fetch_github_repo_telemetry(repo_url: str) -> dict:
    """Fetch live star, fork, and issue counts for a GitHub repository."""
    match = re.search(r"github\.com/([^/]+)/([^/]+)", repo_url.rstrip("/"))
    if not match:
        return {"stars": 0, "forks": 0, "open_issues": 0, "language": "Unknown"}

    owner, repo = match.group(1), match.group(2).replace(".git", "")
    api_url = f"https://api.github.com/repos/{owner}/{repo}"

    headers = {"User-Agent": "FOSS-Club-RIT-Telemetry/2.0"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"

    req = urllib.request.Request(api_url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=8) as response:
            if response.status == 200:
                payload = json.loads(response.read().decode("utf-8"))
                return {
                    "stars": payload.get("stargazers_count", 0),
                    "forks": payload.get("forks_count", 0),
                    "open_issues": payload.get("open_issues_count", 0),
                    "language": payload.get("language") or "Code",
                    "pushed_at": payload.get("pushed_at", "")
                }
    except Exception as err:
        print(f"[Telemetry] Notice for {owner}/{repo}: {err}. Using default metrics.")

    return {"stars": 0, "forks": 0, "open_issues": 0, "language": "Code"}

def compute_developer_rank(user_data: dict, projects: list) -> dict:
    """Calculate Boot.dev RPG XP, character tiers, progress, and badges."""
    is_verified = user_data.get("is_verified_student", False)
    proj_count = len(projects)
    total_stars = sum(p.get("stars", 0) for p in projects)
    total_forks = sum(p.get("forks", 0) for p in projects)

    all_techs = set()
    for p in projects:
        for t in p.get("tech_stack", []):
            all_techs.add(t.lower())

    # --- XP Balancing Rules ---
    xp = 0
    if is_verified:
        xp += 50  # Campus email verified

    if proj_count >= 1:
        xp += 100  # 1st project
    if proj_count >= 2:
        xp += 75   # 2nd project
    if proj_count >= 3:
        xp += 75   # 3rd project

    xp += total_forks * 20  # Peer adoption

    # Star XP capped at 100 XP per repo to prevent distortion
    for p in projects:
        xp += min(p.get("stars", 0) * 5, 100)

    # Tech stack versatility
    xp += min(len(all_techs) * 15, 60)

    # --- Level & Tier Mapping ---
    if xp >= 1500:
        level, title, min_xp, max_xp = 5, "Kernel Overlord", 1500, 3000
    elif xp >= 700:
        level, title, min_xp, max_xp = 4, "Systems Architect", 700, 1499
    elif xp >= 300:
        level, title, min_xp, max_xp = 3, "Byte Craftsman", 300, 699
    elif xp >= 100:
        level, title, min_xp, max_xp = 2, "Open Source Novice", 100, 299
    else:
        level, title, min_xp, max_xp = 1, "Script Tinkerer", 0, 99

    tier_range = max(max_xp - min_xp, 1)
    progress = min(max(int(((xp - min_xp) / tier_range) * 100), 0), 100)

    # --- Achievement Badges ---
    badges = []
    if is_verified:
        badges.append({"id": "verified", "name": "Campus Verified", "icon": "🎓", "color": "#08B74F"})
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

def format_event_date(start_date_raw: str) -> str:
    """Format ISO date string to human-friendly format."""
    if not start_date_raw or not isinstance(start_date_raw, str):
        return "Upcoming Session"
    try:
        clean_ts = start_date_raw.replace("Z", "+00:00")
        dt = datetime.fromisoformat(clean_ts)
        month_name = dt.strftime("%b")
        day = dt.strftime("%d").lstrip("0")
        year = dt.strftime("%Y")
        time_str = dt.strftime("%I:%M %p").lstrip("0") + " IST"
        return f"{month_name} {day}, {year} • {time_str}"
    except Exception:
        return str(start_date_raw)

def scrape_live_tinkerhub_events() -> list:
    """Scrape real upcoming and past workshops from TinkerHub RIT Campus."""
    req = urllib.request.Request(
        TINKERHUB_CAMPUS_URL,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=12) as response:
            html = response.read().decode("utf-8", errors="ignore")
            m = re.search(r'<script[^>]*id="__NUXT_DATA__"[^>]*>(.*?)</script>', html, re.DOTALL)
            if not m:
                return []
            
            data = json.loads(m.group(1))
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
                if isinstance(item, dict) and "name" in item and ("startDate" in item or "meetUrl" in item or "type" in item or "uniqueId" in item):
                    name_val = resolve(item.get("name"))
                    desc_val = resolve(item.get("description"))
                    start_date = resolve(item.get("startDate"))
                    end_date = resolve(item.get("endDate"))
                    banner = resolve(item.get("banner"))
                    location_val = resolve(item.get("location"))
                    event_type = resolve(item.get("type"))
                    is_virtual = resolve(item.get("isVirtual"))
                    unique_id = resolve(item.get("uniqueId")) or resolve(item.get("id"))
                    meet_url = resolve(item.get("meetUrl"))
                    number_of_seats = resolve(item.get("numberOfSeats")) or 80
                    
                    if name_val and isinstance(name_val, str) and len(name_val.strip()) > 2 and "Rajiv Gandhi" not in name_val:
                        mode = "virtual" if is_virtual else "offline"
                        raw_type = str(event_type).replace("_", " ").title() if event_type else "Workshop"
                        
                        # Determine if event is upcoming or live
                        is_upcoming = False
                        if start_date and isinstance(start_date, str):
                            try:
                                clean_start = start_date.replace("Z", "+00:00")
                                dt_start = datetime.fromisoformat(clean_start)
                                if dt_start.timestamp() > datetime.now().timestamp() - 86400:
                                    is_upcoming = True
                            except Exception:
                                pass

                        events.append({
                            "id": f"th-rit-{str(unique_id or len(events))}",
                            "title": name_val.strip(),
                            "description": desc_val if (desc_val and isinstance(desc_val, str)) else "Campus session organized by TinkerHub RIT & FOSS Club.",
                            "date_time": format_event_date(start_date),
                            "raw_date": start_date if isinstance(start_date, str) else "",
                            "location": location_val or ("Google Meet Virtual Session" if is_virtual else "RIT Kottayam Campus (Velloor)"),
                            "capacity": number_of_seats if isinstance(number_of_seats, int) else 80,
                            "registered_count": 0,
                            "is_open": True,
                            "is_collab": True,
                            "is_upcoming": is_upcoming,
                            "source": "tinkerhub",
                            "event_type": raw_type,
                            "meet_url": meet_url if (meet_url and isinstance(meet_url, str) and meet_url.startswith("http")) else None,
                            "event_url": f"https://tinkerhub.org/events/{unique_id}" if (unique_id and str(unique_id).isalnum()) else TINKERHUB_CAMPUS_URL,
                            "banner_url": banner if (banner and isinstance(banner, str) and banner.startswith("http")) else None
                        })
            
            # Sort: Upcoming events at the top, then recent events descending
            events.sort(key=lambda ev: (1 if ev.get("is_upcoming") else 0, ev.get("raw_date") or ""), reverse=True)
            return events
    except Exception as e:
        print(f"[Events Scraper] Notice: {e}. Using fallback events.")
        return []

def get_default_events() -> list:
    """Standard starter events if TinkerHub scraper is unreachable."""
    return [
        {
            "id": "th-rit-1",
            "title": "Git & GitHub 101: Your First Open Source PR",
            "description": "Hands-on workshop in collaboration with TinkerHub RIT. Learn branching, fork-and-pull workflows, and make your first open source contribution.",
            "date_time": "Saturday, Aug 29, 2026 • 1:30 PM - 4:30 PM",
            "location": "MCA Seminar Hall, RIT Kottayam",
            "capacity": 80,
            "registered_count": 38,
            "is_open": True,
            "is_collab": True,
            "source": "tinkerhub",
            "event_type": "Workshop",
            "event_url": TINKERHUB_CAMPUS_URL
        },
        {
            "id": "th-rit-2",
            "title": "Meet the Maker: From Beginner to Open Source Hacker",
            "description": "Interactive talk session on building in public, campus maker culture, and shipping FOSS projects.",
            "date_time": "Thursday, Sep 03, 2026 • 2:30 PM",
            "location": "Google Meet Virtual Session",
            "capacity": 80,
            "registered_count": 0,
            "is_open": True,
            "is_collab": True,
            "source": "tinkerhub",
            "event_type": "Talk Session",
            "meet_url": "https://meet.google.com/mrj-csgy-mez",
            "event_url": TINKERHUB_CAMPUS_URL
        },
        {
            "id": "th-rit-3",
            "title": "TinkerHack '26: 24hr Campus FOSS Hackathon",
            "description": "Our annual 24-hour hackathon co-hosted with TinkerHub. Build open-source software solutions for campus and public good.",
            "date_time": "Sep 25 - Sep 26, 2026 • 24 Hours",
            "location": "Central Computing Facility, RIT Kottayam",
            "capacity": 100,
            "registered_count": 52,
            "is_open": True,
            "is_collab": True,
            "source": "tinkerhub",
            "event_type": "Hackathon",
            "event_url": TINKERHUB_CAMPUS_URL
        }
    ]

def main():
    print("[GitOps Engine] Scanning project markdown files in:", CONTENT_DIR)
    
    if not CONTENT_DIR.exists():
        CONTENT_DIR.mkdir(parents=True, exist_ok=True)

    projects = []
    contributors_map = {}

    md_files = [f for f in CONTENT_DIR.glob("*.md") if f.name != "_template.md"]
    print(f"[GitOps Engine] Found {len(md_files)} project markdown files.")

    for f in sorted(md_files):
        fm = parse_markdown_frontmatter(f)
        if not fm.get("name") or not fm.get("repo_url"):
            print(f"[GitOps Engine] Skipping invalid file: {f.name}")
            continue

        repo_url = fm["repo_url"]
        telemetry = fetch_github_repo_telemetry(repo_url)

        author = fm.get("author", "rit-maker").strip().lstrip("@")
        author_name = fm.get("author_name") or author

        proj_id = f"proj-{f.stem.lower()}"
        tech_stack = fm.get("tech_stack") or [telemetry["language"]]
        if isinstance(tech_stack, str):
            tech_stack = [tech_stack]

        proj_obj = {
            "id": proj_id,
            "name": fm["name"],
            "description": fm.get("description", "Open source software built at RIT Kottayam."),
            "repo_url": repo_url,
            "tech_stack": tech_stack,
            "stars": telemetry["stars"],
            "forks": telemetry["forks"],
            "open_issues": telemetry["open_issues"],
            "is_verified_student": fm.get("is_verified_student", True),
            "submitted_by_username": author,
            "submitted_by_name": author_name,
            "batch": str(fm.get("batch", "2026")),
            "featured": fm.get("featured", True)
        }
        projects.append(proj_obj)

        # Track contributor stats
        author_key = author.lower()
        if author_key not in contributors_map:
            contributors_map[author_key] = {
                "username": author,
                "display_name": author_name,
                "avatar_url": f"https://github.com/{author}.png",
                "is_verified_student": fm.get("is_verified_student", True),
                "projects": []
            }
        contributors_map[author_key]["projects"].append(proj_obj)

    # Calculate Leaderboard Rankings
    ranked_list = []
    for author_key, c_data in contributors_map.items():
        stats = compute_developer_rank(c_data, c_data["projects"])
        ranked_list.append({
            "user_id": f"usr-{author_key}",
            "username": c_data["username"],
            "display_name": c_data["display_name"],
            "avatar_url": c_data["avatar_url"],
            "is_verified_student": c_data["is_verified_student"],
            "xp": stats["xp"],
            "level": stats["level"],
            "title": stats["title"],
            "min_xp": stats["min_xp"],
            "max_xp": stats["max_xp"],
            "progress": stats["progress"],
            "total_projects": stats["total_projects"],
            "total_stars": stats["total_stars"],
            "total_forks": stats["total_forks"],
            "badges": stats["badges"]
        })

    # Sort contributors by XP descending
    ranked_list.sort(key=lambda x: (x["xp"], x["total_stars"], x["total_forks"]), reverse=True)

    # Assign Rank & Medals
    for idx, c in enumerate(ranked_list):
        c["rank"] = idx + 1
        if c["rank"] == 1:
            c["medal"] = "🥇"
        elif c["rank"] == 2:
            c["medal"] = "🥈"
        elif c["rank"] == 3:
            c["medal"] = "🥉"
        else:
            c["medal"] = f"#{c['rank']}"

    # Sort projects by stars descending
    projects.sort(key=lambda p: p["stars"], reverse=True)

    leaderboard_payload = {
        "status": "success",
        "timeframe": "all_time",
        "total_contributors": len(ranked_list),
        "contributors": ranked_list
    }

    # Scrape real TinkerHub events
    print("[GitOps Engine] Scraping live TinkerHub campus events...")
    live_events = scrape_live_tinkerhub_events()
    if not live_events:
        live_events = get_default_events()
    print(f"[GitOps Engine] Captured {len(live_events)} live workshops & events.")

    # Emit JSON files to frontend
    FRONTEND_DATA_DIR.mkdir(parents=True, exist_ok=True)
    FRONTEND_PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    for out_dir in [FRONTEND_DATA_DIR, FRONTEND_PUBLIC_DIR]:
        (out_dir / "projects.json").write_text(json.dumps(projects, indent=2), encoding="utf-8")
        (out_dir / "leaderboard.json").write_text(json.dumps(leaderboard_payload, indent=2), encoding="utf-8")
        (out_dir / "events.json").write_text(json.dumps(live_events, indent=2), encoding="utf-8")

    print(f"[GitOps Engine] Generated {len(projects)} projects, {len(ranked_list)} ranked contributors, and {len(live_events)} events!")
    print(f"[GitOps Engine] JSON feeds saved to: {FRONTEND_DATA_DIR} and {FRONTEND_PUBLIC_DIR}")

if __name__ == "__main__":
    main()
