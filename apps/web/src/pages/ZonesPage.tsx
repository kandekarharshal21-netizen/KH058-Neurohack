import React from 'react';
import { Zone } from '../types';
import { MapPin, ShieldAlert, Users, Activity } from 'lucide-react';

interface ZonesPageProps {
  zones: Zone[];
  onSelectZone: (z: Zone) => void;
}

export const ZonesPage: React.FC<ZonesPageProps> = ({ zones, onSelectZone }) => {
  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#F8F4EE] text-[#2E2E2E] font-sans">
      <div className="border-b border-[#D9CEC1] pb-4">
        <h2 className="text-xl font-extrabold text-[#542126] flex items-center gap-2 font-mono">
          <MapPin className="w-5 h-5 text-[#2F7775]" /> ZONE INTELLIGENCE & SEVERITY DASHBOARD
        </h2>
        <p className="text-xs text-[#B5A69D] mt-1">Detailed priority score breakdowns and measured resource demand vectors across all 5 operational zones</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {zones.map((z) => {
          const isCritical = z.priority_level === 'CRITICAL';
          const isHigh = z.priority_level === 'HIGH';
          
          return (
            <div
              key={z.id}
              onClick={() => onSelectZone(z)}
              className={`p-5 rounded-xl border transition-all cursor-pointer shadow-sm ${
                isCritical
                  ? 'bg-[#9E3F45]/10 border-[#9E3F45]/40 hover:border-[#9E3F45]'
                  : isHigh
                  ? 'bg-[#D6C09A]/20 border-[#D6C09A] hover:border-[#542126]'
                  : 'bg-white border-[#D9CEC1] hover:border-[#2F7775]'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full border ${
                    isCritical ? 'bg-[#9E3F45]/20 text-[#9E3F45] border-[#9E3F45]/40' : 'bg-[#D6C09A]/30 text-[#542126] border-[#D6C09A]'
                  }`}>
                    {z.priority_level}
                  </span>
                  <h3 className="text-base font-extrabold text-[#542126] mt-2">{z.name}</h3>
                  <p className="text-xs text-[#B5A69D] font-mono">{z.code} • Hazard: {z.hazard_baseline}</p>
                </div>

                <div className="text-right bg-[#F4EDE3] px-3 py-1.5 rounded-lg border border-[#D9CEC1]">
                  <p className="text-[10px] text-[#B5A69D] font-mono font-bold">SCORE</p>
                  <p className="text-xl font-black font-mono text-[#2F7775]">{Math.round(z.priority_score)}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs border-t border-[#F0EAE1] pt-3 mt-3">
                <div className="flex justify-between text-[#2E2E2E]">
                  <span className="text-[#B5A69D]">Population</span>
                  <span className="font-mono font-bold text-[#542126]">{z.population.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#2E2E2E]">
                  <span className="text-[#B5A69D]">Road Accessibility</span>
                  <span className={`font-bold ${z.accessibility === 'BLOCKED' ? 'text-[#9E3F45]' : 'text-[#718B78]'}`}>{z.accessibility}</span>
                </div>
                <div className="flex justify-between text-[#2E2E2E]">
                  <span className="text-[#B5A69D]">Measured Needs</span>
                  <span className="font-mono text-[#2F7775]">{(z.needs || []).length} Types</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
