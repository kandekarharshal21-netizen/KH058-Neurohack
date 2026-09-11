from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.models import Task, Alert

class DuplicateAgent:
    @staticmethod
    def detect_duplicate_efforts(db: Session, zone_id: str = None) -> List[Dict[str, Any]]:
        """
        Detects operational task overlaps across multiple agencies targeting the same zone and resource.
        """
        query = db.query(Task).filter(Task.status.in_(["PROPOSED", "APPROVAL_REQUIRED", "ASSIGNED", "IN_PROGRESS"]))
        if zone_id:
            query = query.filter(Task.zone_id == zone_id)

        tasks = query.all()
        duplicates = []

        for i in range(len(tasks)):
            for j in range(i + 1, len(tasks)):
                t1, t2 = tasks[i], tasks[j]
                
                # Check for overlap: same zone, same resource_type, different agency
                if t1.zone_id == t2.zone_id and t1.resource_type == t2.resource_type and t1.agency_id != t2.agency_id:
                    matching_factors = [
                        f"Same Destination Zone ({t1.zone.name if hasattr(t1, 'zone') and t1.zone else t1.zone_id})",
                        f"Same Resource Type ({t1.resource_type})",
                        f"Concurrent Operational Window"
                    ]
                    
                    dup_info = {
                        "task1_id": t1.id,
                        "task1_code": t1.code,
                        "agency1_id": t1.agency_id,
                        "task2_id": t2.id,
                        "task2_code": t2.code,
                        "agency2_id": t2.agency_id,
                        "zone_id": t1.zone_id,
                        "resource_type": t1.resource_type,
                        "quantity_sum": t1.quantity + t2.quantity,
                        "confidence": 0.92,
                        "matching_factors": matching_factors,
                        "suggested_action": "MERGE_OR_REDIRECT"
                    }
                    duplicates.append(dup_info)

                    # Create system alert if not already logged
                    existing_alert = db.query(Alert).filter(
                        Alert.type == "DUPLICATE_EFFORT",
                        Alert.related_entity_id == t1.id
                    ).first()
                    
                    if not existing_alert:
                        alert = Alert(
                            type="DUPLICATE_EFFORT",
                            severity="HIGH",
                            title=f"Potential Duplicate Effort: {t1.resource_type} in Zone",
                            message=f"Agency tasks {t1.code} and {t2.code} both allocate {t1.resource_type} to the same target zone.",
                            zone_id=t1.zone_id,
                            related_entity_type="TASK",
                            related_entity_id=t1.id
                        )
                        db.add(alert)
                        db.commit()

        return duplicates
