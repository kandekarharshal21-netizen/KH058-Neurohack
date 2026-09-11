from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.models import Report, Incident, Zone, AuditLog

class ReliabilityEngineService:
    @staticmethod
    def evaluate_report_reliability(db: Session, report_id: str) -> Dict[str, Any]:
        report = db.query(Report).filter(Report.id == report_id).first()
        if not report:
            return {"error": "Report not found"}

        parsed = report.parsed_data or {}
        reporter_type = parsed.get("source_type", "PUBLIC_REPORT")
        
        # 1. Base Source Credibility Score
        source_scores = {
          "OPERATOR": 0.98,
          "FIELD_AGENCY": 0.95,
          "SENSOR": 0.90,
          "PUBLIC_REPORT": 0.60,
          "DEMO_SCENARIO": 1.0
        }
        base_credibility = source_scores.get(reporter_type, 0.70)

        # 2. Check for Conflicting Reports in Same Zone
        conflicts = []
        if report.zone_id:
            zone = db.query(Zone).filter(Zone.id == report.zone_id).first()
            other_reports = db.query(Report).filter(
                Report.zone_id == report.zone_id,
                Report.id != report.id
            ).all()

            for other in other_reports:
                other_parsed = other.parsed_data or {}
                rep_pop = parsed.get("affected_population", 0)
                other_pop = other_parsed.get("affected_population", 0)

                # Population conflict threshold (> 25% delta)
                if rep_pop > 0 and other_pop > 0 and abs(rep_pop - other_pop) / max(rep_pop, other_pop) > 0.25:
                    conflicts.append({
                        "other_report_id": other.id,
                        "other_report_code": other.code,
                        "reported_population": rep_pop,
                        "conflicting_population": other_pop,
                        "reason": f"Discrepancy in reported affected population ({rep_pop} vs {other_pop})"
                    })

        # 3. Determine Reliability Status
        if len(conflicts) > 0:
            status = "CONFLICTING"
            confidence = 0.50
        elif base_credibility >= 0.90:
            status = "HIGH_CONFIDENCE"
            confidence = base_credibility
        else:
            status = "NEEDS_VERIFICATION"
            confidence = base_credibility

        return {
            "report_id": report.id,
            "code": report.code,
            "source_type": reporter_type,
            "credibility_score": base_credibility,
            "reliability_status": status,
            "overall_confidence": confidence,
            "conflicts_detected": conflicts
        }

    @staticmethod
    def resolve_report_conflict(
        db: Session,
        report_id: str,
        resolution_choice: str, # ACCEPT_A, ACCEPT_B, MERGE
        verified_population: int,
        actor: str = "OPERATOR"
    ) -> Dict[str, Any]:
        report = db.query(Report).filter(Report.id == report_id).first()
        if not report:
            return {"error": "Report not found"}

        parsed = report.parsed_data or {}
        parsed["affected_population"] = verified_population
        parsed["verification_status"] = "OPERATOR_VERIFIED"
        report.parsed_data = parsed
        report.status = "VERIFIED"

        # Update Zone population if linked
        if report.zone_id:
            zone = db.query(Zone).filter(Zone.id == report.zone_id).first()
            if zone:
                zone.population = verified_population

        db.commit()

        # Audit log
        audit = AuditLog(
            event_type="CONFLICT_RESOLVED",
            actor=actor,
            entity_type="REPORT",
            entity_id=report.id,
            correlation_id=report.correlation_id,
            new_state={"resolution": resolution_choice, "verified_population": verified_population}
        )
        db.add(audit)
        db.commit()

        return {"status": "SUCCESS", "message": f"Conflict resolved. Verified population set to {verified_population}."}
