import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import (
    AllocationPlan, Allocation, Zone, Depot, Resource, Need, Task, User, AuditLog, Approval
)
from app.schemas.schemas import OptimizeRequest, ApprovalRequest, HumanOverrideRequest
from app.optimizer.allocation import OptimizationEngine
from app.services.priority_service import PriorityEngineService
from app.services.audit_service import AuditService
from app.services.explanation_service import ExplanationEngineService
from app.realtime.websocket_manager import ws_manager

router = APIRouter(prefix="/allocations", tags=["Allocations"])

@router.get("/plans")
def list_plans(db: Session = Depends(get_db)):
    plans = db.query(AllocationPlan).order_by(AllocationPlan.created_at.desc()).all()
    result = []
    for p in plans:
        allocations = db.query(Allocation).filter(Allocation.plan_id == p.id).all()
        result.append({
            "id": p.id,
            "code": p.code,
            "title": p.title,
            "status": p.status,
            "objective_value": p.objective_value,
            "is_active": p.is_active,
            "constraints_summary": p.constraints_summary,
            "explanation": p.explanation,
            "correlation_id": p.correlation_id,
            "created_at": p.created_at,
            "allocations_count": len(allocations)
        })
    return result

@router.get("/plans/{plan_id}")
def get_plan(plan_id: str, db: Session = Depends(get_db)):
    p = db.query(AllocationPlan).filter(AllocationPlan.id == plan_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    allocations = db.query(Allocation).filter(Allocation.plan_id == p.id).all()
    alloc_list = []
    for a in allocations:
        z = db.query(Zone).filter(Zone.id == a.destination_zone_id).first()
        d = db.query(Depot).filter(Depot.id == a.source_depot_id).first()
        alloc_list.append({
            "id": a.id,
            "resource_type": a.resource_type,
            "source_depot_id": a.source_depot_id,
            "source_depot_name": d.name if d else "Depot",
            "destination_zone_id": a.destination_zone_id,
            "destination_zone_name": z.name if z else "Zone",
            "quantity": a.quantity,
            "risk_level": a.risk_level,
            "status": a.status
        })

    return {
        "plan": p,
        "allocations": alloc_list
    }

@router.post("/optimize")
async def run_optimization(payload: OptimizeRequest = OptimizeRequest(), db: Session = Depends(get_db)):
    correlation_id = f"KSH-OPT-{uuid.uuid4().hex[:6].upper()}"
    
    # 1. Fetch Zones & Needs
    zones_db = db.query(Zone).all()
    zones_data = []
    for z in zones_db:
        needs = db.query(Need).filter(Need.zone_id == z.id).all()
        needs_list = [
            {"resource_type": n.resource_type, "quantity_required": n.quantity_required}
            for n in needs
        ]
        zones_data.append({
            "id": z.id,
            "name": z.name,
            "priority_score": z.priority_score,
            "accessibility": z.accessibility,
            "needs": needs_list
        })

    # 2. Fetch Depots & Available Resources
    depots_db = db.query(Depot).all()
    depots_data = []
    for d in depots_db:
        res_map = {}
        resources = db.query(Resource).filter(Resource.depot_id == d.id).all()
        for r in resources:
            avail = max(0, r.total_quantity - r.reserved_quantity - r.deployed_quantity)
            res_map[r.resource_type] = avail
        
        depots_data.append({
            "id": d.id,
            "name": d.name,
            "agency_id": d.agency_id,
            "resources": res_map
        })

    # 3. Run OR-Tools Optimization Engine
    opt_result = OptimizationEngine.optimize_allocation(
        zones=zones_data,
        depots=depots_data,
        reserve_percent=payload.reserve_percentage or 0.10
    )

    # 4. Save Allocation Plan
    plan_code = f"PLAN-{uuid.uuid4().hex[:4].upper()}"
    plan = AllocationPlan(
        code=plan_code,
        title=f"Tactical Response Plan {plan_code}",
        status="PROPOSED",
        objective_value=opt_result["objective_value"],
        constraints_summary={
            "solver": opt_result["solver_engine"],
            "reserve_percent": opt_result["reserve_percent"],
            "unmet_count": len(opt_result["unmet_needs"])
        },
        explanation=f"Generated via {opt_result['solver_engine']}. Satisfies high-priority life safety demands.",
        correlation_id=correlation_id
    )
    db.add(plan)
    db.flush()

    # Save Allocations
    allocations_saved = []
    for alloc_item in opt_result["allocations"]:
        alloc = Allocation(
            plan_id=plan.id,
            resource_type=alloc_item["resource_type"],
            source_depot_id=alloc_item["source_depot_id"],
            destination_zone_id=alloc_item["destination_zone_id"],
            quantity=alloc_item["quantity"],
            risk_level=alloc_item["risk_level"],
            assigned_agency_id=alloc_item["assigned_agency_id"],
            status="PROPOSED"
        )
        db.add(alloc)
        allocations_saved.append(alloc_item)

    db.commit()
    db.refresh(plan)

    # Audit log
    AuditService.log_audit(
        db,
        event_type="OPTIMIZATION_COMPLETED",
        entity_type="ALLOCATION_PLAN",
        entity_id=plan.id,
        correlation_id=correlation_id,
        new_state={"code": plan.code, "allocations": len(allocations_saved), "objective": plan.objective_value}
    )

    # Broadcast websocket
    await ws_manager.broadcast("allocation.changed", {"plan_id": plan.id, "status": "PROPOSED"})

    return {
        "plan_id": plan.id,
        "code": plan.code,
        "solver": opt_result["solver_engine"],
        "status": plan.status,
        "objective_value": plan.objective_value,
        "allocations": allocations_saved,
        "unmet_needs": opt_result["unmet_needs"]
    }

@router.post("/plans/{plan_id}/approve")
async def approve_plan(
    plan_id: str,
    payload: ApprovalRequest,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = db.query(AllocationPlan).filter(AllocationPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    if payload.decision == "REJECTED":
        plan.status = "REJECTED"
        db.commit()
        
        # Log rejection audit
        AuditService.log_audit(
            db,
            event_type="PLAN_REJECTED",
            entity_type="ALLOCATION_PLAN",
            entity_id=plan.id,
            correlation_id=plan.correlation_id,
            payload={"reason": payload.reason}
        )
        return {"status": "REJECTED", "message": "Allocation plan rejected. Inventory remains untouched."}

    # Set previous plans inactive
    db.query(AllocationPlan).filter(AllocationPlan.is_active == True).update({"is_active": False})
    
    plan.status = "APPROVED"
    plan.is_active = True

    # 1. Update Inventory Reservations & Ledger
    allocations = db.query(Allocation).filter(Allocation.plan_id == plan.id).all()
    for a in allocations:
        a.status = "APPROVED"
        # Find resource in source depot
        res = db.query(Resource).filter(
            Resource.depot_id == a.source_depot_id,
            Resource.resource_type == a.resource_type
        ).first()
        if res:
            res.reserved_quantity += a.quantity

        # 2. Create Agency Coordination Tasks
        task_code = f"TASK-{uuid.uuid4().hex[:4].upper()}"
        task = Task(
            code=task_code,
            plan_id=plan.id,
            agency_id=a.assigned_agency_id or "agency-transport-id",
            zone_id=a.destination_zone_id,
            resource_type=a.resource_type,
            quantity=a.quantity,
            owner="Dispatcher",
            priority="HIGH",
            status="ASSIGNED",
            risk_level=a.risk_level,
            correlation_id=plan.correlation_id
        )
        db.add(task)

    # Record Approval
    approval = Approval(
        plan_id=plan.id,
        approver_id=current_user.id if current_user else None,
        decision="APPROVED",
        reason=payload.reason,
        correlation_id=plan.correlation_id
    )
    db.add(approval)
    db.commit()

    AuditService.log_audit(
        db,
        event_type="PLAN_APPROVED",
        entity_type="ALLOCATION_PLAN",
        entity_id=plan.id,
        correlation_id=plan.correlation_id,
        new_state={"approved_by": current_user.full_name if current_user else "Operator"}
    )

    await ws_manager.broadcast("plan.approved", {"plan_id": plan.id, "status": "APPROVED"})

    return {"status": "APPROVED", "plan_id": plan.id, "message": "Plan approved and dispatched to agency task queues."}
