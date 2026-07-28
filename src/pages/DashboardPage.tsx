import React, { useState } from 'react';
import { useRoast } from '../contexts/RoastContext';
import { OvenId } from '../types/roast';
import { OvenCard } from '../components/oven/OvenCard';
import { NewRoastModal } from '../components/oven/NewRoastModal';
import { analyticsEngine } from '../services/analyticsEngine';
import { Award, Zap } from 'lucide-react';

interface DashboardPageProps {
  onNavigateToRoast: (ovenId: OvenId) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateToRoast }) => {
  const { activeRoasts } = useRoast();
  const [selectedOvenForNewRoast, setSelectedOvenForNewRoast] = useState<OvenId | null>(null);

  const kpis = analyticsEngine.getGlobalKpis();

  const handleStartRoast = (ovenId: OvenId) => {
    setSelectedOvenForNewRoast(ovenId);
  };

  const handleRoastStarted = (ovenId: OvenId) => {
    onNavigateToRoast(ovenId);
  };

  return (
    <div className="space-y-6 pb-32">
      
      {/* Top Banner SCADA Overview */}
      <div className="bg-industrial-card border border-industrial-border rounded-3xl p-6 shadow-scada bg-gradient-to-r from-industrial-card via-industrial-card to-industrial-accent/10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-industrial-accent/20 border border-industrial-accent/40 text-industrial-accent text-xs font-bold uppercase tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5" />
              Painel de Operação Fabril
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
              CONTROLE DOS FORNOS DE TORRA
            </h2>
            <p className="text-xs sm:text-sm text-industrial-textSecondary mt-1">
              Selecione um forno para iniciar a torra ou acompanhar a classificação de IA em tempo real.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
            <div className="bg-industrial-bg border border-industrial-border p-3 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-industrial-textMuted uppercase tracking-wider block">Torras Hoje</span>
              <span className="font-mono text-xl font-extrabold text-white">{kpis.totalRoasts}</span>
            </div>
            <div className="bg-industrial-bg border border-industrial-border p-3 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-industrial-textMuted uppercase tracking-wider block">Tempo Médio</span>
              <span className="font-mono text-xl font-extrabold text-emerald-400">~{Math.floor(kpis.avgDurationSeconds / 60)} min</span>
            </div>
            <div className="bg-industrial-bg border border-industrial-border p-3 rounded-2xl text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-industrial-textMuted uppercase tracking-wider block">Fornos Ativos</span>
              <span className="font-mono text-xl font-extrabold text-industrial-accent">
                {Object.values(activeRoasts).filter(Boolean).length} / 3
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: 3 Ovens */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {([1, 2, 3] as OvenId[]).map(ovenId => (
          <OvenCard
            key={ovenId}
            ovenId={ovenId}
            session={activeRoasts[ovenId]}
            onStartRoast={handleStartRoast}
            onViewRoast={onNavigateToRoast}
          />
        ))}
      </div>

      {/* Assistant Recommendation Box */}
      <div className="bg-industrial-card border border-industrial-border rounded-2xl p-5 shadow-scada flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-extrabold text-sm text-white font-mono">RECOMENDAÇÃO DO ASSISTENTE DE PRODUÇÃO</h4>
          <p className="text-xs text-industrial-textSecondary mt-1 leading-relaxed">
            O <strong className="text-emerald-400">Forno 3</strong> apresentou a maior eficiência da semana (média de 9 min 50s por lote). O <strong className="text-rose-400">Forno 2</strong> necessita de inspeção por desvio de tempo habitual.
          </p>
        </div>
      </div>

      {/* Modal for Starting New Roast */}
      <NewRoastModal
        ovenId={selectedOvenForNewRoast}
        onClose={() => setSelectedOvenForNewRoast(null)}
        onRoastStarted={handleRoastStarted}
      />

    </div>
  );
};
