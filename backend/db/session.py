from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from core.config import settings
from db.models import Base, ProjectDB, MemberDB, UserDB

DATABASE_URL = settings.DATABASE_URL

# Fallback to local SQLite if DATABASE_URL is not configured
if not DATABASE_URL or "your-project-ref" in DATABASE_URL or "postgres.your-project" in DATABASE_URL:
    db_path = Path(__file__).resolve().parent.parent / "foss_club.db"
    DATABASE_URL = f"sqlite:///{db_path}"
    print(f"[Database] Using local SQLite database at: {db_path}")
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    print(f"[Database] Connecting to PostgreSQL (Supabase) database...")
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """FastAPI Dependency for database session management."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Create all tables and seed initial campus projects if empty."""
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # Seed Projects if database is empty
        if db.query(ProjectDB).count() == 0:
            initial_projects = [
                ProjectDB(
                    id="proj-1",
                    name="rit-campushub",
                    description="Centralized student dashboard for Rajiv Gandhi Institute of Tech. Timetables, bus routes, and notice alerts.",
                    repo_url="https://github.com/foss-rit/rit-campushub",
                    tech_stack=["React", "TypeScript", "Tailwind", "FastAPI"],
                    stars=42,
                    forks=14,
                    open_issues=3,
                    submitted_by_username="foss-rit-admin"
                ),
                ProjectDB(
                    id="proj-2",
                    name="kottayam-bus-tracker",
                    description="Open-source crowd-sourced live GPS tracking for private & KSRTC buses running via Pampady & RIT Campus.",
                    repo_url="https://github.com/foss-rit/kottayam-bus-tracker",
                    tech_stack=["Python", "FastAPI", "PostgreSQL", "Leaflet"],
                    stars=28,
                    forks=8,
                    open_issues=4,
                    submitted_by_username="foss-rit-admin"
                ),
                ProjectDB(
                    id="proj-3",
                    name="linux-lab-provisioner",
                    description="Ansible playbooks and zero-touch scripts to configure Arch Linux on college CS department lab machines.",
                    repo_url="https://github.com/foss-rit/linux-lab-provisioner",
                    tech_stack=["Shell", "Python", "Ansible", "Linux"],
                    stars=19,
                    forks=5,
                    open_issues=5,
                    submitted_by_username="foss-rit-admin"
                )
            ]
            db.add_all(initial_projects)
            db.commit()
            print("[Database] Seeded initial campus FOSS projects.")

        # Seed founding members if empty
        if db.query(MemberDB).count() == 0:
            initial_members = [
                MemberDB(
                    id="mem-1",
                    name="Abhiram K",
                    email="abhiram@rit.ac.in",
                    department="Computer Science & Engg",
                    year_of_study=3,
                    github_username="abhiram-k",
                    is_verified_student=True
                ),
                MemberDB(
                    id="mem-2",
                    name="Gopika Nair",
                    email="gopika@rit.ac.in",
                    department="Electronics & Comm Engg",
                    year_of_study=2,
                    github_username="gopika-dev",
                    is_verified_student=False
                )
            ]
            db.add_all(initial_members)
            db.commit()
            print("[Database] Seeded initial founding members.")
    finally:
        db.close()
