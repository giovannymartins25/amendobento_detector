import React from 'react';
import { OvenId, RoastSession } from '../../types/roast';
import { analyticsEngine } from '../../services/analyticsEngine';
import { formatSecondsToMMSS, getStageBadgeStyles, getStageLabel } from '../../utils/formatters';
import { Play, Eye, AlertCircle, Clock, User, Award, Flame } from 'lucide-react';

interface OvenCardProps {
  ovenId: OvenId;
  session: RoastSession | null;
  onStartRoast: (ovenId: OvenId) => void;
  onViewRoast: (ovenId: OvenId) => void;
}

export const OvenCard: React.FC<OvenCardProps> = ({
  ovenId,
  session,
  onStartRoast,
  onViewRoast,
}) => {
  const stats = analyticsEngine.getOvenStats(ovenId);
  const isRoasting = session && session.status === 'roasting';
  const isFirstRoastToday = analyticsEngine.isFirstRoastOfDay(ovenId, session?.startTime);

  const lastAnalysis = session && session.analyses.length > 0
    ? session.analyses[session.analyses.length - 1]
    : null;

  return (
    <div className={`relative bg-industrial-card border rounded-2xl p-5 shadow-scada transition-all hover:border-industrial-borderActive ${
      isRoasting
        ? 'border-emerald-500/60 bg-gradient-to-b from-industrial-card to-emerald-950/20 shadow-success-glow'
        : 'border-industrial-border'
    }`}>
      
      {/* Top Header: Oven Name + Status LED */}
      <div className="flex items-center justify-between border-b border-industrial-border pb-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-extrabold text-xl ${
            isRoasting
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'bg-industrial-bg text-industrial-textSecondary border border-industrial-border'
          }`}>
            F{ovenId}
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-white font-mono flex items-center gap-2">
              FORNO {ovenId}
              {stats.isMaintenanceRequired && (
                <span title="Manutenção Preditiva Requerida" className="inline-flex">
                  <AlertCircle className="w-4 h-4 text-rose-400 animate-pulse" />
                </span>
              )}
            </h3>
            <p className="text-xs text-industrial-textMuted">
              {stats.totalRoasts} torras realizadas • Média ~{Math.floor((stats.avgDurationSeconds + (isFirstRoastToday ? 300 : 0)) / 60)}m
            </p>
          </div>
        </div>

        {/* Status Badge LED */}
        <div className="flex items-center gap-2">
          {isRoasting ? (
            <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/50 px-3 py-1 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-bold text-emerald-400 tracking-wider">EM TORRA</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-industrial-bg border border-industrial-border px-3 py-1 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
              <span className="text-xs font-semibold text-industrial-textMuted tracking-wider">PARADO</span>
            </div>
          )}
        </div>
      </div>

      {/* 1st Roast of the day indicator */}
      {isFirstRoastToday && (
        <div className="mb-3 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>1ª Torra do dia (Forno Frio)</span>
          </div>
          <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-200">+5 min est.</span>
        </div>
      )}

      {/* Center Display: Timer & Active Operator */}
      <div className="space-y-4 mb-5">
        <div className="bg-industrial-bg/80 border border-industrial-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-industrial-textMuted uppercase tracking-wider mb-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-industrial-accent" />
              Tempo da Torra
            </div>
            <div className={`font-mono text-3xl font-extrabold tracking-tight ${
              isRoasting ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'text-industrial-textMuted'
            }`}>
              {isRoasting ? formatSecondsToMMSS(session.durationSeconds) : '00:00'}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-bold text-industrial-textMuted uppercase tracking-wider mb-0.5 flex items-center justify-end gap-1">
              <User className="w-3 h-3 text-blue-400" />
              Operador
            </div>
            <div className="text-sm font-bold text-white">
              {isRoasting ? session.operatorName : 'Nenhum'}
            </div>
          </div>
        </div>

        {/* Last Analysis Badge */}
        {isRoasting && lastAnalysis && (
          <div className="flex items-center justify-between bg-industrial-cardHover p-2.5 rounded-xl border border-industrial-border">
            <span className="text-xs text-industrial-textSecondary flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              Última Análise Roboflow:
            </span>
            {(() => {
              const styles = getStageBadgeStyles(lastAnalysis.stage);
              return (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${styles.bg} ${styles.text} ${styles.border}`}>
                  {getStageLabel(lastAnalysis.stage)} ({lastAnalysis.confidence}%)
                </span>
              );
            })()}
          </div>
        )}

        {/* Maintenance Alert Notification Badge if present */}
        {stats.isMaintenanceRequired && (
          <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-600/40 text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>Manutenção recomendada: Forno &gt;15% mais lento que a média.</span>
          </div>
        )}
      </div>

      {/* Bottom Primary Action Button */}
      <div>
        {isRoasting ? (
          <button
            onClick={() => onViewRoast(ovenId)}
            className="w-full h-14 bg-gradient-to-r from-industrial-accent to-blue-600 hover:from-blue-600 hover:to-indigo-600 text-white font-extrabold rounded-xl shadow-scada-glow flex items-center justify-center gap-3 text-base tracking-wide active:scale-98 transition-all"
          >
            <Eye className="w-6 h-6" />
            👁 ACOMPANHAR TORRA
          </button>
        ) : (
          <button
            onClick={() => onStartRoast(ovenId)}
            className="w-full h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl shadow-success-glow flex items-center justify-center gap-3 text-base tracking-wide active:scale-98 transition-all"
          >
            <Play className="w-6 h-6 fill-current" />
            ▶ INICIAR TORRA
          </button>
        )}
      </div>

    </div>
  );
};
