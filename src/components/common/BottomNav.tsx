import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Flame, Tv, BarChart3, History, Image as ImageIcon, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { isAdmin } = useAuth();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-industrial-card/95 backdrop-blur-md border-t border-industrial-border shadow-2xl px-2 py-1.5">
      <div className={`grid gap-1 max-w-md mx-auto ${isAdmin ? 'grid-cols-6' : 'grid-cols-2'}`}>
        
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
            activeTab === 'dashboard'
              ? 'text-industrial-accent bg-industrial-accent/15 font-bold'
              : 'text-industrial-textMuted hover:text-white'
          }`}
        >
          <Flame className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Fornos</span>
        </button>

        <button
          onClick={() => setActiveTab('kiosk')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
            activeTab === 'kiosk'
              ? 'text-emerald-400 bg-emerald-500/15 font-bold'
              : 'text-industrial-textMuted hover:text-white'
          }`}
        >
          <Tv className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Painel TV</span>
        </button>

        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab('ovens-mgmt')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                activeTab === 'ovens-mgmt'
                  ? 'text-amber-400 bg-amber-500/15 font-bold'
                  : 'text-industrial-textMuted hover:text-white'
              }`}
            >
              <Settings className="w-5 h-5 mb-0.5 text-amber-400" />
              <span className="text-[10px]">Gerenciar</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                activeTab === 'admin'
                  ? 'text-industrial-accent bg-industrial-accent/15 font-bold'
                  : 'text-industrial-textMuted hover:text-white'
              }`}
            >
              <BarChart3 className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Métricas</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                activeTab === 'history'
                  ? 'text-industrial-accent bg-industrial-accent/15 font-bold'
                  : 'text-industrial-textMuted hover:text-white'
              }`}
            >
              <History className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Histórico</span>
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                activeTab === 'gallery'
                  ? 'text-industrial-accent bg-industrial-accent/15 font-bold'
                  : 'text-industrial-textMuted hover:text-white'
              }`}
            >
              <ImageIcon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Galeria</span>
            </button>
          </>
        )}

      </div>
    </div>
  );
};
