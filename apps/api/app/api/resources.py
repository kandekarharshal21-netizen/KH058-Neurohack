from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Depot, Resource, ResourceLedger, Agency

router = APIRouter(prefix="/resources", tags=["Resources"])

@router.get("")
def list_resources(db: Session = Depends(get_db)):
    depots = db.query(Depot).all()
    result = []
    for d in depots:
        resources = db.query(Resource).filter(Resource.depot_id == d.id).all()
        agency = db.query(Agency).filter(Agency.id == d.agency_id).first() if d.agency_id else None
        
        r_list = []
        for r in resources:
            # Ensure available_quantity is accurate
            avail = max(0, r.total_quantity - r.reserved_quantity - r.deployed_quantity)
            r_list.append({
                "id": r.id,
                "code": r.code,
                "resource_type": r.resource_type,
                "unit": r.unit,
                "total_quantity": r.total_quantity,
                "reserved_quantity": r.reserved_quantity,
                "deployed_quantity": r.deployed_quantity,
                "available_quantity": avail,
                "status": r.status,
                "updated_at": r.updated_at
            })

        result.append({
            "depot_id": d.id,
            "depot_name": d.name,
            "location_name": d.location_name,
            "latitude": d.latitude,
            "longitude": d.longitude,
            "agency_name": agency.name if agency else "Central Emergency Logistics",
            "capacity": d.capacity,
            "status": d.status,
            "resources": r_list
        })
    return result

@router.get("/ledger")
def get_ledger(db: Session = Depends(get_db)):
    ledger_entries = db.query(ResourceLedger).order_by(ResourceLedger.timestamp.desc()).limit(100).all()
    return ledger_entries
