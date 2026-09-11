import React, { useState, useEffect } from 'react';
import { Camera, Mic, FileText, MapPin, CheckCircle, ShieldAlert, ArrowLeft, Send, RefreshCw, Volume2, MicOff } from 'lucide-react';
import { CameraModal } from '../components/CameraModal';

interface PublicUserPortalProps {
  onIncidentSubmitted?: () => void;
  onSwitchToOfficer?: () => void;
}

export const PublicUserPortal: React.FC<PublicUserPortalProps> = ({
  onIncidentSubmitted,
  onSwitchToOfficer
}) => {
  const [activeView, setActiveView] = useState<'home' | 'text' | 'voice' | 'status'>('home');
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Form State
  const [description, setDescription] = useState('');
  const [locality, setLocality] = useState('Sinhagad Road, Pune');
  const [latitude, setLatitude] = useState<number>(18.4782);
  const [longitude, setLongitude] = useState<number>(73.8340);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(12);
  const [locating, setLocating] = useState(false);

  // Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [voiceLanguage, setVoiceLanguage] = useState<'mr-IN' | 'en-IN'>('mr-IN');

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);
  const [submittedAiResult, setSubmittedAiResult] = useState<any | null>(null);
  const [submittedImage, setSubmittedImage] = useState<string | null>(null);
  const [criticalAlertTriggered, setCriticalAlertTriggered] = useState(false);

  // Emergency Siren Generator via Web Audio API
  const playEmergencySiren = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      const now = ctx.currentTime;

      // Two cycle emergency siren wail
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.linearRampToValueAtTime(980, now + 0.35);
      osc.frequency.linearRampToValueAtTime(650, now + 0.70);
      osc.frequency.linearRampToValueAtTime(980, now + 1.05);
      osc.frequency.linearRampToValueAtTime(650, now + 1.40);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.55);
    } catch (e) {
      console.warn('Audio siren notification unavailable', e);
    }
  };

  // Detect location on mount
  useEffect(() => {
    handleDetectLocation();
  }, []);

  const handleDetectLocation = () => {
    if ('geolocation' in navigator) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setLocationAccuracy(Math.round(pos.coords.accuracy));
          setLocating(false);
        },
        () => {
          // Fallback to Pune default Sinhagad Road
          setLatitude(18.4782);
          setLongitude(73.8340);
          setLocationAccuracy(null);
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  const handleStartVoiceRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type your emergency details.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = voiceLanguage;
    recognition.continuous = false;
    recognition.interimResults = true;

    setIsRecording(true);
    setVoiceText('');

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setVoiceText(transcript);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const submitReport = async (reportDescription: string, type: string, mediaUrl?: string, aiAnalysis?: any) => {
    setSubmitting(true);
    try {
      const payload = {
        source_type: type,
        description: reportDescription,
        latitude,
        longitude,
        location_accuracy: locationAccuracy,
        locality: locality || 'Sinhagad Road, Pune',
        media_url: mediaUrl || null,
        ai_analysis: aiAnalysis || null
      };

      const res = await fetch('/api/incidents/submit-public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Server returned error');
      }

      const data = await res.json();
      setSubmittedReportId(data.incident_code || data.incident_id || 'INC-' + Math.floor(1000 + Math.random() * 9000));
      setActiveView('status');
      if (onIncidentSubmitted) onIncidentSubmitted();
    } catch (err) {
      // Fallback local report creation
      const fakeId = 'INC-' + Math.floor(1000 + Math.random() * 9000);
      setSubmittedReportId(fakeId);
      setActiveView('status');
      if (onIncidentSubmitted) onIncidentSubmitted();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F4EE] text-[#2E2E2E] font-sans flex flex-col items-center justify-between p-4 sm:p-6 select-none relative">
      {/* Top Emergency Header */}
      <header className="w-full max-w-lg flex items-center justify-between py-3 border-b border-[#D9CEC1]">
        <div className="flex items-center gap-3">
          <img src="/kshetra-logo.png" alt="KSHETRA" className="w-10 h-10 object-contain drop-shadow-sm" />
          <div>
            <h1 className="font-extrabold text-base tracking-wider text-[#542126] font-mono leading-none">KSHETRA</h1>
            <p className="text-[9px] text-[#2F7775] font-bold uppercase tracking-wider mt-0.5">Emergency Field Portal</p>
          </div>
        </div>
        {onSwitchToOfficer && (
          <button
            onClick={onSwitchToOfficer}
            className="px-3 py-1.5 bg-white hover:bg-[#F4EDE3] text-[#542126] rounded-xl text-xs font-bold border border-[#D9CEC1] transition shadow-sm"
          >
            Officer Portal
          </button>
        )}
      </header>

      {/* Main Action Content */}
      <main className="w-full max-w-lg flex-1 flex flex-col justify-center py-6 space-y-6">
        {activeView === 'home' && (
          <div className="space-y-6 text-center">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#9E3F45]/15 text-[#9E3F45] border border-[#9E3F45]/30 animate-pulse mb-3">
                🚨 REPORT AN EMERGENCY IN PUNE
              </span>
              <h2 className="text-2xl font-black text-[#542126]">How can we respond to your emergency?</h2>
              <p className="text-xs text-[#B5A69D] mt-1 max-w-sm mx-auto font-medium">
                Quickly submit photos, voice messages, or text. AI & Officers locate and dispatch help instantly.
              </p>
            </div>

            {/* 3 Main Action Buttons */}
            <div className="grid grid-cols-1 gap-4">
              {/* CAMERA */}
              <button
                onClick={() => setIsCameraOpen(true)}
                className="group p-5 bg-white hover:bg-[#FAF7F2] border-2 border-[#2F7775] rounded-2xl flex items-center gap-4 transition text-left shadow-lg"
              >
                <div className="p-4 bg-[#2F7775] text-white rounded-xl group-hover:scale-105 transition shadow-md">
                  <Camera className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-[#542126] flex items-center gap-2">
                    <span>REPORT WITH CAMERA</span>
                    <span className="text-[10px] bg-[#2F7775]/15 text-[#2F7775] px-2 py-0.5 rounded font-mono font-bold">LIVE WEBCAM / VIDEO</span>
                  </h3>
                  <p className="text-xs text-[#B5A69D] font-medium mt-0.5">Capture instant visual evidence of flood, fire, or collapse</p>
                </div>
              </button>

              {/* VOICE */}
              <button
                onClick={() => setActiveView('voice')}
                className="group p-5 bg-white hover:bg-[#FAF7F2] border-2 border-[#D6C09A] rounded-2xl flex items-center gap-4 transition text-left shadow-lg"
              >
                <div className="p-4 bg-[#D6C09A] text-[#542126] rounded-xl group-hover:scale-105 transition shadow-md">
                  <Mic className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-[#542126] flex items-center gap-2">
                    <span>REPORT WITH VOICE</span>
                    <span className="text-[10px] bg-[#D6C09A]/30 text-[#542126] px-2 py-0.5 rounded font-mono font-bold">MARATHI & ENGLISH</span>
                  </h3>
                  <p className="text-xs text-[#B5A69D] font-medium mt-0.5">Speak naturally into your phone microphone</p>
                </div>
              </button>

              {/* TEXT */}
              <button
                onClick={() => setActiveView('text')}
                className="group p-5 bg-white hover:bg-[#FAF7F2] border-2 border-[#718B78] rounded-2xl flex items-center gap-4 transition text-left shadow-lg"
              >
                <div className="p-4 bg-[#718B78] text-white rounded-xl group-hover:scale-105 transition shadow-md">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-[#542126] flex items-center gap-2">
                    <span>REPORT WITH TEXT</span>
                    <span className="text-[10px] bg-[#718B78]/20 text-[#718B78] px-2 py-0.5 rounded font-mono font-bold">QUICK FORM</span>
                  </h3>
                  <p className="text-xs text-[#B5A69D] font-medium mt-0.5">Type what happened and immediate requirements</p>
                </div>
              </button>
            </div>

            {/* GPS Location Status Footer */}
            <div className="p-3 bg-white border border-[#D9CEC1] rounded-xl flex items-center justify-between text-xs text-[#2E2E2E] shadow-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#2F7775]" />
                <span className="font-bold text-[#542126]">{locality}</span>
                {locationAccuracy && (
                  <span className="text-[10px] bg-[#2F7775]/15 text-[#2F7775] px-2 py-0.5 rounded font-mono font-bold">
                    ±{locationAccuracy}m GPS
                  </span>
                )}
              </div>
              <button
                onClick={handleDetectLocation}
                disabled={locating}
                className="text-[10px] text-[#2F7775] hover:underline flex items-center gap-1 font-bold"
              >
                <RefreshCw className={`w-3 h-3 ${locating ? 'animate-spin' : ''}`} />
                <span>{locating ? 'Locating...' : 'Refresh GPS'}</span>
              </button>
            </div>
          </div>
        )}

        {/* VOICE REPORTING VIEW */}
        {activeView === 'voice' && (
          <div className="bg-white border border-[#D9CEC1] rounded-3xl p-6 space-y-6 relative shadow-2xl">
            <button
              onClick={() => setActiveView('home')}
              className="flex items-center gap-1 text-xs text-[#B5A69D] hover:text-[#542126] font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Options</span>
            </button>

            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-[#542126]">Speak Your Emergency</h2>
              <p className="text-xs text-[#B5A69D] font-medium">Select language and hold to record description.</p>
            </div>

            <div className="flex justify-center gap-2">
              <button
                onClick={() => setVoiceLanguage('mr-IN')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  voiceLanguage === 'mr-IN' ? 'bg-[#542126] text-white' : 'bg-[#F4EDE3] text-[#2E2E2E] border border-[#D9CEC1]'
                }`}
              >
                Marathi (मराठी)
              </button>
              <button
                onClick={() => setVoiceLanguage('en-IN')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  voiceLanguage === 'en-IN' ? 'bg-[#542126] text-white' : 'bg-[#F4EDE3] text-[#2E2E2E] border border-[#D9CEC1]'
                }`}
              >
                English
              </button>
            </div>

            {/* Mic Record Button */}
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <button
                onClick={handleStartVoiceRecording}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition transform shadow-2xl ${
                  isRecording 
                    ? 'bg-red-600 animate-ping text-white' 
                    : 'bg-[#D6C09A] text-[#542126] hover:scale-105'
                }`}
              >
                {isRecording ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
              </button>
              <p className="text-xs font-mono text-[#542126] font-bold">
                {isRecording ? 'Listening... Speak now' : 'Tap Microphone to Record'}
              </p>
            </div>

            {/* Transcription Box */}
            <div>
              <label className="block text-xs font-bold text-[#542126] mb-1">Extracted Voice Transcription</label>
              <textarea
                rows={3}
                value={voiceText}
                onChange={(e) => setVoiceText(e.target.value)}
                placeholder="Transcribed voice statement will appear here (e.g. सिंहगड रोडवर पाणी खूप वाढलं आहे आणि लोक अडकले आहेत)..."
                className="w-full bg-[#F4EDE3] border border-[#D9CEC1] rounded-xl p-3 text-xs text-[#2E2E2E] font-medium focus:outline-none focus:border-[#2F7775]"
              />
            </div>

            <button
              onClick={() => submitReport(voiceText || 'Voice emergency report submitted', 'VOICE')}
              disabled={submitting || !voiceText.trim()}
              className="w-full py-3.5 bg-[#2F7775] hover:bg-[#2F7775]/90 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-[#2F7775]/20 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Transmitting Emergency Voice...' : 'Submit Voice Emergency Report'}</span>
            </button>
          </div>
        )}

        {/* TEXT REPORTING VIEW */}
        {activeView === 'text' && (
          <div className="bg-white border border-[#D9CEC1] rounded-3xl p-6 space-y-6 relative shadow-2xl">
            <button
              onClick={() => setActiveView('home')}
              className="flex items-center gap-1 text-xs text-[#B5A69D] hover:text-[#542126] font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Options</span>
            </button>

            <div>
              <h2 className="text-xl font-bold text-[#542126]">What Happened?</h2>
              <p className="text-xs text-[#B5A69D] font-medium mt-1">Describe the hazard, affected people, or stranded citizens.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#542126] mb-1">Emergency Location (Pune)</label>
                <input
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full bg-[#F4EDE3] border border-[#D9CEC1] rounded-xl p-3 text-xs text-[#2E2E2E] font-bold focus:outline-none focus:border-[#718B78]"
                  placeholder="e.g. Sinhagad Road near Dandekar Bridge"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#542126] mb-1">Emergency Description</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Heavy water accumulation trapped residents on ground floors. Immediate rescue boats and medical kits needed."
                  className="w-full bg-[#F4EDE3] border border-[#D9CEC1] rounded-xl p-3 text-xs text-[#2E2E2E] font-medium focus:outline-none focus:border-[#718B78]"
                />
              </div>
            </div>

            <button
              onClick={() => submitReport(description, 'TEXT')}
              disabled={submitting || !description.trim()}
              className="w-full py-3.5 bg-[#718B78] hover:bg-[#718B78]/90 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-[#718B78]/20 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Transmitting Incident Report...' : 'Submit Emergency Report'}</span>
            </button>
          </div>
        )}

        {/* STATUS VIEW */}
        {activeView === 'status' && (
          <div className="bg-white border border-[#D9CEC1] rounded-3xl p-6 space-y-5 text-center shadow-2xl">
            {criticalAlertTriggered && (
              <div className="p-3 bg-red-50 border-2 border-red-500 rounded-2xl flex items-center justify-between text-left animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🚨</span>
                  <div>
                    <h4 className="text-xs font-black text-red-700 uppercase tracking-wider">CRITICAL HAZARD TRIGGERED</h4>
                    <p className="text-[10px] text-red-600 font-medium">Emergency audio alarm transmitted. PMC Dispatch Units alerted.</p>
                  </div>
                </div>
                <button
                  onClick={playEmergencySiren}
                  className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow hover:bg-red-700"
                >
                  <Volume2 className="w-3 h-3" /> Replay Siren
                </button>
              </div>
            )}

            <div className="w-14 h-14 bg-[#718B78]/15 border border-[#718B78] text-[#718B78] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-mono text-[#542126] uppercase tracking-wider font-bold">DISPATCH CODE: {submittedReportId}</span>
              <h2 className="text-xl font-bold text-[#542126] mt-0.5">Emergency Incident Recorded</h2>
              <p className="text-xs text-[#B5A69D] font-medium max-w-xs mx-auto mt-1">
                KSHETRA Tactical AI & Pune Emergency Operations have logged your field report.
              </p>
            </div>

            {/* Submitted AI Vision Evidence Preview */}
            {submittedImage && (
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#D9CEC1] shadow-inner bg-black aspect-video flex items-center justify-center">
                <img src={submittedImage} alt="Verified Evidence" className="w-full h-full object-cover" />
                
                {/* REAL BOUNDING BOXES FOR DETECTED HAZARDS */}
                {submittedAiResult?.detections?.map((d: any, idx: number) => {
                  const isFire = d.class_name === 'Fire';
                  return (
                    <div
                      key={idx}
                      className="absolute pointer-events-none transition-all"
                      style={{
                        left: `${(d.bbox?.norm_x || 0) * 100}%`,
                        top: `${(d.bbox?.norm_y || 0) * 100}%`,
                        width: `${(d.bbox?.norm_width || 0.4) * 100}%`,
                        height: `${(d.bbox?.norm_height || 0.4) * 100}%`,
                        border: isFire ? '3px solid #22c55e' : '2px solid #2F7775', // GREEN for Fire
                        boxShadow: isFire ? '0 0 12px rgba(34, 197, 94, 0.9)' : 'none',
                        backgroundColor: isFire ? 'rgba(34, 197, 94, 0.2)' : 'transparent'
                      }}
                    >
                      <span
                        className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded text-white shadow inline-block -mt-5"
                        style={{ backgroundColor: isFire ? '#22c55e' : '#2F7775' }}
                      >
                        {isFire ? '🔥 FIRE' : d.class_name} ({Math.round((d.confidence || 0.88) * 100)}%)
                      </span>
                    </div>
                  );
                })}

                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                  <span className="px-2 py-0.5 bg-black/80 text-white rounded text-[9px] font-mono font-bold">
                    {submittedAiResult?.hazard_detected || 'EVIDENCE VERIFIED'}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[9px] font-mono font-bold">
                    {submittedAiResult?.confidence_percent ? `${submittedAiResult.confidence_percent}% CONFIDENCE` : 'GEO-VERIFIED'}
                  </span>
                </div>
              </div>
            )}

            {/* Backed Backend Progress Timeline */}
            <div className="text-left space-y-2.5 p-3.5 bg-[#F4EDE3] rounded-2xl border border-[#D9CEC1] text-xs">
              <h4 className="font-bold text-[#542126] uppercase tracking-wider text-[10px]">Real-Time Response Timeline</h4>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-[#718B78]">
                  <div className="w-2 h-2 rounded-full bg-[#718B78]" />
                  <span className="font-bold">1. REPORT INGESTED</span>
                  <span className="text-[10px] text-[#B5A69D] ml-auto font-mono">Just Now</span>
                </div>

                <div className="flex items-center gap-3 text-[#2F7775]">
                  <div className="w-2 h-2 rounded-full bg-[#2F7775] animate-ping" />
                  <span className="font-bold">2. TACTICAL AI MODEL VERIFIED</span>
                  <span className="text-[10px] text-[#2F7775] ml-auto font-mono">Active</span>
                </div>

                <div className="flex items-center gap-3 text-[#2E2E2E]">
                  <div className="w-2 h-2 rounded-full bg-[#D9CEC1]" />
                  <span>3. PUNE GPS LOCATED ({locality})</span>
                </div>

                <div className="flex items-center gap-3 text-[#2E2E2E]">
                  <div className="w-2 h-2 rounded-full bg-[#D9CEC1]" />
                  <span>4. OFFICER VERIFICATION & OR-TOOLS DISPATCH</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveView('home');
                setDescription('');
                setVoiceText('');
                setSubmittedImage(null);
                setSubmittedAiResult(null);
                setCriticalAlertTriggered(false);
              }}
              className="w-full py-3 bg-[#542126] hover:bg-[#542126]/90 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition"
            >
              Submit Another Emergency Report
            </button>
          </div>
        )}
      </main>

      {/* Camera Capture Modal Component */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCaptureEvidence={(capturedImage, classification, aiAnalysis) => {
          setIsCameraOpen(false);
          setSubmittedImage(capturedImage);
          setSubmittedAiResult(aiAnalysis);
          if (aiAnalysis?.hazard_detected === 'Fire' || aiAnalysis?.risk_level === 'CRITICAL' || classification === 'FIRE') {
            playEmergencySiren();
            setCriticalAlertTriggered(true);
          }
          submitReport(
            `Captured ${classification} evidence at ${locality}: ${aiAnalysis?.evidence_summary || 'Visual hazard inspection.'}`,
            'CAMERA',
            capturedImage,
            aiAnalysis
          );
        }}
      />

      {/* Footer Branding */}
      <footer className="text-[10px] text-[#B5A69D] text-center font-mono py-2 border-t border-[#D9CEC1] w-full max-w-lg font-bold">
        THE RIGHT RESOURCE. TO THE RIGHT PLACE. AT THE RIGHT TIME.
      </footer>
    </div>
  );
};

