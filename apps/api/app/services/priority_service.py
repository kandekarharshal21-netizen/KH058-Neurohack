from typing import Dict, Any, Tuple
from app.core.config import settings

class PriorityEngineService:
    @staticmethod
    def calculate_zone_priority(
        population: int,
        injured_count: int,
        missing_count: int,
        accessibility: str,
        urgency: float,
        fulfilled_ratio: float = 0.0,
        trend_status: str = "STABLE",
        weights: Dict[str, float] = None
    ) -> Tuple[float, str, Dict[str, float]]:
        """
        Calculates deterministic priority score (0-100) and severity level based on exact master spec formula:
        Priority Score = 0.30 * LifeSafety + 0.20 * Population + 0.20 * Shortage + 0.10 * AccessibilityRisk + 0.10 * Urgency + 0.10 * Trend
        """
        w = weights or {
            "life_safety": settings.WEIGHT_LIFE_SAFETY,
            "population": settings.WEIGHT_POPULATION,
            "shortage": settings.WEIGHT_SHORTAGE,
            "accessibility": settings.WEIGHT_ACCESSIBILITY,
            "urgency": settings.WEIGHT_URGENCY,
            "trend": settings.WEIGHT_TREND
        }

        # 1. Life Safety (0 - 100)
        # 10 injured = 50 pts, 50+ injured = 100 pts. 5 missing = 50 pts.
        life_safety = min(100.0, (injured_count * 4.0) + (missing_count * 10.0))
        if life_safety == 0 and population > 0:
            life_safety = min(100.0, (injured_count + 1) * 15.0)

        # 2. Population Factor (0 - 100)
        # Normalized: 5000 population = 100 score
        population_score = min(100.0, (population / 5000.0) * 100.0)

        # 3. Resource Shortage (0 - 100)
        # Shortage = (1.0 - fulfilled_ratio) * 100
        shortage_score = min(100.0, max(0.0, (1.0 - fulfilled_ratio) * 100.0))

        # 4. Accessibility Risk (0 - 100)
        acc_upper = (accessibility or "OPEN").upper()
        if acc_upper == "BLOCKED":
            accessibility_score = 95.0
        elif acc_upper == "RESTRICTED":
            accessibility_score = 60.0
        else:
            accessibility_score = 15.0

        # 5. Urgency (0 - 100)
        urgency_score = min(100.0, max(0.0, urgency))

        # 6. Trend Factor (0 - 100)
        trend_upper = (trend_status or "STABLE").upper()
        if trend_upper == "RAPIDLY_RISING":
            trend_score = 95.0
        elif trend_upper == "RISING":
            trend_score = 70.0
        elif trend_upper == "FALLING":
            trend_score = 15.0
        else:
            trend_score = 30.0

        # Calculated Score
        raw_score = (
            w["life_safety"] * life_safety +
            w["population"] * population_score +
            w["shortage"] * shortage_score +
            w["accessibility"] * accessibility_score +
            w["urgency"] * urgency_score +
            w["trend"] * trend_score
        )

        score = round(min(100.0, max(0.0, raw_score)), 1)

        # Priority Level Mapping
        if score >= 75.0:
            level = "CRITICAL"
        elif score >= 50.0:
            level = "HIGH"
        elif score >= 25.0:
            level = "WATCH"
        else:
            level = "STABLE"

        breakdown = {
            "life_safety": round(life_safety, 1),
            "population": round(population_score, 1),
            "shortage": round(shortage_score, 1),
            "accessibility": round(accessibility_score, 1),
            "urgency": round(urgency_score, 1),
            "trend": round(trend_score, 1),
            "composite_score": score
        }

        return score, level, breakdown
