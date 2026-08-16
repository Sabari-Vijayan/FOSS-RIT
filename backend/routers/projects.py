from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from db.session import get_db
from db.models import ProjectDB, UserDB
from schemas.project import Project, ProjectCreate
from core.security import get_current_user, get_optional_user
from services.github_service import fetch_github_repo_metadata, verify_repo_author

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.get("", response_model=List[Project])
def get_projects(
    tech: Optional[str] = None,
    sort_by: Optional[str] = "stars",
    db: Session = Depends(get_db)
):
    """Retrieve all featured open-source repositories with filtering."""
    query = db.query(ProjectDB)
    
    projects = query.all()
    
    if tech and tech.lower() != "all":
        projects = [
            p for p in projects
            if any(t.lower() == tech.lower() for t in (p.tech_stack or []))
        ]

    if sort_by == "stars":
        projects.sort(key=lambda x: x.stars, reverse=True)
    elif sort_by == "forks":
        projects.sort(key=lambda x: x.forks, reverse=True)
    elif sort_by == "issues":
        projects.sort(key=lambda x: x.open_issues, reverse=True)

    return [Project.model_validate(p) for p in projects]

@router.post("", response_model=Project)
async def submit_project(
    project_in: ProjectCreate,
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Feature a new FOSS project built by campus students.
    Auto-fetches stars, forks, tags, and verifies author identity.
    """
    clean_url = project_in.repo_url.strip()

    existing = db.query(ProjectDB).filter(ProjectDB.repo_url == clean_url).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="This repository is already featured on our showcase radar!"
        )

    metadata = await fetch_github_repo_metadata(clean_url)

    is_author = await verify_repo_author(clean_url, current_user.username)
    if not is_author and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail=f"To feature this project, you (@{current_user.username}) must be an author or contributor on the GitHub repository."
        )

    new_project = ProjectDB(
        name=metadata["name"],
        description=metadata["description"],
        repo_url=metadata["repo_url"],
        tech_stack=metadata["tech_stack"],
        stars=metadata["stars"],
        forks=metadata["forks"],
        open_issues=metadata["open_issues"],
        submitted_by_id=current_user.id,
        submitted_by_username=current_user.username
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return Project.model_validate(new_project)

@router.delete("/{project_id}")
def delete_project(
    project_id: str,
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a featured project (only submitter or admin can delete)."""
    project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    if project.submitted_by_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="You do not have permission to delete this project.")

    db.delete(project)
    db.commit()
    return {"status": "success", "message": f"Project '{project.name}' deleted."}
