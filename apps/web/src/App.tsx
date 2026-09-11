import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { useOperationalState } from './stores/useStore';
import { DecisionTraceModal } from './components/DecisionTraceModal';
import { AIChatAssistant } from './components/AIChatAssistant';
import { BrandIntroSplash } from './components/BrandIntroSplash';

import { AuthPage } from './pages/AuthPage';
import { PublicUserPortal } from './pages/PublicUserPortal';
import { CommandCenter } from './pages/CommandCenter';
import { IncidentsPage } from './pages/IncidentsPage';
import { VerificationCenterPage } from './pages/VerificationCenterPage';
import { ZonesPage } from './pages/ZonesPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { AllocationPage } from './pages/AllocationPage';
import { CoordinationPage } from './pages/CoordinationPage';
import { AlertsPage } from './pages/AlertsPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AIModelsPage } from './pages/AIModelsPage';
import { AIActivityPage } from './pages/AIActivityPage';
import { AuditPage } from './pages/AuditPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<string>('OPERATOR');
  const [userEmail, setUserEmail] = useState<string>('officer@kshetra.gov.in');
  const [experienceMode, setExperienceMode] = useState<'officer' | 'public'>('officer');

  const {
    zones,
    incidents,
    depots,
    plans,
    tasks,
    alerts,
    auditLogs,
    selectedZone,
    setSelectedZone,
    activeTab,
    setActiveTab,
    loading,
    refreshAllData,
    wsConnected
  } = useOperationalState();

  const [traceCorrelationId, setTraceCorrelationId] = useState<string | null>(null);
  const [isTraceOpen, setIsTraceOpen] = useState<boolean>(false);

  const handleOpenDecisionTrace = (cid: string) => {
    setTraceCorrelationId(cid);
    setIsTraceOpen(true);
  };

  const handleLogin = (role: string, email: string) => {
    setUserRole(role);
    setUserEmail(email);
    setIsAuthenticated(true);
    if (role === 'FIELD_REPORTER') {
      setExperienceMode('public');
    } else {
      setExperienceMode('officer');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // 0. Brand Intro Splash Experience
  if (showSplash) {
    return <BrandIntroSplash onComplete={() => setShowSplash(false)} />;
  }

  // 1. Unauthenticated -> Show Auth Screen
  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} />;
  }

  // 2. Field User Experience -> Public Incident Reporting Portal
  if (experienceMode === 'public') {
    return (
      <PublicUserPortal
        onIncidentSubmitted={refreshAllData}
        onSwitchToOfficer={() => setExperienceMode('officer')}
      />
    );
  }

  const criticalZonesCount = zones.filter(z => z.priority_level === 'CRITICAL').length;
  const unreadAlertsCount = alerts.filter(a => !a.is_read).length;

  // 3. Officer / Emergency Command Center Experience (Light Theme)
  return (
    <div className="flex h-screen w-screen bg-[#F8F4EE] text-[#2E2E2E] overflow-hidden font-sans">
      {/* Persistent Professional Command Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        criticalZonesCount={criticalZonesCount}
        unreadAlertsCount={unreadAlertsCount}
        userRole={userRole}
        onSwitchToPublic={() => setExperienceMode('public')}
        onLogout={handleLogout}
      />

      {/* Main Command Content Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Persistent Top Header */}
        <Header
          wsConnected={wsConnected}
          onRefresh={refreshAllData}
          onOpenDecisionTrace={handleOpenDecisionTrace}
        />

        {/* Tab Route Content Views */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === 'command-center' && (
            <CommandCenter
              zones={zones}
              incidents={incidents}
              depots={depots}
              plans={plans}
              tasks={tasks}
              alerts={alerts}
              selectedZone={selectedZone}
              onSelectZone={setSelectedZone}
              onRefresh={refreshAllData}
              onOpenDecisionTrace={handleOpenDecisionTrace}
            />
          )}
          {activeTab === 'incidents' && <IncidentsPage incidents={incidents} zones={zones} onRefresh={refreshAllData} />}
          {activeTab === 'verification' && <VerificationCenterPage incidents={incidents} onRefresh={refreshAllData} />}
          {activeTab === 'zones' && <ZonesPage zones={zones} onSelectZone={setSelectedZone} />}
          {activeTab === 'resources' && <ResourcesPage depots={depots} />}
          {activeTab === 'allocation' && <AllocationPage plans={plans} zones={zones} onRefresh={refreshAllData} />}
          {activeTab === 'coordination' && <CoordinationPage tasks={tasks} onRefresh={refreshAllData} />}
          {activeTab === 'alerts' && <AlertsPage alerts={alerts} onRefresh={refreshAllData} />}
          {activeTab === 'simulator' && <SimulatorPage zones={zones} />}
          {activeTab === 'analytics' && <AnalyticsPage zones={zones} depots={depots} />}
          {activeTab === 'ai-models' && <AIModelsPage />}
          {activeTab === 'ai-activity' && <AIActivityPage />}
          {activeTab === 'audit' && <AuditPage auditLogs={auditLogs} onOpenDecisionTrace={handleOpenDecisionTrace} />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Floating State-Aware Operational AI Assistant */}
      <AIChatAssistant zones={zones} tasks={tasks} depots={depots} />

      {/* Decision Trace Visualizer Modal */}
      <DecisionTraceModal
        isOpen={isTraceOpen}
        correlationId={traceCorrelationId}
        onClose={() => setIsTraceOpen(false)}
      />
    </div>
  );
}

export default App;

