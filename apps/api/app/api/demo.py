import uuid
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import (
    Zone, Incident, Need, Depot, Resource, AllocationPlan, Allocation, Task, Alert, AuditLog, AgentRun, DecisionEvent
)
from app.services.priority_service import PriorityEngineService
from app.services.needs_service import NeedsAssessmentService
from app.optimizer.allocation import OptimizationEngine
from app.services.explanation_service import ExplanationEngineService
from app.services.audit_service import AuditService
from app.realtime.websocket_manager import ws_manager

router = APIRouter(prefix="/demo", tags=["Demo Controller"])

@router.post("/trigger-zone-c-escalation")
async def trigger_zone_c_escalation(db: Session = Depends(get_db)):
    correlation_id = "KSH-C-0042-RUN-007"
    
    # 1. Fetch Zone C
    zone_c = db.query(Zone).filter(Zone.code == "ZONE-C").first() or db.query(Zone).filter(Zone.name.contains("C")).first()
    if not zone_c:
        return {"error": "Zone C not found"}

    old_state = {
        "population": zone_c.population,
        "priority_score": zone_c.priority_score,
        "priority_level": zone_c.priority_level,
        "accessibility": zone_c.accessibility
    }

    # Fetch active plan before change
    old_plan = db.query(AllocationPlan).filter(AllocationPlan.is_active == True).first()
    old_allocations = []
    if old_plan:
        old_allocs_db = db.query(Allocation).filter(Allocation.plan_id == old_plan.id).all()
        for a in old_allocs_db:
            z = db.query(Zone).filter(Zone.id == a.destination_zone_id).first()
            old_allocations.append({
                "zone_name": z.name if z else "Zone",
                "resource_type": a.resource_type,
                "quantity": a.quantity
            })

    # 2. Ingest Emergency Field Report & Escalation
    report_text = "Emergency update: water level is rising rapidly. The main bridge is now blocked. Estimated affected population has increased to 5000. Approximately 900 people are isolated and several require medical assistance."
    
    # Update Zone C
    zone_c.population = 5000
    zone_c.accessibility = "BLOCKED"
    
    # Create Incident Record
    inc = Incident(
        code=f"INC-{uuid.uuid4().hex[:4].upper()}",
        title="Zone C Sudden Water Level Escalation & Main Bridge Block",
        description=report_text,
        hazard_type="FLOOD",
        zone_id=zone_c.id,
        affected_population=5000,
        injured_count=85,
        missing_count=12,
        accessibility="BLOCKED",
        road_condition="BLOCKED",
        water_level="HIGH_RISING",
        status="ESCALATED",
        confidence=0.98
    )
    db.add(inc)

    # 3. Recalculate Needs for Zone C
    new_needs = NeedsAssessmentService.calculate_zone_needs(
        population=5000,
        injured_count=85,
        accessibility="BLOCKED",
        hazard_type="FLOOD"
    )
    
    db.query(Need).filter(Need.zone_id == zone_c.id).delete()
    for nd in new_needs:
        need_obj = Need(
            zone_id=zone_c.id,
            resource_type=nd["resource_type"],
            quantity_required=nd["quantity_required"],
            unit=nd["unit"],
            urgency=nd["urgency"],
            basis=nd["basis"],
            confidence=nd["confidence"]
        )
        db.add(need_obj)

    # 4. Recalculate Priority Score for Zone C (Escalates from 61 -> 91 CRITICAL)
    score, level, breakdown = PriorityEngineService.calculate_zone_priority(
        population=5000,
        injured_count=85,
        missing_count=12,
        accessibility="BLOCKED",
        urgency=95.0,
        trend_status="RAPIDLY_RISING"
    )
    zone_c.priority_score = score
    zone_c.priority_level = level

    new_state = {
        "population": 5000,
        "priority_score": score,
        "priority_level": level,
        "accessibility": "BLOCKED"
    }

    # 5. Rerun Mathematical Optimization Engine
    all_zones = db.query(Zone).all()
    zones_data = []
    for z in all_zones:
        needs = db.query(Need).filter(Need.zone_id == z.id).all()
        needs_list = [{"resource_type": n.resource_type, "quantity_required": n.quantity_required} for n in needs]
        zones_data.append({
            "id": z.id,
            "name": z.name,
            "priority_score": z.priority_score,
            "accessibility": z.accessibility,
            "needs": needs_list
        })

    depots_db = db.query(Depot).all()
    depots_data = []
    for d in depots_db:
        res_map = {}
        resources = db.query(Resource).filter(Resource.depot_id == d.id).all()
        for r in resources:
            res_map[r.resource_type] = r.available_quantity
        depots_data.append({"id": d.id, "name": d.name, "agency_id": d.agency_id, "resources": res_map})

    opt_result = OptimizationEngine.optimize_allocation(zones=zones_data, depots=depots_data)

    # 6. Save Reallocation Plan
    new_plan = AllocationPlan(
        code=f"PLAN-REALLOC-{uuid.uuid4().hex[:4].upper()}",
        title="Adaptive Dynamic Reallocation Plan — Zone C Escalation",
        status="PROPOSED",
        objective_value=opt_result["objective_value"],
        constraints_summary={"solver": opt_result["solver_engine"], "trigger": "Zone C Escalation"},
        explanation=f"Reallocated surplus resources from lower priority zones to Zone C due to sudden bridge block and population increase to 5000.",
        correlation_id=correlation_id
    )
    db.add(new_plan)
    db.flush()

    new_allocations = []
    for alloc_item in opt_result["allocations"]:
        a = Allocation(
            plan_id=new_plan.id,
            resource_type=alloc_item["resource_type"],
            source_depot_id=alloc_item["source_depot_id"],
            destination_zone_id=alloc_item["destination_zone_id"],
            quantity=alloc_item["quantity"],
            risk_level=alloc_item["risk_level"],
            assigned_agency_id=alloc_item["assigned_agency_id"],
            status="PROPOSED"
        )
        db.add(a)
        z = db.query(Zone).filter(Zone.id == alloc_item["destination_zone_id"]).first()
        new_allocations.append({
            "zone_name": z.name if z else "Zone",
            "resource_type": alloc_item["resource_type"],
            "quantity": alloc_item["quantity"]
        })

    # Create Critical System Alert
    alert = Alert(
        type="CRITICAL_ZONE",
        severity="CRITICAL",
        title="RAPID ESCALATION: Zone C Priority Jump to 91 (CRITICAL)",
        message="Zone C affected population surged to 5,000. Main bridge blocked. Dynamic reallocation required.",
        zone_id=zone_c.id,
        related_entity_type="INCIDENT",
        related_entity_id=inc.id
    )
    db.add(alert)

    # Log Complete Decision Trace Graph Steps
    steps = [
        ("REPORT_INGESTED", "Incident Agent", "Parsed field report: Population 5000, Bridge Blocked"),
        ("NEEDS_REASSESSED", "Needs Agent", "Recalculated demand: Water 7500L, Food 3000, Rescue 12 teams"),
        ("PRIORITY_ESCALATED", "Priority Engine", "Priority score updated: 61 -> 91 (CRITICAL)"),
        ("OPTIMIZATION_RERUN", "Optimization Engine", "OR-Tools solved new MIP allocation model"),
        ("REALLOCATION_GENERATED", "Coordination Agent", "Proposed plan diff comparing V1 vs V2")
    ]
    for step_name, agent_name, summary in steps:
        AuditService.log_decision_event(
            db, correlation_id=correlation_id, step_name=step_name, agent_name=agent_name, payload={"summary": summary}
        )

    AuditService.log_audit(
        db,
        event_type="ZONE_ESCALATED",
        entity_type="ZONE",
        entity_id=zone_c.id,
        correlation_id=correlation_id,
        previous_state=old_state,
        new_state=new_state
    )

    db.commit()

    # Generate Explanation
    diff_analysis = ExplanationEngineService.generate_reallocation_explanation(
        zone_name=zone_c.name,
        old_state=old_state,
        new_state=new_state,
        allocations_diff={"previous": old_allocations, "proposed": new_allocations}
    )

    # Broadcast websocket event
    await ws_manager.broadcast("zone.escalated", {
        "zone_id": zone_c.id,
        "priority": score,
        "plan_id": new_plan.id
    })

    return {
        "status": "SUCCESS",
        "correlation_id": correlation_id,
        "zone_c_updated": {
            "old_priority": old_state["priority_score"],
            "new_priority": score,
            "level": level,
            "population": 5000,
            "accessibility": "BLOCKED"
        },
        "new_plan": {
            "id": new_plan.id,
            "code": new_plan.code,
            "objective_value": new_plan.objective_value
        },
        "explanation": diff_analysis
    }
