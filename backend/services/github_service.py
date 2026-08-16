import re
from typing import Dict, Any, Tuple, Optional
import httpx
from fastapi import HTTPException
from core.config import settings

def parse_github_url(repo_url: str) -> Tuple[str, str]:
    """Parse owner and repo name from GitHub URL."""
    clean_url = repo_url.strip().rstrip("/")
    match = re.search(r"github\.com[/:]([a-zA-Z0-9_.-]+)/([a-zA-Z0-9_.-]+)", clean_url)
    if not match:
        raise HTTPException(
            status_code=400,
            detail="Invalid GitHub repository URL. Must be in the format: https://github.com/owner/repository"
        )
    return match.group(1), match.group(2)

async def exchange_github_code(code: str, redirect_uri: Optional[str] = None) -> Dict[str, Any]:
    """Exchange GitHub OAuth authorization code for verified user profile."""
    if not settings.GITHUB_CLIENT_ID or not settings.GITHUB_CLIENT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="GitHub OAuth credentials not configured on the server. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in backend/.env"
        )

    req_data = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "client_secret": settings.GITHUB_CLIENT_SECRET,
        "code": code,
    }
    if redirect_uri:
        req_data["redirect_uri"] = redirect_uri
    elif settings.GITHUB_REDIRECT_URI:
        req_data["redirect_uri"] = settings.GITHUB_REDIRECT_URI

    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json", "Content-Type": "application/json"},
            json=req_data,
            timeout=15.0
        )
        
        token_data = token_res.json()
        print(f"[GitHub OAuth] Code exchange response: {token_data}")
        
        # If redirect_uri caused a mismatch, retry without it
        if not token_data.get("access_token") and "redirect_uri" in str(token_data).lower():
            req_data.pop("redirect_uri", None)
            retry_res = await client.post(
                "https://github.com/login/oauth/access_token",
                headers={"Accept": "application/json", "Content-Type": "application/json"},
                json=req_data,
                timeout=15.0
            )
            token_data = retry_res.json()
            print(f"[GitHub OAuth Retry] Code exchange response: {token_data}")

        access_token = token_data.get("access_token")
        if not access_token:
            error_msg = token_data.get("error_description") or token_data.get("error") or "Failed to exchange GitHub authorization code."
            raise HTTPException(status_code=400, detail=error_msg)

        auth_headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "FOSS-Club-RIT"
        }
        user_res = await client.get("https://api.github.com/user", headers=auth_headers, timeout=10.0)
        if user_res.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch GitHub profile.")
        
        user_data = user_res.json()

        email = user_data.get("email")
        if not email:
            try:
                email_res = await client.get("https://api.github.com/user/emails", headers=auth_headers, timeout=10.0)
                if email_res.status_code == 200:
                    emails = email_res.json()
                    if isinstance(emails, list):
                        for e in emails:
                            if e.get("primary") and e.get("verified"):
                                email = e.get("email")
                                break
                            elif e.get("email") and not email:
                                email = e.get("email")
            except Exception as e:
                print(f"[GitHub OAuth] Warning: Could not fetch user emails: {e}")

        return {
            "github_id": str(user_data.get("id")),
            "username": user_data.get("login"),
            "display_name": user_data.get("name") or user_data.get("login"),
            "email": email or f"{user_data.get('login')}@users.noreply.github.com",
            "avatar_url": user_data.get("avatar_url")
        }

async def fetch_github_repo_metadata(repo_url: str) -> Dict[str, Any]:
    """Scrape live repository stars, forks, issues, description, and languages."""
    owner, repo_name = parse_github_url(repo_url)
    api_url = f"https://api.github.com/repos/{owner}/{repo_name}"

    async with httpx.AsyncClient() as client:
        res = await client.get(
            api_url,
            headers={
                "Accept": "application/vnd.github.v3+json",
                "User-Agent": "FOSS-Club-RIT"
            },
            timeout=10.0
        )
        if res.status_code != 200:
            raise HTTPException(
                status_code=404,
                detail=f"GitHub repository '{owner}/{repo_name}' not found or is private."
            )

        data = res.json()
        tech_stack = []
        if data.get("language"):
            tech_stack.append(data["language"])
        topics = data.get("topics", [])
        if topics:
            tech_stack.extend([t.capitalize() for t in topics[:4]])
        if not tech_stack:
            tech_stack = ["Open Source", "Software"]

        return {
            "id": f"proj-{owner.lower()}-{repo_name.lower()}",
            "name": data.get("name") or repo_name,
            "description": data.get("description") or "Open source campus project.",
            "repo_url": data.get("html_url") or repo_url,
            "tech_stack": list(dict.fromkeys(tech_stack)),
            "stars": data.get("stargazers_count", 0),
            "forks": data.get("forks_count", 0),
            "open_issues": data.get("open_issues_count", 0),
            "submitted_by_username": owner
        }

async def verify_repo_author(repo_url: str, username: str) -> bool:
    """Verify if the user is the owner, collaborator, or contributor of the repo."""
    owner, repo_name = parse_github_url(repo_url)
    
    if owner.lower() == username.lower():
        return True

    api_url = f"https://api.github.com/repos/{owner}/{repo_name}/contributors"
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(
                api_url,
                headers={
                    "Accept": "application/vnd.github.v3+json",
                    "User-Agent": "FOSS-Club-RIT"
                },
                timeout=10.0
            )
            if res.status_code == 200:
                contributors = res.json()
                if isinstance(contributors, list):
                    for c in contributors:
                        if c.get("login", "").lower() == username.lower():
                            return True
    except Exception as e:
        print(f"[GitHub Verification] Contributor check warning: {e}")

    return False
