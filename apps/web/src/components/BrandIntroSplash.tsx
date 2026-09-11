import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity } from 'lucide-react';

interface BrandIntroSplashProps {
  onComplete: () => void;
}

export const BrandIntroSplash: React.FC<BrandIntroSplashProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + 5;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#F8F4EE] flex flex-col items-center justify-center p-6 text-[#2E2E2E] select-none font-sans">
      {/* Brand Card */}
      <div className="w-full max-w-md bg-white border border-[#D9CEC1] rounded-3xl p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
        {/* Decorative Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#542126] via-[#2F7775] to-[#D6C09A]" />

        {/* Official KSHETRA Logo */}
        <div className="inline-flex p-4 rounded-2xl bg-[#F4EDE3] border border-[#D9CEC1] shadow-inner mb-2">
          <img 
            src="/kshetra-logo.png" 
            alt="KSHETRA Logo" 
            className="w-24 h-24 object-contain animate-pulse"
          />
        </div>

        <div>
          <h1 className="text-3xl font-black tracking-wider text-[#542126] font-mono leading-none">KSHETRA</h1>
          <p className="text-[10px] text-[#2F7775] font-bold uppercase tracking-widest mt-2 leading-relaxed">
            Knowledge-based Humanitarian Emergency & Tactical Resource Allocation
          </p>
          <div className="pt-2">
            <span className="inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#F4EDE3] text-[#542126] border border-[#D9CEC1]">
              THE RIGHT RESOURCE. TO THE RIGHT PLACE. AT THE RIGHT TIME.
            </span>
          </div>
        </div>

        {/* Progress Bar & Telemetry Status */}
        <div className="space-y-2 pt-2">
          <div className="w-full bg-[#F4EDE3] border border-[#D9CEC1] h-2.5 rounded-full overflow-hidden p-0.5">
            <div 
              className="bg-gradient-to-r from-[#2F7775] to-[#718B78] h-full rounded-full transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-[#B5A69D]">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-[#2F7775] animate-spin" />
              <span>INITIALIZING TACTICAL SYSTEM...</span>
            </span>
            <span className="text-[#542126] font-bold">{progress}%</span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#F0EAE1] flex items-center justify-center gap-1.5 text-[10px] text-[#B5A69D] uppercase tracking-wider font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#718B78]" />
          <span>AUTHENTICATED EMERGENCY PLATFORM</span>
        </div>
      </div>
    </div>
  );
};
