import React from 'react';
import { AuditLogItem } from '../types';
import { FileText, ShieldCheck, Activity, Search } from 'lucide-react';

interface AuditPageProps {
  auditLogs: AuditLogItem[];
  onOpenDecisionTrace: (cid: string) => void;
}

export const AuditPage: React.FC<AuditPageProps> = ({ auditLogs, onOpenDecisionTrace }) => {
  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#F8F4EE] text-[#2E2E2E] font-sans">
      <div className="border-b border-[#D9CEC1] pb-4">
        <h2 className="text-xl font-extrabold text-[#542126] flex items-center gap-2 font-mono">
          <FileText className="w-5 h-5 text-[#2F7775]" /> IMMUTABLE AUDIT LOG & DECISION TRACE DIRECTORY
        </h2>
        <p className="text-xs text-[#B5A69D] mt-1">Append-only historical decision trail tagged with system Correlation IDs for complete operational accountability</p>
      </div>

      <div className="bg-white border border-[#D9CEC1] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#D9CEC1] bg-[#F4EDE3] flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#542126] uppercase tracking-wider font-mono">Audit Log History</h3>
          <span className="text-xs font-mono text-[#2F7775]">{auditLogs.length} Records Logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4EDE3] text-[#542126] uppercase font-mono text-[10px] border-b border-[#D9CEC1]">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Event Type</th>
                <th className="p-3">Entity Type</th>
                <th className="p-3">Actor</th>
                <th className="p-3">Correlation ID</th>
                <th className="p-3 text-right">Trace View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAE1]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F4EDE3]/40">
                  <td className="p-3 font-mono text-[#B5A69D]">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td className="p-3 font-bold text-[#2F7775]">{log.event_type}</td>
                  <td className="p-3 font-semibold text-[#542126]">{log.entity_type}</td>
                  <td className="p-3 text-[#2E2E2E]">{log.actor}</td>
                  <td className="p-3 font-mono text-[#B5A69D]">{log.correlation_id}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onOpenDecisionTrace(log.correlation_id)}
                      className="px-2.5 py-1 bg-[#2F7775]/10 hover:bg-[#2F7775]/20 text-[#2F7775] font-bold rounded text-[10px] border border-[#2F7775]/30"
                    >
                      View Graph
                    </button>
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
