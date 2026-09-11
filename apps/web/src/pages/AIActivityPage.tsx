import React, { useState, useEffect } from 'react';
import { Bot, CheckCircle2, Cpu, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export const AIActivityPage: React.FC = () => {
  const [agentRuns, setAgentRuns] = useState<any[]>([]);

  useEffect(() => {
    api.getAgentRuns().then(setAgentRuns).catch(console.error);
  }, []);

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#F8F4EE] text-[#2E2E2E] font-sans">
      <div className="border-b border-[#D9CEC1] pb-4">
        <h2 className="text-xl font-extrabold text-[#542126] flex items-center gap-2 font-mono">
          <Bot className="w-5 h-5 text-[#2F7775]" /> AI AGENT ACTIVITY & EXECUTION CENTER
        </h2>
        <p className="text-xs text-[#B5A69D] mt-1">Audit execution logs, confidence scores, and tool permissions across all 8 autonomous specialized agents</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-white border border-[#D9CEC1] rounded-xl shadow-sm">
          <p className="text-[#B5A69D] font-bold uppercase text-[10px]">Active AI Mode</p>
          <p className="text-base font-extrabold text-[#718B78] font-mono mt-1">DEMO / FALLBACK ENGINE</p>
        </div>
        <div className="p-4 bg-white border border-[#D9CEC1] rounded-xl shadow-sm">
          <p className="text-[#B5A69D] font-bold uppercase text-[10px]">Supervisor Routing</p>
          <p className="text-base font-extrabold text-[#2F7775] font-mono mt-1">LANGGRAPH / CONTROLLED GRAPH</p>
        </div>
        <div className="p-4 bg-white border border-[#D9CEC1] rounded-xl shadow-sm">
          <p className="text-[#B5A69D] font-bold uppercase text-[10px]">Pydantic Schema Validation</p>
          <p className="text-base font-extrabold text-[#718B78] font-mono mt-1">STRICT ENFORCED</p>
        </div>
        <div className="p-4 bg-white border border-[#D9CEC1] rounded-xl shadow-sm">
          <p className="text-[#B5A69D] font-bold uppercase text-[10px]">Average Execution Latency</p>
          <p className="text-base font-extrabold text-[#542126] font-mono mt-1">45 ms</p>
        </div>
      </div>

      <div className="bg-white border border-[#D9CEC1] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#D9CEC1] bg-[#F4EDE3] flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#542126] uppercase tracking-wider font-mono">Agent Execution Runs Directory</h3>
          <span className="text-xs font-mono text-[#2F7775]">{agentRuns.length} Runs Logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4EDE3] text-[#542126] uppercase font-mono text-[10px] border-b border-[#D9CEC1]">
              <tr>
                <th className="p-3">Run ID</th>
                <th className="p-3">Agent Name</th>
                <th className="p-3">Input Summary</th>
                <th className="p-3">Output Summary</th>
                <th className="p-3">Confidence</th>
                <th className="p-3">Latency</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAE1]">
              {agentRuns.map((r) => (
                <tr key={r.id} className="hover:bg-[#F4EDE3]/40">
                  <td className="p-3 font-mono font-bold text-[#2F7775]">{r.run_id}</td>
                  <td className="p-3 font-bold text-[#542126]">{r.agent_name}</td>
                  <td className="p-3 text-[#2E2E2E] truncate max-w-xs">{r.input_summary || 'Standard System Input'}</td>
                  <td className="p-3 text-[#2E2E2E] font-mono text-[11px] truncate max-w-xs">{r.output_summary}</td>
                  <td className="p-3 font-mono text-[#718B78] font-bold">{Math.round(r.confidence * 100)}%</td>
                  <td className="p-3 font-mono text-[#B5A69D]">{r.duration_ms}ms</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-[#718B78]/20 text-[#718B78] border border-[#718B78]/40 font-bold">{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
