import re
from typing import Dict, Any, List, Optional
import httpx
from fastapi import HTTPException
from core.config import settings

def parse_github_url(repo_url: str) -> tuple[str, str]:
    """Extract (owner, repo) from a GitHub URL."""
    clean_url = repo_url.strip().rstrip("/")
    match = re.search(r"github\.com/([^/]+)/([^/]+)", clean_url)
    if not match:
        raise HTTPException(
            status_code=400,
            detail="Invalid GitHub repository URL. Must be in the format: https://github.com/owner/repository"
        )
    return match.group(1), match.group(2)

async def exchange_github_code(code: str) -> Dict[str, Any]:
    """Exchange GitHub OAuth authorization code for verified user profile."""
    if not settings.GITHUB_CLIENT_ID or not settings.GITHUB_CLIENT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="GitHub OAuth credentials not configured on the server. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in backend/.env"
        )

    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": settings.GITHUB_REDIRECT_URI
            },
            timeout=15.0
        )
        
        token_data = token_res.json()
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
            email_res = await client.get("https://api.github.com/user/emails", headers=auth_headers, timeout=10.0)
            if email_res.status_code == 200:
                emails = email_res.json()
                for e in emails:
                    if e.get("primary") and e.get("verified"):
                        email = e.get("email")
                        break

        return {
            "github_id": str(user_data.get("id")),
            "username": user_data.get("login"),
            "display_name": user_data.get("name") or user_data.get("login"),
            "email": email,
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

        if res.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail=f"Repository '{owner}/{repo_name}' was not found on GitHub. Please ensure it is public."
            )
        elif res.status_code != 200:
            return {
                "name": repo_name,
                "description": f"Open-source repository by {owner}.",
                "repo_url": repo_url,
                "tech_stack": ["Open Source"],
                "stars": 0,
                "forks": 0,
                "open_issues": 0
            }

        data = res.json()
        
        tech_stack = []
        if data.get("language"):
            tech_stack.append(data.get("language"))
        if data.get("topics"):
            tech_stack.extend(data.get("topics")[:4])
        if not tech_stack:
            tech_stack = ["Open Source"]

        return {
            "name": data.get("name", repo_name),
            "description": data.get("description") or f"Open-source repository by {owner}.",
            "repo_url": data.get("html_url", repo_url),
            "tech_stack": [t.capitalize() if len(t) > 3 else t.upper() for t in tech_stack],
            "stars": data.get("stargazers_count", 0),
            "forks": data.get("forks_count", 0),
            "open_issues": data.get("open_issues_count", 0)
        }

async def verify_repo_author(repo_url: str, username: str) -> bool:
    """
    Verify whether the authenticated username is the owner or a contributor to the repository.
    Allows campus authors to feature their work while preventing strangers from claiming external repos.
    """
    owner, repo_name = parse_github_url(repo_url)
    
    if owner.lower() == username.lower():
        return True

    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(
                f"https://api.github.com/repos/{owner}/{repo_name}/contributors",
                headers={"Accept": "application/vnd.github.v3+json", "User-Agent": "FOSS-Club-RIT"},
                timeout=8.0
            )
            if res.status_code == 200:
                contributors = res.json()
                for c in contributors:
                    if isinstance(c, dict) and c.get("login", "").lower() == username.lower():
                        return True
    except Exception:
        pass

    if owner.lower() in ["foss-rit", "tinkerhub-rit", "rit-kottayam"]:
        return True

    return False
