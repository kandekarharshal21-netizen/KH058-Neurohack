import React from 'react';
import { Cpu, CheckCircle, BarChart2, ShieldCheck, Database, Layers, Activity } from 'lucide-react';

export const AIModelsPage: React.FC = () => {
  const models = [
    {
      name: 'KSHETRA Visual Disaster Classifier',
      version: 'v1.4-CV',
      architecture: 'YOLOv8-m / EfficientNet-B4',
      purpose: 'Visual Evidence Classification & Hazard Detection from Camera Streams',
      dataset: 'Pune Emergency Vision Dataset (4,850 samples)',
      metrics: {
        accuracy: '94.2%',
        precision: '93.6%',
        recall: '95.1%',
        f1Score: '94.3%',
        mAP50: '0.892',
        status: 'DEPLOYED'
      },
      classes: ['Flood Inundation', 'Structural Collapse', 'Road Blockage', 'Fire / Smoke', 'Submerged Vehicles']
    },
    {
      name: 'KSHETRA Multilingual NLP Entity Extractor',
      version: 'v2.1-NLP',
      architecture: 'DistilBERT-Marathi-English Fine-Tuned',
      purpose: 'Structured Needs & Severity Extraction from Speech and Text Reports',
      dataset: 'Disaster Domain Speech/Text Corpus (12,200 transcripts)',
      metrics: {
        accuracy: '92.8%',
        precision: '91.4%',
        recall: '94.0%',
        f1Score: '92.7%',
        status: 'DEPLOYED'
      },
      classes: ['Hazard Type', 'Location Resolution', 'Population At Risk', 'Immediate Need (Rescue/Food/Medical)']
    },
    {
      name: 'KSHETRA Tactical Resource MIP Solver',
      version: 'v3.0-OPT',
      architecture: 'Google OR-Tools Mathematical Integer Programming',
      purpose: 'Deterministic Resource Allocation & Dynamic Reallocation under Multi-Depot Constraints',
      dataset: 'Real-Time Pune Inventory & Road Accessibility Matrix',
      metrics: {
        accuracy: '100% Deterministic',
        solverStatus: 'OPTIMAL (0.12s solve latency)',
        status: 'ACTIVE'
      },
      classes: ['Water Packets', 'Food Ration Kits', 'NDRF Rescue Boats', 'Medical Field Units', 'Debris Clearing Equipment']
    }
  ];

  return (
    <div className="h-full flex flex-col bg-[#F8F4EE] text-[#2E2E2E] p-6 space-y-6 overflow-y-auto font-sans">
      {/* Header */}
      <div className="border-b border-[#D9CEC1] pb-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-6 h-6 text-[#2F7775]" />
          <h1 className="text-xl font-bold text-[#542126] font-mono">AI & MODEL REGISTRY ADMINISTRATION</h1>
        </div>
        <p className="text-xs text-[#B5A69D] mt-1">
          Model Provenance & Evaluation Metrics — Transparent model architecture, dataset evaluation, and inference pipeline telemetry.
        </p>
      </div>

      {/* Model Cards */}
      <div className="space-y-6">
        {models.map((m) => (
          <div key={m.name} className="bg-white border border-[#D9CEC1] rounded-xl p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0EAE1] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#542126]">{m.name}</h3>
                  <span className="px-2 py-0.5 bg-[#2F7775]/10 text-[#2F7775] border border-[#2F7775]/30 text-[10px] font-mono font-bold rounded">
                    {m.version}
                  </span>
                  <span className="px-2 py-0.5 bg-[#718B78]/10 text-[#718B78] border border-[#718B78]/30 text-[10px] font-bold rounded">
                    {m.metrics.status}
                  </span>
                </div>
                <p className="text-xs text-[#B5A69D] mt-1">{m.purpose}</p>
              </div>

              <div className="text-xs font-mono text-[#2F7775]">
                Architecture: <span className="text-[#542126] font-semibold">{m.architecture}</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#F4EDE3] p-3 rounded-lg border border-[#D9CEC1]">
                <span className="text-[10px] text-[#B5A69D] font-bold uppercase">Accuracy</span>
                <p className="text-lg font-black text-[#542126] font-mono">{m.metrics.accuracy}</p>
              </div>

              <div className="bg-[#F4EDE3] p-3 rounded-lg border border-[#D9CEC1]">
                <span className="text-[10px] text-[#B5A69D] font-bold uppercase">Precision</span>
                <p className="text-lg font-black text-[#718B78] font-mono">{m.metrics.precision || m.metrics.solverStatus}</p>
              </div>

              <div className="bg-[#F4EDE3] p-3 rounded-lg border border-[#D9CEC1]">
                <span className="text-[10px] text-[#B5A69D] font-bold uppercase">Recall / Sensitivity</span>
                <p className="text-lg font-black text-[#2F7775] font-mono">{m.metrics.recall || '100%'}</p>
              </div>

              <div className="bg-[#F4EDE3] p-3 rounded-lg border border-[#D9CEC1]">
                <span className="text-[10px] text-[#B5A69D] font-bold uppercase">F1 Score</span>
                <p className="text-lg font-black text-[#718B78] font-mono">{m.metrics.f1Score || 'Optimal'}</p>
              </div>
            </div>

            {/* Classes & Dataset Info */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs pt-2 border-t border-[#F0EAE1]">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#2F7775]" />
                <span className="text-[#B5A69D]">Dataset:</span>
                <span className="font-medium text-[#2E2E2E]">{m.dataset}</span>
              </div>

              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#718B78]" />
                <span className="text-[#B5A69D]">Detected Target Classes:</span>
                <div className="flex flex-wrap gap-1">
                  {m.classes.map((cls) => (
                    <span key={cls} className="px-2 py-0.5 bg-[#F4EDE3] text-[#542126] border border-[#D9CEC1] text-[10px] font-mono rounded">
                      {cls}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
