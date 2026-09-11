import React from 'react';
import { AlertItem } from '../types';
import { Bell, ShieldAlert, Check } from 'lucide-react';
import { api } from '../services/api';

interface AlertsPageProps {
  alerts: AlertItem[];
  onRefresh: () => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ alerts, onRefresh }) => {
  const handleMarkRead = async (alertId: string) => {
    await api.markAlertRead(alertId);
    onRefresh();
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#F8F4EE] text-[#2E2E2E] font-sans">
      <div className="border-b border-[#D9CEC1] pb-4">
        <h2 className="text-xl font-extrabold text-[#542126] flex items-center gap-2 font-mono">
          <Bell className="w-5 h-5 text-[#542126]" /> SYSTEM ALERTS & NOTIFICATIONS INBOX
        </h2>
        <p className="text-xs text-[#B5A69D] mt-1">Critical zone escalations, resource shortage alerts, duplicate effort warnings</p>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="p-8 bg-white border border-[#D9CEC1] rounded-xl text-center text-[#B5A69D] text-xs">
            No system alerts in inbox.
          </div>
        ) : (
          alerts.map((a) => (
            <div key={a.id} className={`p-4 rounded-xl border flex items-center justify-between text-xs shadow-sm ${
              a.severity === 'CRITICAL' ? 'bg-[#9E3F45]/10 border-[#9E3F45]/40 text-[#9E3F45]' : 'bg-white border-[#D9CEC1] text-[#2E2E2E]'
            }`}>
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-[#9E3F45] shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#542126]">{a.title}</span>
                    <span className="text-[10px] font-mono text-[#B5A69D]">{new Date(a.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[#2E2E2E] mt-0.5">{a.message}</p>
                </div>
              </div>

              {!a.is_read && (
                <button
                  onClick={() => handleMarkRead(a.id)}
                  className="px-3 py-1.5 rounded bg-[#F4EDE3] hover:bg-[#D9CEC1] text-[#542126] border border-[#D9CEC1] font-bold text-[11px] flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Mark Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
