"""
Main FastAPI Application for the College FOSS Club Backend.
Provides RESTful APIs for Events, Projects, Members, Auth, and Community Live Stats.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import events, projects, members, auth
from db import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seeds on application startup
    init_db()
    yield

app = FastAPI(
    title="FOSS Club RIT Kottayam API",
    description="Backend API powering the official Free and Open Source Software Club at Rajiv Gandhi Institute of Technology (RIT) Kottayam, in collaboration with TinkerHub.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Enable CORS for local dev and frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Open for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth.router)
app.include_router(events.router)
app.include_router(projects.router)
app.include_router(members.router)

@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint to verify backend status."""
    return {
        "status": "healthy",
        "service": "FOSS Club API",
        "version": "1.0.0",
        "motto": "Learn. Share. Contribute."
    }

@app.get("/", tags=["Root"])
def root():
    """Root info endpoint with documentation links."""
    return {
        "message": "Welcome to the College FOSS Club API!",
        "interactive_docs": "/docs",
        "endpoints": {
            "health": "/api/health",
            "events": "/api/events",
            "projects": "/api/projects",
            "members": "/api/members",
            "stats": "/api/members/stats"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
