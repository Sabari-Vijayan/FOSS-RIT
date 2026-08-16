from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from db.session import get_db
from db.models import ProjectDB, UserDB
from schemas.project import Project, ProjectCreate
from core.security import get_current_user
from services.github_service import fetch_github_repo_metadata, verify_repo_author

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.get("", response_model=List[Project])
async def get_projects(
    tech: Optional[str] = None,
    sort_by: Optional[str] = "stars",
    sync: Optional[bool] = False,
    db: Session = Depends(get_db)
):
    """Retrieve all featured open-source repositories with optional real-time GitHub sync."""
    projects = db.query(ProjectDB).all()

    if sync:
        for p in projects:
            try:
                meta = await fetch_github_repo_metadata(p.repo_url, is_sync=True)
                if meta:
                    if "stars" in meta:
                        p.stars = meta["stars"]
                    if "forks" in meta:
                        p.forks = meta["forks"]
                    if "open_issues" in meta:
                        p.open_issues = meta["open_issues"]
                    if meta.get("tech_stack"):
                        p.tech_stack = meta["tech_stack"]
                    if meta.get("description"):
                        p.description = meta["description"]
            except Exception as e:
                print(f"[Projects Sync] Warning syncing {p.repo_url}: {e}")
        try:
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"[Projects Sync] DB commit notice: {e}")
    
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

    # Attach submitter verification status
    output = []
    for p in projects:
        proj_dict = {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "repo_url": p.repo_url,
            "tech_stack": p.tech_stack or [],
            "stars": p.stars,
            "forks": p.forks,
            "open_issues": p.open_issues,
            "submitted_by_username": p.submitted_by_username,
            "is_verified_student": p.submitter.is_verified_student if p.submitter else False,
            "created_at": p.created_at
        }
        output.append(Project(**proj_dict))

    return output

@router.post("/sync", response_model=List[Project])
async def sync_all_projects(db: Session = Depends(get_db)):
    """Synchronize all featured repositories with GitHub API in real time."""
    projects = db.query(ProjectDB).all()
    for p in projects:
        try:
            meta = await fetch_github_repo_metadata(p.repo_url, is_sync=True)
            if meta:
                if "stars" in meta:
                    p.stars = meta["stars"]
                if "forks" in meta:
                    p.forks = meta["forks"]
                if "open_issues" in meta:
                    p.open_issues = meta["open_issues"]
                if meta.get("tech_stack"):
                    p.tech_stack = meta["tech_stack"]
                if meta.get("description"):
                    p.description = meta["description"]
        except Exception as e:
            print(f"[Projects Sync API] Error syncing {p.repo_url}: {e}")

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[Projects Sync API] DB commit notice: {e}")

    # Return refreshed list
    output = []
    for p in projects:
        proj_dict = {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "repo_url": p.repo_url,
            "tech_stack": p.tech_stack or [],
            "stars": p.stars,
            "forks": p.forks,
            "open_issues": p.open_issues,
            "submitted_by_username": p.submitted_by_username,
            "is_verified_student": p.submitter.is_verified_student if p.submitter else False,
            "created_at": p.created_at
        }
        output.append(Project(**proj_dict))

    return output

@router.post("/{project_id}/sync", response_model=Project)
async def sync_single_project(project_id: str, db: Session = Depends(get_db)):
    """Synchronize an individual repository with GitHub API in real time."""
    project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    try:
        meta = await fetch_github_repo_metadata(project.repo_url, is_sync=True)
        if meta:
            if "stars" in meta:
                project.stars = meta["stars"]
            if "forks" in meta:
                project.forks = meta["forks"]
            if "open_issues" in meta:
                project.open_issues = meta["open_issues"]
            if meta.get("tech_stack"):
                project.tech_stack = meta["tech_stack"]
            if meta.get("description"):
                project.description = meta["description"]
            db.commit()
            db.refresh(project)
    except Exception as e:
        print(f"[Project Single Sync] Error syncing {project.repo_url}: {e}")

    return Project(
        id=project.id,
        name=project.name,
        description=project.description,
        repo_url=project.repo_url,
        tech_stack=project.tech_stack or [],
        stars=project.stars,
        forks=project.forks,
        open_issues=project.open_issues,
        submitted_by_username=project.submitted_by_username,
        is_verified_student=project.submitter.is_verified_student if project.submitter else False,
        created_at=project.created_at
    )

@router.post("", response_model=Project)
async def submit_project(
    project_in: ProjectCreate,
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Feature a new FOSS project built by campus students.
    Auto-fetches stars, forks, tags, checks author identity, and enforces a 3-project cap.
    """
    clean_url = project_in.repo_url.strip()

    # Enforce Maximum 3 Projects Limit per User
    user_project_count = db.query(ProjectDB).filter(ProjectDB.submitted_by_id == current_user.id).count()
    if user_project_count >= 3 and current_user.role != "admin":
        raise HTTPException(
            status_code=400,
            detail="You have reached the maximum limit of 3 featured projects. You can delete or replace an existing project to showcase a new one."
        )

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

    proj_dict = {
        "id": new_project.id,
        "name": new_project.name,
        "description": new_project.description,
        "repo_url": new_project.repo_url,
        "tech_stack": new_project.tech_stack or [],
        "stars": new_project.stars,
        "forks": new_project.forks,
        "open_issues": new_project.open_issues,
        "submitted_by_username": new_project.submitted_by_username,
        "is_verified_student": current_user.is_verified_student,
        "created_at": new_project.created_at
    }

    return Project(**proj_dict)

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
