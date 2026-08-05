import React, { useState } from 'react';
import { useRoast } from '../contexts/RoastContext';
import { useAuth } from '../contexts/AuthContext';
import { OvenId } from '../types/roast';
import { OvenCard } from '../components/oven/OvenCard';
import { NewRoastModal } from '../components/oven/NewRoastModal';
import { analyticsEngine } from '../services/analyticsEngine';
import { Award, Zap, Flame, Settings, Power } from 'lucide-react';

interface DashboardPageProps {
  onNavigateToRoast: (ovenId: OvenId) => void;
  onNavigateToOvenMgmt?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateToRoast, onNavigateToOvenMgmt }) => {
  const { ovens, activeRoasts, toggleOvenVisibilityOnBoard } = useRoast();
  const { isAdmin } = useAuth();
  const [selectedOvenForNewRoast, setSelectedOvenForNewRoast] = useState<OvenId | null>(null);

  const circulatingOvens = ovens.filter(o => o.status === 'active');
  const visibleOvens = circulatingOvens.filter(o => o.isVisibleOnBoard || activeRoasts[o.id]?.status === 'roasting');
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
              Selecione um forno ativado para iniciar a torra ou acompanhe a classificação em tempo real.
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
              <span className="text-[10px] font-bold text-industrial-textMuted uppercase tracking-wider block">Fornos no Painel</span>
              <span className="font-mono text-xl font-extrabold text-industrial-accent">
                {visibleOvens.length} de {circulatingOvens.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Selection Control Bar for Ovens in Circulation */}
      {circulatingOvens.length > 0 && (
        <div className="bg-industrial-card border border-industrial-border rounded-2xl p-4 shadow-scada flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Power className="w-5 h-5 text-industrial-accent" />
            <div>
              <h3 className="text-xs font-mono font-extrabold text-white uppercase tracking-wider">
                SELEÇÃO DE FORNOS PARA OPERAÇÃO & PAINEL TV
              </h3>
              <p className="text-[11px] text-industrial-textMuted">
                Clique no forno desejado para exibi-lo no painel e liberá-lo para a torra
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {circulatingOvens.map(oven => {
              const isVisible = oven.isVisibleOnBoard || activeRoasts[oven.id]?.status === 'roasting';
              return (
                <button
                  key={oven.id}
                  onClick={() => toggleOvenVisibilityOnBoard(oven.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all active:scale-95 ${
                    isVisible
                      ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 shadow-success-glow hover:bg-emerald-500/30'
                      : 'bg-industrial-bg border border-industrial-border text-industrial-textMuted hover:text-white hover:border-slate-500'
                  }`}
                  title={isVisible ? `Ocultar ${oven.name} do painel` : `Exibir/Ativar ${oven.name} no painel`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${isVisible ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                  <span>{oven.name}</span>
                  <span className="text-[10px] opacity-75 font-sans uppercase">
                    {isVisible ? '(Ativo no Painel)' : '+ Ativar'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid: Active/Visible Ovens */}
      {circulatingOvens.length === 0 ? (
        <div className="bg-industrial-card/40 border border-dashed border-industrial-border rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <Flame className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white font-mono">Nenhum forno em circulação na fábrica</h3>
          <p className="text-xs text-industrial-textMuted max-w-md mx-auto">
            Acesse a aba &quot;Gerenciar Fornos&quot; para colocar fornos em circulação na fábrica.
          </p>
          {isAdmin && onNavigateToOvenMgmt && (
            <div className="pt-2 flex justify-center">
              <button
                onClick={onNavigateToOvenMgmt}
                className="px-4 py-2 bg-industrial-accent hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-scada-glow transition-all flex items-center gap-2 uppercase tracking-wider"
              >
                <Settings className="w-4 h-4" />
                Ir para Gerenciar Fornos
              </button>
            </div>
          )}
        </div>
      ) : visibleOvens.length === 0 ? (
        <div className="bg-industrial-card/40 border border-dashed border-industrial-border rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <Flame className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white font-mono">Nenhum forno ativado no painel no momento</h3>
          <p className="text-xs text-industrial-textMuted max-w-md mx-auto">
            Clique no botão do forno desejado na barra acima para ativá-lo no painel de operação e na TV.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-2">
            {circulatingOvens.map(o => (
              <button
                key={o.id}
                onClick={() => toggleOvenVisibilityOnBoard(o.id)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-success-glow transition-all flex items-center gap-1.5"
              >
                🟢 Exibir {o.name} no Painel
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className={`grid gap-6 ${visibleOvens.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {visibleOvens.map(oven => (
            <OvenCard
              key={oven.id}
              ovenId={oven.id}
              session={activeRoasts[oven.id]}
              onStartRoast={handleStartRoast}
              onViewRoast={onNavigateToRoast}
            />
          ))}
        </div>
      )}

      {/* Assistant Recommendation Box */}
      {isAdmin && (
        <div className="bg-industrial-card border border-industrial-border rounded-2xl p-5 shadow-scada flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-white font-mono">RECOMENDAÇÃO DO ASSISTENTE DE PRODUÇÃO</h4>
            <p className="text-xs text-industrial-textSecondary mt-1 leading-relaxed">
              O <strong className="text-emerald-400">Forno 1</strong> apresentou a maior eficiência da semana (média de 9 min 50s por lote). O <strong className="text-rose-400">Forno 2</strong> necessita de inspeção por desvio de tempo habitual.
            </p>
          </div>
        </div>
      )}

      {/* Modal for Starting New Roast */}
      <NewRoastModal
        ovenId={selectedOvenForNewRoast}
        onClose={() => setSelectedOvenForNewRoast(null)}
        onRoastStarted={handleRoastStarted}
      />

    </div>
  );
};
