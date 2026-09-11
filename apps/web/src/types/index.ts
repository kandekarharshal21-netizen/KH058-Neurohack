export interface Zone {
  id: string;
  name: string;
  code: string;
  hazard_baseline: string;
  latitude: number;
  longitude: number;
  polygon_coordinates?: number[][];
  population: number;
  baseline_severity: number;
  priority_score: number;
  priority_level: 'STABLE' | 'WATCH' | 'HIGH' | 'CRITICAL';
  status: string;
  accessibility: 'OPEN' | 'RESTRICTED' | 'BLOCKED';
  needs?: Need[];
  score_breakdown?: Record<string, number>;
  updated_at?: string;
}

export interface Need {
  id?: string;
  resource_type: 'WATER' | 'FOOD' | 'MEDICAL' | 'SHELTER' | 'RESCUE_TEAMS';
  quantity_required: number;
  unit: string;
  urgency: number;
  basis: string;
  confidence: number;
}

export interface Incident {
  id: string;
  code: string;
  title: string;
  description: string;
  hazard_type: string;
  zone_id: string;
  zone_name?: string;
  reported_at: string;
  affected_population: number;
  injured_count: number;
  missing_count: number;
  accessibility: string;
  status: string;
  confidence: number;
  location_lat: number;
  location_lng: number;
  image_url?: string;
  created_at: string;
}

export interface ResourceDepot {
  depot_id: string;
  depot_name: string;
  location_name: string;
  latitude: number;
  longitude: number;
  agency_name: string;
  capacity: number;
  status: string;
  resources: ResourceItem[];
}

export interface ResourceItem {
  id: string;
  code: string;
  resource_type: string;
  unit: string;
  total_quantity: number;
  reserved_quantity: number;
  deployed_quantity: number;
  available_quantity: number;
  status: string;
}

export interface AllocationPlan {
  id: string;
  code: string;
  title: string;
  status: string;
  objective_value: number;
  is_active: boolean;
  constraints_summary: Record<string, any>;
  explanation: string;
  correlation_id: string;
  created_at: string;
  allocations_count?: number;
}

export interface AllocationItem {
  id: string;
  resource_type: string;
  source_depot_id: string;
  source_depot_name?: string;
  destination_zone_id: string;
  destination_zone_name?: string;
  quantity: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: string;
}

export interface TaskItem {
  id: string;
  code: string;
  plan_id?: string;
  agency_id: string;
  agency_name: string;
  zone_id: string;
  zone_name: string;
  resource_type: string;
  quantity: number;
  owner?: string;
  priority: string;
  status: 'PROPOSED' | 'APPROVAL_REQUIRED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  risk_level: string;
  dependencies_count: number;
  created_at: string;
}

export interface AlertItem {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  zone_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  event_type: string;
  actor: string;
  entity_type: string;
  entity_id?: string;
  correlation_id: string;
  previous_state?: Record<string, any>;
  new_state?: Record<string, any>;
  payload?: Record<string, any>;
}
