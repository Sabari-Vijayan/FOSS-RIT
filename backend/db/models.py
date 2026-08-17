import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class UserDB(Base):
    """Authenticated user via GitHub OAuth."""
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: f"usr-{uuid.uuid4().hex[:8]}")
    github_id = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    display_name = Column(String, nullable=True)
    email = Column(String, nullable=True)  # Primary GitHub email (kept private)
    avatar_url = Column(String, nullable=True)
    role = Column(String, default="member")  # member, core_team, admin
    
    # Campus verification
    college_email = Column(String, nullable=True, unique=True)
    is_verified_student = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, default=datetime.utcnow)

    # Relationships
    projects = relationship("ProjectDB", back_populates="submitter", cascade="all, delete-orphan")


class ProjectDB(Base):
    """Featured open-source projects built by campus students."""
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=lambda: f"proj-{uuid.uuid4().hex[:8]}")
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    repo_url = Column(String, unique=True, nullable=False)
    tech_stack = Column(JSON, default=list)  # Stored as JSON list of strings
    stars = Column(Integer, default=0)
    forks = Column(Integer, default=0)
    open_issues = Column(Integer, default=0)
    
    # Attribution
    submitted_by_id = Column(String, ForeignKey("users.id"), nullable=True)
    submitted_by_username = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    submitter = relationship("UserDB", back_populates="projects")


class MemberDB(Base):
    """Student members joined in the founding cohort."""
    __tablename__ = "members"

    id = Column(String, primary_key=True, default=lambda: f"mem-{uuid.uuid4().hex[:8]}")
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)  # Private student email
    department = Column(String, nullable=False)
    year_of_study = Column(Integer, default=1)
    github_username = Column(String, nullable=True)
    is_verified_student = Column(Boolean, default=False)
    joined_at = Column(DateTime, default=datetime.utcnow)


class EventRSVPDB(Base):
    """RSVPs registered for standalone community meetups."""
    __tablename__ = "event_rsvps"

    id = Column(String, primary_key=True, default=lambda: f"rsvp-{uuid.uuid4().hex[:8]}")
    event_id = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    college_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
