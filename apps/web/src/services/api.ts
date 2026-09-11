import axios from 'axios';
import { Zone, Incident, ResourceDepot, AllocationPlan, TaskItem, AlertItem, AuditLogItem } from '../types';

const API_BASE = '/api';

export const api = {
  // Zones
  getZones: async (): Promise<Zone[]> => {
    const res = await axios.get(`${API_BASE}/zones`);
    return res.data;
  },

  getZoneDetail: async (zoneId: string) => {
    const res = await axios.get(`${API_BASE}/zones/${zoneId}`);
    return res.data;
  },

  // Incidents & NL Reports
  getIncidents: async (): Promise<Incident[]> => {
    const res = await axios.get(`${API_BASE}/incidents`);
    return res.data;
  },

  parseReport: async (rawText: string, zoneId?: string) => {
    const res = await axios.post(`${API_BASE}/incidents/parse-report`, { raw_text: rawText, zone_id: zoneId });
    return res.data;
  },

  createIncident: async (incidentData: any) => {
    const res = await axios.post(`${API_BASE}/incidents`, incidentData);
    return res.data;
  },

  // Resources
  getResources: async (): Promise<ResourceDepot[]> => {
    const res = await axios.get(`${API_BASE}/resources`);
    return res.data;
  },

  getLedger: async () => {
    const res = await axios.get(`${API_BASE}/resources/ledger`);
    return res.data;
  },

  // Allocations & Optimization
  getPlans: async (): Promise<AllocationPlan[]> => {
    const res = await axios.get(`${API_BASE}/allocations/plans`);
    return res.data;
  },

  getPlanDetail: async (planId: string) => {
    const res = await axios.get(`${API_BASE}/allocations/plans/${planId}`);
    return res.data;
  },

  runOptimization: async (reservePercent: number = 0.10) => {
    const res = await axios.post(`${API_BASE}/allocations/optimize`, { reserve_percentage: reservePercent });
    return res.data;
  },

  approvePlan: async (planId: string, decision: 'APPROVED' | 'REJECTED', reason: string) => {
    const res = await axios.post(`${API_BASE}/allocations/plans/${planId}/approve`, { decision, reason });
    return res.data;
  },

  // Tasks
  getTasks: async (): Promise<TaskItem[]> => {
    const res = await axios.get(`${API_BASE}/tasks`);
    return res.data;
  },

  updateTaskStatus: async (taskId: string, status: string) => {
    const res = await axios.patch(`${API_BASE}/tasks/${taskId}/status`, { status });
    return res.data;
  },

  getDuplicates: async () => {
    const res = await axios.get(`${API_BASE}/tasks/duplicates`);
    return res.data;
  },

  // Alerts
  getAlerts: async (): Promise<AlertItem[]> => {
    const res = await axios.get(`${API_BASE}/alerts`);
    return res.data;
  },

  markAlertRead: async (alertId: string) => {
    const res = await axios.patch(`${API_BASE}/alerts/${alertId}/read`);
    return res.data;
  },

  // Audit
  getAuditLogs: async (): Promise<AuditLogItem[]> => {
    const res = await axios.get(`${API_BASE}/audit`);
    return res.data;
  },

  getAgentRuns: async () => {
    const res = await axios.get(`${API_BASE}/audit/agent-runs`);
    return res.data;
  },

  getDecisionTrace: async (correlationId: string) => {
    const res = await axios.get(`${API_BASE}/audit/decision-trace/${correlationId}`);
    return res.data;
  },

  // Master Demo Controller
  triggerZoneCEscalation: async () => {
    const res = await axios.post(`${API_BASE}/demo/trigger-zone-c-escalation`);
    return res.data;
  },

  // Simulation
  runSimulation: async (payload: any) => {
    const res = await axios.post(`${API_BASE}/simulations/run`, payload);
    return res.data;
  },

  // Settings & Health
  getHealth: async () => {
    const res = await axios.get(`${API_BASE}/settings/health`);
    return res.data;
  }
};
