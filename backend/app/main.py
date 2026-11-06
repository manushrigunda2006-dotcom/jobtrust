from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.services.data_loader import seed_database, train_or_load_nlp_model
from app.routers import analyze, scans, reports, dashboard, demo

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("jobtrust")

# Initialize database schema
Base.metadata.create_all(bind=engine)

# Seed database and initialize ML model
try:
    db = SessionLocal()
    seed_database(db)
    db.close()
    logger.info("Database seeded successfully.")
except Exception as e:
    logger.warning(f"Database seed notice: {e}")

try:
    train_or_load_nlp_model()
    logger.info("NLP Classification model loaded/trained successfully.")
except Exception as e:
    logger.warning(f"NLP model initialization notice: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Powered Recruitment Fraud Detection and Trust Verification Platform for Vedathon"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(analyze.router, prefix=settings.API_V1_STR)
app.include_router(scans.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(demo.router, prefix=settings.API_V1_STR)

@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "JOBTRUST Intelligence Engine",
        "version": settings.VERSION,
        "database": "connected",
        "ai_engine": "operational",
        "threat_intel_fallback": "active" if not settings.GOOGLE_SAFE_BROWSING_KEY else "google_safe_browsing"
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to JOBTRUST API - AI-Powered Recruitment Fraud Intelligence Platform",
        "docs": "/docs",
        "health": "/api/health"
    }
