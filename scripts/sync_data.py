#!/usr/bin/env python3
"""
FOSS Club RIT - GitOps Data & Telemetry Engine
Reads markdown project files in content/projects/, queries GitHub API for live metrics,
computes Boot.dev RPG XP rankings, levels, and badges, and emits static JSON feeds.
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

    # Emit JSON files to frontend
    FRONTEND_DATA_DIR.mkdir(parents=True, exist_ok=True)
    FRONTEND_PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    for out_dir in [FRONTEND_DATA_DIR, FRONTEND_PUBLIC_DIR]:
        (out_dir / "projects.json").write_text(json.dumps(projects, indent=2), encoding="utf-8")
        (out_dir / "leaderboard.json").write_text(json.dumps(leaderboard_payload, indent=2), encoding="utf-8")

    print(f"[GitOps Engine] Generated {len(projects)} projects and {len(ranked_list)} ranked contributors!")
    print(f"[GitOps Engine] JSON feeds saved to: {FRONTEND_DATA_DIR} and {FRONTEND_PUBLIC_DIR}")

if __name__ == "__main__":
    main()
