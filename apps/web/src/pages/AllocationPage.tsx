import React, { useState } from 'react';
import { AllocationPlan, Zone } from '../types';
import { api } from '../services/api';
import { ReallocationDiffView } from '../components/ReallocationDiffView';
import { Layers, Play, CheckCircle2, XCircle, Activity, ShieldCheck } from 'lucide-react';

interface AllocationPageProps {
  plans: AllocationPlan[];
  zones: Zone[];
  onRefresh: () => void;
}

export const AllocationPage: React.FC<AllocationPageProps> = ({ plans, zones, onRefresh }) => {
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [reservePercent, setReservePercent] = useState<number>(0.10);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(plans[0]?.id || null);

  const handleRunOptimization = async () => {
    try {
      setIsOptimizing(true);
      const res = await api.runOptimization(reservePercent);
      setSelectedPlanId(res.plan_id);
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApprovePlan = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!selectedPlanId) return;
    try {
      await api.approvePlan(selectedPlanId, decision, 'Operator authorization confirmed');
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#F8F4EE] text-[#2E2E2E] font-sans">
      <div className="flex items-center justify-between border-b border-[#D9CEC1] pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#542126] flex items-center gap-2 font-mono">
            <Layers className="w-5 h-5 text-[#2F7775]" /> MATHEMATICAL OPTIMIZATION ENGINE (Google OR-Tools MIP)
          </h2>
          <p className="text-xs text-[#B5A69D] mt-1">Deterministic MIP solver generating priority-weighted resource allocations under supply, route, and policy constraints</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#D9CEC1] text-xs">
            <span className="text-[#B5A69D]">Reserve Policy:</span>
            <select
              value={reservePercent}
              onChange={(e) => setReservePercent(parseFloat(e.target.value))}
              className="bg-[#F4EDE3] text-[#2F7775] font-bold focus:outline-none rounded px-2 py-0.5 border border-[#D9CEC1]"
            >
              <option value={0.05}>5% Reserve</option>
              <option value={0.10}>10% Reserve (Standard)</option>
              <option value={0.15}>15% Reserve</option>
            </select>
          </div>

          <button
            onClick={handleRunOptimization}
            disabled={isOptimizing}
            className="px-4 py-2 rounded-lg bg-[#2F7775] hover:bg-[#2F7775]/90 text-white font-bold text-xs flex items-center gap-2 shadow-md disabled:opacity-50"
          >
            {isOptimizing ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            <span>RUN OPTIMIZER</span>
          </button>
        </div>
      </div>

      {/* Dynamic Reallocation Before/After Section */}
      <ReallocationDiffView onApproveReallocation={() => handleApprovePlan('APPROVED')} />

      {/* Allocation Plan Directory */}
      <div className="bg-white border border-[#D9CEC1] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#D9CEC1] bg-[#F4EDE3] flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#542126] uppercase tracking-wider font-mono">Generated Response Plans</h3>
          <span className="text-xs font-mono text-[#2F7775]">{plans.length} History Records</span>
        </div>

        <div className="divide-y divide-[#F0EAE1]">
          {plans.map((p) => (
            <div key={p.id} className="p-4 flex items-center justify-between hover:bg-[#F4EDE3]/40 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#2F7775]">{p.code}</span>
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                    p.status === 'APPROVED' ? 'bg-[#718B78]/20 text-[#718B78] border-[#718B78]/40' : 'bg-[#D6C09A]/30 text-[#542126] border-[#D6C09A]'
                  }`}>{p.status}</span>
                </div>
                <p className="text-[#542126] font-bold mt-1">{p.title}</p>
                <p className="text-[11px] text-[#2E2E2E] mt-0.5">{p.explanation}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right font-mono">
                  <p className="text-[10px] text-[#B5A69D]">Objective Score</p>
                  <p className="font-bold text-[#542126]">{p.objective_value}</p>
                </div>

                {p.status === 'PROPOSED' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprovePlan('REJECTED')}
                      className="px-3 py-1.5 rounded bg-[#9E3F45]/10 hover:bg-[#9E3F45]/20 text-[#9E3F45] font-bold border border-[#9E3F45]/30 text-xs"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprovePlan('APPROVED')}
                      className="px-3 py-1.5 rounded bg-[#718B78] hover:bg-[#718B78]/90 text-white font-bold text-xs flex items-center gap-1 shadow-md"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Dispatch
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
