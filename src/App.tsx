import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { RoastProvider } from './contexts/RoastContext';
import { Navbar } from './components/common/Navbar';
import { BottomNav } from './components/common/BottomNav';
import { AlertBanner } from './components/common/AlertBanner';
import { DashboardPage } from './pages/DashboardPage';
import { ActiveRoastPage } from './pages/ActiveRoastPage';
import { KioskTvPage } from './pages/KioskTvPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { ImageGalleryPage } from './pages/ImageGalleryPage';
import { AiPerformancePage } from './pages/AiPerformancePage';
import { ModelEvolutionPage } from './pages/ModelEvolutionPage';
import { OvenId } from './types/roast';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedOvenForRoastView, setSelectedOvenForRoastView] = useState<OvenId | null>(null);

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

      {/* Global SCADA Alert Banner */}
      <AlertBanner />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <DashboardPage onNavigateToRoast={handleNavigateToRoast} />
        )}

        {activeTab === 'roast' && selectedOvenForRoastView && (
          <ActiveRoastPage ovenId={selectedOvenForRoastView} onBack={handleBackToDashboard} />
        )}

        {activeTab === 'kiosk' && (
          <KioskTvPage />
        )}

        {activeTab === 'admin' && (
          <AdminDashboardPage />
        )}

        {activeTab === 'history' && (
          <HistoryPage />
        )}

        {activeTab === 'gallery' && (
          <ImageGalleryPage />
        )}

        {activeTab === 'ai-performance' && (
          <AiPerformancePage />
        )}

        {activeTab === 'model-evolution' && (
          <ModelEvolutionPage />
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
