import React from 'react';
import { ArrowRight, ArrowUpRight, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ReallocationDiffViewProps {
  zoneName?: string;
  onApproveReallocation?: () => void;
}

export const ReallocationDiffView: React.FC<ReallocationDiffViewProps> = ({
  zoneName = "Zone C — Central Basin District",
  onApproveReallocation
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
            DYNAMIC REALLOCATION RECOMMENDATION
          </span>
          <h3 className="text-lg font-black text-slate-100 mt-2">Before vs After Response Plan Comparison</h3>
          <p className="text-xs text-slate-400">Triggered by sudden emergency escalation in {zoneName}</p>
        </div>

        {onApproveReallocation && (
          <button
            onClick={onApproveReallocation}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>APPROVE & DISPATCH REALLOCATION</span>
          </button>
        )}
      </div>

      {/* Why Did The Plan Change Banner */}
      <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/30 rounded-xl text-xs space-y-2">
        <h4 className="font-extrabold text-cyan-300 flex items-center gap-1.5 text-sm">
          <TrendingUp className="w-4 h-4 text-cyan-400" /> WHY DID THE PLAN CHANGE?
        </h4>
        <p className="text-slate-300 leading-relaxed">
          Zone C's affected population increased by <strong>+56.2%</strong> (from 3,200 to 5,000 residents), main bridge access became <strong>BLOCKED</strong>, and 85 casualties required urgent medical triage. These state changes escalated Zone C's priority score from <strong>61.0 (HIGH) to 91.0 (CRITICAL)</strong>, prompting OR-Tools to reallocate surplus rations and rescue vectors.
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Previous Response Plan */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <h5 className="text-xs font-bold text-slate-400 uppercase font-mono">PREVIOUS RESPONSE (Plan RP-0041)</h5>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">HIGH PRIORITY (61.0)</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">Affected Population</span>
              <span className="font-mono text-slate-200">3,200</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">Road Accessibility</span>
              <span className="font-semibold text-emerald-400">OPEN</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">Water Allocation</span>
              <span className="font-mono text-slate-200">3,200 L</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">Food Kit Allocation</span>
              <span className="font-mono text-slate-200">1,200 Kits</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Rescue Teams Assigned</span>
              <span className="font-mono text-slate-200">2 Teams</span>
            </div>
          </div>
        </div>

        {/* New Response Plan */}
        <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/40 shadow-xl shadow-cyan-500/5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <h5 className="text-xs font-bold text-cyan-300 uppercase font-mono">ADAPTIVE REALLOCATION (Plan RP-0042)</h5>
            <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-mono font-bold">CRITICAL PRIORITY (91.0)</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">Affected Population</span>
              <span className="font-mono text-red-400 font-bold">5,000 (+1,800)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">Road Accessibility</span>
              <span className="font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">BLOCKED</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">Water Allocation</span>
              <span className="font-mono text-cyan-400 font-bold">5,000 L (+1,800 L)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">Food Kit Allocation</span>
              <span className="font-mono text-cyan-400 font-bold">2,200 Kits (+1,000 Kits)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Rescue Teams Assigned</span>
              <span className="font-mono text-cyan-400 font-bold">8 Teams (+6 Teams Airlift)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
