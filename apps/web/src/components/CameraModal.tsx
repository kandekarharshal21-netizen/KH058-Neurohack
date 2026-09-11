import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, Check, RefreshCw, Upload, Video, SwitchCamera, Activity, Flame, ShieldAlert, Film } from 'lucide-react';
import { api } from '../services/api';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptureEvidence: (imageDataUrl: string, classification: string, aiAnalysis?: any) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCaptureEvidence }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const screeningCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [classification, setClassification] = useState<string>('FIRE');
  const [activeMode, setActiveMode] = useState<'camera' | 'video'>('camera');

  // Live screening telemetry states from real model
  const [isScreening, setIsScreening] = useState<boolean>(false);
  const [liveConfidence, setLiveConfidence] = useState<number>(0);
  const [liveDetectionText, setLiveDetectionText] = useState<string>('SCANNING FOR DISASTER HAZARDS...');
  const [liveDetections, setLiveDetections] = useState<any[]>([]);
  const [analyzedResult, setAnalyzedResult] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Video upload processing states
  const [videoProcessing, setVideoProcessing] = useState<boolean>(false);
  const [videoResult, setVideoResult] = useState<any | null>(null);

  const startCamera = async (mode: 'environment' | 'user') => {
    stopCamera();
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setIsScreening(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Camera access unavailable or permission denied. You can upload an image or video file directly.');
      setIsScreening(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScreening(false);
  };

  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Real CV live frame sampling loop (2 fps)
  useEffect(() => {
    let intervalId: any;
    let isRequestBusy = false;

    if (isScreening && !capturedImage && activeMode === 'camera') {
      intervalId = setInterval(async () => {
        if (isRequestBusy) return;
        const video = videoRef.current;
        if (!video || video.readyState !== 4) return;

        try {
          isRequestBusy = true;
          let canvas = screeningCanvasRef.current;
          if (!canvas) {
            canvas = document.createElement('canvas');
            screeningCanvasRef.current = canvas;
          }
          canvas.width = 320;
          canvas.height = 240;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, 320, 240);
            const frameBase64 = canvas.toDataURL('image/jpeg', 0.65);
            const res = await api.analyzeFrame(frameBase64);
            if (res && res.success) {
              setLiveConfidence(res.confidence_percent || 0);
              setLiveDetectionText(`${res.hazard_detected}: ${res.confidence_percent}% Confidence`);
              setLiveDetections(res.detections || []);
            }
          }
        } catch (e) {
          console.debug('Live screening frame error:', e);
        } finally {
          isRequestBusy = false;
        }
      }, 500);
    }

    return () => clearInterval(intervalId);
  }, [isScreening, capturedImage, activeMode]);

  useEffect(() => {
    if (isOpen && !capturedImage && activeMode === 'camera') {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, capturedImage, activeMode]);

  // Capture current real video frame to canvas and run CV inference
  const handleCapture = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.90);
      setCapturedImage(dataUrl);
      stopCamera();

      // Run real model inference on captured frame
      try {
        setIsAnalyzing(true);
        const res = await api.analyzeFrame(dataUrl);
        setAnalyzedResult(res);
        if (res.hazard_detected === 'Fire') setClassification('FIRE');
        else if (res.hazard_detected === 'Flood') setClassification('FLOOD');
        else if (res.hazard_detected === 'Heavy Smoke') setClassification('SMOKE');
      } catch (e) {
        console.error('Frame analysis failed:', e);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        if (evt.target?.result) {
          const dataUrl = evt.target.result as string;
          setCapturedImage(dataUrl);
          stopCamera();

          try {
            setIsAnalyzing(true);
            const res = await api.analyzeFrame(dataUrl);
            setAnalyzedResult(res);
            if (res.hazard_detected === 'Fire') setClassification('FIRE');
            else if (res.hazard_detected === 'Flood') setClassification('FLOOD');
            else if (res.hazard_detected === 'Heavy Smoke') setClassification('SMOKE');
          } catch (err) {
            console.error(err);
          } finally {
            setIsAnalyzing(false);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setVideoProcessing(true);
        const res = await api.analyzeVideo(file, 2);
        setVideoResult(res);
      } catch (err) {
        console.error(err);
      } finally {
        setVideoProcessing(false);
      }
    }
  };

  const handleConfirmEvidence = () => {
    if (capturedImage) {
      onCaptureEvidence(capturedImage, classification, analyzedResult);
      setCapturedImage(null);
      setAnalyzedResult(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none overflow-y-auto">
      <div className="bg-white border border-[#D9CEC1] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col text-[#2E2E2E]">
        {/* Header */}
        <div className="p-4 border-b border-[#D9CEC1] flex items-center justify-between bg-[#F8F4EE]">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#2F7775]" />
            <span className="text-sm font-extrabold text-[#542126] font-mono">Disaster Evidence Inspection</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveMode(activeMode === 'camera' ? 'video' : 'camera')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold border border-[#D9CEC1] bg-white text-[#542126] flex items-center gap-1"
            >
              {activeMode === 'camera' ? <Film className="w-3.5 h-3.5 text-[#2F7775]" /> : <Camera className="w-3.5 h-3.5 text-[#2F7775]" />}
              <span>{activeMode === 'camera' ? 'Video Mode' : 'Live Camera'}</span>
            </button>

            {activeMode === 'camera' && !capturedImage && !cameraError && (
              <button 
                onClick={toggleCameraFacing}
                className="p-1.5 rounded-lg bg-[#F4EDE3] hover:bg-[#D9CEC1] text-[#542126] text-xs font-bold transition flex items-center gap-1 border border-[#D9CEC1]"
                title="Switch Front/Back Camera"
              >
                <SwitchCamera className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{facingMode === 'environment' ? 'Rear' : 'Front'}</span>
              </button>
            )}

            <button 
              onClick={() => { stopCamera(); onClose(); }}
              className="p-1.5 rounded-lg hover:bg-[#F4EDE3] text-[#B5A69D] hover:text-[#542126]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport / Live Stream */}
        <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
          {activeMode === 'video' ? (
            <div className="p-6 text-center text-xs space-y-3 bg-[#F8F4EE] w-full h-full flex flex-col items-center justify-center">
              <Film className="w-10 h-10 text-[#2F7775] mx-auto" />
              <p className="text-[#542126] font-bold">Select and Upload Disaster Surveillance Video</p>
              <p className="text-[11px] text-[#B5A69D]">Model performs intelligent 2 FPS temporal frame extraction and hazard aggregation</p>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2F7775] hover:bg-[#2F7775]/90 text-white font-bold text-xs cursor-pointer shadow-md">
                <Upload className="w-4 h-4" /> Choose Video File
                <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
              </label>

              {videoProcessing && (
                <div className="flex items-center gap-2 text-[#2F7775] font-bold text-xs">
                  <Activity className="w-4 h-4 animate-spin" /> Analyzing Video Frames...
                </div>
              )}

              {videoResult && (
                <div className="mt-2 p-3 bg-white border border-[#D9CEC1] rounded-xl text-left w-full text-xs space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-[#542126]">Dominant Hazard:</span>
                    <span className="text-red-600 font-mono">{videoResult.dominant_hazard}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#B5A69D]">Frames Analyzed:</span>
                    <span className="font-mono">{videoResult.frames_analyzed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#B5A69D]">Peak Confidence:</span>
                    <span className="font-mono text-[#718B78] font-bold">{Math.round(videoResult.peak_confidence * 100)}%</span>
                  </div>
                  <button
                    onClick={() => {
                      const dominant = videoResult.dominant_hazard || 'FIRE';
                      onCaptureEvidence(
                        videoResult.best_frame ? `data:image/jpeg;base64,${videoResult.best_frame}` : '',
                        dominant,
                        videoResult
                      );
                      setVideoResult(null);
                      onClose();
                    }}
                    className="w-full mt-3 py-2 bg-[#718B78] hover:bg-[#718B78]/90 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                  >
                    <Check className="w-3.5 h-3.5" /> Confirm Video Analysis Evidence
                  </button>
                </div>
              )}
            </div>
          ) : capturedImage ? (
            <div className="relative w-full h-full">
              <img src={capturedImage} alt="Captured Evidence Frame" className="w-full h-full object-cover" />

              {/* REAL BOUNDING BOXES FROM CV INFERENCE */}
              {analyzedResult?.detections?.map((d: any, idx: number) => {
                const isFire = d.class_name === 'Fire';
                return (
                  <div
                    key={idx}
                    className="absolute pointer-events-none transition-all"
                    style={{
                      left: `${(d.bbox.norm_x || 0) * 100}%`,
                      top: `${(d.bbox.norm_y || 0) * 100}%`,
                      width: `${(d.bbox.norm_width || 0.5) * 100}%`,
                      height: `${(d.bbox.norm_height || 0.4) * 100}%`,
                      border: isFire ? '3px solid #22c55e' : '2px solid #2F7775', // GREEN box for Fire
                      boxShadow: isFire ? '0 0 12px rgba(34, 197, 94, 0.8)' : 'none',
                      backgroundColor: isFire ? 'rgba(34, 197, 94, 0.15)' : 'transparent'
                    }}
                  >
                    <span
                      className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded text-white shadow-md inline-block -mt-6"
                      style={{ backgroundColor: isFire ? '#22c55e' : '#2F7775' }}
                    >
                      {isFire ? '🔥 FIRE' : d.label || d.class_name} ({Math.round(d.confidence * 100)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          ) : cameraError ? (
            <div className="p-6 text-center text-xs space-y-3 bg-[#F8F4EE] w-full h-full flex flex-col items-center justify-center">
              <Video className="w-10 h-10 text-[#9E3F45] mx-auto" />
              <p className="text-[#542126] font-bold max-w-xs">{cameraError}</p>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2F7775] hover:bg-[#2F7775]/90 text-white font-bold text-xs cursor-pointer shadow-md">
                <Upload className="w-4 h-4" /> Upload Evidence Image
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          ) : (
            <>
              {/* REAL LIVE VIDEO ELEMENT */}
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover" 
              />

              {/* LIVE CV TELEMETRY HEADER */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <span className="px-2.5 py-1 bg-red-600 text-white rounded-md text-[10px] font-mono font-bold flex items-center gap-1.5 shadow">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>LIVE CAMERA STREAM</span>
                </span>
                <span className="px-2.5 py-1 bg-black/80 text-white rounded-md text-[10px] font-mono font-bold border border-[#D6C09A] backdrop-blur-sm">
                  CV Inference: {liveConfidence}%
                </span>
              </div>

              {/* REAL GREEN BOUNDING BOXES FOR DETECTED FIRE ON LIVE STREAM */}
              {liveDetections.map((d: any, idx: number) => {
                const isFire = d.class_name === 'Fire';
                return (
                  <div
                    key={idx}
                    className="absolute pointer-events-none transition-all duration-150"
                    style={{
                      left: `${(d.bbox.norm_x || 0.1) * 100}%`,
                      top: `${(d.bbox.norm_y || 0.1) * 100}%`,
                      width: `${(d.bbox.norm_width || 0.5) * 100}%`,
                      height: `${(d.bbox.norm_height || 0.4) * 100}%`,
                      border: isFire ? '3px solid #22c55e' : '2px dashed #2F7775', // GREEN for Fire
                      boxShadow: isFire ? '0 0 14px rgba(34, 197, 94, 0.9)' : 'none',
                      backgroundColor: isFire ? 'rgba(34, 197, 94, 0.18)' : 'transparent'
                    }}
                  >
                    <span 
                      className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded text-white shadow-md inline-block -mt-5"
                      style={{ backgroundColor: isFire ? '#22c55e' : '#2F7775' }}
                    >
                      {isFire ? '🔥 FIRE' : d.class_name} ({Math.round(d.confidence * 100)}%)
                    </span>
                  </div>
                );
              })}

              {/* LIVE BOTTOM STATUS OVERLAY */}
              <div className="absolute bottom-3 left-3 right-3 pointer-events-none flex justify-center">
                <span className="bg-black/80 text-[#F4EDE3] px-3 py-1 rounded-md text-[10px] font-mono font-bold border border-[#2F7775]">
                  {liveDetectionText}
                </span>
              </div>
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Captured Evidence Review */}
        {capturedImage && (
          <div className="p-4 space-y-3 bg-[#F8F4EE] border-t border-[#D9CEC1]">
            <div className="p-3 bg-white rounded-xl border border-[#D9CEC1] text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-2">
                <span className="font-bold text-[#542126] flex items-center gap-1.5 font-mono">
                  <ShieldAlert className="w-4 h-4 text-[#9E3F45]" /> Model Analysis Result
                </span>
                <span className="text-[10px] font-mono text-[#718B78] font-bold">
                  {analyzedResult ? `${analyzedResult.confidence_percent}% Confidence` : 'Analyzing...'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[#B5A69D]">Detected Hazard:</span>
                  <p className="font-bold text-[#542126]">{analyzedResult?.hazard_detected || 'Processing...'}</p>
                </div>
                <div>
                  <span className="text-[#B5A69D]">Risk Classification:</span>
                  <p className={`font-bold ${analyzedResult?.risk_level === 'CRITICAL' ? 'text-[#9E3F45]' : 'text-[#718B78]'}`}>
                    {analyzedResult?.risk_level || 'CRITICAL'}
                  </p>
                </div>
              </div>

              {analyzedResult?.evidence_summary && (
                <p className="text-[10px] text-[#2E2E2E] bg-[#F4EDE3] p-2 rounded border border-[#D9CEC1]">
                  {analyzedResult.evidence_summary}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => { setCapturedImage(null); setAnalyzedResult(null); startCamera(facingMode); }}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#D9CEC1] text-[#542126] font-bold text-xs flex items-center gap-1.5 border border-[#D9CEC1]"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retake Live Frame
              </button>
              <button
                onClick={handleConfirmEvidence}
                className="px-5 py-2.5 rounded-xl bg-[#718B78] hover:bg-[#718B78]/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
              >
                <Check className="w-4 h-4" /> Confirm Evidence
              </button>
            </div>
          </div>
        )}

        {/* Default Controls */}
        {!capturedImage && activeMode === 'camera' && (
          <div className="p-4 bg-[#F8F4EE] border-t border-[#D9CEC1] flex items-center justify-between">
            <label className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F4EDE3] text-[#542126] font-bold text-xs cursor-pointer flex items-center gap-1.5 border border-[#D9CEC1]">
              <Upload className="w-3.5 h-3.5 text-[#2F7775]" /> Upload Photo
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
            <button
              onClick={handleCapture}
              disabled={!!cameraError}
              className="px-6 py-2.5 rounded-xl bg-[#2F7775] hover:bg-[#2F7775]/90 text-white font-bold text-xs flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              <Camera className="w-4 h-4" /> CAPTURE REAL FRAME
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

