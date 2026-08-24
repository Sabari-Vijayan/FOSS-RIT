# FOSS Club RIT — Maintainer & Reviewer Guide

Welcome to the FOSS Club RIT core maintainer team! 

Your role is to help review and verify open-source project submissions from campus students. This guide outlines the simple 4-step review process designed to keep verification fast, fair, and educational.

---

## 🎯 The 4-Step Review Workflow

Whenever a student opens a Pull Request to submit or update their project:

### Step 1: Check the Automated Review Card
When a PR is opened, the `@github-actions` bot will automatically comment on the PR with a **Project Review Summary Card**.
- Verify that the automated checks have a **Green Checkmark (Passed)**.
- If the checks failed, the bot will show the exact error (e.g. missing `repo_url` or typo in frontmatter). You can ask the student to fix the typo.

### Step 2: Cross-Verify the Project Link (30 Seconds)
Click the repository link in the PR comment and verify:
1. **Real Code:** Is there actual code in the repository (not an empty repo)?
2. **README:** Is there a basic README explaining what the project does?
3. **Public Repo:** Is the repository public and accessible?
4. **Student Identity:** Is the submitter a student/alumni of RIT Kottayam?

### Step 3: Leave a Friendly Review
- If everything looks good:
  - Click **Files changed** -> **Review changes** -> **Approve**.
  - Leave a friendly message: *"Great project! Approved for the campus radar."*
- If something needs improvement (e.g. missing README or invalid link):
  - Click **Request changes** and leave a helpful comment:
    *"Hey @username! Looks like your repository is currently private. Could you make it public so we can feature it on the website?"*

### Step 4: Merge the Pull Request
Once approved:
1. Click **Merge pull request** -> **Confirm merge**.
2. The auto-sync system will automatically calculate the student's XP, add them to the Leaderboard, and deploy the updated website in ~10 seconds.

---

## 🚩 When to Reject or Ask for Changes

| Situation | Action to Take |
| :--- | :--- |
| **Empty repository (no code)** | Ask the student to push their code before requesting to be featured. |
| **Unmodified fork of an existing project** | Politely decline: submissions must be original work or active contributions. |
| **Spam / non-student submissions** | Close the PR with a short explanation. |
| **More than 3 projects from one student** | Ask the student which 3 projects they would like featured on the radar. |

---

## 💡 Tips for Junior Maintainers

- **Be Encouraging:** Many 1st and 2nd-year students are making their very first GitHub Pull Request. Be welcoming and supportive!
- **Never Merge Breaking Code:** Only PRs modifying `content/projects/*.md` should be merged by junior maintainers. Any PR modifying `frontend/`, `scripts/`, or `.github/` requires review from `@vertigotalks7`.
- **Ask Questions:** If you're unsure about a submission, tag `@vertigotalks7` in a PR comment to get a second opinion.
