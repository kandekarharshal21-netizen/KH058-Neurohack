import React from 'react';
import { X, CheckCircle2, ArrowRight, Bot, ShieldCheck, Activity, Layers, AlertCircle } from 'lucide-react';

interface DecisionTraceModalProps {
  isOpen: boolean;
  correlationId: string | null;
  onClose: () => void;
}

export const DecisionTraceModal: React.FC<DecisionTraceModalProps> = ({ isOpen, correlationId, onClose }) => {
  if (!isOpen) return null;

  const traceSteps = [
    { name: 'Report Ingested', agent: 'Field Reporter', desc: 'Received unstructured emergency text report for Zone C', status: 'COMPLETED', duration: '12ms' },
    { name: 'Incident Agent', agent: 'Probabilistic AI LLM', desc: 'Extracted Population: 5,000, Hazard: Flood, Accessibility: BLOCKED', status: 'COMPLETED', duration: '140ms' },
    { name: 'Needs Assessment', agent: 'Needs Engine', desc: 'Calculated demands: Water 7,500L, Food 3,000 kits, Rescue 12 teams', status: 'COMPLETED', duration: '8ms' },
    { name: 'Priority Engine', agent: 'Deterministic Logic', desc: 'Escalated score from 61.0 (HIGH) to 91.0 (CRITICAL)', status: 'COMPLETED', duration: '5ms' },
    { name: 'Duplicate Check', agent: 'Duplicate Agent', desc: 'Checked multi-agency tasks for resource overlaps: None found', status: 'COMPLETED', duration: '18ms' },
    { name: 'OR-Tools MIP Solver', agent: 'Optimization Engine', desc: 'Solved multi-depot inventory constraints. Objective score: 184.5', status: 'COMPLETED', duration: '65ms' },
    { name: 'Human Approval Gate', agent: 'Risk Engine', desc: 'Risk level HIGH. Requires mandatory controller authorization', status: 'APPROVAL_REQUIRED', duration: 'Pending' },
    { name: 'Dynamic Reallocation', agent: 'Audit Service', desc: 'Generated Before vs After plan diff for operator confirmation', status: 'COMPLETED', duration: '4ms' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-extrabold text-slate-100">Auditable Decision Trace Graph</h3>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Correlation ID: <strong className="text-cyan-400">{correlationId || 'KSH-C-0042-RUN-007'}</strong></p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Graph */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="bg-cyan-950/30 border border-cyan-500/30 p-3 rounded-xl text-xs text-cyan-200 flex items-center justify-between">
            <span><strong>Three-Layer Intelligence Model:</strong> Probabilistic LLM $\rightarrow$ Deterministic Rules $\rightarrow$ Mathematical Optimization</span>
            <span className="font-mono text-[10px] bg-cyan-900/60 px-2 py-1 rounded">100% Traceable</span>
          </div>

          <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
            {traceSteps.map((step, idx) => (
              <div key={idx} className="relative group">
                {/* Node Bullet */}
                <div className={`absolute -left-[31px] top-0 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-slate-900 ${
                  step.status === 'COMPLETED' ? 'border-emerald-400 text-emerald-400' : 'border-amber-400 text-amber-400 animate-pulse'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-cyan-400 tracking-wider font-mono">{step.agent}</span>
                    <span className="text-[10px] font-mono text-slate-500">{step.duration}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100">{step.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors">
            Close Trace View
          </button>
        </div>
      </div>
    </div>
  );
};
