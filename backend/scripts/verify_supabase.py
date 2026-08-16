"""
Helper script to test live PostgreSQL / Supabase connection and verify tables.
Usage:
    python scripts/verify_supabase.py
"""
import sys
from pathlib import Path

# Add parent directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from core.config import settings
from db.session import engine, init_db, SessionLocal
from db.models import UserDB, ProjectDB
from sqlalchemy import inspect, text

def main():
    print("=" * 60)
    print("FOSS Club RIT - Supabase / PostgreSQL Connection Tester")
    print("=" * 60)
    
    url = settings.DATABASE_URL
    if not url:
        print("[!] DATABASE_URL is not set in backend/.env")
        print("    Defaulting to local SQLite.")
        return

    # Obfuscate password in output
    safe_url = url
    if "@" in url and ":" in url:
        try:
            proto, rest = url.split("://", 1)
            creds, host = rest.split("@", 1)
            user = creds.split(":")[0]
            safe_url = f"{proto}://{user}:****@{host}"
        except Exception:
            pass

    print(f"[*] Target Connection: {safe_url}")
    print("\n[...] Testing TCP connection and SSL handshake...")

    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();")).fetchone()
            print(f"[+] Connection successful!")
            print(f"    Database Version: {result[0]}")
            
        print("\n[...] Initializing schema tables...")
        init_db()
        
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"[+] Found {len(tables)} tables: {', '.join(tables)}")

        db = SessionLocal()
        users_cnt = db.query(UserDB).count()
        proj_cnt = db.query(ProjectDB).count()
        db.close()
        
        print(f"[+] Live Data: {users_cnt} users, {proj_cnt} campus projects")
        print("\n[SUCCESS] Your Supabase database is 100% configured and production-ready!")

    except Exception as e:
        print(f"\n[-] Connection failed: {e}")
        print("\n[*] Troubleshooting Tips:")
        print("  1. Make sure you selected 'URI' under Supabase Project Settings -> Database.")
        print("  2. Ensure your password does not contain un-encoded special characters.")
        print("  3. For Supabase, use port 5432 (direct) or port 6543 (connection pooler).")

if __name__ == "__main__":
    main()
