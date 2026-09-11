from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings
from app.core.database import get_db
from app.schemas.schemas import PolicyConfigRequest

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    db_ok = True
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_ok = False

    return {
        "status": "ONLINE" if db_ok else "DEGRADED",
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": "CONNECTED" if db_ok else "DISCONNECTED",
        "ai_engine": settings.AI_MODE,
        "optimizer": "GOOGLE_OR_TOOLS_MIP",
        "realtime": "WEBSOCKETS_ACTIVE"
    }

@router.get("/policy")
def get_policy():
    return {
        "weight_life_safety": settings.WEIGHT_LIFE_SAFETY,
        "weight_population": settings.WEIGHT_POPULATION,
        "weight_shortage": settings.WEIGHT_SHORTAGE,
        "weight_accessibility": settings.WEIGHT_ACCESSIBILITY,
        "weight_urgency": settings.WEIGHT_URGENCY,
        "weight_trend": settings.WEIGHT_TREND,
        "reserve_percent": settings.DEFAULT_RESERVE_PERCENT,
        "policy_version": 1
    }

@router.post("/policy")
def update_policy(payload: PolicyConfigRequest):
    settings.WEIGHT_LIFE_SAFETY = payload.weight_life_safety
    settings.WEIGHT_POPULATION = payload.weight_population
    settings.WEIGHT_SHORTAGE = payload.weight_shortage
    settings.WEIGHT_ACCESSIBILITY = payload.weight_accessibility
    settings.WEIGHT_URGENCY = payload.weight_urgency
    settings.WEIGHT_TREND = payload.weight_trend
    settings.DEFAULT_RESERVE_PERCENT = payload.reserve_percent
    return {"status": "updated", "policy_version": 2}
