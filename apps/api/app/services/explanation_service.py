from typing import Dict, Any, List

class ExplanationEngineService:
    @staticmethod
    def generate_reallocation_explanation(
        zone_name: str,
        old_state: Dict[str, Any],
        new_state: Dict[str, Any],
        allocations_diff: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generates human-readable and structured explainability breakdowns comparing plan versions.
        """
        old_pop = old_state.get("population", 0)
        new_pop = new_state.get("population", 0)
        pop_pct = round(((new_pop - old_pop) / old_pop * 100), 1) if old_pop > 0 else 0.0

        old_prio = old_state.get("priority_score", 0.0)
        new_prio = new_state.get("priority_score", 0.0)

        old_acc = old_state.get("accessibility", "OPEN")
        new_acc = new_state.get("accessibility", "OPEN")

        text_explanation = (
            f"Zone {zone_name} escalated from Priority Score {old_prio} ({old_state.get('priority_level', 'HIGH')}) "
            f"to {new_prio} ({new_state.get('priority_level', 'CRITICAL')}). "
            f"Affected population increased by {pop_pct}% (from {old_pop} to {new_pop}). "
            f"Road accessibility changed from {old_acc} to {new_acc}. "
            f"The optimization solver dynamically reallocated resources to satisfy critical life-safety demand."
        )

        deltas = [
            {
                "field": "affected_population",
                "old_value": old_pop,
                "new_value": new_pop,
                "impact": f"+{new_pop - old_pop} residents requiring emergency relief"
            },
            {
                "field": "accessibility",
                "old_value": old_acc,
                "new_value": new_acc,
                "impact": "Main access route blocked, triggering rescue team & airlift prioritization"
            },
            {
                "field": "priority_score",
                "old_value": old_prio,
                "new_value": new_prio,
                "impact": "Escalated to CRITICAL status"
            }
        ]

        return {
            "title": f"Reallocation Explanation for Zone {zone_name}",
            "summary": text_explanation,
            "state_deltas": deltas,
            "allocations_diff": allocations_diff,
            "confidence": 0.96
        }
