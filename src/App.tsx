import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RoastProvider } from './contexts/RoastContext';
import { Navbar } from './components/common/Navbar';
import { BottomNav } from './components/common/BottomNav';
import { AlertBanner } from './components/common/AlertBanner';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ActiveRoastPage } from './pages/ActiveRoastPage';
import { KioskTvPage } from './pages/KioskTvPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { ImageGalleryPage } from './pages/ImageGalleryPage';
import { AiPerformancePage } from './pages/AiPerformancePage';
import { ModelEvolutionPage } from './pages/ModelEvolutionPage';
import { OvenManagementPage } from './pages/OvenManagementPage';
import { AlertsPage } from './pages/AlertsPage';
import { OvenId } from './types/roast';

export const AppContent: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedOvenForRoastView, setSelectedOvenForRoastView] = useState<OvenId | null>(null);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleNavigateToRoast = (ovenId: OvenId) => {
    setSelectedOvenForRoastView(ovenId);
    setActiveTab('roast');
  };

  const handleBackToDashboard = () => {
    setSelectedOvenForRoastView(null);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-industrial-bg text-industrial-textPrimary flex flex-col font-sans selection:bg-industrial-accent">
      {/* Header Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Global SCADA Alert Banner (Returns null) */}
      <AlertBanner onOpenAlerts={() => setActiveTab('alerts')} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <DashboardPage
            onNavigateToRoast={handleNavigateToRoast}
          />
        )}

        {activeTab === 'roast' && selectedOvenForRoastView && (
          <ActiveRoastPage ovenId={selectedOvenForRoastView} onBack={handleBackToDashboard} />
        )}

        {isAdmin && activeTab === 'kiosk' && (
          <KioskTvPage onNavigateToRoast={handleNavigateToRoast} />
        )}

        {isAdmin && activeTab === 'alerts' && (
          <AlertsPage onNavigateToOven={handleNavigateToRoast} />
        )}

        {isAdmin && activeTab === 'ovens-mgmt' && (
          <OvenManagementPage />
        )}

        {isAdmin && activeTab === 'admin' && (
          <AdminDashboardPage onTabChange={setActiveTab} />
        )}

        {isAdmin && activeTab === 'history' && (
          <HistoryPage onTabChange={setActiveTab} />
        )}

        {isAdmin && activeTab === 'gallery' && (
          <ImageGalleryPage onTabChange={setActiveTab} />
        )}

        {isAdmin && activeTab === 'ai-performance' && (
          <AiPerformancePage onTabChange={setActiveTab} />
        )}

        {isAdmin && activeTab === 'model-evolution' && (
          <ModelEvolutionPage onTabChange={setActiveTab} />
        )}
      </main>

      {/* Ergonomic Mobile Bottom Nav (Thumb Zone) */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <RoastProvider>
        <AppContent />
      </RoastProvider>
    </AuthProvider>
  );
}
