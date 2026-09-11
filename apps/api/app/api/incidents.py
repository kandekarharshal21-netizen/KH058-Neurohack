import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List

from app.core.database import get_db
from app.models.models import Incident, Report, Zone, Need, AuditLog
from app.schemas.schemas import ReportCreate, IncidentCreate
from app.agents.incident_agent import IncidentAgent
from app.services.needs_service import NeedsAssessmentService
from app.services.priority_service import PriorityEngineService
from app.services.audit_service import AuditService
from app.realtime.websocket_manager import ws_manager

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.get("")
def list_incidents(db: Session = Depends(get_db)):
    incidents = db.query(Incident).order_by(Incident.reported_at.desc()).all()
    result = []
    for inc in incidents:
        zone = db.query(Zone).filter(Zone.id == inc.zone_id).first()
        result.append({
            "id": inc.id,
            "code": inc.code,
            "title": inc.title,
            "description": inc.description,
            "hazard_type": inc.hazard_type,
            "zone_id": inc.zone_id,
            "zone_name": zone.name if zone else "Unknown Zone",
            "reported_at": inc.reported_at,
            "affected_population": inc.affected_population,
            "injured_count": inc.injured_count,
            "missing_count": inc.missing_count,
            "accessibility": inc.accessibility,
            "road_condition": inc.road_condition,
            "water_level": inc.water_level,
            "shelter_condition": inc.shelter_condition,
            "medical_requirement": inc.medical_requirement,
            "status": inc.status,
            "confidence": inc.confidence,
            "location_lat": inc.location_lat or (zone.latitude if zone else 0.0),
            "location_lng": inc.location_lng or (zone.longitude if zone else 0.0),
            "image_url": inc.image_url,
            "evidence_analysis": inc.evidence_analysis,
            "created_at": inc.created_at
        })
    return result

@router.post("/parse-report")
async def parse_report(payload: ReportCreate, db: Session = Depends(get_db)):
    correlation_id = f"KSH-REP-{uuid.uuid4().hex[:6].upper()}"
    
    # Run Incident Agent
    extracted = await IncidentAgent.extract_incident_from_text(payload.raw_text)

    # Store raw report
    report = Report(
        code=f"REP-{uuid.uuid4().hex[:4].upper()}",
        raw_text=payload.raw_text,
        zone_id=payload.zone_id,
        correlation_id=correlation_id,
        parsed_data=extracted,
        image_url=payload.image_url,
        status="PARSED"
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    AuditService.log_agent_run(
        db,
        run_id=f"RUN-INC-{uuid.uuid4().hex[:4].upper()}",
        agent_name="Incident Agent",
        correlation_id=correlation_id,
        input_summary=payload.raw_text[:100],
        output_summary=f"Extracted hazard: {extracted.get('hazard')}, population: {extracted.get('affected_population')}"
    )

    return {
        "report_id": report.id,
        "correlation_id": correlation_id,
        "extracted": extracted
    }

@router.post("")
async def create_incident(payload: IncidentCreate, db: Session = Depends(get_db)):
    correlation_id = f"KSH-INC-{uuid.uuid4().hex[:6].upper()}"
    zone = db.query(Zone).filter(Zone.id == payload.zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Target zone not found")

    inc = Incident(
        code=f"INC-{uuid.uuid4().hex[:4].upper()}",
        title=payload.title,
        description=payload.description,
        hazard_type=payload.hazard_type,
        zone_id=payload.zone_id,
        affected_population=payload.affected_population,
        injured_count=payload.injured_count,
        missing_count=payload.missing_count,
        accessibility=payload.accessibility,
        road_condition=payload.road_condition,
        water_level=payload.water_level,
        shelter_condition=payload.shelter_condition,
        medical_requirement=payload.medical_requirement,
        status="ACTIVE",
        image_url=payload.image_url,
        location_lat=zone.latitude,
        location_lng=zone.longitude
    )
    db.add(inc)

    # Update Zone state
    zone.population = payload.affected_population
    zone.accessibility = payload.accessibility
    
    # Calculate Needs
    needs_data = NeedsAssessmentService.calculate_zone_needs(
        population=payload.affected_population,
        injured_count=payload.injured_count,
        accessibility=payload.accessibility,
        hazard_type=payload.hazard_type
    )

    # Clear old needs for zone and insert new
    db.query(Need).filter(Need.zone_id == zone.id).delete()
    for nd in needs_data:
        need_obj = Need(
            zone_id=zone.id,
            resource_type=nd["resource_type"],
            quantity_required=nd["quantity_required"],
            unit=nd["unit"],
            urgency=nd["urgency"],
            basis=nd["basis"],
            confidence=nd["confidence"]
        )
        db.add(need_obj)

    # Recalculate priority
    score, level, breakdown = PriorityEngineService.calculate_zone_priority(
        population=zone.population,
        injured_count=payload.injured_count,
        missing_count=payload.missing_count,
        accessibility=payload.accessibility,
        urgency=90.0 if payload.accessibility == "BLOCKED" else 60.0
    )
    zone.priority_score = score
    zone.priority_level = level

    db.commit()
    db.refresh(inc)

    # Audit log
    AuditService.log_audit(
        db,
        event_type="INCIDENT_CREATED",
        entity_type="INCIDENT",
        entity_id=inc.id,
        correlation_id=correlation_id,
        new_state={"title": inc.title, "zone": zone.name, "priority": score}
    )

    # Broadcast websocket event
    await ws_manager.broadcast("incident.created", {"incident_id": inc.id, "zone_id": zone.id, "priority": score})

    return inc
