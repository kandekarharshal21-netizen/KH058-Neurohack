import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, AlertTriangle, FileText, Search, Eye, Filter } from 'lucide-react';
import { Incident } from '../types';

interface VerificationCenterPageProps {
  incidents?: Incident[];
  onRefresh?: () => void;
}

export const VerificationCenterPage: React.FC<VerificationCenterPageProps> = ({
  incidents = [],
  onRefresh
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Unverified reports for verification center
  const pendingIncidents = incidents.length > 0 ? incidents : [
    {
      id: 'INC-7091',
      title: 'Water accumulation & trapped citizens',
      location: 'Sinhagad Road, Pune',
      source_type: 'CAMERA',
      severity_score: 92,
      confidence_score: 89,
      status: 'VERIFICATION_REQUIRED',
      verification_status: 'UNVERIFIED',
      reported_at: '10 minutes ago',
      evidence_summary: 'Image shows submerged vehicles and water entering residential ground floors.',
      contradiction: 'Reporter stated 10,000 trapped; locality census database indicates 4,800 peak density.'
    },
    {
      id: 'INC-8120',
      title: 'Landslide debris blocking access road',
      location: 'Parvati Hills Pass, Pune',
      source_type: 'VOICE',
      severity_score: 78,
      confidence_score: 64,
      status: 'UNVERIFIED',
      verification_status: 'UNVERIFIED',
      reported_at: '25 minutes ago',
      evidence_summary: 'Voice audio in Marathi reporting boulder blockage near Sinhagad college turn.',
      contradiction: 'Single report received; satellite synthetic aperture radar shows partial road obstruction.'
    }
  ];

  const handleVerify = async (id: string, action: 'VERIFIED' | 'REJECTED') => {
    setProcessingId(id);
    try {
      await fetch(`/api/incidents/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action, reviewer: 'Officer' })
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F8F4EE] text-[#2E2E2E] p-6 space-y-6 overflow-y-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9CEC1] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-[#2F7775]" />
            <h1 className="text-xl font-bold text-[#542126] font-mono">VERIFICATION CENTER</h1>
          </div>
          <p className="text-xs text-[#B5A69D] mt-1 font-medium">
            Information Reliability Engine — Review unverified, conflicting, or low-confidence field reports before dispatching resources.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 bg-[#F4EDE3] border border-[#D9CEC1] p-1 rounded-xl text-xs">
          <button
            onClick={() => setSelectedFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              selectedFilter === 'ALL' ? 'bg-[#2F7775] text-white' : 'text-[#2E2E2E] hover:text-[#542126]'
            }`}
          >
            All Pending ({pendingIncidents.length})
          </button>
          <button
            onClick={() => setSelectedFilter('LOW_CONFIDENCE')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              selectedFilter === 'LOW_CONFIDENCE' ? 'bg-[#9E3F45] text-white' : 'text-[#2E2E2E] hover:text-[#542126]'
            }`}
          >
            Low Confidence
          </button>
        </div>
      </div>

      {/* Verification Queue */}
      <div className="grid grid-cols-1 gap-6">
        {pendingIncidents.map((item: any) => (
          <div key={item.id} className="bg-white border border-[#D9CEC1] rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-start justify-between gap-4 border-b border-[#D9CEC1] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#2F7775]">{item.id}</span>
                  <span className="px-2 py-0.5 bg-[#F4EDE3] text-[#542126] border border-[#D9CEC1] text-[10px] font-bold rounded uppercase">
                    {item.source_type || 'CAMERA'}
                  </span>
                  <span className="px-2 py-0.5 bg-[#9E3F45]/15 border border-[#9E3F45]/30 text-[#9E3F45] text-[10px] font-bold rounded">
                    UNVERIFIED
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#542126] mt-1">{item.title || item.description}</h3>
                <p className="text-xs text-[#B5A69D] mt-0.5 font-medium">{item.location || item.locality}</p>
              </div>

              <div className="text-right">
                <div className="text-xs font-mono font-bold text-[#2F7775]">
                  AI Confidence: {item.confidence_score || 85}%
                </div>
                <div className="text-[10px] text-[#B5A69D] font-medium mt-0.5">Reported {item.reported_at || 'Recently'}</div>
              </div>
            </div>

            {/* Evidence & Provenance Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#F4EDE3] p-3 rounded-xl border border-[#D9CEC1] space-y-1">
                <div className="text-[10px] text-[#542126] font-bold uppercase tracking-wider">Visual & Audio Evidence</div>
                <p className="text-[#2E2E2E] font-medium">{item.evidence_summary || 'Standing water across roadway with partially submerged vehicles.'}</p>
                <div className="pt-2 text-[10px] text-[#B5A69D]">
                  Provenance Badge: <span className="text-[#718B78] font-bold">[FIELD REPORTED FACT]</span>
                </div>
              </div>

              <div className="bg-[#F4EDE3] p-3 rounded-xl border border-[#9E3F45]/30 space-y-1">
                <div className="text-[10px] text-[#9E3F45] font-bold uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-[#D6C09A]" />
                  <span>Cross-Report Comparison / Contradiction</span>
                </div>
                <p className="text-[#2E2E2E] font-medium">{item.contradiction || 'Reported numbers slightly exceed baseline density model.'}</p>
                <div className="pt-2 text-[10px] text-[#B5A69D]">
                  Provenance Badge: <span className="text-[#542126] font-bold">[AI INFERRED CONFLICT]</span>
                </div>
              </div>
            </div>

            {/* Officer Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-[#D9CEC1]">
              <div className="text-xs text-[#B5A69D] font-medium">
                Action required by authorized Command Officer
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVerify(item.id, 'REJECTED')}
                  disabled={processingId === item.id}
                  className="px-4 py-2 bg-[#9E3F45]/10 hover:bg-[#9E3F45]/20 text-[#9E3F45] border border-[#9E3F45]/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>REJECT REPORT</span>
                </button>

                <button
                  onClick={() => handleVerify(item.id, 'VERIFIED')}
                  disabled={processingId === item.id}
                  className="px-4 py-2 bg-[#718B78] hover:bg-[#718B78]/90 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-[#718B78]/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>VERIFY & DISPATCH</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

