# 🚀 FOSS Club — RIT Kottayam

<p align="center">
  <strong>Official Open Source Community of Rajiv Gandhi Institute of Technology (RIT), Kottayam</strong><br>
  <em>In active collaboration with <a href="https://tinkerhub.org">TinkerHub Foundation</a></em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Genesis_Chapter_Launch-08B74F?style=for-the-badge" alt="Genesis Launch" />
  <img src="https://img.shields.io/badge/Frontend-React_18_%2B_Vite_%2B_TS-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Backend-FastAPI_%2B_Python_3.10+-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Database-Supabase_%2F_PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
</p>

> **"Build in the open. Learn by Tinkering. Ship together."**

Welcome to the official web platform repository for **FOSS Club RIT Kottayam**. This platform powers our student onboarding, workshop & bootcamp registrations, campus project showcase, and open-source learning circles in partnership with **TinkerHub**.

---

## 📑 Table of Contents

- [About the Community](#-about-the-community)
- [Key Platform Features](#-key-platform-features)
- [Tech Stack Overview](#-tech-stack-overview)
- [Project Architecture & Directory Structure](#-project-architecture--directory-structure)
- [Step-by-Step Local Setup Guide](#-step-by-step-local-setup-guide)
  - [Prerequisites](#1-prerequisites)
  - [Backend Setup (FastAPI)](#2-backend-setup-fastapi)
  - [Frontend Setup (React + Vite)](#3-frontend-setup-react--vite)
  - [Database Setup (Supabase / PostgreSQL)](#4-database-setup-supabase--postgresql)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Automated GitHub Scraper](#-automated-github-scraper)
- [Design System & Brand Tokens](#-design-system--brand-tokens)
- [Contributing Guidelines](#-contributing-guidelines)
- [License & Acknowledgements](#-license--acknowledgements)

---

## 🌐 About the Community

**FOSS Club RIT Kottayam** is a student-led initiative at Rajiv Gandhi Institute of Technology, Government Engineering College, Kottayam. 

Our goal is to build an active hacker and builder culture by:
1. **Taking Students from Zero to First PR**: No prior coding experience required. We teach Git, Linux, and terminal productivity from ground zero.
2. **Hosting Peer Learning Circles**: Cohort-based learning tracks for Web Development, Python, Systems Programming, Open Hardware, and Go in collaboration with **TinkerHub**.
3. **Shipping Real Campus Tools**: Building open-source utilities tailored for RIT students and KTU curriculum needs.
4. **Welcoming All Engineering Disciplines**: Open to all departments — CSE, ECE, EEE, Mechanical, Civil, MCA, and Robotics.

---

## ✨ Key Platform Features

- 🌓 **Theme Switcher (Dark / Light)**: High-contrast **Code Night** (`#1A1A1A`) and **Libre White** (`#FFFFFF`) themes with zero flicker and `localStorage` persistence.
- 🎟️ **Real-Time Event RSVPs**: Reserve spots for upcoming campus workshops and bootcamps with live seat availability counters and duplicate registration prevention.
- 🔍 **Auto-Scraped Project Radar**: Simply paste a GitHub repository link, and our backend automatically scrapes live stars, forks, open issues count, description, and technology tags directly from GitHub.
- 📝 **Founding Cohort Onboarding**: Streamlined membership form for RIT students across branches.
- 🎨 **Brand Mascot Expressions**: Interactive SVG vector avatars representing different builder vibes (Happy Hacker, Systems Master, Vibe Coder, Kernel Debugger).
- 🛡️ **Graceful Fallback Mode**: The frontend contains built-in fallback seed mocks, allowing UI developers to build and test features even if the backend or database is offline.

---

## 🛠️ Tech Stack Overview

### Frontend
- **Core**: React 18, TypeScript 5, Vite 5
- **Icons**: Lucide React + Custom SVG Brand Vectors
- **Styling**: Pure CSS Design Tokens (`tokens.css`, `index.css`, `animations.css`) for 100% control, fluid typography, and zero heavy CSS bloat.
- **State & Context**: Native React Hooks (`useContext`, `useState`, `useEffect`, `useCallback`).

### Backend
- **Framework**: Python 3.10+, FastAPI (ASGI)
- **Server**: Uvicorn with auto-reload (`uvicorn[standard]`)
- **Data Validation & Typing**: Pydantic v2 with `email-validator`
- **Scraping Engine**: Asynchronous HTTP client extracting public repository metadata from GitHub APIs.

### Database & Storage
- **Database**: PostgreSQL / Supabase
- **Extensions**: `uuid-ossp`, `JSONB` native indexing for flexible scraped data.

---

## 📁 Project Architecture & Directory Structure

```
foss-club-website/
├── .gitignore                    # Global ignore rules for Node, Python & credentials
├── README.md                     # Comprehensive developer & contributor documentation
│
├── backend/                      # FastAPI Python REST Backend
│   ├── .env.example              # Template for Supabase & environment configuration
│   ├── main.py                   # FastAPI app entry, CORS configuration & health check
│   ├── models.py                 # Pydantic data schemas (Member, Event, Project, Stats)
│   ├── database.py               # In-memory database store & initial seed datasets
│   ├── requirements.txt          # Python dependencies (fastapi, uvicorn, email-validator)
│   └── routers/
│       ├── events.py             # Endpoints for event listing, details, and RSVP booking
│       ├── projects.py           # Endpoints for project showcase & GitHub auto-scraping
│       └── members.py            # Endpoints for student onboarding and live club stats
│
└── frontend/                     # React 18 + TypeScript + Vite Client
    ├── index.html                # Single-page HTML entry with Inter & JetBrains Mono
    ├── vite.config.ts            # Vite bundler config with /api proxy forwarding
    ├── tsconfig.json             # Strict TypeScript compiler options
    ├── package.json              # Frontend scripts & npm dependencies
    └── src/
        ├── main.tsx              # React bootstrap with ThemeProvider & ToastProvider
        ├── App.tsx               # Root view & layout coordinator
        ├── types/
        │   └── index.ts          # TypeScript interfaces mirroring backend models
        ├── services/
        │   └── api.ts            # Typed REST API service with graceful fallback mocks
        ├── context/
        │   ├── ThemeContext.tsx  # Code Night (Dark) / Libre White (Light) mode toggler
        │   └── ToastContext.tsx  # Global toast notification dispatcher
        ├── components/
        │   ├── layout/
        │   │   ├── Navbar.tsx    # Sticky brand header & quick navigation links
        │   │   └── Footer.tsx    # Multi-column footer with RIT & TinkerHub metadata
        │   ├── hero/
        │   │   ├── Hero.tsx      # Centered headline, CTAs, and chapter badge
        │   │   └── StatsRibbon.tsx # Founding cohort metrics counters
        │   ├── sections/
        │   │   ├── Pillars.tsx   # "Why FOSS Club" 4-pillar cards
        │   │   ├── EventsGrid.tsx# Filterable workshop list with RSVP triggers
        │   │   ├── ProjectsGrid.tsx # Project radar with live scraped GitHub badges
        │   │   ├── MascotBanner.tsx # Interactive community vibe mascots
        │   │   └── Manifesto.tsx # The 4 Software Freedoms
        │   ├── modals/
        │   │   ├── JoinModal.tsx # Student membership onboarding popup
        │   │   ├── RsvpModal.tsx # Workshop seat reservation popup
        │   │   └── ProjectModal.tsx # Single-link GitHub repository submission
        │   └── ui/
        │       └── Icons.tsx     # Custom SVG vector icons (GitHub, brand icons)
        └── styles/
            ├── tokens.css        # Official brand color tokens & CSS custom properties
            ├── animations.css    # Pulse dots, badge glows & micro-interactions
            └── index.css         # Typography hierarchy, buttons, cards & modal styles
```

---

## 🚀 Step-by-Step Local Setup Guide

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **Python**: `3.10` or higher ([Download Python](https://www.python.org/))
- **Git**: ([Download Git](https://git-scm.com/))

---

### 2. Backend Setup (FastAPI)

1. Open your terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - **Windows PowerShell**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     source venv/bin/activate
     ```

4. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

5. (Optional) Configure environment variables:
   ```bash
   cp .env.example .env
   ```

6. Start the FastAPI development server:
   ```bash
   python -m uvicorn main:app --reload --port 8000
   ```

7. Verify backend status:
   - API Status: `http://127.0.0.1:8000/api/health`
   - Interactive Swagger API Docs: `http://127.0.0.1:8000/docs`
   - ReDoc Interactive Docs: `http://127.0.0.1:8000/redoc`

---

### 3. Frontend Setup (React + Vite)

1. Open a **new terminal window** and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   👉 **`http://localhost:3000`**

---

### 4. Database Setup (Supabase / PostgreSQL)

The platform is designed to connect to **Supabase** (or any PostgreSQL instance).

1. Create a free project on **[supabase.com](https://supabase.com)**.
2. Navigate to the **SQL Editor** in your Supabase dashboard.
3. Paste and execute the table schema:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Members Table
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    github_username VARCHAR(100),
    department VARCHAR(100) NOT NULL,
    year_of_study INT NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Events Table
CREATE TABLE events (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    date_time VARCHAR(150) NOT NULL,
    location VARCHAR(200) NOT NULL,
    capacity INT NOT NULL DEFAULT 60,
    registered_count INT NOT NULL DEFAULT 0,
    is_open BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Event RSVPs Table
CREATE TABLE event_rsvps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(50) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_event_rsvp UNIQUE (event_id, email)
);

-- 4. Projects Table (Auto-scraped)
CREATE TABLE projects (
    id VARCHAR(50) PRIMARY KEY,
    repo_url VARCHAR(300) UNIQUE NOT NULL,
    name VARCHAR(150),
    description TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    stars INT DEFAULT 0,
    forks INT DEFAULT 0,
    open_issues INT DEFAULT 0,
    last_synced_at TIMESTAMPTZ DEFAULT NOW()
);
```

4. Copy your Database connection URI from **Project Settings -> Database -> Connection String** and place it in your `backend/.env` file:
   ```env
   DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description | Payload / Query |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint | None |
| `GET` | `/api/events` | List all upcoming workshops & hackathons | None |
| `GET` | `/api/events/{event_id}` | Retrieve details for a single event | `event_id` in path |
| `POST` | `/api/events/{event_id}/rsvp` | Register RSVP for a workshop | `{ "name": "...", "email": "..." }` |
| `GET` | `/api/projects` | List all open source projects (supports filter) | `?tech=React` |
| `POST` | `/api/projects` | Submit a project & auto-scrape GitHub data | `{ "repo_url": "https://github.com/..." }` |
| `GET` | `/api/members` | List members & contributor directory | None |
| `POST` | `/api/members/join` | Onboard new founding student member | `{ "name": "...", "email": "...", "department": "...", "year_of_study": 2 }` |
| `GET` | `/api/members/stats` | Retrieve live community metrics | None |

---

## 🤖 Automated GitHub Scraper

When a student submits a repository link via `POST /api/projects`:
1. The backend parses the repository `owner` and `repo` name from the URL.
2. It queries GitHub's public API (`https://api.github.com/repos/{owner}/{repo}`).
3. It automatically extracts:
   - **Repository Name & Description**
   - **Live Star & Fork count**
   - **Primary Language & Topic Tags**
   - **Open Issues count**
4. It stores the sanitized record in the database without requiring manual maintenance!

---

## 🎨 Design System & Brand Tokens

The user interface follows clean, high-contrast developer aesthetics:

| Token Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| `--foss-mint` | `#08B74F` | Primary brand green, CTA buttons, active states |
| `--code-night` | `#1A1A1A` | Dark mode background surface |
| `--open-gray` | `#1E1E1E` | Card containers and elevated surfaces |
| `--surface-border` | `#2E2E2E` | Subtle borders & dividers |
| `--pixel-blue` | `#2B7FFF` | Accent highlights & secondary tags |
| `--byte-yellow` | `#F5C040` | Stars, warnings, and accents |
| `--flame-red` | `#E84A36` | Issues, alerts, and capacity warnings |
| `--libre-white` | `#FFFFFF` | Light mode surface & crisp primary text |

---

## 🤝 Contributing Guidelines

We welcome contributions from all students, alumni, and open-source enthusiasts!

1. **Fork the Repository** on GitHub.
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/foss-club-website.git
   cd foss-club-website
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/awesome-new-feature
   ```
4. **Make your changes** (test both frontend and backend):
   ```bash
   # In frontend:
   npm run build
   ```
5. **Commit your changes** using conventional commit messages:
   ```bash
   git commit -m "feat: add campus project search filter"
   ```
6. **Push to your branch**:
   ```bash
   git push origin feature/awesome-new-feature
   ```
7. **Open a Pull Request** against the `main` branch.

---

## 📜 License & Acknowledgements

- **License**: Released under the **[MIT License](https://opensource.org/licenses/MIT)**.
- **Institution**: [Rajiv Gandhi Institute of Technology (RIT), Kottayam](https://rit.ac.in) — Government Engineering College.
- **Partner**: [TinkerHub Foundation](https://tinkerhub.org) — Empowering peer-to-peer tech learning across Kerala.

<p align="center">
  <em>Crafted with ❤️ by the students of RIT Kottayam.</em>
</p>
