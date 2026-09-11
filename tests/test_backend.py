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
