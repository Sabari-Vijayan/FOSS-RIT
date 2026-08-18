"""
Main FastAPI Application for the College FOSS Club Backend.
Provides stateless GitOps RESTful APIs for Events, Projects, Leaderboard, and Community Live Stats.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import events, projects, members, leaderboard

app = FastAPI(
    title="FOSS Club RIT Kottayam API",
    description="Stateless GitOps Backend API powering the official Free and Open Source Software Club at Rajiv Gandhi Institute of Technology (RIT) Kottayam, in collaboration with TinkerHub.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for local dev and frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(events.router)
app.include_router(projects.router)
app.include_router(members.router)
app.include_router(leaderboard.router)

@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint to verify backend status."""
    return {
        "status": "healthy",
        "service": "FOSS Club API",
        "version": "2.0.0 (Pure GitOps)",
        "database": "None (Pure GitOps / Flat-File)",
        "architecture": "Stateless Jamstack + GitHub Actions",
        "motto": "Learn. Share. Contribute."
    }

@app.get("/", tags=["Root"])
def root():
    """Root info endpoint with documentation links."""
    return {
        "message": "Welcome to the College FOSS Club API (GitOps Edition)!",
        "interactive_docs": "/docs",
        "endpoints": {
            "health": "/api/health",
            "events": "/api/events",
            "projects": "/api/projects",
            "leaderboard": "/api/leaderboard",
            "members": "/api/members",
            "stats": "/api/members/stats"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
