import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRoast } from '../../contexts/RoastContext';
import { Flame, Tv, BarChart3, History, Image as ImageIcon, BrainCircuit, UserCheck, ShieldCheck, LogOut, Settings, Bell } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, logout, isAdmin } = useAuth();
  const { alerts } = useRoast();

  return (
    <header className="bg-industrial-card border-b border-industrial-border sticky top-0 z-40 shadow-scada">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Brand Logo & SCADA Status Badge */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-industrial-accent to-blue-700 flex items-center justify-center shadow-scada-glow">
            <Flame className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg tracking-tight text-white font-mono">
                AMENDOBENTO <span className="text-industrial-accent text-xs font-sans px-1.5 py-0.5 rounded bg-industrial-accent/20 border border-industrial-accent/40">SCADA v2.0</span>
              </h1>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-industrial-textMuted">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="font-medium text-emerald-400">Sistema Conectado</span>
              <span>•</span>
              <span>Roboflow AI Ready</span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-industrial-bg p-1 rounded-xl border border-industrial-border">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-industrial-accent text-white shadow-scada-glow'
                : 'text-industrial-textSecondary hover:text-white hover:bg-industrial-card'
            }`}
          >
            <Flame className="w-4 h-4" />
            Fornos
          </button>

          <button
            onClick={() => setActiveTab('kiosk')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'kiosk'
                ? 'bg-industrial-accent text-white shadow-scada-glow'
                : 'text-industrial-textSecondary hover:text-white hover:bg-industrial-card'
            }`}
          >
            <Tv className="w-4 h-4 text-emerald-400" />
            Painel TV
          </button>

          {/* Admin Exclusive Tabs */}
          {isAdmin && (
            <>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all relative ${
                  activeTab === 'alerts'
                    ? 'bg-industrial-accent text-white shadow-scada-glow'
                    : 'text-industrial-textSecondary hover:text-white hover:bg-industrial-card'
                }`}
              >
                <Bell className="w-4 h-4 text-amber-400" />
                Avisos
                {alerts.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-500 text-slate-950 font-black">
                    {alerts.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('ovens-mgmt')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'ovens-mgmt'
                    ? 'bg-industrial-accent text-white shadow-scada-glow'
                    : 'text-industrial-textSecondary hover:text-white hover:bg-industrial-card'
                }`}
              >
                <Settings className="w-4 h-4 text-amber-400" />
                Gerenciar Fornos
              </button>

              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'admin'
                    ? 'bg-industrial-accent text-white shadow-scada-glow'
                    : 'text-industrial-textSecondary hover:text-white hover:bg-industrial-card'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Métricas KPI
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'history'
                    ? 'bg-industrial-accent text-white shadow-scada-glow'
                    : 'text-industrial-textSecondary hover:text-white hover:bg-industrial-card'
                }`}
              >
                <History className="w-4 h-4" />
                Histórico
              </button>

              <button
                onClick={() => setActiveTab('gallery')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'gallery'
                    ? 'bg-industrial-accent text-white shadow-scada-glow'
                    : 'text-industrial-textSecondary hover:text-white hover:bg-industrial-card'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Galeria
              </button>

              <button
                onClick={() => setActiveTab('ai-performance')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'ai-performance'
                    ? 'bg-industrial-accent text-white shadow-scada-glow'
                    : 'text-industrial-textSecondary hover:text-white hover:bg-industrial-card'
                }`}
              >
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                Métricas IA
              </button>
            </>
          )}
        </nav>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-industrial-bg px-3 py-1.5 rounded-xl border border-industrial-border">
            {isAdmin ? (
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            ) : (
              <UserCheck className="w-4 h-4 text-emerald-400" />
            )}
            <div className="text-xs font-bold text-white">
              {currentUser.name}
              <span className={`block text-[9px] uppercase tracking-wider ${isAdmin ? 'text-blue-400' : 'text-emerald-400'}`}>
                {isAdmin ? 'ADMIN / SUPERVISÃO' : 'OPERADOR'}
              </span>
            </div>

            <button
              onClick={logout}
              title="Trocar de Usuário / Sair"
              className="ml-2 p-1.5 text-industrial-textMuted hover:text-rose-400 hover:bg-industrial-card rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
