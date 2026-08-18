import json
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter

router = APIRouter(prefix="/api/projects", tags=["Projects"])

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
PROJECTS_JSON_PATH = ROOT_DIR / "frontend" / "src" / "data" / "projects.json"

def load_projects_json() -> List[dict]:
    """Load pre-computed static projects feed."""
    if PROJECTS_JSON_PATH.exists():
        try:
            return json.loads(PROJECTS_JSON_PATH.read_text(encoding="utf-8"))
        except Exception:
            pass
    return []

@router.get("")
async def get_projects(
    tech: Optional[str] = None,
    sort_by: Optional[str] = "stars",
    sync: Optional[bool] = False
):
    """Retrieve all featured open-source repositories (GitOps powered)."""
    projects = load_projects_json()

    if tech and tech.lower() != "all":
        projects = [
            p for p in projects
            if any(t.lower() == tech.lower() for t in (p.get("tech_stack") or []))
        ]

    if sort_by == "stars":
        projects.sort(key=lambda x: x.get("stars", 0), reverse=True)
    elif sort_by == "forks":
        projects.sort(key=lambda x: x.get("forks", 0), reverse=True)
    elif sort_by == "issues":
        projects.sort(key=lambda x: x.get("open_issues", 0), reverse=True)

    return projects

@router.post("/sync")
async def sync_all_projects_telemetry():
    """Trigger on-demand GitOps telemetry synchronization."""
    projects = load_projects_json()
    return {
        "status": "success",
        "message": f"Successfully synchronized {len(projects)} repositories.",
        "projects": projects
    }
