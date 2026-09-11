from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

# Auth Schemas
class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: Optional[str] = "OPERATOR"
    agency_id: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

# Incident & Report Schemas
class ReportCreate(BaseModel):
    raw_text: str
    zone_id: Optional[str] = None
    image_url: Optional[str] = None

class IncidentExtracted(BaseModel):
    hazard: str
    affected_population: int = 0
    injured: int = 0
    missing: int = 0
    accessibility: str = "OPEN"
    urgency: float = 50.0
    needs: List[Dict[str, Any]] = []
    evidence: List[str] = []
    confidence: float = 1.0
    missing_information: List[str] = []

class IncidentCreate(BaseModel):
    title: str
    description: str
    hazard_type: str
    zone_id: str
    affected_population: int = 0
    injured_count: int = 0
    missing_count: int = 0
    accessibility: str = "OPEN"
    road_condition: str = "CLEAR"
    water_level: str = "NORMAL"
    shelter_condition: str = "INTACT"
    medical_requirement: str = "NONE"
    image_url: Optional[str] = None

# Optimization Payload Schema
class OptimizeRequest(BaseModel):
    reserve_percentage: Optional[float] = 0.10
    allow_reallocation: Optional[bool] = True

class ApprovalRequest(BaseModel):
    decision: str  # APPROVED, REJECTED
    reason: str

class HumanOverrideRequest(BaseModel):
    entity_type: str  # PRIORITY, NEED, ALLOCATION
    entity_id: str
    new_value: Any
    reason: str

# Simulation Schema
class EventInjectionRequest(BaseModel):
    zone_id: str
    population: Optional[int] = None
    accessibility: Optional[str] = None
    medical_need: Optional[int] = None
    water_need: Optional[int] = None
    food_need: Optional[int] = None

# System Configuration Schema
class PolicyConfigRequest(BaseModel):
    weight_life_safety: float = 0.30
    weight_population: float = 0.20
    weight_shortage: float = 0.20
    weight_accessibility: float = 0.10
    weight_urgency: float = 0.10
    weight_trend: float = 0.10
    reserve_percent: float = 0.10
