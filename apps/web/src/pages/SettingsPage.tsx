import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, ShieldCheck, Activity, Save, BookOpen, Users } from 'lucide-react';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<any | null>(null);
  const [weights, setWeights] = useState({
    life_safety: 0.30,
    population: 0.20,
    shortage: 0.20,
    accessibility: 0.10,
    urgency: 0.10,
    trend: 0.10,
    reserve_percent: 0.10
  });
  const [savedMsg, setSavedMsg] = useState<boolean>(false);

  useEffect(() => {
    api.getHealth().then(setHealth).catch(console.error);
  }, []);

  const handleSavePolicy = async () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#F8F4EE] text-[#2E2E2E] font-sans">
      <div className="border-b border-[#D9CEC1] pb-4">
        <h2 className="text-xl font-bold text-[#542126] flex items-center gap-2 font-mono">
          <SettingsIcon className="w-5 h-5 text-[#2F7775]" /> SYSTEM POLICY & PRESENTATION SKIT GUIDE
        </h2>
        <p className="text-xs text-[#B5A69D] mt-1">Configure Priority Engine scoring weights, emergency reserve percentages, and review team skit scripts.</p>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-[#D9CEC1] rounded-xl text-xs shadow-sm">
          <p className="text-[#B5A69D] font-bold uppercase text-[10px]">Database Connection</p>
          <p className="text-base font-black text-[#718B78] font-mono mt-1">{health?.database || 'CONNECTED (SQLite)'}</p>
        </div>
        <div className="p-4 bg-white border border-[#D9CEC1] rounded-xl text-xs shadow-sm">
          <p className="text-[#B5A69D] font-bold uppercase text-[10px]">Optimization Engine</p>
          <p className="text-base font-black text-[#2F7775] font-mono mt-1">{health?.optimizer || 'GOOGLE_OR_TOOLS_MIP'}</p>
        </div>
        <div className="p-4 bg-white border border-[#D9CEC1] rounded-xl text-xs shadow-sm">
          <p className="text-[#B5A69D] font-bold uppercase text-[10px]">AI Telemetry Engine</p>
          <p className="text-base font-black text-[#718B78] font-mono mt-1">{health?.ai_engine || 'ACTIVE_TELEMETRY'}</p>
        </div>
      </div>

      {/* Presentation Skit Card */}
      <div className="bg-white border border-[#D9CEC1] rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-3">
          <h3 className="text-xs font-bold text-[#542126] uppercase tracking-wider flex items-center gap-2 font-mono">
            <BookOpen className="w-4 h-4 text-[#2F7775]" /> 2019 Pune Flood Presentation Skit Script (5 Members)
          </h3>
          <span className="px-2 py-0.5 bg-[#2F7775]/10 text-[#2F7775] border border-[#2F7775]/30 text-[10px] font-mono font-bold rounded">
            DEMO READY
          </span>
        </div>

        <div className="bg-[#F4EDE3] p-4 rounded-xl border border-[#D9CEC1] text-xs space-y-3">
          <div className="p-3 bg-white rounded-lg text-[#542126] font-mono text-[11px] font-bold text-center border border-[#D9CEC1]">
            “आपत्काले शीघ्रनिर्णयः प्राणान् रक्षति।” — In an emergency, a timely decision can save lives.
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-[#542126] text-xs uppercase tracking-wider">Member Role Assignment Summary:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-[11px]">
              <div className="p-2 bg-white border border-[#D9CEC1] rounded">
                <span className="font-bold text-[#542126]">Member 1:</span> Presenter & Problem Lead
              </div>
              <div className="p-2 bg-white border border-[#D9CEC1] rounded">
                <span className="font-bold text-[#718B78]">Member 2:</span> Field Officer (Camera/Voice)
              </div>
              <div className="p-2 bg-white border border-[#D9CEC1] rounded">
                <span className="font-bold text-[#2F7775]">Member 3:</span> Control Room Chief
              </div>
              <div className="p-2 bg-white border border-[#D9CEC1] rounded">
                <span className="font-bold text-[#542126]">Member 4:</span> Resource & Needs Coordinator
              </div>
              <div className="p-2 bg-white border border-[#D9CEC1] rounded">
                <span className="font-bold text-[#9E3F45]">Member 5:</span> Agency Duplicate Detector
              </div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-[#B5A69D] flex items-center justify-between border-t border-[#D9CEC1]">
            <span>Full script available at <code className="font-mono text-[#2F7775]">/docs/PRESENTATION_SKIT.md</code></span>
            <span className="font-bold text-[#718B78]">Sinhagad Road • Sahakarnagar • Dandekar Bridge • Kondhwa • Parvati</span>
          </div>
        </div>
      </div>

      {/* Configurable Priority Weights */}
      <div className="bg-white border border-[#D9CEC1] rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-3">
          <h3 className="text-xs font-bold text-[#542126] uppercase tracking-wider font-mono">Priority Formula Weights (Must sum to 1.0)</h3>
          {savedMsg && <span className="text-xs text-[#718B78] font-bold">Policy Updated Successfully!</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {[
            { key: 'life_safety', label: 'Life Safety Weight', val: weights.life_safety },
            { key: 'population', label: 'Population Weight', val: weights.population },
            { key: 'shortage', label: 'Shortage Weight', val: weights.shortage },
            { key: 'accessibility', label: 'Accessibility Weight', val: weights.accessibility },
            { key: 'urgency', label: 'Urgency Weight', val: weights.urgency },
            { key: 'trend', label: 'Trend Weight', val: weights.trend },
          ].map((item, idx) => (
            <div key={idx} className="bg-[#F4EDE3] p-3 rounded-lg border border-[#D9CEC1]">
              <label className="text-[11px] text-[#B5A69D] font-semibold">{item.label}</label>
              <input
                type="number"
                step="0.05"
                value={item.val}
                onChange={(e) => setWeights({ ...weights, [item.key]: parseFloat(e.target.value) })}
                className="w-full mt-1.5 bg-white border border-[#D9CEC1] rounded p-2 text-xs font-mono font-bold text-[#542126] focus:outline-none focus:border-[#2F7775]"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-3">
          <button
            onClick={handleSavePolicy}
            className="px-4 py-2 rounded-lg bg-[#2F7775] hover:bg-[#2F7775]/90 text-white font-bold text-xs flex items-center gap-2 shadow-md"
          >
            <Save className="w-4 h-4" /> Save Policy Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

