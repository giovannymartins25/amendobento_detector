import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRoast } from '../../contexts/RoastContext';
import {
  Flame,
  Tv,
  BarChart3,
  Settings,
  Bell,
  Sparkles,
  User,
  History,
  Image as ImageIcon,
  BrainCircuit,
  TrendingUp,
  X
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { isAdmin } = useAuth();
  const { alerts } = useRoast();
  const [isAnalyticsMenuOpen, setIsAnalyticsMenuOpen] = useState(false);

  const isAnalyticsActive = ['history', 'gallery', 'ai-performance', 'model-evolution', 'admin'].includes(activeTab);

  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-industrial-card/95 backdrop-blur-md border-t border-industrial-border shadow-2xl px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        <div className={`grid gap-1 max-w-md mx-auto ${isAdmin ? 'grid-cols-5' : 'grid-cols-2'}`}>
          
          {/* Fornos - Always visible */}
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setIsAnalyticsMenuOpen(false);
            }}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
              activeTab === 'dashboard'
                ? 'text-industrial-accent bg-industrial-accent/15 font-bold'
                : 'text-industrial-textMuted hover:text-white'
            }`}
          >
            <Flame className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Fornos</span>
          </button>

          {/* Admin Exclusive Bottom Options */}
          {isAdmin ? (
            <>
              <button
                onClick={() => {
                  setActiveTab('kiosk');
                  setIsAnalyticsMenuOpen(false);
                }}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                  activeTab === 'kiosk'
                    ? 'text-emerald-400 bg-emerald-500/15 font-bold'
                    : 'text-industrial-textMuted hover:text-white'
                }`}
              >
                <Tv className="w-5 h-5 mb-0.5 text-emerald-400" />
                <span className="text-[10px]">Painel TV</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('alerts');
                  setIsAnalyticsMenuOpen(false);
                }}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all relative ${
                  activeTab === 'alerts'
                    ? 'text-amber-400 bg-amber-500/15 font-bold'
                    : 'text-industrial-textMuted hover:text-white'
                }`}
              >
                <Bell className="w-5 h-5 mb-0.5 text-amber-400" />
                <span className="text-[10px]">Avisos</span>
                {alerts.length > 0 && (
                  <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab('ovens-mgmt');
                  setIsAnalyticsMenuOpen(false);
                }}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                  activeTab === 'ovens-mgmt'
                    ? 'text-amber-400 bg-amber-500/15 font-bold'
                    : 'text-industrial-textMuted hover:text-white'
                }`}
              >
                <Settings className="w-5 h-5 mb-0.5 text-amber-400" />
                <span className="text-[10px]">Gerenciar</span>
              </button>

              {/* Combined Button for Histórico, Galeria, Métricas IA, Métricas KPI */}
              <button
                onClick={() => setIsAnalyticsMenuOpen(!isAnalyticsMenuOpen)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                  isAnalyticsActive
                    ? 'text-purple-400 bg-purple-500/15 font-bold'
                    : 'text-industrial-textMuted hover:text-white'
                }`}
              >
                <Sparkles className="w-5 h-5 mb-0.5 text-purple-400" />
                <span className="text-[10px]">Histórico & IA</span>
              </button>
            </>
          ) : (
            /* Operator Specific Option: Ver Perfil ONLY */
            <button
              onClick={() => {
                const navProfileBtn = document.querySelector('header .cursor-pointer') as HTMLElement;
                if (navProfileBtn) navProfileBtn.click();
              }}
              className="flex flex-col items-center justify-center py-2 px-1 rounded-xl text-emerald-400 hover:text-white transition-all"
            >
              <User className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Ver Perfil</span>
            </button>
          )}

        </div>
      </div>

      {/* Mobile Popover Menu for Histórico & IA resources */}
      {isAnalyticsMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-end justify-center p-4 pb-20 animate-fade-in">
          <div className="w-full max-w-sm bg-industrial-card border border-industrial-border rounded-3xl p-4 shadow-2xl space-y-2 animate-scale-up">
            <div className="flex items-center justify-between border-b border-industrial-border pb-3 px-2">
              <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                RECURSOS & ANÁLISES
              </span>
              <button
                onClick={() => setIsAnalyticsMenuOpen(false)}
                className="p-1 text-industrial-textMuted hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => {
                setActiveTab('history');
                setIsAnalyticsMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 bg-industrial-bg border border-industrial-border rounded-2xl text-xs font-bold text-white hover:border-industrial-accent transition-all"
            >
              <History className="w-5 h-5 text-blue-400" />
              <span>Histórico de Torras</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('gallery');
                setIsAnalyticsMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 bg-industrial-bg border border-industrial-border rounded-2xl text-xs font-bold text-white hover:border-industrial-accent transition-all"
            >
              <ImageIcon className="w-5 h-5 text-emerald-400" />
              <span>Galeria de Imagens</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('ai-performance');
                setIsAnalyticsMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 bg-industrial-bg border border-industrial-border rounded-2xl text-xs font-bold text-white hover:border-industrial-accent transition-all"
            >
              <BrainCircuit className="w-5 h-5 text-purple-400" />
              <span>Métricas de IA</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('admin');
                setIsAnalyticsMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 bg-industrial-bg border border-industrial-border rounded-2xl text-xs font-bold text-white hover:border-industrial-accent transition-all"
            >
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span>Métricas KPI</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('model-evolution');
                setIsAnalyticsMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 bg-industrial-bg border border-industrial-border rounded-2xl text-xs font-bold text-white hover:border-industrial-accent transition-all"
            >
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <span>Evolução do Modelo</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
