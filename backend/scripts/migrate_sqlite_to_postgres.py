"""
Database Migration Tool: Local SQLite -> Supabase PostgreSQL
Transfers all existing users, featured projects, and RSVPs from local foss_club.db into Supabase.

Usage:
    python scripts/migrate_sqlite_to_postgres.py
"""
import sys
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add parent directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from core.config import settings
from db.models import Base, UserDB, ProjectDB, MemberDB, EventRSVPDB

def main():
    print("=" * 65)
    print("FOSS Club RIT - Data Exporter (Local SQLite -> Supabase PostgreSQL)")
    print("=" * 65)

    sqlite_path = backend_dir / "foss_club.db"
    if not sqlite_path.exists():
        print("[-] Local foss_club.db not found on disk.")
        return

    sqlite_engine = create_engine(f"sqlite:///{sqlite_path}")
    SqliteSession = sessionmaker(bind=sqlite_engine)
    sqlite_db = SqliteSession()

    pg_url = settings.DATABASE_URL
    if not pg_url or "sqlite" in pg_url:
        print("[-] DATABASE_URL is not set to a PostgreSQL / Supabase URI in backend/.env.")
        print("    Please set DATABASE_URL=postgresql://... in backend/.env and re-run.")
        return

    if pg_url.startswith("postgres://"):
        pg_url = pg_url.replace("postgres://", "postgresql://", 1)

    connect_args = {}
    if "supabase.co" in pg_url or "pooler.supabase.com" in pg_url or "sslmode" not in pg_url:
        connect_args = {"sslmode": "require"}

    print(f"[*] Target Supabase: {pg_url.split('@')[-1] if '@' in pg_url else 'PostgreSQL'}")
    pg_engine = create_engine(pg_url, connect_args=connect_args)
    PgSession = sessionmaker(bind=pg_engine)
    
    # 1. Create tables on PostgreSQL if not exist
    Base.metadata.create_all(bind=pg_engine)
    pg_db = PgSession()

    try:
        # 2. Migrate Users
        sqlite_users = sqlite_db.query(UserDB).all()
        print(f"\n[1/3] Migrating {len(sqlite_users)} User(s)...")
        valid_user_ids = set()
        for u in sqlite_users:
            existing = pg_db.query(UserDB).filter(UserDB.id == u.id).first()
            if not existing:
                new_u = UserDB(
                    id=u.id,
                    github_id=u.github_id,
                    username=u.username,
                    display_name=u.display_name,
                    email=u.email,
                    avatar_url=u.avatar_url,
                    role=u.role,
                    college_email=u.college_email,
                    is_verified_student=u.is_verified_student,
                    created_at=u.created_at,
                    last_login=u.last_login
                )
                pg_db.add(new_u)
                valid_user_ids.add(u.id)
                print(f"  + Added user: @{u.username} ({u.id})")
            else:
                valid_user_ids.add(existing.id)
        pg_db.commit()

        # Query all existing user IDs in Postgres
        all_pg_user_ids = {uid[0] for uid in pg_db.query(UserDB.id).all()}

        # 3. Migrate Projects
        sqlite_projects = sqlite_db.query(ProjectDB).all()
        print(f"\n[2/3] Migrating {len(sqlite_projects)} Project(s)...")
        for p in sqlite_projects:
            existing = pg_db.query(ProjectDB).filter(ProjectDB.repo_url == p.repo_url).first()
            if not existing:
                # Ensure foreign key validity
                sub_id = p.submitted_by_id if (p.submitted_by_id in all_pg_user_ids) else None
                new_p = ProjectDB(
                    id=p.id,
                    name=p.name,
                    description=p.description,
                    repo_url=p.repo_url,
                    tech_stack=p.tech_stack,
                    stars=p.stars,
                    forks=p.forks,
                    open_issues=p.open_issues,
                    submitted_by_id=sub_id,
                    submitted_by_username=p.submitted_by_username,
                    created_at=p.created_at,
                    updated_at=p.updated_at
                )
                pg_db.add(new_p)
                print(f"  + Added project: {p.name} (by @{p.submitted_by_username or 'anon'})")
        pg_db.commit()

        # 4. Migrate RSVPs
        sqlite_rsvps = sqlite_db.query(EventRSVPDB).all()
        print(f"\n[3/3] Migrating {len(sqlite_rsvps)} Event RSVP(s)...")
        for r in sqlite_rsvps:
            existing = pg_db.query(EventRSVPDB).filter(EventRSVPDB.id == r.id).first()
            if not existing:
                new_r = EventRSVPDB(
                    id=r.id,
                    event_id=r.event_id,
                    name=r.name,
                    email=r.email,
                    college_id=r.college_id,
                    created_at=r.created_at
                )
                pg_db.add(new_r)
        pg_db.commit()

        print("\n" + "=" * 65)
        print("[SUCCESS] All local SQLite data successfully exported to Supabase PostgreSQL!")
        print("=" * 65)

    except Exception as e:
        pg_db.rollback()
        print(f"\n[-] Error during migration: {e}")
    finally:
        sqlite_db.close()
        pg_db.close()

if __name__ == "__main__":
    main()
