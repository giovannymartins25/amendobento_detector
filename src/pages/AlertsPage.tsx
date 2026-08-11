import React, { useState } from 'react';
import { useRoast } from '../contexts/RoastContext';
import { PredictiveAlert } from '../types/roast';
import { formatDateTime } from '../utils/formatters';
import { Bell, AlertTriangle, CheckCircle2, Info, Trash2, Check, Filter } from 'lucide-react';
import { ConfirmModal } from '../components/common/ConfirmModal';

interface AlertsPageProps {
  onNavigateToOven?: (ovenId: number) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ onNavigateToOven }) => {
  const { alerts, dismissAlert, ovens } = useRoast();
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  const filteredAlerts = alerts.filter(alert => {
    if (filterSeverity === 'all') return true;
    return alert.severity === filterSeverity;
  });

  const getSeverityBadge = (severity: PredictiveAlert['severity']) => {
    switch (severity) {
      case 'danger':
        return {
          bg: 'bg-rose-950/80 border-rose-600/60 text-rose-200',
          icon: <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 animate-bounce" />,
          label: 'CRÍTICO / MANUTENÇÃO',
        };
      case 'warning':
        return {
          bg: 'bg-amber-950/80 border-amber-500/60 text-amber-200',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />,
          label: 'ATENÇÃO',
        };
      case 'success':
        return {
          bg: 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
          label: 'PONTO IDEAL / SUCESSO',
        };
      default:
        return {
          bg: 'bg-blue-950/80 border-blue-600/60 text-blue-200',
          icon: <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />,
          label: 'INFORMAÇÃO',
        };
    }
  };

  const handleConfirmClearAll = () => {
    alerts.forEach(a => dismissAlert(a.id));
    setIsConfirmClearOpen(false);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Page Header */}
      <div className="bg-industrial-card border border-industrial-border rounded-3xl p-6 shadow-scada flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-industrial-card via-industrial-card to-amber-950/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-scada-glow">
            <Bell className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white font-mono tracking-tight flex items-center gap-3">
              CENTRAL DE AVISOS E NOTIFICAÇÕES
              {alerts.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-amber-500 text-slate-950 font-black">
                  {alerts.length}
                </span>
              )}
            </h2>
            <p className="text-xs text-industrial-textSecondary">
              Histórico completo de alertas preditivos, manutenções e acompanhamento de torra
            </p>
          </div>
        </div>

        {alerts.length > 0 && (
          <button
            onClick={() => setIsConfirmClearOpen(true)}
            className="px-4 py-2.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-600/50 text-rose-300 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            Limpar Todos os Avisos
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-industrial-card p-3 rounded-2xl border border-industrial-border">
        <div className="flex items-center gap-2 text-xs font-bold text-industrial-textMuted uppercase tracking-wider px-2">
          <Filter className="w-4 h-4 text-industrial-accent" />
          <span>Filtrar por Severidade:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterSeverity('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterSeverity === 'all'
                ? 'bg-industrial-accent text-white shadow-scada-glow'
                : 'bg-industrial-bg text-industrial-textSecondary hover:text-white'
            }`}
          >
            Todos ({alerts.length})
          </button>
          <button
            onClick={() => setFilterSeverity('danger')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterSeverity === 'danger'
                ? 'bg-rose-600 text-white shadow-danger-glow'
                : 'bg-industrial-bg text-rose-300 hover:text-white'
            }`}
          >
            Críticos ({alerts.filter(a => a.severity === 'danger').length})
          </button>
          <button
            onClick={() => setFilterSeverity('warning')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterSeverity === 'warning'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-industrial-bg text-amber-300 hover:text-white'
            }`}
          >
            Alertas ({alerts.filter(a => a.severity === 'warning').length})
          </button>
          <button
            onClick={() => setFilterSeverity('success')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterSeverity === 'success'
                ? 'bg-emerald-600 text-white shadow-success-glow'
                : 'bg-industrial-bg text-emerald-300 hover:text-white'
            }`}
          >
            Concluídos ({alerts.filter(a => a.severity === 'success').length})
          </button>
        </div>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-industrial-card/40 border border-dashed border-industrial-border rounded-3xl p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white font-mono">Nenhum aviso pendente no momento</h3>
          <p className="text-xs text-industrial-textMuted max-w-md mx-auto">
            Todos os parâmetros operacionais da fábrica estão operando dentro do esperado. Novos alertas aparecerão aqui automaticamente.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map(alert => {
            const badge = getSeverityBadge(alert.severity);
            const oven = ovens.find(o => o.id === alert.ovenId);
            const ovenName = oven ? oven.name : `Forno ${alert.ovenId}`;

            return (
              <div
                key={alert.id}
                className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-scada transition-all ${badge.bg}`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-slate-950/40 border border-white/10 mt-0.5">
                    {badge.icon}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-950/60 text-[10px] font-mono font-bold uppercase tracking-wider text-white border border-white/10">
                        {ovenName}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                        • {badge.label}
                      </span>
                      <span className="text-[11px] opacity-60 font-mono">
                        {formatDateTime(new Date(alert.timestamp))}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-base text-white tracking-tight leading-snug">
                      {alert.title}
                    </h4>
                    <p className="text-xs opacity-90 leading-relaxed max-w-3xl">
                      {alert.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0 pt-2 md:pt-0">
                  {onNavigateToOven && (
                    <button
                      onClick={() => onNavigateToOven(alert.ovenId)}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-xl transition-colors"
                    >
                      Ver Forno
                    </button>
                  )}
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="p-2 bg-black/30 hover:bg-black/50 text-white/80 hover:text-white rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold"
                    title="Dispensar aviso"
                  >
                    <Check className="w-4 h-4" />
                    <span>Dispensar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Clearing All Alerts */}
      <ConfirmModal
        isOpen={isConfirmClearOpen}
        title="Limpar Todos os Avisos"
        message="Deseja realmente remover todos os avisos da lista? Os alertas não serão mais visíveis nesta tela."
        variant="warning"
        confirmText="Limpar Todos"
        cancelText="Cancelar"
        onConfirm={handleConfirmClearAll}
        onCancel={() => setIsConfirmClearOpen(false)}
      />

    </div>
  );
};
