from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from core.config import settings
from db.models import Base, ProjectDB, MemberDB, UserDB

DATABASE_URL = settings.DATABASE_URL or ""

# Normalize postgres:// to postgresql:// for SQLAlchemy 2.0
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Fallback to local SQLite if DATABASE_URL is not configured
if not DATABASE_URL or "your-project-ref" in DATABASE_URL or "postgres.your-project" in DATABASE_URL or "sqlite" in DATABASE_URL:
    db_path = Path(__file__).resolve().parent.parent / "foss_club.db"
    DATABASE_URL = f"sqlite:///{db_path}"
    print(f"[Database] Using local SQLite database at: {db_path}")
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    print(f"[Database] Connecting to PostgreSQL (Supabase) database...")
    # Safe SSL and pooling for Supabase (both port 5432 direct & port 6543 pooler)
    connect_args = {}
    if "supabase.co" in DATABASE_URL or "sslmode" not in DATABASE_URL:
        connect_args = {"sslmode": "require"}

    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=5,
        max_overflow=10,
        connect_args=connect_args
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
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"[Database] Notice during table creation: {e}")

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
    except Exception as e:
        print(f"[Database] Notice during seeding: {e}")
    finally:
        db.close()
