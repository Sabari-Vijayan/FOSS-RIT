# 🚀 Future Architecture & Scaling Blueprint (`FUTURE_PLAN.md`)

> **For Future Maintainers, Tech Leads & FOSS Club Collaborators**  
> *Rajiv Gandhi Institute of Technology (RIT), Kottayam • In Collaboration with TinkerHub*

---

## 📌 Executive Summary

This platform was engineered by [@vertigotalks7](https://github.com/vertigotalks7) on a **100% Pure GitOps / Jamstack Architecture**.  
- **Data Source of Truth:** Flat Markdown files (`content/projects/*.md`).
- **Telemetry Engine:** Python automated worker (`scripts/sync_data.py`).
- **Hosting & CI/CD:** Vercel Global Edge CDN + GitHub Actions.
- **Cost & Maintenance:** **$0/month, zero databases, zero servers to patch or maintain.**

This document provides future maintainers with an exact technical roadmap for how to scale, optimize, and evolve the platform as student submissions grow from **tens of projects** to **thousands of projects over the next 10+ years**.

---

## 📊 Current System Capacity vs. Future Milestones

```
┌─────────────────────────┬──────────────────────────┬────────────────────────────────────────────────────────┐
│ Scale Milestone         │ Estimated Timeframe      │ Recommended Architectural Action                       │
├─────────────────────────┼──────────────────────────┼────────────────────────────────────────────────────────┤
│ 1. Current (10 - 500)   │ Years 1 – 3              │ Current Flat-File GitOps (Runs perfectly as-is)        │
│ 2. Growth (500 - 3,000) │ Years 4 – 6              │ Implement Incremental Telemetry Caching                │
│ 3. Campus (3,000 - 10k) │ Years 7 – 10             │ Introduce Batch / Year Directory Partitioning          │
│ 4. State Level (10,000+)│ Inter-College Expansion  │ Switch to GitHub GraphQL API v4 / Edge Headless DB     │
└─────────────────────────┴──────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 🛠️ Step-by-Step Scaling Solutions for Future Maintainers

---

### Phase 1: Incremental Telemetry Caching (Scale: 500 to 3,000 Projects)

#### ⚠️ The Symptom:
When the club reaches 1,000+ historical projects, merging a PR takes ~30–45 seconds in GitHub Actions because `sync_data.py` sequentially checks GitHub stars for every single 5-year-old project.

#### 💡 The Solution:
Modify `scripts/sync_data.py` to use **Incremental PR Syncing**:
1. When a PR merges into `main`, read the existing `frontend/src/data/projects.json`.
2. Only make a live GitHub API call for the **newly added/modified file in that PR** (1 API call instead of 1,000).
3. Let the **nightly midnight cron (`nightly-sync.yml`)** handle the full refresh of all historical projects when everyone is asleep.

#### 📝 Python Implementation Snippet:
```python
# In scripts/sync_data.py
existing_projects = {p["repo_url"].lower(): p for p in load_existing_projects_json()}

for f in md_files:
    fm = parse_markdown_frontmatter(f)
    repo_url = fm["repo_url"]
    
    # If project already exists in JSON and file was not modified, reuse cached metrics:
    if repo_url.lower() in existing_projects and not is_nightly_cron:
        telemetry = {
            "stars": existing_projects[repo_url.lower()]["stars"],
            "forks": existing_projects[repo_url.lower()]["forks"],
            "open_issues": existing_projects[repo_url.lower()]["open_issues"]
        }
    else:
        telemetry = fetch_github_repo_telemetry(repo_url)
```

---

### Phase 2: Batch & Year Directory Partitioning (Scale: 3,000 to 10,000 Projects)

#### ⚠️ The Symptom:
Having 5,000+ individual files in a single flat `content/projects/` directory makes GitHub's Web UI slower to browse.

#### 💡 The Solution:
Organize the markdown files by graduating academic batch:
```
content/
└── projects/
    ├── 2023/
    │   └── tinkerfetch.md
    ├── 2024/
    │   └── tempspace.md
    ├── 2025/
    │   └── ai-companion.md
    └── 2026/
        └── foss-club-website.md
```

#### What to update:
1. Update `scripts/sync_data.py` to scan recursively:
   ```python
   md_files = list(CONTENT_DIR.rglob("*.md"))
   ```
2. Update the frontend UI to include a **Batch Year Filter** on the Projects Radar (`All Years`, `Batch 2026`, `Batch 2025`, `Alumni Archive`).

---

### Phase 3: GitHub GraphQL API v4 (Scale: 10,000+ Projects)

#### ⚠️ The Symptom:
If the platform expands to represent all TinkerHub campus chapters or KTU engineering colleges across Kerala, hitting REST API 1-by-1 reaches the 5,000 requests/hr ceiling.

#### 💡 The Solution:
Switch from GitHub **REST API v3** to **GraphQL API v4**:
- **Why GraphQL?** A single GraphQL query can fetch stars, forks, issues, and language for **100 repositories in a single HTTP request**.
- **The Result:** 10,000 repositories require only **100 requests** total (takes under 8 seconds).

#### 📝 GraphQL Query Blueprint:
```graphql
query GetBatchMetrics {
  repo1: repository(owner: "vertigotalks7", name: "FOSS-RIT") { stargazerCount forkCount primaryLanguage { name } }
  repo2: repository(owner: "Sabari-Vijayan", name: "tinkerfetch") { stargazerCount forkCount primaryLanguage { name } }
  # ... up to 100 repositories per query
}
```

---

### Phase 4: Alternative Database Options (If Pure Static is Ever Outgrown)

If a future team lead wishes to introduce user comments, live chat, or dynamic RSVP ticket scanning:

| Alternative | Why Choose It | Estimated Cost |
| :--- | :--- | :---: |
| **1. Turso (LibSQL / SQLite on Edge)** | Millions of reads/month, ultra-fast, serverless | Free Tier |
| **2. Supabase (PostgreSQL)** | Built-in Auth, Row-Level Security, Realtime websockets | Free Tier |
| **3. PocketBase (Single-binary backend)** | Self-hostable on a single free VM or cheap VPS | Free / $3 mo |

> ⚠️ **Maintainer Advice:** Avoid adding an SQL database unless you genuinely need real-time user-generated data like live chat. Flat-file GitOps requires **zero maintenance and never suffers from database corruption or migration failures**.

---

## 🔑 Maintainer Handover & Ownership Transition Guide

When senior club admins graduate and pass leadership to the junior core team:

1. **GitHub Repository Admin Access:**
   - Go to **Settings $\rightarrow$ Collaborators** $\rightarrow$ add the new Lead Admin with **Admin** permissions.
   - Update [`.github/CODEOWNERS`](file:///c:/PROJECTS/foss-club-website/.github/CODEOWNERS) to list the new lead's GitHub handle.

2. **Vercel Project Ownership:**
   - In Vercel Project Settings $\rightarrow$ Transfer ownership to the incoming team or FOSS Club GitHub Organization.

3. **Domain & DNS (Optional):**
   - If the club purchases `fossrit.in` or `foss.rit.ac.in`:
   - Add Custom Domain in Vercel Settings $\rightarrow$ Domains $\rightarrow$ Add CNAME pointing to `cname.vercel-dns.com`.

---

## 📜 Preserving Open Source Culture

Always remember the primary educational goal of this project:
> **"Every student who wants to feature a project learns how to fork a repository, write clean markdown, and open their first Pull Request."**

Keep the contribution process beginner-friendly, keep the automated review bots helpful, and empower students to build and ship in public! 🚀
