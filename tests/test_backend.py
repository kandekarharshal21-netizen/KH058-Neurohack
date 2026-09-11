import pytest
from fastapi.testclient import TestClient
import sys, os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../apps/api")))

from app.main import app
from app.services.priority_service import PriorityEngineService
from app.services.needs_service import NeedsAssessmentService
from app.optimizer.allocation import OptimizationEngine

client = TestClient(app)

def test_priority_engine_calculation():
    score, level, breakdown = PriorityEngineService.calculate_zone_priority(
        population=5000,
        injured_count=85,
        missing_count=12,
        accessibility="BLOCKED",
        urgency=95.0
    )
    assert score >= 75.0
    assert level == "CRITICAL"
    assert "life_safety" in breakdown

def test_needs_assessment():
    needs = NeedsAssessmentService.calculate_zone_needs(
        population=3200,
        injured_count=10,
        accessibility="OPEN",
        hazard_type="FLOOD"
    )
    assert len(needs) >= 2
    types = [n["resource_type"] for n in needs]
    assert "WATER" in types
    assert "FOOD" in types

def test_optimization_solver():
    zones = [
        {"id": "z1", "priority_score": 90.0, "needs": [{"resource_type": "WATER", "quantity_required": 1000}]},
        {"id": "z2", "priority_score": 40.0, "needs": [{"resource_type": "WATER", "quantity_required": 1000}]}
    ]
    depots = [
        {"id": "d1", "name": "Main Depot", "resources": {"WATER": 1200}}
    ]
    result = OptimizationEngine.optimize_allocation(zones=zones, depots=depots, reserve_percent=0.10)
    assert result["status"] in ["OPTIMAL", "FEASIBLE"]
    assert len(result["allocations"]) > 0

def test_api_health():
    res = client.get("/api/settings/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ONLINE"

def test_list_zones():
    res = client.get("/api/zones")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 5

def test_zone_c_escalation_demo_flow():
    res = client.post("/api/demo/trigger-zone-c-escalation")
    assert res.status_code == 200
    json_data = res.json()
    assert json_data["status"] == "SUCCESS"
    assert json_data["zone_c_updated"]["level"] == "CRITICAL"
    assert json_data["zone_c_updated"]["new_priority"] >= 75.0

def test_cv_service_fire_detection_green_bbox():
    import numpy as np
    import cv2
    import base64
    from app.services.cv_service import ComputerVisionService

    # Create synthetic thermal image with strong flame region
    img = np.zeros((300, 300, 3), dtype=np.uint8)
    img[:] = (20, 30, 20)  # Dark background
    cv2.rectangle(img, (70, 70), (230, 230), (30, 140, 255), -1)  # BGR Flame signature

    _, buffer = cv2.imencode(".jpg", img)
    b64_str = f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"

    result = ComputerVisionService.analyze_frame(b64_str)
    assert result["success"] is True
    assert result["hazard_detected"] == "Fire"
    assert result["risk_level"] == "CRITICAL"
    assert len(result["detections"]) > 0

    # Industry Requirement: Bounding box MUST be green (#22c55e)
    fire_det = [d for d in result["detections"] if d["class_name"] == "Fire"][0]
    assert fire_det["box_color"] == "#22c55e"
    assert "norm_x" in fire_det["bbox"]
    assert "norm_y" in fire_det["bbox"]
    assert fire_det["confidence"] > 0.6

def test_submit_public_report_api():
    payload = {
        "source_type": "CAMERA",
        "description": "Wildfire outbreak observed near Sinhagad Road, heavy smoke billowing.",
        "latitude": 18.4782,
        "longitude": 73.8340,
        "location_accuracy": 15,
        "locality": "Sinhagad Road, Pune",
        "ai_analysis": {
            "hazard_detected": "Fire",
            "confidence": 0.94,
            "confidence_percent": 94,
            "risk_level": "CRITICAL",
            "detections": [{
                "class_name": "Fire",
                "box_color": "#22c55e",
                "bbox": {"norm_x": 0.2, "norm_y": 0.3, "norm_width": 0.5, "norm_height": 0.4}
            }]
        }
    }
    res = client.post("/api/incidents/submit-public", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["hazard_type"] == "FIRE"
    assert "incident_code" in data

def test_auth_registration_and_login():
    import uuid
    email = f"field_{uuid.uuid4().hex[:6]}@kshetra.gov.in"
    reg_payload = {
        "email": email,
        "password": "EmergencyPassword123!",
        "full_name": "Field Officer Pune",
        "role": "FIELD_REPORTER"
    }
    res_reg = client.post("/api/auth/register", json=reg_payload)
    assert res_reg.status_code == 200
    reg_data = res_reg.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["role"] == "FIELD_REPORTER"

    login_payload = {
        "email": email,
        "password": "EmergencyPassword123!"
    }
    res_login = client.post("/api/auth/login", json=login_payload)
    assert res_login.status_code == 200
    login_data = res_login.json()
    assert "access_token" in login_data
    token = login_data["access_token"]

    res_me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 200
    assert res_me.json()["email"] == email
