import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "JOBTRUST"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database: fallback to local SQLite if POSTGRES_URL not set
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./jobtrust.db")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "jobtrust-super-secret-security-key-vedathon-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # Threat Intelligence API keys
    GOOGLE_SAFE_BROWSING_KEY: str = os.getenv("GOOGLE_SAFE_BROWSING_KEY", "")
    VIRUSTOTAL_API_KEY: str = os.getenv("VIRUSTOTAL_API_KEY", "")
    
    # File storage paths
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
    REPORT_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "reports")
    DATA_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")

    class Config:
        case_sensitive = True

settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.REPORT_DIR, exist_ok=True)
os.makedirs(settings.DATA_DIR, exist_ok=True)
