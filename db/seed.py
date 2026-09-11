import sys
import os
from datetime import datetime

# Add apps/api to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../apps/api")))

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.models import (
    User, Agency, Zone, Depot, Resource, Incident, Report, Need, AuditLog
)
from app.services.priority_service import PriorityEngineService

def seed_db():
    print("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing demo data
    db.query(AuditLog).delete()
    db.query(Need).delete()
    db.query(Incident).delete()
    db.query(Report).delete()
    db.query(Resource).delete()
    db.query(Depot).delete()
    db.query(Zone).delete()
    db.query(User).delete()
    db.query(Agency).delete()
    db.commit()

    print("Seeding Agencies...")
    agencies_data = [
        {"name": "Emergency Management Authority", "type": "GOVERNMENT", "capabilities": ["COORDINATION", "COMMAND"]},
        {"name": "Health Department", "type": "MEDICAL", "capabilities": ["TRIAGE", "HOSPITAL", "AMBULANCE"]},
        {"name": "Food & Civil Supplies", "type": "LOGISTICS", "capabilities": ["RATIONS", "WATER", "COMMISSARY"]},
        {"name": "Transport Authority", "type": "TRANSPORT", "capabilities": ["TRUCKS", "CONVOYS", "AIRLIFT"]},
        {"name": "Search & Rescue Command", "type": "RESCUE", "capabilities": ["BOAT_RESCUE", "AIR_RESCUE", "DOG_TEAMS"]},
        {"name": "NGO Relief Network", "type": "VOLUNTEER", "capabilities": ["SHELTER_MGMT", "COMMUNITY"]}
    ]
    agency_objs = {}
    for a in agencies_data:
        agency = Agency(name=a["name"], type=a["type"], capabilities=a["capabilities"])
        db.add(agency)
        db.flush()
        agency_objs[a["name"]] = agency.id

    print("Seeding Users...")
    hashed_pwd = get_password_hash("admin123")
    users = [
        User(email="admin@kshetra.gov.in", full_name="Chief Operations Director", hashed_password=hashed_pwd, role="ADMIN"),
        User(email="operator@kshetra.gov.in", full_name="Senior Controller Officer", hashed_password=hashed_pwd, role="OPERATOR"),
        User(email="reporter@kshetra.gov.in", full_name="Field Scout Alpha", hashed_password=hashed_pwd, role="FIELD_REPORTER")
    ]
    for u in users:
        db.add(u)
    db.commit()

    print("Seeding 5 Pune Emergency Disaster Zones...")
    zones_data = [
        {
            "name": "Zone A — Sinhagad Road Mutha River Basin",
            "code": "ZONE-A",
            "hazard_baseline": "FLOOD",
            "latitude": 18.4782,
            "longitude": 73.8340,
            "population": 3800,
            "baseline_severity": 76.0,
            "accessibility": "RESTRICTED",
            "polygon_coordinates": [[18.472, 73.828], [18.484, 73.830], [18.482, 73.842], [18.470, 73.838]]
        },
        {
            "name": "Zone B — Shivajinagar & Mutha Confluence",
            "code": "ZONE-B",
            "hazard_baseline": "FLOOD",
            "latitude": 18.5308,
            "longitude": 73.8475,
            "population": 2200,
            "baseline_severity": 68.0,
            "accessibility": "OPEN",
            "polygon_coordinates": [[18.525, 73.840], [18.538, 73.843], [18.536, 73.854], [18.523, 73.851]]
        },
        {
            "name": "Zone C — Kothrud ARAI Hill & Paud Ridge",
            "code": "ZONE-C",
            "hazard_baseline": "WILDFIRE",
            "latitude": 18.5074,
            "longitude": 73.8077,
            "population": 3200,
            "baseline_severity": 61.0,
            "accessibility": "OPEN",
            "polygon_coordinates": [[18.500, 73.800], [18.514, 73.803], [18.512, 73.816], [18.498, 73.812]]
        },
        {
            "name": "Zone D — Hadapsar Magarpatta Industrial Belt",
            "code": "ZONE-D",
            "hazard_baseline": "FIRE",
            "latitude": 18.5089,
            "longitude": 73.9259,
            "population": 2900,
            "baseline_severity": 74.0,
            "accessibility": "OPEN",
            "polygon_coordinates": [[18.502, 73.918], [18.516, 73.921], [18.513, 73.934], [18.499, 73.930]]
        },
        {
            "name": "Zone E — Katraj Ambegaon Hillside Ghat",
            "code": "ZONE-E",
            "hazard_baseline": "LANDSLIDE",
            "latitude": 18.4485,
            "longitude": 73.8588,
            "population": 1400,
            "baseline_severity": 58.0,
            "accessibility": "BLOCKED",
            "polygon_coordinates": [[18.440, 73.850], [18.455, 73.853], [18.452, 73.867], [18.438, 73.862]]
        }
    ]

    zone_objs = {}
    for zd in zones_data:
        score, level, _ = PriorityEngineService.calculate_zone_priority(
            population=zd["population"],
            injured_count=15 if zd["baseline_severity"] > 75 else 5,
            missing_count=0,
            accessibility=zd["accessibility"],
            urgency=zd["baseline_severity"]
        )
        z = Zone(
            name=zd["name"],
            code=zd["code"],
            hazard_baseline=zd["hazard_baseline"],
            latitude=zd["latitude"],
            longitude=zd["longitude"],
            polygon_coordinates=zd["polygon_coordinates"],
            population=zd["population"],
            baseline_severity=zd["baseline_severity"],
            priority_score=score,
            priority_level=level,
            accessibility=zd["accessibility"]
        )
        db.add(z)
        db.flush()
        zone_objs[zd["code"]] = z

    print("Seeding Pune Resource Depots...")
    depots_data = [
        {"name": "PMC Central Command Logistics Hub", "location": "Shivajinagar Central Depot, Pune", "lat": 18.5280, "lng": 73.8510, "agency": "Emergency Management Authority"},
        {"name": "Pune South Medical & Triage Depot", "location": "Swargate Tactical Logistics Depot, Pune", "lat": 18.4980, "lng": 73.8520, "agency": "Health Department"},
        {"name": "Pune East Rapid Relief Depot", "location": "Hadapsar Industrial Logistics Base, Pune", "lat": 18.5050, "lng": 73.9180, "agency": "Food & Civil Supplies"}
    ]

    depot_objs = []
    for dd in depots_data:
        depot = Depot(
            name=dd["name"],
            location_name=dd["location"],
            latitude=dd["lat"],
            longitude=dd["lng"],
            agency_id=agency_objs.get(dd["agency"]),
            capacity=15000
        )
        db.add(depot)
        db.flush()
        depot_objs.append(depot)

    print("Seeding Stock Inventories (Scarcity Configured)...")
    # Inventory Totals across depots:
    # Water: 5000 units, Food: 2200 kits, Medical: 500 kits, Shelter: 1800 slots, Rescue: 12 teams
    resources_inventory = [
        # Depot Alpha
        {"depot": depot_objs[0], "type": "WATER", "unit": "LITERS", "qty": 3000},
        {"depot": depot_objs[0], "type": "FOOD", "unit": "KITS", "qty": 1200},
        {"depot": depot_objs[0], "type": "RESCUE_TEAMS", "unit": "TEAMS", "qty": 8},
        
        # Depot Bravo
        {"depot": depot_objs[1], "type": "MEDICAL", "unit": "KITS", "qty": 500},
        {"depot": depot_objs[1], "type": "SHELTER", "unit": "SLOTS", "qty": 800},
        
        # Depot Charlie
        {"depot": depot_objs[2], "type": "WATER", "unit": "LITERS", "qty": 2000},
        {"depot": depot_objs[2], "type": "FOOD", "unit": "KITS", "qty": 1000},
        {"depot": depot_objs[2], "type": "SHELTER", "unit": "SLOTS", "qty": 1000},
        {"depot": depot_objs[2], "type": "RESCUE_TEAMS", "unit": "TEAMS", "qty": 4}
    ]

    for idx, r_data in enumerate(resources_inventory):
        res = Resource(
            code=f"RES-000{idx+1}",
            depot_id=r_data["depot"].id,
            resource_type=r_data["type"],
            unit=r_data["unit"],
            total_quantity=r_data["qty"],
            reserved_quantity=0,
            deployed_quantity=0,
            available_quantity=r_data["qty"],
            provider_agency_id=r_data["depot"].agency_id
        )
        db.add(res)

    print("Seeding Initial Zone Needs...")
    needs_map = [
        # Zone A
        {"zone": zone_objs["ZONE-A"], "type": "WATER", "qty": 2700, "unit": "LITERS", "urgency": 85.0, "basis": "Population 1800 x 1.5 L/day"},
        {"zone": zone_objs["ZONE-A"], "type": "FOOD", "qty": 1080, "unit": "KITS", "urgency": 75.0, "basis": "Population 1800 x 0.6 rations"},
        {"zone": zone_objs["ZONE-A"], "type": "RESCUE_TEAMS", "qty": 4, "unit": "TEAMS", "urgency": 80.0, "basis": "Restricted accessibility riverbed flood"},

        # Zone B
        {"zone": zone_objs["ZONE-B"], "type": "MEDICAL", "qty": 120, "unit": "KITS", "urgency": 95.0, "basis": "Earthquake casualty triage (900 pop)"},
        {"zone": zone_objs["ZONE-B"], "type": "SHELTER", "qty": 270, "unit": "SLOTS", "urgency": 85.0, "basis": "Structural damage displacement"},

        # Zone C
        {"zone": zone_objs["ZONE-C"], "type": "WATER", "qty": 4800, "unit": "LITERS", "urgency": 70.0, "basis": "Population 3200 x 1.5 L/day"},
        {"zone": zone_objs["ZONE-C"], "type": "FOOD", "qty": 1920, "unit": "KITS", "urgency": 65.0, "basis": "Population 3200 x 0.6 rations"},

        # Zone D
        {"zone": zone_objs["ZONE-D"], "type": "SHELTER", "qty": 480, "unit": "SLOTS", "urgency": 90.0, "basis": "Cyclone roof damage (1200 pop)"},
        {"zone": zone_objs["ZONE-D"], "type": "MEDICAL", "qty": 80, "unit": "KITS", "urgency": 70.0, "basis": "Storm injury support"},

        # Zone E
        {"zone": zone_objs["ZONE-E"], "type": "RESCUE_TEAMS", "qty": 3, "unit": "TEAMS", "urgency": 90.0, "basis": "Blocked pass landslide isolation"},
        {"zone": zone_objs["ZONE-E"], "type": "FOOD", "qty": 300, "unit": "KITS", "urgency": 60.0, "basis": "Isolated community rations"}
    ]

    for n in needs_map:
        nd = Need(
            zone_id=n["zone"].id,
            resource_type=n["type"],
            quantity_required=n["qty"],
            unit=n["unit"],
            urgency=n["urgency"],
            basis=n["basis"],
            confidence=0.92
        )
        db.add(nd)

    db.commit()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_db()
