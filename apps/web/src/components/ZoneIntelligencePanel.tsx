import React from 'react';
import { ShieldAlert, AlertTriangle, Activity, Lock, Users, ArrowUpRight, FileCheck2 } from 'lucide-react';
import { Zone } from '../types';

interface ZoneIntelligencePanelProps {
  zone: Zone | null;
  onClose?: () => void;
}

export const ZoneIntelligencePanel: React.FC<ZoneIntelligencePanelProps> = ({ zone }) => {
  if (!zone) {
    return (
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-400 text-sm">
        Select a zone on the Command Map to view detailed Zone Intelligence.
      </div>
    );
  }

  const isCritical = zone.priority_level === 'CRITICAL';
  const isHigh = zone.priority_level === 'HIGH';

  const levelColor = isCritical
    ? 'text-red-400 bg-red-500/10 border-red-500/30 animate-emergency'
    : isHigh
    ? 'text-orange-400 bg-orange-500/10 border-orange-500/30'
    : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';

  const breakdown = zone.score_breakdown || {
    life_safety: 85,
    population: 75,
    shortage: 90,
    accessibility: zone.accessibility === 'BLOCKED' ? 95 : 20,
    urgency: 80,
    trend: 70
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 text-xs font-black rounded-full border ${levelColor}`}>
              {zone.priority_level} PRIORITY
            </span>
            <span className="text-xs font-mono text-slate-400">{zone.code}</span>
          </div>
          <h3 className="text-base font-extrabold text-slate-100 mt-1.5">{zone.name}</h3>
          <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
            <span>Hazard: <strong className="text-cyan-400">{zone.hazard_baseline}</strong></span>
            <span>•</span>
            <span>Population: <strong className="text-slate-200">{zone.population.toLocaleString()}</strong></span>
          </p>
        </div>

        <div className="text-right bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
          <p className="text-[10px] text-slate-400 font-semibold uppercase">Priority Score</p>
          <p className="text-2xl font-black font-mono text-cyan-400">{Math.round(zone.priority_score)}</p>
        </div>
      </div>

      {/* Score Breakdown Bars */}
      <div>
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" /> Score Components (Deterministic Formula)
        </h4>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { label: 'Life Safety (30%)', val: breakdown.life_safety, color: 'bg-red-500' },
            { label: 'Population (20%)', val: breakdown.population, color: 'bg-cyan-500' },
            { label: 'Shortage (20%)', val: breakdown.shortage, color: 'bg-rose-500' },
            { label: 'Accessibility (10%)', val: breakdown.accessibility, color: 'bg-amber-500' },
            { label: 'Urgency (10%)', val: breakdown.urgency, color: 'bg-purple-500' },
            { label: 'Trend (10%)', val: breakdown.trend, color: 'bg-emerald-500' },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-950 p-2 rounded border border-slate-800/80">
              <div className="flex justify-between text-[11px] font-medium text-slate-300 mb-1">
                <span>{item.label}</span>
                <span className="font-mono font-bold text-slate-200">{Math.round(item.val)}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className={`h-full ${item.color}`} style={{ width: `${Math.min(100, item.val)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Required Resource Demands */}
      <div>
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" /> Measured Resource Demands
        </h4>

        <div className="space-y-2">
          {(zone.needs || []).length === 0 ? (
            <p className="text-xs text-slate-500">No active resource demands recorded for this zone.</p>
          ) : (
            (zone.needs || []).map((nd, idx) => (
              <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-200">{nd.resource_type}</p>
                  <p className="text-[10px] text-slate-400">{nd.basis}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-cyan-400 text-sm">{nd.quantity_required.toLocaleString()} {nd.unit}</p>
                  <p className="text-[10px] text-emerald-400 font-semibold">{Math.round(nd.confidence * 100)}% Confidence</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Decision Explanation */}
      <div className="p-3 bg-cyan-950/20 border border-cyan-500/30 rounded-lg text-xs">
        <p className="font-bold text-cyan-300 flex items-center gap-1 mb-1">
          <ArrowUpRight className="w-3.5 h-3.5" /> Explainable Priority Rationale
        </p>
        <p className="text-slate-300 text-[11px] leading-relaxed">
          Zone <strong className="text-white">{zone.name}</strong> is at Priority <strong className="text-cyan-300">{Math.round(zone.priority_score)} ({zone.priority_level})</strong> because population is {zone.population.toLocaleString()}, main road access is <strong className="text-amber-300">{zone.accessibility}</strong>, and unfulfilled life-safety resource demand is high.
        </p>
      </div>
    </div>
  );
};
