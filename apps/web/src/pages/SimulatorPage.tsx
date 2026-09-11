import React, { useState } from 'react';
import { Zone } from '../types';
import { api } from '../services/api';
import { Sliders, Play, Activity, TrendingUp } from 'lucide-react';

interface SimulatorPageProps {
  zones: Zone[];
}

export const SimulatorPage: React.FC<SimulatorPageProps> = ({ zones }) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id || '');
  const [simPop, setSimPop] = useState<number>(5000);
  const [simAcc, setSimAcc] = useState<string>('BLOCKED');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<any | null>(null);

  const handleRunSimulation = async () => {
    try {
      setIsSimulating(true);
      const res = await api.runSimulation({
        zone_id: selectedZoneId,
        population: simPop,
        accessibility: simAcc
      });
      setSimResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#F8F4EE] text-[#2E2E2E] font-sans">
      <div className="border-b border-[#D9CEC1] pb-4">
        <h2 className="text-xl font-extrabold text-[#542126] flex items-center gap-2 font-mono">
          <Sliders className="w-5 h-5 text-[#2F7775]" /> WHAT-IF OPERATIONAL SCENARIO SIMULATOR
        </h2>
        <p className="text-xs text-[#B5A69D] mt-1">Isolated sandbox environment to test event injections (population spikes, road blocks) WITHOUT mutating live state</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="bg-white border border-[#D9CEC1] rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold text-[#542126] uppercase tracking-wider font-mono">Event Injection Parameters</h3>

          <div>
            <label className="text-[11px] text-[#B5A69D] font-semibold">Select Target Zone</label>
            <select
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value)}
              className="w-full mt-1 bg-[#F4EDE3] border border-[#D9CEC1] rounded-lg p-2.5 text-xs text-[#2E2E2E] focus:outline-none focus:border-[#2F7775]"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-[#B5A69D] font-semibold">Simulated Population ({simPop.toLocaleString()})</label>
            <input
              type="range"
              min={500}
              max={10000}
              step={500}
              value={simPop}
              onChange={(e) => setSimPop(parseInt(e.target.value))}
              className="w-full mt-2 accent-[#2F7775]"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#B5A69D] font-semibold">Simulated Accessibility</label>
            <select
              value={simAcc}
              onChange={(e) => setSimAcc(e.target.value)}
              className="w-full mt-1 bg-[#F4EDE3] border border-[#D9CEC1] rounded-lg p-2.5 text-xs text-[#2E2E2E] focus:outline-none focus:border-[#2F7775]"
            >
              <option value="OPEN">OPEN (All roads clear)</option>
              <option value="RESTRICTED">RESTRICTED (Heavy traffic/debris)</option>
              <option value="BLOCKED">BLOCKED (Main bridge/pass cut off)</option>
            </select>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="w-full py-2.5 rounded-lg bg-[#2F7775] hover:bg-[#2F7775]/90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            {isSimulating ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            <span>RUN SCENARIO SIMULATION</span>
          </button>
        </div>

        {/* Results Panel */}
        <div className="md:col-span-2 bg-white border border-[#D9CEC1] rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold text-[#542126] uppercase tracking-wider font-mono">Simulation Output & Baseline Comparison</h3>

          {!simResult ? (
            <div className="text-center py-12 text-[#B5A69D] text-xs">
              Adjust parameters and click "Run Scenario Simulation" to inspect projected allocation outputs.
            </div>
          ) : (
            <div className="space-y-4 text-xs animate-fade-in">
              <div className="p-3 bg-[#F4EDE3] border border-[#2F7775]/40 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-bold text-[#542126]">Target Zone: {simResult.target_zone}</p>
                  <p className="text-[11px] text-[#2E2E2E]">Simulated Score: <strong className="text-[#2F7775]">{simResult.simulated_priority_score}</strong></p>
                </div>
                <span className="px-2.5 py-1 rounded bg-[#2F7775]/10 text-[#2F7775] border border-[#2F7775]/30 font-bold font-mono">
                  {simResult.simulation_mode}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#F4EDE3] rounded-lg border border-[#D9CEC1]">
                  <p className="font-bold text-[#542126] font-mono text-[11px]">BASELINE FCFS ALLOCATOR</p>
                  <p className="text-[#2E2E2E] mt-2">Unmet Shortage: <span className="font-mono text-[#9E3F45] font-bold">{simResult.baseline_fcfs_plan.unmet_needs.length} Incidents</span></p>
                </div>

                <div className="p-3 bg-[#F4EDE3] rounded-lg border border-[#2F7775]/40">
                  <p className="font-bold text-[#2F7775] font-mono text-[11px]">KSHETRA OR-TOOLS OPTIMIZED</p>
                  <p className="text-[#2E2E2E] mt-2">Unmet Shortage: <span className="font-mono text-[#718B78] font-bold">{simResult.kshetra_optimized_plan.unmet_needs.length} Incidents</span></p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
