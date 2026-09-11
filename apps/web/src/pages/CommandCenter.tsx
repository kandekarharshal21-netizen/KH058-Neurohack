import React, { useState } from 'react';
import { MetricsHeader } from '../components/MetricsHeader';
import { CommandMap } from '../map/CommandMap';
import { ZoneIntelligencePanel } from '../components/ZoneIntelligencePanel';
import { ReallocationDiffView } from '../components/ReallocationDiffView';
import { Zone, Incident, ResourceDepot, AllocationPlan, TaskItem, AlertItem, AuditLogItem } from '../types';
import { AlertTriangle, Layers, Activity, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

interface CommandCenterProps {
  zones: Zone[];
  incidents: Incident[];
  depots: ResourceDepot[];
  plans: AllocationPlan[];
  tasks: TaskItem[];
  alerts: AlertItem[];
  selectedZone: Zone | null;
  onSelectZone: (zone: Zone) => void;
  onRefresh: () => void;
  onOpenDecisionTrace: (cid: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  zones,
  incidents,
  depots,
  plans,
  tasks,
  alerts,
  selectedZone,
  onSelectZone,
  onRefresh,
  onOpenDecisionTrace
}) => {
  const [activePlan, setActivePlan] = useState<AllocationPlan | null>(plans.find(p => p.is_active) || plans[0] || null);

  const handleApprovePlan = async (planId: string) => {
    try {
      await api.approvePlan(planId, 'APPROVED', 'Command Controller Manual Approval');
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#F8F4EE] text-[#2E2E2E] font-sans">
      {/* 1. Header Metrics Bar */}
      <MetricsHeader zones={zones} incidents={incidents} tasks={tasks} depots={depots} />

      {/* 2. Main Area: Map + Zone Intelligence Panel */}
      <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Geospatial Operational Map */}
        <div className="lg:col-span-2 flex flex-col h-[520px]">
          <CommandMap
            zones={zones}
            depots={depots}
            tasks={tasks}
            selectedZone={selectedZone}
            onSelectZone={onSelectZone}
          />
        </div>

        {/* Zone Intelligence Slide-Out */}
        <div className="flex flex-col">
          <ZoneIntelligencePanel zone={selectedZone} />
        </div>
      </div>

      {/* 3. Secondary Section: Live Alerts & Dynamic Reallocation Banner */}
      <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Live System Alerts Sidebar */}
        <div className="bg-white border border-[#D9CEC1] rounded-2xl p-4 space-y-3 shadow-sm">
          <h3 className="text-xs font-bold text-[#542126] uppercase tracking-wider flex items-center justify-between font-mono">
            <span className="flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-[#D6C09A]" /> Live Priority Alerts</span>
            <span className="text-[10px] font-mono text-[#2F7775] font-bold">{alerts.length} Active</span>
          </h3>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {alerts.length === 0 ? (
              <p className="text-xs text-[#B5A69D] py-4 text-center">No critical system alerts.</p>
            ) : (
              alerts.map((a, idx) => (
                <div key={idx} className={`p-3 rounded-xl border text-xs ${
                  a.severity === 'CRITICAL' ? 'bg-[#9E3F45]/10 border-[#9E3F45]/30 text-[#9E3F45]' : 'bg-[#F4EDE3] border-[#D9CEC1] text-[#2E2E2E]'
                }`}>
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span>{a.title}</span>
                    <span className="text-[10px] font-mono opacity-60">Just now</span>
                  </div>
                  <p className="text-[11px] leading-snug">{a.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Optimization & Reallocation Plans */}
        <div className="lg:col-span-2 bg-white border border-[#D9CEC1] rounded-2xl p-4 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#542126] uppercase tracking-wider flex items-center gap-2 font-mono">
              <Layers className="w-4 h-4 text-[#2F7775]" /> Active Optimization Plan
            </h3>
            <button
              onClick={() => onOpenDecisionTrace('KSH-C-0042-RUN-007')}
              className="text-xs font-bold text-[#2F7775] hover:text-[#542126] flex items-center gap-1 bg-[#F4EDE3] px-3 py-1.5 rounded-xl border border-[#D9CEC1] transition shadow-sm"
            >
              <Activity className="w-3.5 h-3.5" /> View Decision Trace
            </button>
          </div>

          {plans.length === 0 ? (
            <div className="text-center py-6 text-[#B5A69D] text-xs font-medium">
              No allocation plans generated yet. Click "Optimization Engine" to generate a response plan.
            </div>
          ) : (
            <div className="space-y-3">
              {plans.slice(0, 2).map((p, idx) => (
                <div key={idx} className="p-3 bg-[#F4EDE3] rounded-xl border border-[#D9CEC1] flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#542126]">{p.code}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        p.status === 'APPROVED' ? 'bg-[#718B78]/20 text-[#718B78] border-[#718B78]/40' : 'bg-[#D6C09A]/30 text-[#542126] border-[#D6C09A]'
                      }`}>{p.status}</span>
                    </div>
                    <p className="text-[#2E2E2E] font-bold mt-1">{p.title}</p>
                    <p className="text-[10px] text-[#B5A69D] font-medium">{p.explanation}</p>
                  </div>

                  {p.status === 'PROPOSED' && (
                    <button
                      onClick={() => handleApprovePlan(p.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#718B78] hover:bg-[#718B78]/90 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-[#718B78]/20"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


