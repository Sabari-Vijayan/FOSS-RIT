# FOSS Club — RIT Kottayam

The official web platform and community portal for the Free and Open Source Software (FOSS) Club at Rajiv Gandhi Institute of Technology (RIT), Government Engineering College, Kottayam — built in collaboration with the [TinkerHub Foundation](https://tinkerhub.org) (Campus Chapter 2160).

**Motto:** *Learn. Share. Contribute.*

---

## Overview

The platform serves as the central hub for open-source culture at RIT Kottayam. It facilitates student onboarding, showcases campus-built open-source repositories, and synchronizes live workshops and hackathons conducted with TinkerHub.

### Core Capabilities

- **Live Campus Event Synchronization:** Automatically scrapes and parses live workshop schedules, venue details, and registration links directly from the [TinkerHub RIT Campus Portal](https://tinkerhub.org/campus/2160/Rajiv%20Gandhi%20Institute%20of%20Technology,%20Velloor) with in-memory TTL caching.
- **Authenticated Project Showcase:** Students can feature open-source projects built on campus. The backend automatically queries GitHub's API to extract live metrics (stars, forks, open issues, language tags) and verifies repository authorship to prevent spoofed submissions.
- **GitHub OAuth & Student Verification:** Frictionless 1-click GitHub authentication paired with optional `@rit.ac.in` college email verification badges.
- **Data Privacy & Endpoint Sanitization:** Public directory endpoints strictly filter out sensitive data (such as student email addresses) to prevent accidental data exposure via browser inspection tools.
- **Resilient Dual-Engine Database:** SQLAlchemy 2.0 database layer that connects directly to PostgreSQL (Supabase, Neon, or self-hosted) in production, with an automatic zero-configuration SQLite fallback for local development.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript 5, Vite 5, React Router 6, Lucide Icons, Pure CSS Tokens |
| **Backend** | Python 3.10+, FastAPI, Uvicorn, Pydantic v2, HTTPX |
| **Authentication** | GitHub OAuth 2.0, Python-Jose (JWT / HS256) |
| **Database** | PostgreSQL (Supabase) / SQLite fallback via SQLAlchemy 2.0 ORM |
| **Styling** | Vanilla CSS with custom design tokens, dark/light theme support, and responsive layouts |

---

## Architecture & Directory Structure

```
foss-club-website/
├── backend/
│   ├── core/                    # Application settings, environment loading & JWT security
│   │   ├── config.py            # Typed settings (DATABASE_URL, OAuth keys, secrets)
│   │   └── security.py          # JWT generation, token decoding & auth dependencies
│   ├── db/                      # Database engine, connection pooling & ORM models
│   │   ├── session.py           # SQLAlchemy engine (PostgreSQL/Supabase + SQLite fallback)
│   │   └── models.py            # Database tables (UserDB, ProjectDB, MemberDB, EventRSVPDB)
│   ├── schemas/                 # Pydantic validation & response schemas
│   │   ├── auth.py              # UserPublic, AuthResponse, VerifyStudentEmail
│   │   ├── project.py           # Project, ProjectCreate
│   │   ├── member.py            # MemberPublic, MemberCreate, ClubStats
│   │   └── event.py             # Event, EventRSVP, RSVPResponse
│   ├── routers/                 # API route handlers
│   │   ├── auth.py              # /api/auth endpoints
│   │   ├── events.py            # /api/events endpoints (live sync & RSVPs)
│   │   ├── projects.py          # /api/projects endpoints (with author verification)
│   │   └── members.py           # /api/members endpoints (sanitized public roster)
│   ├── services/                # External integration logic
│   │   ├── github_service.py    # GitHub API scraper & contributor validation
│   │   └── tinkerhub_service.py # Live Nuxt 3 SSR scraper for RIT Campus (2160)
│   ├── main.py                  # FastAPI application entrypoint & middleware configuration
│   └── requirements.txt         # Python dependencies
│
└── frontend/
    ├── src/
    │   ├── components/          # Modular UI components
    │   │   ├── common/          # Reusable icons, toast notifications, grid backgrounds
    │   │   ├── hero/            # Hero section & community stats ribbon
    │   │   ├── layout/          # Responsive sticky Navbar & Footer
    │   │   ├── modals/          # Join, Project submit, RSVP, and Student verification modals
    │   │   └── sections/        # EventsGrid, ProjectsGrid, Pillars, Manifesto
    │   ├── context/             # Global React state (AuthContext, ThemeContext, ToastContext)
    │   ├── hooks/               # Custom hooks (useAuth, useTheme, useToast)
    │   ├── pages/               # Routed pages (HomePage, EventsPage, ProjectsPage, AuthCallbackPage)
    │   ├── services/            # API client (api.ts)
    │   ├── styles/              # Global design system tokens and layout stylesheets
    │   └── types/               # TypeScript interface definitions
    ├── index.html               # Single-page application entrypoint
    ├── vite.config.ts           # Vite configuration & dev proxy
    └── package.json             # Frontend dependencies & build scripts
```

---

## Local Development Setup

### Prerequisites
- **Node.js**: v18.0+ ([nodejs.org](https://nodejs.org/))
- **Python**: 3.10+ ([python.org](https://www.python.org/))
- **Git**: ([git-scm.com](https://git-scm.com/))

---

### 1. Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. *(Optional)* Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   > **Note:** If `DATABASE_URL` is omitted, the backend automatically initializes a local SQLite database (`foss_club.db`). To connect to a live Supabase instance, supply your PostgreSQL connection URI in `backend/.env`.

5. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   - Health check: `http://localhost:8000/api/health`
   - Interactive Swagger Docs: `http://localhost:8000/docs`

---

### 2. Frontend Setup

1. Open a separate terminal window and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Access the web application at `http://localhost:5173`.

---

## API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/github` | None | Exchanges GitHub OAuth code for a 30-day JWT session. |
| `GET` | `/api/auth/me` | Bearer | Returns the authenticated user's profile. |
| `POST` | `/api/auth/verify-student` | Bearer | Validates `@rit.ac.in` domain and awards student verification badge. |
| `POST` | `/api/auth/dev-login` | None | Development helper for testing authenticated flows locally. |

### Events & Workshops (`/api/events`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | None | Returns live campus workshops scraped from TinkerHub RIT. |
| `POST` | `/api/events/sync-tinkerhub` | None | Flushes the cache and triggers a live re-scrape. |
| `GET` | `/api/events/{event_id}` | None | Retrieves metadata for a specific workshop. |
| `POST` | `/api/events/rsvp` | None | Registers an attendance RSVP for a standalone meetup. |

### Projects Radar (`/api/projects`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/projects` | None | Lists featured projects with optional `?tech=` filtering. |
| `POST` | `/api/projects` | Bearer | Auto-scrapes and features a GitHub repo after verifying contributor status. |
| `DELETE` | `/api/projects/{id}` | Bearer | Deletes a project (restricted to the original submitter or admin). |

### Community Members (`/api/members`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/members` | None | Returns the public roster (student emails sanitized). |
| `POST` | `/api/members/join` | None | Registers a student in the founding membership directory. |
| `GET` | `/api/members/stats` | None | Computes live metrics across database records and TinkerHub sessions. |

---

## Security & Anti-Spam Design

1. **Automated Contributor Verification:** When a student submits a repository URL, the backend queries GitHub's API in real-time to confirm that the logged-in user is an author or contributor of that repository. Submissions for external or unassociated projects are blocked with `403 Forbidden`.
2. **Minimal OAuth Scope:** Authentication requests only `read:user` permissions. The platform never requests write permissions or access to private repositories.
3. **Data Sanitization:** Endpoints returning public member records use the `MemberPublic` schema, omitting personal contact details and private emails from public API payloads.

---

## Contributing

We welcome contributions from students, alumni, and community members.

1. Fork the repository on GitHub.
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes with concise, descriptive commit messages:
   ```bash
   git commit -m "feat(events): add date range filter to campus schedule"
   ```
4. Verify the frontend and backend builds:
   ```bash
   # Frontend verification
   cd frontend && npm run build
   ```
5. Push to your fork and submit a Pull Request to the `main` branch.

---

## License

This project is open-source and released under the [MIT License](https://opensource.org/licenses/MIT).

- **Institution:** [Rajiv Gandhi Institute of Technology (RIT), Kottayam](https://rit.ac.in)
- **Partner Community:** [TinkerHub Foundation](https://tinkerhub.org)
