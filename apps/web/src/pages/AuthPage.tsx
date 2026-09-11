import React, { useState } from 'react';
import { Shield, Key, User, Lock, AlertCircle, ArrowRight } from 'lucide-react';

interface AuthPageProps {
  onLogin: (role: string, email: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('officer@kshetra.gov.in');
  const [password, setPassword] = useState('••••••••••••');
  const [role, setRole] = useState('OPERATOR');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide valid authentication credentials.');
      return;
    }
    setLoading(true);
    setError(null);

    // Simulate secure JWT auth verification
    setTimeout(() => {
      setLoading(false);
      onLogin(role, email);
    }, 600);
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F4EE] flex items-center justify-center p-4 relative overflow-hidden font-sans text-[#2E2E2E]">
      {/* Background Decorative Soft Accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#D9CEC1]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#2F7775]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-[#D9CEC1] rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-[#F4EDE3] border border-[#D9CEC1] shadow-sm mb-1">
            <img src="/kshetra-logo.png" alt="KSHETRA Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-2xl font-black tracking-wider text-[#542126] font-mono">KSHETRA</h1>
          <p className="text-[11px] text-[#2F7775] font-bold uppercase tracking-widest leading-relaxed">
            Knowledge-based Humanitarian Emergency & Tactical Resource Allocation
          </p>
          <div className="pt-1">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#F4EDE3] text-[#542126] border border-[#D9CEC1]">
              THE RIGHT RESOURCE. TO THE RIGHT PLACE. AT THE RIGHT TIME.
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-[#9E3F45]/10 border border-[#9E3F45]/40 rounded-xl flex items-center gap-2 text-xs text-[#9E3F45] font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#9E3F45]" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#542126] mb-1">Select Tactical Role</label>
            <div className="relative">
              <Shield className="w-4 h-4 text-[#2F7775] absolute left-3 top-3" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#F4EDE3] border border-[#D9CEC1] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#2E2E2E] font-bold focus:outline-none focus:border-[#2F7775] transition"
              >
                <option value="OPERATOR">OPERATOR — Command & Response Control</option>
                <option value="ADMIN">ADMIN — System Administrator</option>
                <option value="RESOURCE_MANAGER">RESOURCE_MANAGER — Logistics & Depots</option>
                <option value="AGENCY_COORDINATOR">AGENCY_COORDINATOR — Inter-Agency Dispatch</option>
                <option value="FIELD_REPORTER">FIELD_REPORTER — Citizen Emergency Reporting</option>
                <option value="VIEWER">VIEWER — Observer Dashboard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#542126] mb-1">Officer Email / Identifier</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#B5A69D] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F4EDE3] border border-[#D9CEC1] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#2E2E2E] font-semibold focus:outline-none focus:border-[#2F7775] transition"
                placeholder="officer@kshetra.gov.in"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#542126] mb-1">Security Credentials</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#B5A69D] absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F4EDE3] border border-[#D9CEC1] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#2E2E2E] font-semibold focus:outline-none focus:border-[#2F7775] transition"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#2F7775] hover:bg-[#2F7775]/90 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-[#2F7775]/20 disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating Credentials...</span>
            ) : (
              <>
                <span>Access Command System</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Role Auto-fill */}
        <div className="pt-2 border-t border-[#F0EAE1] text-center space-y-2">
          <p className="text-[10px] text-[#B5A69D] uppercase tracking-wider font-bold">Quick Role Switching for Evaluation</p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            <button
              onClick={() => { setRole('OPERATOR'); setEmail('operator@kshetra.gov.in'); }}
              className="px-2.5 py-1 bg-[#F4EDE3] hover:bg-[#D9CEC1] border border-[#D9CEC1] rounded-lg text-[10px] text-[#542126] font-bold"
            >
              Command Officer
            </button>
            <button
              onClick={() => { setRole('FIELD_REPORTER'); setEmail('citizen@pune.gov.in'); }}
              className="px-2.5 py-1 bg-[#F4EDE3] hover:bg-[#D9CEC1] border border-[#D9CEC1] rounded-lg text-[10px] text-[#718B78] font-bold"
            >
              Field Citizen Portal
            </button>
            <button
              onClick={() => { setRole('ADMIN'); setEmail('admin@kshetra.gov.in'); }}
              className="px-2.5 py-1 bg-[#F4EDE3] hover:bg-[#D9CEC1] border border-[#D9CEC1] rounded-lg text-[10px] text-[#2F7775] font-bold"
            >
              System Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

