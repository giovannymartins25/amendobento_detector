import React, { useState } from 'react';
import { useRoast } from '../contexts/RoastContext';
import { useAuth } from '../contexts/AuthContext';
import { OvenId } from '../types/roast';
import { OvenCard } from '../components/oven/OvenCard';
import { NewRoastModal } from '../components/oven/NewRoastModal';
import { SelectOvenModal } from '../components/oven/SelectOvenModal';
import { analyticsEngine } from '../services/analyticsEngine';
import { Flame, ChevronDown, ChevronUp, BarChart2, Award, Play } from 'lucide-react';

interface DashboardPageProps {
  onNavigateToRoast: (ovenId: OvenId) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateToRoast }) => {
  const { ovens, activeRoasts } = useRoast();
  const { isAdmin } = useAuth();

  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [selectedOvenForNewRoast, setSelectedOvenForNewRoast] = useState<OvenId | null>(null);
  const [showStats, setShowStats] = useState(false);

  // Ovens active in circulation (configured in Gerenciar Fornos)
  const circulatingOvens = ovens.filter(o => o.status === 'active');
  const roastingOvens = circulatingOvens.filter(o => activeRoasts[o.id]?.status === 'roasting');
  const idleOvens = circulatingOvens.filter(o => activeRoasts[o.id]?.status !== 'roasting');

  const kpis = analyticsEngine.getGlobalKpis();

  const handleStartRoastForOven = (ovenId: OvenId) => {
    setSelectedOvenForNewRoast(ovenId);
  };

  const handleSelectOvenFromModal = (ovenId: OvenId) => {
    setIsSelectModalOpen(false);
    setSelectedOvenForNewRoast(ovenId);
  };

  const handleRoastStarted = (ovenId: OvenId) => {
    onNavigateToRoast(ovenId);
  };

  return (
    <div className="space-y-6 pb-24 max-w-6xl mx-auto">
      
      {/* Top Header + Main Start Roast Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-industrial-border/60 pb-4">
        <div>
          <h2 className="text-2xl font-black text-white font-mono tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-industrial-accent" />
            FORNOS DE TORRA
          </h2>
          <p className="text-xs text-industrial-textMuted mt-0.5">
            {roastingOvens.length > 0
              ? `${roastingOvens.length} torra(s) em andamento no momento`
              : 'Nenhuma torra em andamento. Clique em Iniciar Torra para escolher um forno.'}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Primary Action Button: Iniciar Torra */}
          {idleOvens.length > 0 && (
            <button
              onClick={() => setIsSelectModalOpen(true)}
              className="flex-1 sm:flex-none px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-2xl shadow-success-glow flex items-center justify-center gap-2.5 uppercase tracking-wider active:scale-98 transition-all shrink-0"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{roastingOvens.length > 0 ? '+ Iniciar Outra Torra' : '▶ Iniciar Torra'}</span>
            </button>
          )}

          {/* Admin Optional Toggle Button for Extra Info */}
          {isAdmin && (
            <button
              onClick={() => setShowStats(!showStats)}
              className="px-3.5 py-3.5 bg-industrial-card hover:bg-industrial-cardHover border border-industrial-border text-industrial-textSecondary hover:text-white text-xs font-bold rounded-2xl flex items-center gap-2 transition-all shrink-0"
            >
              <BarChart2 className="w-4 h-4 text-industrial-accent" />
              <span>{showStats ? 'Ocultar Resumo' : 'Resumo'}</span>
              {showStats ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Admin Optional Collapsible Stats Panel */}
      {isAdmin && showStats && (
        <div className="bg-industrial-card border border-industrial-border rounded-3xl p-5 shadow-2xl space-y-4 animate-scale-up">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-industrial-bg border border-industrial-border p-3.5 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-industrial-textMuted uppercase tracking-wider block">Torras Hoje</span>
              <span className="font-mono text-2xl font-black text-white">{kpis.totalRoasts}</span>
            </div>
            <div className="bg-industrial-bg border border-industrial-border p-3.5 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-industrial-textMuted uppercase tracking-wider block">Tempo Médio</span>
              <span className="font-mono text-2xl font-black text-emerald-400">~{Math.floor(kpis.avgDurationSeconds / 60)} min</span>
            </div>
            <div className="bg-industrial-bg border border-industrial-border p-3.5 rounded-2xl text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-industrial-textMuted uppercase tracking-wider block">Fornos em Torra</span>
              <span className="font-mono text-2xl font-black text-industrial-accent">
                {roastingOvens.length} / {circulatingOvens.length}
              </span>
            </div>
          </div>

          <div className="bg-industrial-bg/60 p-3 rounded-2xl border border-industrial-border text-xs text-industrial-textSecondary flex items-center gap-3">
            <Award className="w-5 h-5 text-purple-400 shrink-0" />
            <span>
              <strong className="text-emerald-400">Forno 1</strong> lidera a eficiência semanal. <strong className="text-rose-400">Forno 2</strong> exige verificação de tempo.
            </span>
          </div>
        </div>
      )}

      {/* Content Area */}
      {circulatingOvens.length === 0 ? (
        <div className="bg-industrial-card/40 border border-dashed border-industrial-border rounded-3xl p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <Flame className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white font-mono">Nenhum forno em circulação no momento</h3>
          <p className="text-xs text-industrial-textMuted max-w-sm mx-auto">
            Acesse a página "Gerenciar Fornos" para colocar equipamentos em circulação.
          </p>
        </div>
      ) : roastingOvens.length === 0 ? (
        /* Empty State: No roasts running, big call to action */
        <div className="bg-industrial-card border border-industrial-border rounded-3xl p-10 text-center space-y-5 shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 mx-auto flex items-center justify-center shadow-success-glow">
            <Flame className="w-10 h-10 text-white animate-pulse" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-xl font-extrabold text-white font-mono">NENHUMA TORRA EM ANDAMENTO</h3>
            <p className="text-xs text-industrial-textMuted">
              Selecione um forno para iniciar a torra de amendoim. O monitoramento será exibido automaticamente no Painel TV.
            </p>
          </div>

          <button
            onClick={() => setIsSelectModalOpen(true)}
            className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base rounded-2xl shadow-success-glow inline-flex items-center gap-3 uppercase tracking-wider active:scale-98 transition-all"
          >
            <Play className="w-6 h-6 fill-current" />
            ▶ INICIAR TORRA AGORA
          </button>
        </div>
      ) : (
        /* Active Roasts Display */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              TORRAS EM ANDAMENTO ({roastingOvens.length})
            </h3>
          </div>

          <div className={`grid gap-6 ${roastingOvens.length === 1 ? 'grid-cols-1 max-w-xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {roastingOvens.map(oven => (
              <OvenCard
                key={oven.id}
                ovenId={oven.id}
                session={activeRoasts[oven.id]}
                onStartRoast={handleStartRoastForOven}
                onViewRoast={onNavigateToRoast}
              />
            ))}
          </div>
        </div>
      )}

      {/* Select Oven Modal */}
      <SelectOvenModal
        isOpen={isSelectModalOpen}
        availableOvens={idleOvens}
        onClose={() => setIsSelectModalOpen(false)}
        onSelectOven={handleSelectOvenFromModal}
      />

      {/* Modal for Starting New Roast */}
      <NewRoastModal
        ovenId={selectedOvenForNewRoast}
        onClose={() => setSelectedOvenForNewRoast(null)}
        onRoastStarted={handleRoastStarted}
      />

    </div>
  );
};
