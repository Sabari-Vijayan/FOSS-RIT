# Contributing to FOSS Club RIT 🚀

Welcome to the **FOSS Club RIT** open-source repository! We showcase open-source software, developer tools, and campus utilities built by students and alumni of **Rajiv Gandhi Institute of Technology (RIT Kottayam)**.

---

## 🌟 How to Feature Your Project on Campus Radar

We use a **Pure GitOps** workflow. You don't need to log into any database—simply submit a Pull Request!

### Step 1: Fork this Repository
Click the **Fork** button at the top right of this repository to create your own copy on GitHub.

### Step 2: Create a Markdown File
In your fork, create a new file under `content/projects/` named after your project (e.g. `content/projects/my-cool-project.md`):

```markdown
---
name: "My Cool Project"
description: "A short 1-2 sentence description explaining what your tool does."
repo_url: "https://github.com/your-username/your-repo-name"
tech_stack: ["Python", "React", "FastAPI"]
author: "your-github-username"
author_name: "Your Full Name"
is_verified_student: true
batch: "2026"
featured: true
---
```

### Step 3: Open a Pull Request (PR)
1. Commit your changes:
   ```bash
   git add content/projects/my-cool-project.md
   git commit -m "feat(projects): add My Cool Project to campus radar"
   git push origin main
   ```
2. Open a **Pull Request** to the `main` branch of this repository.
3. Our automated bot will validate your file format, and a club maintainer will review and merge it!

---

## 🏆 Earning Developer XP on the Leaderboard

Once your project is merged:
- 🚀 **First Project:** `+100 XP`
- 🔱 **2nd & 3rd Projects:** `+75 XP each`
- 🍴 **Peer Forks:** `+20 XP / fork`
- ⭐ **GitHub Stars:** `+5 XP / star` (capped at 100 XP/repo)
- ⚡ **Multi-Stack Languages:** `+15 XP / unique language`
- 🎓 **RIT Student Verification:** `+50 XP`

Level up your developer title from **Script Tinkerer** to **Kernel Overlord**!
