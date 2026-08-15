"""
Projects Router for FOSS Club.
Handles open-source repository listings, technology filtering, and automated GitHub scraping.
"""
from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
import uuid
import json
import urllib.request
from datetime import datetime
from models import Project, ProjectCreate
from database import PROJECTS_DB

router = APIRouter(prefix="/api/projects", tags=["Projects"])

def scrape_github_repo(repo_url: str) -> dict:
    """Auto-scrape public repository metadata from GitHub."""
    cleaned_url = repo_url.strip().rstrip("/")
    parts = cleaned_url.split("/")
    if len(parts) < 2 or "github.com" not in cleaned_url:
        return {
            "name": parts[-1] if parts else "project",
            "description": "Open source repository",
            "tech_stack": ["Open Source"],
            "stars": 0,
            "forks": 0,
            "open_issues": 0
        }
    
    owner, repo_name = parts[-2], parts[-1]
    api_url = f"https://api.github.com/repos/{owner}/{repo_name}"
    
    try:
        req = urllib.request.Request(api_url, headers={"User-Agent": "FOSS-Club-RIT-Kottayam"})
        with urllib.request.urlopen(req, timeout=4) as response:
            if response.status == 200:
                data = json.loads(response.read().decode())
                topics = data.get("topics", [])
                primary_lang = data.get("language")
                if primary_lang and primary_lang not in topics:
                    topics.insert(0, primary_lang)

                return {
                    "name": data.get("name", repo_name),
                    "description": data.get("description") or f"Open-source repository by {owner}.",
                    "tech_stack": topics if topics else ["FOSS", "GitHub"],
                    "stars": data.get("stargazers_count", 0),
                    "forks": data.get("forks_count", 0),
                    "open_issues": data.get("open_issues_count", 0)
                }
    except Exception:
        pass

    # Fallback if offline or rate limited
    return {
        "name": repo_name,
        "description": f"Open-source repository at {owner}/{repo_name}",
        "tech_stack": ["Open Source"],
        "stars": 0,
        "forks": 0,
        "open_issues": 0
    }

@router.get("", response_model=List[Project])
def list_projects(tech: Optional[str] = None):
    """List all open-source projects, optionally filtered by tech stack."""
    projects = list(PROJECTS_DB.values())
    if tech and tech.lower() != "all":
        tech_lower = tech.lower()
        projects = [
            p for p in projects 
            if any(t.lower() == tech_lower for t in p.tech_stack)
        ]
    return projects

@router.get("/{project_id}", response_model=Project)
def get_project(project_id: str):
    """Retrieve details of a single project."""
    if project_id not in PROJECTS_DB:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return PROJECTS_DB[project_id]

@router.post("", response_model=Project, status_code=status.HTTP_201_CREATED)
def submit_project(project_in: ProjectCreate):
    """Submit a new open-source project and automatically scrape GitHub metadata."""
    # Check if repo is already listed
    for p in PROJECTS_DB.values():
        if p.repo_url.lower().rstrip("/") == project_in.repo_url.lower().rstrip("/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This repository is already featured on our showcase radar!"
            )

    scraped = scrape_github_repo(project_in.repo_url)
    
    new_id = f"proj-{uuid.uuid4().hex[:6]}"
    project = Project(
        id=new_id,
        name=project_in.name or scraped["name"],
        description=project_in.description or scraped["description"],
        repo_url=project_in.repo_url,
        tech_stack=scraped["tech_stack"],
        stars=scraped["stars"],
        forks=scraped["forks"],
        open_issues=scraped["open_issues"],
        last_synced_at=datetime.now()
    )
    PROJECTS_DB[new_id] = project
    return project
