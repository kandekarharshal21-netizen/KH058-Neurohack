from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.models import Zone, Need, Incident, AuditLog
from app.services.priority_service import PriorityEngineService

router = APIRouter(prefix="/zones", tags=["Zones"])

@router.get("")
def list_zones(db: Session = Depends(get_db)):
    zones = db.query(Zone).all()
    result = []
    for z in zones:
        needs = db.query(Need).filter(Need.zone_id == z.id).all()
        needs_list = [
            {
                "id": n.id,
                "resource_type": n.resource_type,
                "quantity_required": n.quantity_required,
                "unit": n.unit,
                "urgency": n.urgency,
                "basis": n.basis,
                "confidence": n.confidence
            } for n in needs
        ]
        
        # Calculate real priority score breakdown
        active_inc = db.query(Incident).filter(Incident.zone_id == z.id).first()
        injured = active_inc.injured_count if active_inc else 0
        missing = active_inc.missing_count if active_inc else 0
        urgency = active_inc.confidence * 80.0 if active_inc else 50.0

        score, level, breakdown = PriorityEngineService.calculate_zone_priority(
            population=z.population,
            injured_count=injured,
            missing_count=missing,
            accessibility=z.accessibility,
            urgency=urgency
        )

        result.append({
            "id": z.id,
            "name": z.name,
            "code": z.code,
            "hazard_baseline": z.hazard_baseline,
            "latitude": z.latitude,
            "longitude": z.longitude,
            "polygon_coordinates": z.polygon_coordinates,
            "population": z.population,
            "baseline_severity": z.baseline_severity,
            "priority_score": score,
            "priority_level": level,
            "status": z.status,
            "accessibility": z.accessibility,
            "needs": needs_list,
            "score_breakdown": breakdown,
            "updated_at": z.updated_at
        })
    return result

@router.get("/{zone_id}")
def get_zone(zone_id: str, db: Session = Depends(get_db)):
    z = db.query(Zone).filter(Zone.id == zone_id).first()
    if not z:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    needs = db.query(Need).filter(Need.zone_id == z.id).all()
    incidents = db.query(Incident).filter(Incident.zone_id == z.id).all()
    history = db.query(AuditLog).filter(AuditLog.entity_id == z.id).order_by(AuditLog.timestamp.desc()).all()

    return {
        "zone": z,
        "needs": needs,
        "incidents": incidents,
        "history": history
    }
