#!/usr/bin/env python3
"""
FOSS Club RIT — Project Submission PR Validator
Validates frontmatter, security constraints, and generates a supervised review summary card.
"""

import sys
import re
import os
import json
import urllib.request
import urllib.error
from pathlib import Path

# Ensure UTF-8 output across all platforms
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

def validate():
    content_dir = Path("content/projects")
    if not content_dir.exists():
        print("[Error] `content/projects` directory not found!")
        sys.exit(1)

    md_files = [f for f in content_dir.glob("*.md") if f.name != "_template.md"]
    
    if not md_files:
        print("No project markdown files found to validate.")
        return

    hard_errors = []
    authors = {}
    summary_cards = []
    token = os.environ.get("GITHUB_TOKEN")

    for f in md_files:
        text = f.read_text(encoding="utf-8")
        
        # --- HARD BLOCK 1: Syntax & Frontmatter ---
        if not text.startswith("---"):
            hard_errors.append(f"{f.name}: Missing frontmatter opening delimiter (---)")
            continue
        
        # --- HARD BLOCK 2: XSS & Script Injection ---
        if "<script" in text.lower():
            hard_errors.append(f"{f.name}: Malicious or unsafe `<script>` tags are strictly prohibited.")

        # --- HARD BLOCK 3: Mandatory Fields ---
        if "name:" not in text:
            hard_errors.append(f"{f.name}: Missing required field `name:`")
        if "repo_url:" not in text:
            hard_errors.append(f"{f.name}: Missing required field `repo_url:`")
        if "author:" not in text:
            hard_errors.append(f"{f.name}: Missing required field `author:`")
        
        url_match = re.search(r"repo_url:\s*[\"']?(https://github\.com/([a-zA-Z0-9_-]+)/([a-zA-Z0-9._-]+))[\"']?", text)
        if not url_match:
            hard_errors.append(f"{f.name}: Invalid GitHub `repo_url` (must be https://github.com/owner/repository)")
            continue

        repo_owner = url_match.group(2)
        repo_name = url_match.group(3).replace(".git", "")
        repo_url = url_match.group(1).rstrip("/")
        
        name_match = re.search(r"name:\s*[\"']?([^\"\n\r]+)[\"']?", text)
        author_match = re.search(r"author:\s*[\"']?@?([a-zA-Z0-9_-]+)[\"']?", text)
        batch_match = re.search(r"batch:\s*[\"']?([^\"\n\r]+)[\"']?", text)
        tech_match = re.search(r"tech_stack:\s*\[(.*?)\]", text)
        
        author_str = author_match.group(1).strip() if author_match else "Unknown"
        author_lower = author_str.lower()
        authors[author_lower] = authors.get(author_lower, 0) + 1
        if authors[author_lower] > 3:
            hard_errors.append(f"{f.name}: Author @{author_str} has exceeded the limit of 3 featured campus projects.")

        # --- SUPERVISED CHECK: Query GitHub API for Live Status ---
        api_url = f"https://api.github.com/repos/{repo_owner}/{repo_name}"
        headers = {"User-Agent": "FOSS-RIT-PR-Validator/1.0"}
        if token:
            headers["Authorization"] = f"Bearer {token}"

        live_status_badge = "🔍 Pending verification"
        warning_notice = ""
        
        req = urllib.request.Request(api_url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=8) as resp:
                if resp.status == 200:
                    repo_payload = json.loads(resp.read().decode("utf-8"))
                    live_stars = repo_payload.get("stargazers_count", 0)
                    live_forks = repo_payload.get("forks_count", 0)
                    live_status_badge = f"✅ Live Public Repository (⭐ {live_stars} | 🍴 {live_forks})"
        except urllib.error.HTTPError as he:
            if he.code == 404:
                live_status_badge = "⚠️ **404 Not Found (Action Required)**"
                warning_notice = (
                    f"> [!WARNING]\n"
                    f"> **Repository Returned 404 Not Found:**\n"
                    f"> The link `{repo_url}` is either private, misspelled, or does not exist yet.\n"
                    f"> 👉 **Junior Maintainer Action:** Ask @{author_str} to ensure the repository is set to **Public** before approving!"
                )
            elif he.code == 403:
                live_status_badge = "ℹ️ Rate limit reached (Link manually verifiable)"
            else:
                live_status_badge = f"ℹ️ HTTP {he.code} during check"
        except Exception as e:
            live_status_badge = "ℹ️ Check bypassed"

        # Ownership notice for maintainers
        club_orgs = ["foss-rit", "tinkerhub-rit", "rit-foss"]
        ownership_notice = ""
        if repo_owner.lower() != author_lower and repo_owner.lower() not in club_orgs:
            ownership_notice = f"> [!NOTE]\n> **Ownership Note:** Repository owner (`@{repo_owner}`) differs from author (`@{author_str}`). Please verify this is a team or organization project."

        proj_name = name_match.group(1).strip() if name_match else f.stem
        batch_str = batch_match.group(1).strip() if batch_match else "2026"
        tech_str = tech_match.group(1).strip() if tech_match else "Code"

        notices = []
        if warning_notice:
            notices.append(warning_notice)
        if ownership_notice:
            notices.append(ownership_notice)
        notices_formatted = "\n\n".join(notices)
        if notices_formatted:
            notices_formatted += "\n"

        card = f"""### 📋 Project Review Summary for Maintainers
- **Project Name:** {proj_name}
- **Submitted by:** @{author_str} (Batch: {batch_str})
- **Repository:** [{repo_url}]({repo_url})
- **Status:** {live_status_badge}
- **Tech Stack:** `{tech_str}`

{notices_formatted}
#### ✅ Maintainer Verification Checklist:
- [ ] Click the repository link: verify it is public and contains working code.
- [ ] Verify the repository has a basic README explaining how to run the project.
- [ ] Verify the contributor (@{author_str}) is an authentic student builder at RIT.
- [ ] Confirm this is original work or an active project (not an unmodified clone)."""

        summary_cards.append(card)

    if hard_errors:
        print("❌ Hard Validation Errors Found:")
        for e in hard_errors:
            print(f"  - {e}")
        sys.exit(1)

    # Write summary for PR comment
    with open("pr_summary.md", "w", encoding="utf-8") as sf:
        sf.write("\n\n---\n\n".join(summary_cards))

    print(f"✅ All {len(md_files)} project files passed syntax and format checks!")

if __name__ == "__main__":
    validate()
