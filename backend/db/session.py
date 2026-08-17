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
    """Create all tables if they do not exist, and safely migrate new columns."""
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"[Database] Notice during table creation: {e}")

    try:
        from sqlalchemy import text
        with engine.begin() as conn:
            if "sqlite" in DATABASE_URL:
                try:
                    conn.execute(text("ALTER TABLE users ADD COLUMN is_leaderboard_hidden BOOLEAN DEFAULT 0;"))
                except Exception:
                    pass
            else:
                try:
                    conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_leaderboard_hidden BOOLEAN DEFAULT FALSE;"))
                except Exception:
                    pass
    except Exception as err:
        print(f"[Database] Notice during column migration check: {err}")
