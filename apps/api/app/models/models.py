import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    OPERATOR = "OPERATOR"
    RESOURCE_MANAGER = "RESOURCE_MANAGER"
    AGENCY_COORDINATOR = "AGENCY_COORDINATOR"
    FIELD_REPORTER = "FIELD_REPORTER"
    VIEWER = "VIEWER"

class PriorityLevel(str, enum.Enum):
    STABLE = "STABLE"
    WATCH = "WATCH"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class IncidentStatus(str, enum.Enum):
    NEW = "NEW"
    ANALYZING = "ANALYZING"
    VERIFIED = "VERIFIED"
    ACTIVE = "ACTIVE"
    ESCALATED = "ESCALATED"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"

class PlanStatus(str, enum.Enum):
    PROPOSED = "PROPOSED"
    OPTIMAL = "OPTIMAL"
    FEASIBLE = "FEASIBLE"
    APPROVAL_REQUIRED = "APPROVAL_REQUIRED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    SUPERSEDED = "SUPERSEDED"
    FAILED = "FAILED"

class TaskStatus(str, enum.Enum):
    PROPOSED = "PROPOSED"
    APPROVAL_REQUIRED = "APPROVAL_REQUIRED"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    ESCALATED = "ESCALATED"

class RiskLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default=UserRole.OPERATOR.value)
    agency_id = Column(String, ForeignKey("agencies.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    agency = relationship("Agency", back_populates="users")

class Agency(Base):
    __tablename__ = "agencies"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, unique=True, nullable=False)
    type = Column(String, nullable=False)
    capabilities = Column(JSON, default=list)
    contact_info = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="agency")

class Zone(Base):
    __tablename__ = "zones"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, unique=True, nullable=False)
    code = Column(String, unique=True, nullable=False)
    hazard_baseline = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    polygon_coordinates = Column(JSON, nullable=True)
    population = Column(Integer, default=0)
    baseline_severity = Column(Float, default=50.0)
    priority_score = Column(Float, default=50.0)
    priority_level = Column(String, default=PriorityLevel.WATCH.value)
    status = Column(String, default="ACTIVE")
    accessibility = Column(String, default="OPEN") # OPEN, RESTRICTED, BLOCKED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    incidents = relationship("Incident", back_populates="zone")
    needs = relationship("Need", back_populates="zone")

class Depot(Base):
    __tablename__ = "depots"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    location_name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    agency_id = Column(String, ForeignKey("agencies.id"), nullable=True)
    capacity = Column(Integer, default=10000)
    status = Column(String, default="OPERATIONAL")
    created_at = Column(DateTime, default=datetime.utcnow)

    resources = relationship("Resource", back_populates="depot")

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, default=generate_uuid)
    code = Column(String, unique=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    hazard_type = Column(String, nullable=False)
    zone_id = Column(String, ForeignKey("zones.id"), nullable=False)
    reporter_id = Column(String, ForeignKey("users.id"), nullable=True)
    reported_at = Column(DateTime, default=datetime.utcnow)
    affected_population = Column(Integer, default=0)
    injured_count = Column(Integer, default=0)
    missing_count = Column(Integer, default=0)
    accessibility = Column(String, default="OPEN")
    road_condition = Column(String, default="CLEAR")
    water_level = Column(String, default="NORMAL")
    shelter_condition = Column(String, default="INTACT")
    medical_requirement = Column(String, default="NONE")
    status = Column(String, default=IncidentStatus.NEW.value)
    confidence = Column(Float, default=1.0)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    location_source = Column(String, default="ZONE_ESTIMATE")
    location_confidence = Column(Float, default=1.0)
    image_url = Column(String, nullable=True)
    evidence_analysis = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    zone = relationship("Zone", back_populates="incidents")

class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, default=generate_uuid)
    code = Column(String, unique=True, nullable=False)
    raw_text = Column(Text, nullable=False)
    zone_id = Column(String, ForeignKey("zones.id"), nullable=True)
    reporter_id = Column(String, ForeignKey("users.id"), nullable=True)
    correlation_id = Column(String, index=True, nullable=False)
    parsed_data = Column(JSON, nullable=True)
    status = Column(String, default="INGESTED")
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Need(Base):
    __tablename__ = "needs"

    id = Column(String, primary_key=True, default=generate_uuid)
    zone_id = Column(String, ForeignKey("zones.id"), nullable=False)
    resource_type = Column(String, nullable=False)
    quantity_required = Column(Integer, default=0)
    unit = Column(String, nullable=False)
    urgency = Column(Float, default=50.0)
    confidence = Column(Float, default=1.0)
    basis = Column(String, nullable=False)
    evidence = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    zone = relationship("Zone", back_populates="needs")

class Resource(Base):
    __tablename__ = "resources"

    id = Column(String, primary_key=True, default=generate_uuid)
    code = Column(String, unique=True, nullable=False)
    depot_id = Column(String, ForeignKey("depots.id"), nullable=False)
    resource_type = Column(String, nullable=False)
    unit = Column(String, nullable=False)
    total_quantity = Column(Integer, default=0)
    reserved_quantity = Column(Integer, default=0)
    deployed_quantity = Column(Integer, default=0)
    available_quantity = Column(Integer, default=0)
    status = Column(String, default="AVAILABLE")
    provider_agency_id = Column(String, ForeignKey("agencies.id"), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    depot = relationship("Depot", back_populates="resources")

class ResourceLedger(Base):
    __tablename__ = "resource_ledger"

    id = Column(String, primary_key=True, default=generate_uuid)
    timestamp = Column(DateTime, default=datetime.utcnow)
    resource_id = Column(String, ForeignKey("resources.id"), nullable=False)
    event_type = Column(String, nullable=False) # RECEIVED, RESERVED, ALLOCATED, DISPATCHED, ARRIVED
    quantity = Column(Integer, nullable=False)
    source_depot_id = Column(String, nullable=True)
    destination_zone_id = Column(String, nullable=True)
    actor_id = Column(String, nullable=True)
    reason = Column(String, nullable=False)
    correlation_id = Column(String, index=True, nullable=False)

class AllocationPlan(Base):
    __tablename__ = "allocation_plans"

    id = Column(String, primary_key=True, default=generate_uuid)
    code = Column(String, unique=True, nullable=False)
    title = Column(String, nullable=False)
    status = Column(String, default=PlanStatus.PROPOSED.value)
    objective_value = Column(Float, default=0.0)
    priority_version = Column(Integer, default=1)
    reserve_policy_version = Column(Integer, default=1)
    is_active = Column(Boolean, default=False)
    total_cost = Column(Float, default=0.0)
    constraints_summary = Column(JSON, default=dict)
    explanation = Column(Text, nullable=True)
    correlation_id = Column(String, index=True, nullable=False)
    created_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    allocations = relationship("Allocation", back_populates="plan", cascade="all, delete-orphan")

class Allocation(Base):
    __tablename__ = "allocations"

    id = Column(String, primary_key=True, default=generate_uuid)
    plan_id = Column(String, ForeignKey("allocation_plans.id"), nullable=False)
    resource_type = Column(String, nullable=False)
    source_depot_id = Column(String, ForeignKey("depots.id"), nullable=False)
    destination_zone_id = Column(String, ForeignKey("zones.id"), nullable=False)
    need_id = Column(String, ForeignKey("needs.id"), nullable=True)
    quantity = Column(Integer, nullable=False)
    priority_weight = Column(Float, default=1.0)
    assigned_agency_id = Column(String, ForeignKey("agencies.id"), nullable=True)
    risk_level = Column(String, default=RiskLevel.MEDIUM.value)
    status = Column(String, default="PROPOSED")
    created_at = Column(DateTime, default=datetime.utcnow)

    plan = relationship("AllocationPlan", back_populates="allocations")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=generate_uuid)
    code = Column(String, unique=True, nullable=False)
    plan_id = Column(String, ForeignKey("allocation_plans.id"), nullable=True)
    agency_id = Column(String, ForeignKey("agencies.id"), nullable=False)
    zone_id = Column(String, ForeignKey("zones.id"), nullable=False)
    resource_type = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    owner = Column(String, nullable=True)
    priority = Column(String, default="HIGH")
    deadline = Column(String, nullable=True)
    status = Column(String, default=TaskStatus.PROPOSED.value)
    risk_level = Column(String, default=RiskLevel.MEDIUM.value)
    correlation_id = Column(String, index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class TaskDependency(Base):
    __tablename__ = "task_dependencies"

    id = Column(String, primary_key=True, default=generate_uuid)
    parent_task_id = Column(String, ForeignKey("tasks.id"), nullable=False)
    dependent_task_id = Column(String, ForeignKey("tasks.id"), nullable=False)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, default=generate_uuid)
    type = Column(String, nullable=False) # CRITICAL_ZONE, RESOURCE_SHORTAGE, DUPLICATE_EFFORT, REALLOCATION, APPROVAL_REQUIRED
    severity = Column(String, default="HIGH")
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    zone_id = Column(String, ForeignKey("zones.id"), nullable=True)
    related_entity_type = Column(String, nullable=True)
    related_entity_id = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Approval(Base):
    __tablename__ = "approvals"

    id = Column(String, primary_key=True, default=generate_uuid)
    plan_id = Column(String, ForeignKey("allocation_plans.id"), nullable=False)
    approver_id = Column(String, ForeignKey("users.id"), nullable=True)
    decision = Column(String, nullable=False) # APPROVED, REJECTED
    reason = Column(Text, nullable=False)
    risk_level = Column(String, default=RiskLevel.HIGH.value)
    correlation_id = Column(String, index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

class DecisionEvent(Base):
    __tablename__ = "decision_events"

    id = Column(String, primary_key=True, default=generate_uuid)
    correlation_id = Column(String, index=True, nullable=False)
    step_name = Column(String, nullable=False)
    status = Column(String, default="COMPLETED")
    duration_ms = Column(Integer, default=0)
    agent_name = Column(String, nullable=False)
    payload = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    timestamp = Column(DateTime, default=datetime.utcnow)
    event_type = Column(String, nullable=False)
    actor = Column(String, default="SYSTEM")
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=True)
    correlation_id = Column(String, index=True, nullable=False)
    previous_state = Column(JSON, nullable=True)
    new_state = Column(JSON, nullable=True)
    payload = Column(JSON, nullable=True)

class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(String, primary_key=True, default=generate_uuid)
    run_id = Column(String, unique=True, nullable=False)
    agent_name = Column(String, nullable=False)
    status = Column(String, default="SUCCESS")
    duration_ms = Column(Integer, default=0)
    confidence = Column(Float, default=1.0)
    input_summary = Column(Text, nullable=True)
    output_summary = Column(Text, nullable=True)
    correlation_id = Column(String, index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
