import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRoast } from '../../contexts/RoastContext';
import {
  Flame,
  Tv,
  BarChart3,
  History,
  Image as ImageIcon,
  BrainCircuit,
  UserCheck,
  ShieldCheck,
  LogOut,
  Settings,
  Bell,
  ChevronDown,
  User,
  Sparkles,
  TrendingUp,
  X
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, logout, isAdmin, users, loginAs } = useAuth();
  const { alerts } = useRoast();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAnalyticsActive = ['history', 'gallery', 'ai-performance', 'model-evolution', 'admin'].includes(activeTab);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-industrial-card border-b border-industrial-border sticky top-0 z-40 shadow-scada">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Brand Logo - Clean AMENDOBENTO Branding */}
        <div className="cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <h1 className="font-black text-2xl tracking-wider text-white font-mono">
            AMENDOBENTO
          </h1>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-industrial-bg p-1 rounded-xl border border-industrial-border">
          {/* Fornos - Accessible by all */}
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

          {/* Admin Exclusive Tabs */}
          {isAdmin && (
            <>
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
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500 text-slate-950 font-black animate-pulse">
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

              {/* Combined Dropdown Button: Histórico, Galeria e Métricas IA */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isAnalyticsActive
                      ? 'bg-industrial-accent text-white shadow-scada-glow'
                      : 'text-industrial-textSecondary hover:text-white hover:bg-industrial-card'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Histórico & Análises</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-industrial-card border border-industrial-border rounded-2xl shadow-2xl p-1.5 z-50 animate-scale-up">
                    <button
                      onClick={() => {
                        setActiveTab('history');
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        activeTab === 'history'
                          ? 'bg-industrial-accent text-white'
                          : 'text-industrial-textSecondary hover:text-white hover:bg-industrial-bg'
                      }`}
                    >
                      <History className="w-4 h-4 text-blue-400" />
                      <span>Histórico de Torras</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('gallery');
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        activeTab === 'gallery'
                          ? 'bg-industrial-accent text-white'
                          : 'text-industrial-textSecondary hover:text-white hover:bg-industrial-bg'
                      }`}
                    >
                      <ImageIcon className="w-4 h-4 text-emerald-400" />
                      <span>Galeria de Imagens</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('ai-performance');
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        activeTab === 'ai-performance'
                          ? 'bg-industrial-accent text-white'
                          : 'text-industrial-textSecondary hover:text-white hover:bg-industrial-bg'
                      }`}
                    >
                      <BrainCircuit className="w-4 h-4 text-purple-400" />
                      <span>Métricas de IA</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('admin');
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        activeTab === 'admin'
                          ? 'bg-industrial-accent text-white'
                          : 'text-industrial-textSecondary hover:text-white hover:bg-industrial-bg'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4 text-emerald-400" />
                      <span>Métricas KPI</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('model-evolution');
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        activeTab === 'model-evolution'
                          ? 'bg-industrial-accent text-white'
                          : 'text-industrial-textSecondary hover:text-white hover:bg-industrial-bg'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                      <span>Evolução do Modelo</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Operator Specific Nav: Ver Perfil button */}
          {!isAdmin && (
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-emerald-400 hover:text-white hover:bg-emerald-950/40 transition-all"
            >
              <User className="w-4 h-4" />
              Ver Perfil
            </button>
          )}
        </nav>

        {/* User Profile Badge & Actions */}
        <div className="flex items-center gap-3">
          {!isAdmin ? (
            <div className="flex items-center gap-2 bg-industrial-bg px-3 py-1.5 rounded-xl border border-industrial-border">
              <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-extrabold">OPERADOR ATIVO</span>
                <select
                  value={currentUser.id}
                  onChange={(e) => loginAs(e.target.value)}
                  className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-1"
                >
                  {users.filter(u => u.role === 'operator').map(op => (
                    <option key={op.id} value={op.id} className="bg-industrial-card text-white py-1">
                      {op.name} ({op.shift?.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 bg-industrial-bg px-3 py-1.5 rounded-xl border border-industrial-border cursor-pointer hover:border-industrial-accent/50 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <div className="text-xs font-bold text-white">
                {currentUser.name}
                <span className="block text-[9px] uppercase tracking-wider text-blue-400">
                  ADMIN / SUPERVISÃO
                </span>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            title="Sair da Conta"
            className="p-2 text-industrial-textMuted hover:text-rose-400 hover:bg-industrial-card rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* User Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-industrial-card border border-industrial-border rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-industrial-border pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                  isAdmin ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}>
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">{currentUser.name}</h3>
                  <span className={`text-xs font-bold uppercase tracking-wider ${isAdmin ? 'text-blue-400' : 'text-emerald-400'}`}>
                    {isAdmin ? 'ADMINISTRADOR' : 'OPERADOR DE CHÃO DE FÁBRICA'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1.5 hover:bg-industrial-cardHover text-industrial-textMuted hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 bg-industrial-bg p-4 rounded-2xl border border-industrial-border text-xs">
              <div className="flex justify-between">
                <span className="text-industrial-textMuted">ID do Usuário:</span>
                <span className="font-mono text-white">{currentUser.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-industrial-textMuted">Turno de Trabalho:</span>
                <span className="font-bold text-white">{currentUser.shift || 'Geral'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-industrial-textMuted">Nível de Permissão:</span>
                <span className="font-bold text-emerald-400">{isAdmin ? 'Acesso Total' : 'Operação de Fornos'}</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  logout();
                }}
                className="w-full py-3 bg-rose-950/60 hover:bg-rose-900 border border-rose-600/50 text-rose-300 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider transition-all"
              >
                <LogOut className="w-4 h-4" />
                Trocar de Usuário / Sair
              </button>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="w-full py-2.5 bg-industrial-card hover:bg-industrial-cardHover text-industrial-textSecondary text-xs font-bold rounded-xl"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
