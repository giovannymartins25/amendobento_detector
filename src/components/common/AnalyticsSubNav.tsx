import React from 'react';
import { History, Image as ImageIcon, BrainCircuit, TrendingUp, BarChart3 } from 'lucide-react';

interface AnalyticsSubNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const AnalyticsSubNav: React.FC<AnalyticsSubNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="bg-industrial-card p-1.5 rounded-2xl border border-industrial-border flex flex-wrap items-center gap-1 shadow-scada">
      <button
        onClick={() => setActiveTab('history')}
        className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
          activeTab === 'history'
            ? 'bg-industrial-accent text-white shadow-scada-glow'
            : 'text-industrial-textSecondary hover:text-white hover:bg-industrial-bg'
        }`}
      >
        <History className="w-4 h-4 text-blue-400" />
        <span>Histórico</span>
      </button>

      <button
        onClick={() => setActiveTab('gallery')}
        className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
          activeTab === 'gallery'
            ? 'bg-industrial-accent text-white shadow-scada-glow'
            : 'text-industrial-textSecondary hover:text-white hover:bg-industrial-bg'
        }`}
      >
        <ImageIcon className="w-4 h-4 text-emerald-400" />
        <span>Galeria</span>
      </button>

      <button
        onClick={() => setActiveTab('ai-performance')}
        className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
          activeTab === 'ai-performance'
            ? 'bg-industrial-accent text-white shadow-scada-glow'
            : 'text-industrial-textSecondary hover:text-white hover:bg-industrial-bg'
        }`}
      >
        <BrainCircuit className="w-4 h-4 text-purple-400" />
        <span>Métricas IA</span>
      </button>

      <button
        onClick={() => setActiveTab('admin')}
        className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
          activeTab === 'admin'
            ? 'bg-industrial-accent text-white shadow-scada-glow'
            : 'text-industrial-textSecondary hover:text-white hover:bg-industrial-bg'
        }`}
      >
        <BarChart3 className="w-4 h-4 text-emerald-400" />
        <span>Métricas KPI</span>
      </button>

      <button
        onClick={() => setActiveTab('model-evolution')}
        className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
          activeTab === 'model-evolution'
            ? 'bg-industrial-accent text-white shadow-scada-glow'
            : 'text-industrial-textSecondary hover:text-white hover:bg-industrial-bg'
        }`}
      >
        <TrendingUp className="w-4 h-4 text-amber-400" />
        <span>Evolução Modelo</span>
      </button>
    </div>
  );
};
