from typing import List, Dict, Any

class NeedsAssessmentService:
    @staticmethod
    def calculate_zone_needs(
        population: int,
        injured_count: int,
        accessibility: str,
        hazard_type: str
    ) -> List[Dict[str, Any]]:
        """
        Calculates measurable resource demand based on deterministic rules and parameters.
        Returns a list of resource need dicts.
        """
        needs = []
        acc_upper = (accessibility or "OPEN").upper()
        haz_upper = (hazard_type or "FLOOD").upper()

        # 1. Water Demand
        water_per_person = 1.5 if haz_upper in ["FLOOD", "CYCLONE"] else 1.0
        water_qty = int(round(population * water_per_person))
        if water_qty > 0:
            needs.append({
                "resource_type": "WATER",
                "quantity_required": water_qty,
                "unit": "LITERS",
                "urgency": 85.0 if haz_upper == "FLOOD" else 60.0,
                "basis": f"Population ({population}) x {water_per_person} L/person/day for {hazard_type}",
                "confidence": 0.95
            })

        # 2. Food Demand
        food_factor = 0.6 if haz_upper in ["FLOOD", "EARTHQUAKE"] else 0.5
        food_qty = int(round(population * food_factor))
        if food_qty > 0:
            needs.append({
                "resource_type": "FOOD",
                "quantity_required": food_qty,
                "unit": "KITS",
                "urgency": 75.0,
                "basis": f"Population ({population}) x {food_factor} ration kits/person",
                "confidence": 0.92
            })

        # 3. Medical Kits Demand
        medical_qty = max(10, int(injured_count * 1.5) + (50 if haz_upper == "EARTHQUAKE" else 20))
        needs.append({
            "resource_type": "MEDICAL",
            "quantity_required": medical_qty,
            "unit": "KITS",
            "urgency": 95.0 if injured_count > 10 else 70.0,
            "basis": f"Injured count ({injured_count}) x 1.5 + base triage allowance",
            "confidence": 0.90
        })

        # 4. Shelter Capacity Demand
        if haz_upper in ["EARTHQUAKE", "CYCLONE"] or acc_upper == "BLOCKED":
            shelter_factor = 0.4 if haz_upper == "CYCLONE" else 0.3
            shelter_qty = int(round(population * shelter_factor))
            if shelter_qty > 0:
                needs.append({
                    "resource_type": "SHELTER",
                    "quantity_required": shelter_qty,
                    "unit": "SLOTS",
                    "urgency": 80.0,
                    "basis": f"Displaced population ({population}) x {shelter_factor} shelter factor",
                    "confidence": 0.88
                })

        # 5. Rescue Teams Demand
        if acc_upper == "BLOCKED" or haz_upper in ["LANDSLIDE", "FLOOD"]:
            rescue_teams = max(2, int(population / 400))
            needs.append({
                "resource_type": "RESCUE_TEAMS",
                "quantity_required": rescue_teams,
                "unit": "TEAMS",
                "urgency": 90.0 if acc_upper == "BLOCKED" else 65.0,
                "basis": f"Isolation/Accessibility ({accessibility}) for population {population}",
                "confidence": 0.91
            })

        return needs
