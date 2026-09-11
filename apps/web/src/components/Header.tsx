import React, { useState } from 'react';
import {
  Activity,
  Play,
  RotateCcw,
  Wifi,
  WifiOff,
  UserCheck,
  Zap,
  CheckCircle2,
  Volume2,
  VolumeX,
  Camera,
  AlertOctagon
} from 'lucide-react';
import { api } from '../services/api';
import { sirenService } from '../services/siren';
import { CameraModal } from './CameraModal';

interface HeaderProps {
  wsConnected: boolean;
  onRefresh: () => void;
  onOpenDecisionTrace?: (cid: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ wsConnected, onRefresh, onOpenDecisionTrace }) => {
  const [demoExecuting, setDemoExecuting] = useState<boolean>(false);
  const [demoSuccessMsg, setDemoSuccessMsg] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(sirenService.isAudioEnabled());
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);

  const handleEnableAudio = () => {
    const ok = sirenService.initContext();
    setAudioEnabled(ok);
    if (ok) {
      sirenService.testSiren();
    }
  };

  const handleTriggerZoneCEscalation = async () => {
    try {
      setDemoExecuting(true);
      const res = await api.triggerZoneCEscalation();
      setDemoSuccessMsg(`Zone C Escalated! Priority score jumped to ${res.zone_c_updated.new_priority} (${res.zone_c_updated.level}). Reallocation plan generated.`);
      
      // Play Emergency Siren Sound if audio enabled
      if (audioEnabled) {
        sirenService.playSiren('CRITICAL');
      }

      onRefresh();
      if (onOpenDecisionTrace && res.correlation_id) {
        setTimeout(() => onOpenDecisionTrace(res.correlation_id), 1200);
      }
    } catch (err) {
      console.error('Demo trigger failed:', err);
    } finally {
      setDemoExecuting(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-[#D9CEC1] px-6 flex items-center justify-between shrink-0 select-none shadow-sm font-sans">
      {/* Left: Tagline & Realtime Status */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-sm font-extrabold text-[#542126] flex items-center gap-2 font-mono">
            KSHETRA Tactical Command Center
          </h2>
          <p className="text-[10px] text-[#2F7775] font-bold uppercase tracking-wider">
            THE RIGHT RESOURCE. TO THE RIGHT PLACE. AT THE RIGHT TIME.
          </p>
        </div>

        <div className="h-6 w-px bg-[#D9CEC1] mx-2 hidden md:block" />

        {/* Realtime WebSocket status */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#F4EDE3] border border-[#D9CEC1] text-xs">
          {wsConnected ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-[#718B78] animate-pulse" />
              <span className="text-[#718B78] font-bold text-[10px] tracking-wider uppercase">REALTIME WEBSOCKET ACTIVE</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-[#D6C09A]" />
              <span className="text-[#542126] font-bold text-[10px] tracking-wider uppercase">POLLING MODE</span>
            </>
          )}
        </div>
      </div>

      {/* Center Controls: SIREN AUDIO & DEMO ESCALATION */}
      <div className="flex items-center gap-2 bg-[#F4EDE3] p-1.5 rounded-xl border border-[#D9CEC1]">
        {/* Emergency Audio Toggle */}
        {!audioEnabled ? (
          <button
            onClick={handleEnableAudio}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#FAF7F2] text-[#542126] font-bold text-xs border border-[#D9CEC1] transition shadow-sm"
            title="Enable Web Audio Emergency Siren"
          >
            <VolumeX className="w-3.5 h-3.5 text-[#9E3F45]" />
            <span>ENABLE EMERGENCY AUDIO</span>
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={() => sirenService.testSiren()}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#718B78]/20 hover:bg-[#718B78]/30 text-[#718B78] font-bold text-xs border border-[#718B78]/40 transition"
              title="Test Siren Audio"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#718B78]" />
              <span>TEST SIREN</span>
            </button>
            <button
              onClick={() => sirenService.stopSiren()}
              className="px-2 py-1.5 rounded-lg bg-white hover:bg-[#FAF7F2] text-[#542126] font-bold text-xs border border-[#D9CEC1] transition"
              title="Silence Siren"
            >
              MUTE
            </button>
          </div>
        )}

        <div className="h-5 w-px bg-[#D9CEC1] mx-1" />

        {/* Camera Opener */}
        <button
          onClick={() => setIsCameraOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#2F7775] hover:bg-[#2F7775]/90 text-white text-xs font-bold transition shadow-sm"
          title="Open Field Evidence Camera"
        >
          <Camera className="w-3.5 h-3.5 text-[#D6C09A]" />
          <span className="hidden sm:inline">FIELD CAMERA</span>
        </button>

        {/* DEMO ESCALATION BUTTON */}
        <button
          onClick={handleTriggerZoneCEscalation}
          disabled={demoExecuting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#9E3F45] hover:bg-[#9E3F45]/90 text-white font-bold text-xs shadow-md shadow-[#9E3F45]/20 transition-all disabled:opacity-50"
        >
          {demoExecuting ? (
            <Activity className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <span>TRIGGER SINHAGAD RD EMERGENCY</span>
        </button>

        <button
          onClick={onRefresh}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#FAF7F2] text-[#542126] text-xs font-bold border border-[#D9CEC1] transition-colors shadow-sm"
          title="Refresh All Realtime Telemetry"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#2F7775]" />
        </button>
      </div>

      {/* Right User Profile */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F4EDE3] border border-[#D9CEC1]">
          <UserCheck className="w-4 h-4 text-[#2F7775]" />
          <div className="text-left">
            <p className="text-xs font-bold text-[#542126] leading-tight">Tactical Operator</p>
            <p className="text-[10px] text-[#B5A69D] leading-tight font-semibold">Pune District HQ</p>
          </div>
        </div>
      </div>

      {/* Field Camera Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCaptureEvidence={(img, cls) => {
          onRefresh();
        }}
      />
    </header>
  );
};


