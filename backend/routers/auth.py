from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.session import get_db
from db.models import UserDB
from schemas.auth import UserPublic, AuthResponse, VerifyStudentEmail
from core.security import create_access_token, get_current_user
from core.config import settings
from services.github_service import exchange_github_code

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.get("/config")
def get_auth_configuration():
    """Return public OAuth configuration status."""
    is_configured = bool(settings.GITHUB_CLIENT_ID and settings.GITHUB_CLIENT_SECRET)
    return {
        "is_oauth_configured": is_configured,
        "github_client_id": settings.GITHUB_CLIENT_ID or ""
    }

@router.post("/github", response_model=AuthResponse)
async def github_oauth_callback(payload: dict, db: Session = Depends(get_db)):
    """Exchange GitHub OAuth authorization code for verified user session and JWT."""
    code = payload.get("code")
    redirect_uri = payload.get("redirect_uri")
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code from GitHub.")

    profile = await exchange_github_code(code, redirect_uri=redirect_uri)
    
    # Lookup by github_id OR by username (to seamlessly link/upgrade dev test accounts)
    user = db.query(UserDB).filter(
        (UserDB.github_id == profile["github_id"]) | (UserDB.username.ilike(profile["username"]))
    ).first()

    if not user:
        user = UserDB(
            github_id=profile["github_id"],
            username=profile["username"],
            display_name=profile["display_name"],
            email=profile["email"],
            avatar_url=profile["avatar_url"],
            role="member",
            is_verified_student=False
        )
        db.add(user)
    else:
        # Upgrade account to official GitHub OAuth ID & live profile
        user.github_id = profile["github_id"]
        user.username = profile["username"]
        user.display_name = profile["display_name"]
        user.avatar_url = profile["avatar_url"]
        user.last_login = datetime.utcnow()
        if profile.get("email"):
            user.email = profile["email"]

    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "username": user.username, "role": user.role})
    return AuthResponse(access_token=token, user=UserPublic.model_validate(user))

@router.get("/me", response_model=UserPublic)
async def get_my_profile(current_user: UserDB = Depends(get_current_user)):
    """Return the authenticated user profile."""
    return UserPublic.model_validate(current_user)

@router.delete("/me")
async def delete_my_account(
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Permanently delete the authenticated student's account,
    cascading to all their submitted projects and associated registrations.
    """
    user_id = current_user.id
    user_name = current_user.username
    user_email = current_user.email
    college_email = current_user.college_email

    # Delete all projects submitted by this user
    from db.models import ProjectDB, EventRSVPDB
    db.query(ProjectDB).filter(
        (ProjectDB.submitted_by_id == user_id) | (ProjectDB.submitted_by_username == user_name)
    ).delete(synchronize_session=False)

    # Delete any RSVPs associated with user email
    if user_email or college_email:
        emails_to_clean = [e for e in [user_email, college_email] if e]
        db.query(EventRSVPDB).filter(EventRSVPDB.email.in_(emails_to_clean)).delete(synchronize_session=False)

    # Delete user record
    db.delete(current_user)
    db.commit()

    return {
        "status": "success",
        "message": f"Account @{user_name} and all associated campus data have been permanently deleted."
    }

@router.post("/verify-student", response_model=UserPublic)
async def verify_student_status(
    payload: VerifyStudentEmail,
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Link and verify an official RIT college email domain (@rit.ac.in)."""
    email_str = payload.college_email.lower().strip()
    
    if not (email_str.endswith("@rit.ac.in") or email_str.endswith("@ritkottayam.ac.in") or "rit" in email_str):
        raise HTTPException(
            status_code=400,
            detail="Must be an official RIT Kottayam student email address (e.g. yourname@rit.ac.in)"
        )

    existing = db.query(UserDB).filter(UserDB.college_email == email_str, UserDB.id != current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="This college email is already associated with another student account.")

    current_user.college_email = email_str
    current_user.is_verified_student = True
    db.commit()
    db.refresh(current_user)

    return UserPublic.model_validate(current_user)

@router.post("/dev-login", response_model=AuthResponse)
async def dev_quick_login(username: str = "rit-developer", db: Session = Depends(get_db)):
    """Local development quick login helper."""
    user = db.query(UserDB).filter(UserDB.username.ilike(username)).first()
    if not user:
        user_role = "admin" if "admin" in username.lower() else "member"
        user = UserDB(
            github_id=f"dev-{username.lower()}",
            username=username,
            display_name=f"{username.capitalize()} (Dev)",
            email=f"{username}@rit.ac.in",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
            role=user_role,
            college_email=f"{username}@rit.ac.in",
            is_verified_student=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": user.id, "username": user.username, "role": user.role})
    return AuthResponse(access_token=token, user=UserPublic.model_validate(user))
