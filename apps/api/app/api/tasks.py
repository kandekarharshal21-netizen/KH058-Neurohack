from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Task, Agency, Zone, TaskDependency
from app.agents.duplicate_agent import DuplicateAgent
from app.realtime.websocket_manager import ws_manager

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.get("")
def list_tasks(db: Session = Depends(get_db)):
    tasks = db.query(Task).order_by(Task.created_at.desc()).all()
    result = []
    for t in tasks:
        agency = db.query(Agency).filter(Agency.id == t.agency_id).first()
        zone = db.query(Zone).filter(Zone.id == t.zone_id).first()
        deps = db.query(TaskDependency).filter(TaskDependency.dependent_task_id == t.id).all()
        
        result.append({
            "id": t.id,
            "code": t.code,
            "plan_id": t.plan_id,
            "agency_id": t.agency_id,
            "agency_name": agency.name if agency else "Emergency Agency",
            "zone_id": t.zone_id,
            "zone_name": zone.name if zone else "Zone",
            "resource_type": t.resource_type,
            "quantity": t.quantity,
            "owner": t.owner,
            "priority": t.priority,
            "status": t.status,
            "risk_level": t.risk_level,
            "dependencies_count": len(deps),
            "created_at": t.created_at
        })
    return result

@router.patch("/{task_id}/status")
async def update_task_status(task_id: str, status_payload: dict, db: Session = Depends(get_db)):
    new_status = status_payload.get("status")
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    valid_transitions = {
        "PROPOSED": ["APPROVAL_REQUIRED", "ASSIGNED", "CANCELLED"],
        "APPROVAL_REQUIRED": ["ASSIGNED", "CANCELLED"],
        "ASSIGNED": ["IN_PROGRESS", "CANCELLED"],
        "IN_PROGRESS": ["COMPLETED", "ESCALATED", "CANCELLED"],
        "COMPLETED": [],
        "CANCELLED": []
    }

    if new_status not in valid_transitions.get(task.status, []):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid state transition from {task.status} to {new_status}"
        )

    task.status = new_status
    db.commit()

    await ws_manager.broadcast("task.updated", {"task_id": task.id, "status": new_status})
    return {"status": new_status, "task_id": task.id}

@router.get("/duplicates")
def get_duplicate_warnings(db: Session = Depends(get_db)):
    return DuplicateAgent.detect_duplicate_efforts(db)
