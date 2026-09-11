import json
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.models import AuditLog, DecisionEvent, AgentRun

class AuditService:
    @staticmethod
    def log_audit(
        db: Session,
        event_type: str,
        entity_type: str,
        correlation_id: str,
        actor: str = "SYSTEM",
        entity_id: Optional[str] = None,
        previous_state: Optional[Dict[str, Any]] = None,
        new_state: Optional[Dict[str, Any]] = None,
        payload: Optional[Dict[str, Any]] = None
    ) -> AuditLog:
        audit = AuditLog(
            event_type=event_type,
            actor=actor,
            entity_type=entity_type,
            entity_id=entity_id,
            correlation_id=correlation_id,
            previous_state=previous_state,
            new_state=new_state,
            payload=payload,
            timestamp=datetime.utcnow()
        )
        db.add(audit)
        db.commit()
        db.refresh(audit)
        return audit

    @staticmethod
    def log_decision_event(
        db: Session,
        correlation_id: str,
        step_name: str,
        agent_name: str,
        status: str = "COMPLETED",
        duration_ms: int = 50,
        payload: Optional[Dict[str, Any]] = None
    ) -> DecisionEvent:
        event = DecisionEvent(
            correlation_id=correlation_id,
            step_name=step_name,
            agent_name=agent_name,
            status=status,
            duration_ms=duration_ms,
            payload=payload or {},
            created_at=datetime.utcnow()
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event

    @staticmethod
    def log_agent_run(
        db: Session,
        run_id: str,
        agent_name: str,
        correlation_id: str,
        status: str = "SUCCESS",
        duration_ms: int = 120,
        confidence: float = 0.95,
        input_summary: str = "",
        output_summary: str = ""
    ) -> AgentRun:
        agent_run = AgentRun(
            run_id=run_id,
            agent_name=agent_name,
            correlation_id=correlation_id,
            status=status,
            duration_ms=duration_ms,
            confidence=confidence,
            input_summary=input_summary,
            output_summary=output_summary,
            timestamp=datetime.utcnow()
        )
        db.add(agent_run)
        db.commit()
        db.refresh(agent_run)
        return agent_run
