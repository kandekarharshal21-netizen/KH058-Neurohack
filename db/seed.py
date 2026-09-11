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

    print("Seeding 5 Emergency Zones...")
    zones_data = [
        {
            "name": "Zone A — Eastern Riverbed Settlement",
            "code": "ZONE-A",
            "hazard_baseline": "FLOOD",
            "latitude": 26.8520,
            "longitude": 80.9460,
            "population": 1800,
            "baseline_severity": 72.0,
            "accessibility": "RESTRICTED",
            "polygon_coordinates": [[26.850, 80.940], [26.858, 80.942], [26.855, 80.950], [26.848, 80.948]]
        },
        {
            "name": "Zone B — Northern Seismic Fault Line",
            "code": "ZONE-B",
            "hazard_baseline": "EARTHQUAKE",
            "latitude": 26.9010,
            "longitude": 80.9820,
            "population": 900,
            "baseline_severity": 84.0,
            "accessibility": "OPEN",
            "polygon_coordinates": [[26.895, 80.975], [26.905, 80.978], [26.904, 80.988], [26.896, 80.985]]
        },
        {
            "name": "Zone C — Central Basin District",
            "code": "ZONE-C",
            "hazard_baseline": "FLOOD",
            "latitude": 26.8250,
            "longitude": 80.9020,
            "population": 3200,
            "baseline_severity": 61.0,
            "accessibility": "OPEN",
            "polygon_coordinates": [[26.820, 80.895], [26.832, 80.898], [26.830, 80.910], [26.818, 80.905]]
        },
        {
            "name": "Zone D — Southern Coastal Belt",
            "code": "ZONE-D",
            "hazard_baseline": "CYCLONE",
            "latitude": 26.7820,
            "longitude": 80.9540,
            "population": 1200,
            "baseline_severity": 78.0,
            "accessibility": "OPEN",
            "polygon_coordinates": [[26.775, 80.948], [26.788, 80.950], [26.785, 80.960], [26.776, 80.958]]
        },
        {
            "name": "Zone E — Western Hillside Pass",
            "code": "ZONE-E",
            "hazard_baseline": "LANDSLIDE",
            "latitude": 26.8850,
            "longitude": 80.8540,
            "population": 500,
            "baseline_severity": 55.0,
            "accessibility": "BLOCKED",
            "polygon_coordinates": [[26.880, 80.848], [26.890, 80.850], [26.888, 80.860], [26.879, 80.858]]
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

    print("Seeding Resource Depots...")
    depots_data = [
        {"name": "Depot Alpha — Central Command Supply Hub", "location": "Lucknow Central Depot", "lat": 26.8467, "lng": 80.9462, "agency": "Emergency Management Authority"},
        {"name": "Depot Bravo — North Medical & Triage Depot", "location": "Northern Highway Depot", "lat": 26.9100, "lng": 80.9700, "agency": "Health Department"},
        {"name": "Depot Charlie — South Relief & Logistics Hub", "location": "Southern Ring Depot", "lat": 26.7700, "lng": 80.9300, "agency": "Food & Civil Supplies"}
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
