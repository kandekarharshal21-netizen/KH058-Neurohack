import React from 'react';
import { Zone, ResourceDepot } from '../types';
import { BarChart3, TrendingUp, PieChart, ShieldAlert } from 'lucide-react';

interface AnalyticsPageProps {
  zones: Zone[];
  depots: ResourceDepot[];
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ zones, depots }) => {
  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#F8F4EE] text-[#2E2E2E] font-sans">
      <div className="border-b border-[#D9CEC1] pb-4">
        <h2 className="text-xl font-extrabold text-[#542126] flex items-center gap-2 font-mono">
          <BarChart3 className="w-5 h-5 text-[#2F7775]" /> OPERATIONAL ANALYTICS & FULFILLMENT METRICS
        </h2>
        <p className="text-xs text-[#B5A69D] mt-1">Quantitative evaluation of demand fulfillment, priority distributions, and depot resource utilization</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Zone Priority Distribution */}
        <div className="bg-white border border-[#D9CEC1] rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold text-[#542126] uppercase tracking-wider flex items-center gap-2 font-mono">
            <ShieldAlert className="w-4 h-4 text-[#2F7775]" /> Zone Priority Score Distribution
          </h3>

          <div className="space-y-3 text-xs">
            {zones.map((z) => (
              <div key={z.id} className="bg-[#F4EDE3] p-3 rounded-lg border border-[#D9CEC1] space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-[#542126]">{z.name}</span>
                  <span className="font-mono text-[#2F7775]">{Math.round(z.priority_score)} pts ({z.priority_level})</span>
                </div>
                <div className="w-full bg-[#D9CEC1] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${z.priority_level === 'CRITICAL' ? 'bg-[#9E3F45]' : z.priority_level === 'HIGH' ? 'bg-[#D6C09A]' : 'bg-[#718B78]'}`}
                    style={{ width: `${Math.min(100, z.priority_score)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Depot Inventory Capacity Utilization */}
        <div className="bg-white border border-[#D9CEC1] rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold text-[#542126] uppercase tracking-wider flex items-center gap-2 font-mono">
            <PieChart className="w-4 h-4 text-[#718B78]" /> Depot Inventory Capacity Utilization
          </h3>

          <div className="space-y-3 text-xs">
            {depots.map((d) => (
              <div key={d.depot_id} className="bg-[#F4EDE3] p-3 rounded-lg border border-[#D9CEC1] space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-[#542126]">{d.depot_name}</span>
                  <span className="font-mono text-[#718B78]">{d.resources.length} Resource Lines</span>
                </div>
                <p className="text-[11px] text-[#2E2E2E]">Managed by {d.agency_name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
