import React, { useState } from 'react';
import { Incident, Zone } from '../types';
import { api } from '../services/api';
import { AlertTriangle, Plus, Bot, CheckCircle2, Send, Activity } from 'lucide-react';

interface IncidentsPageProps {
  incidents: Incident[];
  zones: Zone[];
  onRefresh: () => void;
}

export const IncidentsPage: React.FC<IncidentsPageProps> = ({ incidents, zones, onRefresh }) => {
  const [rawText, setRawText] = useState<string>('Bridge blocked. Water level is rising rapidly. Around 1800 people are isolated. Several injured people need medical assistance.');
  const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id || '');
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<any | null>(null);

  const handleParseReport = async () => {
    if (!rawText.trim()) return;
    try {
      setIsParsing(true);
      const res = await api.parseReport(rawText, selectedZoneId);
      setExtractedData(res.extracted);
    } catch (e) {
      console.error(e);
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmIncident = async () => {
    if (!extractedData) return;
    try {
      await api.createIncident({
        title: `${extractedData.hazard} Emergency Report`,
        description: rawText,
        hazard_type: extractedData.hazard,
        zone_id: selectedZoneId || zones[0]?.id,
        affected_population: extractedData.affected_population,
        injured_count: extractedData.injured,
        accessibility: extractedData.accessibility,
        road_condition: extractedData.accessibility === 'BLOCKED' ? 'BLOCKED' : 'CLEAR'
      });
      setExtractedData(null);
      setRawText('');
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#F8F4EE] text-[#2E2E2E] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#D9CEC1] pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#542126] flex items-center gap-2 font-mono">
            <AlertTriangle className="w-5 h-5 text-[#9E3F45]" /> INCIDENT MANAGEMENT & FIELD REPORTING
          </h2>
          <p className="text-xs text-[#B5A69D] mt-1">Natural language report parsing powered by Incident Agent (LLM + Pydantic Validation)</p>
        </div>
      </div>

      {/* Natural Language Report Ingestion Panel */}
      <div className="bg-white border border-[#D9CEC1] rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#542126] flex items-center gap-2 font-mono">
          <Bot className="w-4 h-4 text-[#2F7775]" /> Submit Unstructured Natural Language Field Report
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={3}
              placeholder="Enter raw field text report (e.g. Bridge blocked. Water level is rising rapidly. Around 1800 people are isolated...)"
              className="w-full bg-[#F4EDE3] border border-[#D9CEC1] rounded-lg p-3 text-xs text-[#2E2E2E] placeholder-[#B5A69D] focus:outline-none focus:border-[#2F7775] font-mono"
            />
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-[#B5A69D]">Target Zone</label>
              <select
                value={selectedZoneId}
                onChange={(e) => setSelectedZoneId(e.target.value)}
                className="w-full mt-1 bg-[#F4EDE3] border border-[#D9CEC1] rounded-lg p-2 text-xs text-[#2E2E2E] focus:outline-none focus:border-[#2F7775]"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleParseReport}
              disabled={isParsing || !rawText.trim()}
              className="w-full py-2.5 rounded-lg bg-[#2F7775] hover:bg-[#2F7775]/90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              {isParsing ? <Activity className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>RUN INCIDENT AGENT</span>
            </button>
          </div>
        </div>

        {/* AI Extracted Schema Confirmation Screen */}
        {extractedData && (
          <div className="mt-4 p-4 bg-[#F4EDE3] border border-[#2F7775]/40 rounded-xl space-y-3 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#D9CEC1] pb-2">
              <span className="text-xs font-bold text-[#718B78] flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-4 h-4" /> AI Extracted Intelligence Schema (Pydantic Validated)
              </span>
              <span className="text-[10px] font-mono text-[#2F7775] font-bold">Confidence: {Math.round(extractedData.confidence * 100)}%</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded border border-[#D9CEC1]">
                <p className="text-[10px] text-[#B5A69D] uppercase">Hazard Type</p>
                <p className="font-bold text-[#542126]">{extractedData.hazard}</p>
              </div>
              <div className="bg-white p-2.5 rounded border border-[#D9CEC1]">
                <p className="text-[10px] text-[#B5A69D] uppercase">Affected Population</p>
                <p className="font-bold text-[#2E2E2E]">{extractedData.affected_population}</p>
              </div>
              <div className="bg-white p-2.5 rounded border border-[#D9CEC1]">
                <p className="text-[10px] text-[#B5A69D] uppercase">Injured Count</p>
                <p className="font-bold text-[#9E3F45]">{extractedData.injured}</p>
              </div>
              <div className="bg-white p-2.5 rounded border border-[#D9CEC1]">
                <p className="text-[10px] text-[#B5A69D] uppercase">Accessibility</p>
                <p className="font-bold text-[#542126]">{extractedData.accessibility}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setExtractedData(null)}
                className="px-3 py-1.5 rounded bg-white hover:bg-[#D9CEC1] text-[#542126] border border-[#D9CEC1] text-xs font-semibold"
              >
                Reject & Edit
              </button>
              <button
                onClick={handleConfirmIncident}
                className="px-4 py-1.5 rounded bg-[#718B78] hover:bg-[#718B78]/90 text-white font-bold text-xs flex items-center gap-1 shadow-md"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Confirm & Persist Incident
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Incident List Table */}
      <div className="bg-white border border-[#D9CEC1] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#D9CEC1] bg-[#F4EDE3] flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#542126] uppercase tracking-wider font-mono">Active Incident Directory</h3>
          <span className="text-xs text-[#2F7775] font-mono font-bold">{incidents.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4EDE3] text-[#542126] uppercase font-mono text-[10px] border-b border-[#D9CEC1]">
              <tr>
                <th className="p-3">Code</th>
                <th className="p-3">Title</th>
                <th className="p-3">Hazard</th>
                <th className="p-3">Zone</th>
                <th className="p-3">Population</th>
                <th className="p-3">Accessibility</th>
                <th className="p-3">Status</th>
                <th className="p-3">Reported</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAE1]">
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-[#F4EDE3]/40">
                  <td className="p-3 font-mono font-bold text-[#2F7775]">{inc.code}</td>
                  <td className="p-3 font-semibold text-[#542126]">{inc.title}</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-[#2F7775]/10 text-[#2F7775] border border-[#2F7775]/30 font-bold">{inc.hazard_type}</span></td>
                  <td className="p-3 text-[#2E2E2E]">{inc.zone_name}</td>
                  <td className="p-3 font-mono text-[#2E2E2E]">{inc.affected_population.toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      inc.accessibility === 'BLOCKED' ? 'bg-[#9E3F45]/10 text-[#9E3F45] border border-[#9E3F45]/30' : 'bg-[#718B78]/20 text-[#718B78] border border-[#718B78]/30'
                    }`}>{inc.accessibility}</span>
                  </td>
                  <td className="p-3 font-bold text-[#542126]">{inc.status}</td>
                  <td className="p-3 text-[#B5A69D] font-mono">{new Date(inc.created_at).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
