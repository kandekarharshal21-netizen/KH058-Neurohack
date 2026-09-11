import { useState, useEffect } from 'react';
import { Zone, Incident, ResourceDepot, AllocationPlan, TaskItem, AlertItem, AuditLogItem } from '../types';
import { api } from '../services/api';

export function useOperationalState() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [depots, setDepots] = useState<ResourceDepot[]>([]);
  const [plans, setPlans] = useState<AllocationPlan[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [activeTab, setActiveTab] = useState<string>('command-center');
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoEscalated, setIsDemoEscalated] = useState<boolean>(false);
  const [wsConnected, setWsConnected] = useState<boolean>(false);

  const refreshAllData = async () => {
    try {
      setLoading(true);
      const [zData, iData, rData, pData, tData, aData, auditData] = await Promise.all([
        api.getZones(),
        api.getIncidents(),
        api.getResources(),
        api.getPlans(),
        api.getTasks(),
        api.getAlerts(),
        api.getAuditLogs()
      ]);

      setZones(zData);
      setIncidents(iData);
      setDepots(rData);
      setPlans(pData);
      setTasks(tData);
      setAlerts(aData);
      setAuditLogs(auditData);

      // Default select critical or first zone
      const criticalZone = zData.find(z => z.priority_level === 'CRITICAL' || z.priority_level === 'HIGH') || zData[0];
      if (criticalZone && !selectedZone) {
        setSelectedZone(criticalZone);
      }
    } catch (err) {
      console.error('Failed to load operational data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();

    // Setup WebSocket connection for live events
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/operations`;
    let socket: WebSocket | null = null;

    try {
      socket = new WebSocket(wsUrl);
      socket.onopen = () => setWsConnected(true);
      socket.onclose = () => setWsConnected(false);
      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.event) {
            refreshAllData();
          }
        } catch (e) {
          // ignore
        }
      };
    } catch (e) {
      setWsConnected(false);
    }

    return () => {
      if (socket) socket.close();
    };
  }, []);

  return {
    zones,
    incidents,
    depots,
    plans,
    tasks,
    alerts,
    auditLogs,
    selectedZone,
    setSelectedZone,
    activeTab,
    setActiveTab,
    loading,
    refreshAllData,
    isDemoEscalated,
    setIsDemoEscalated,
    wsConnected
  };
}
