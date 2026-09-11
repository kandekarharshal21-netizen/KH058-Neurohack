import React, { useState, useEffect } from 'react';
import { TaskItem } from '../types';
import { api } from '../services/api';
import { Users, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface CoordinationPageProps {
  tasks: TaskItem[];
  onRefresh: () => void;
}

export const CoordinationPage: React.FC<CoordinationPageProps> = ({ tasks, onRefresh }) => {
  const [duplicates, setDuplicates] = useState<any[]>([]);

  useEffect(() => {
    api.getDuplicates().then(setDuplicates).catch(console.error);
  }, []);

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      await api.updateTaskStatus(taskId, newStatus);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#F8F4EE] text-[#2E2E2E] font-sans">
      <div className="border-b border-[#D9CEC1] pb-4">
        <h2 className="text-xl font-extrabold text-[#542126] flex items-center gap-2 font-mono">
          <Users className="w-5 h-5 text-[#2F7775]" /> INTER-AGENCY COORDINATION & TASK DISPATCH
        </h2>
        <p className="text-xs text-[#B5A69D] mt-1">Multi-agency operational task matrix with status state machine control and duplicate effort detection</p>
      </div>

      {/* Duplicate Effort Warnings Panel */}
      {duplicates.length > 0 && (
        <div className="p-4 bg-[#D6C09A]/20 border border-[#D6C09A] rounded-xl space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-[#542126] font-mono">
            <AlertTriangle className="w-4 h-4 text-[#9E3F45]" /> POTENTIAL DUPLICATE EFFORT DETECTED ({duplicates.length})
          </div>
          <div className="space-y-2">
            {duplicates.map((dup, idx) => (
              <div key={idx} className="bg-white p-3 rounded-lg border border-[#D9CEC1] text-xs flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#542126]">
                    Tasks <span className="font-mono text-[#2F7775]">{dup.task1_code}</span> and <span className="font-mono text-[#2F7775]">{dup.task2_code}</span> both allocate {dup.resource_type} to the same destination zone.
                  </p>
                  <p className="text-[10px] text-[#B5A69D] mt-0.5">Matching Factors: {dup.matching_factors.join(' • ')}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-2.5 py-1 bg-[#2F7775] hover:bg-[#2F7775]/90 text-white font-bold rounded text-[11px]">
                    MERGE / REDIRECT
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Directory Matrix */}
      <div className="bg-white border border-[#D9CEC1] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#D9CEC1] bg-[#F4EDE3] flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#542126] uppercase tracking-wider font-mono">Assigned Operational Agency Tasks</h3>
          <span className="text-xs font-mono text-[#2F7775]">{tasks.length} Total Tasks</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4EDE3] text-[#542126] uppercase font-mono text-[10px] border-b border-[#D9CEC1]">
              <tr>
                <th className="p-3">Task Code</th>
                <th className="p-3">Assigned Agency</th>
                <th className="p-3">Destination Zone</th>
                <th className="p-3">Resource & Quantity</th>
                <th className="p-3">Risk Gate</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAE1]">
              {tasks.map((t) => (
                <tr key={t.id} className="hover:bg-[#F4EDE3]/40">
                  <td className="p-3 font-mono font-bold text-[#2F7775]">{t.code}</td>
                  <td className="p-3 font-bold text-[#542126]">{t.agency_name}</td>
                  <td className="p-3 text-[#2E2E2E]">{t.zone_name}</td>
                  <td className="p-3 font-mono font-bold text-[#542126]">{t.quantity.toLocaleString()} {t.resource_type}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.risk_level === 'HIGH' ? 'bg-[#9E3F45]/10 text-[#9E3F45] border border-[#9E3F45]/30' : 'bg-[#718B78]/20 text-[#718B78] border border-[#718B78]/30'
                    }`}>{t.risk_level} RISK</span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-[#2F7775]/10 text-[#2F7775] border border-[#2F7775]/30 font-bold">{t.status}</span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {t.status === 'ASSIGNED' && (
                      <button
                        onClick={() => handleUpdateStatus(t.id, 'IN_PROGRESS')}
                        className="px-2.5 py-1 bg-[#2F7775] hover:bg-[#2F7775]/90 text-white font-bold rounded text-[10px]"
                      >
                        Start Transit
                      </button>
                    )}
                    {t.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleUpdateStatus(t.id, 'COMPLETED')}
                        className="px-2.5 py-1 bg-[#718B78] hover:bg-[#718B78]/90 text-white font-bold rounded text-[10px]"
                      >
                        Mark Completed
                      </button>
                    )}
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
