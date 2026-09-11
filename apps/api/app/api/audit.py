from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.models.models import AuditLog, AgentRun, DecisionEvent, AllocationPlan

router = APIRouter(prefix="/audit", tags=["Audit"])

@router.get("")
def list_audit_logs(
    db: Session = Depends(get_db),
    event_type: Optional[str] = Query(None),
    limit: int = Query(100)
):
    query = db.query(AuditLog).order_by(AuditLog.timestamp.desc())
    if event_type:
        query = query.filter(AuditLog.event_type == event_type)
    return query.limit(limit).all()

@router.get("/agent-runs")
def list_agent_runs(db: Session = Depends(get_db)):
    runs = db.query(AgentRun).order_by(AgentRun.timestamp.desc()).all()
    return runs

@router.get("/decision-trace/{correlation_id}")
def get_decision_trace(correlation_id: str, db: Session = Depends(get_db)):
    events = db.query(DecisionEvent).filter(DecisionEvent.correlation_id == correlation_id).order_by(DecisionEvent.created_at.asc()).all()
    audits = db.query(AuditLog).filter(AuditLog.correlation_id == correlation_id).order_by(AuditLog.timestamp.asc()).all()
    plan = db.query(AllocationPlan).filter(AllocationPlan.correlation_id == correlation_id).first()

    return {
        "correlation_id": correlation_id,
        "events": events,
        "audits": audits,
        "associated_plan": plan
    }
