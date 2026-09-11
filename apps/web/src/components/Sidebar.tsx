import React from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  MapPin,
  Package,
  Layers,
  Users,
  Bell,
  Sliders,
  BarChart3,
  Bot,
  FileText,
  Settings as SettingsIcon,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  criticalZonesCount: number;
  unreadAlertsCount: number;
  userRole?: string;
  onSwitchToPublic?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  criticalZonesCount,
  unreadAlertsCount,
  userRole = 'OPERATOR',
  onSwitchToPublic,
  onLogout
}) => {
  const menuItems = [
    { id: 'command-center', label: 'Command Center', icon: LayoutDashboard },
    { id: 'incidents', label: 'Incidents Queue', icon: AlertTriangle },
    { id: 'verification', label: 'Verification Center', icon: CheckCircle2, badge: 'Needs Review', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    { id: 'zones', label: 'Pune Locality Map', icon: MapPin, badge: criticalZonesCount > 0 ? `${criticalZonesCount} Critical` : null, badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30' },
    { id: 'resources', label: 'Resource Depots', icon: Package },
    { id: 'allocation', label: 'Optimization Engine', icon: Layers },
    { id: 'coordination', label: 'Agency Tasks', icon: Users },
    { id: 'alerts', label: 'Emergency Alerts', icon: Bell, badge: unreadAlertsCount > 0 ? `${unreadAlertsCount}` : null, badgeColor: 'bg-red-600/30 text-red-300 border-red-500/40' },
    { id: 'simulator', label: 'What-If Simulator', icon: Sliders },
    { id: 'analytics', label: 'Analytics & Trends', icon: BarChart3 },
    { id: 'ai-models', label: 'AI & Models Admin', icon: Cpu },
    { id: 'ai-activity', label: 'Agent Intelligence', icon: Bot },
    { id: 'audit', label: 'Audit Trail & Trace', icon: FileText },
    { id: 'settings', label: 'Settings & Policy', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 bg-[#F8F4EE] border-r border-[#D9CEC1] flex flex-col shrink-0 h-screen select-none font-sans text-[#2E2E2E]">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#D9CEC1] flex items-center gap-3 bg-[#F4EDE3]">
        <img 
          src="/kshetra-logo.png" 
          alt="KSHETRA Logo" 
          className="w-10 h-10 object-contain drop-shadow-sm"
        />
        <div className="min-w-0">
          <h1 className="font-black text-lg tracking-wider text-[#542126] font-mono leading-none">KSHETRA</h1>
          <p className="text-[9px] text-[#2F7775] tracking-wider font-bold uppercase mt-1 truncate">Tactical Emergency Command</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                isActive
                  ? 'bg-[#2F7775] text-white shadow-md shadow-[#2F7775]/20 font-bold'
                  : 'text-[#2E2E2E] hover:text-[#542126] hover:bg-[#F4EDE3]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#D6C09A]' : 'text-[#2F7775]'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border shrink-0 ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Mode Switcher & User Status */}
      <div className="p-3 border-t border-[#D9CEC1] bg-[#F4EDE3] text-[11px] space-y-2">
        {onSwitchToPublic && (
          <button
            onClick={onSwitchToPublic}
            className="w-full flex items-center justify-center gap-2 py-2 px-2 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#542126] border border-[#D9CEC1] text-xs font-bold transition shadow-sm"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#718B78]" />
            <span>Field Reporter Portal</span>
          </button>
        )}
        <div className="flex items-center justify-between text-[#B5A69D] pt-1">
          <div className="flex items-center gap-1.5 font-bold text-[#542126]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#718B78]" />
            <span className="font-mono text-[10px] uppercase">{userRole}</span>
          </div>
          {onLogout && (
            <button 
              onClick={onLogout}
              className="text-[10px] text-[#9E3F45] hover:underline font-bold"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};


