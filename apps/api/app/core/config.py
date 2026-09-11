import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "KSHETRA"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    SECRET_KEY: str = os.getenv("JWT_SECRET", "kshetra-secret-key-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./kshetra.db")
    
    # LLM AI Configuration
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-2.5-flash")
    LLM_BASE_URL: str = os.getenv("LLM_BASE_URL", "")
    AI_MODE: str = "LIVE" if os.getenv("LLM_API_KEY") else "DEMO_FALLBACK"
    
    # Default Policy Weights
    WEIGHT_LIFE_SAFETY: float = 0.30
    WEIGHT_POPULATION: float = 0.20
    WEIGHT_SHORTAGE: float = 0.20
    WEIGHT_ACCESSIBILITY: float = 0.10
    WEIGHT_URGENCY: float = 0.10
    WEIGHT_TREND: float = 0.10
    
    DEFAULT_RESERVE_PERCENT: float = 0.10

settings = Settings()
