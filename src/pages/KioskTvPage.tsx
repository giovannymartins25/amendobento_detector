import React, { useState, useEffect } from 'react';
import { useRoast } from '../contexts/RoastContext';
import { OvenId } from '../types/roast';
import { formatSecondsToMMSS, formatDateTime, getStageBadgeStyles, getStageLabel } from '../utils/formatters';
import { Tv, User, Award } from 'lucide-react';

export const KioskTvPage: React.FC = () => {
  const { activeRoasts } = useRoast();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6 pb-16">
      
      {/* Kiosk Header */}
      <div className="bg-industrial-card border border-industrial-border rounded-3xl p-6 shadow-scada flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-success-glow">
            <Tv className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white font-mono tracking-tight flex items-center gap-3">
              PAINEL GERAL DA PRODUÇÃO — CHÃO DE FÁBRICA
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping inline-block" />
            </h2>
            <p className="text-xs text-industrial-textSecondary">Monitoramento em tempo real dos 3 Fornos de Torração</p>
          </div>
        </div>

        <div className="bg-industrial-bg border border-industrial-border px-5 py-2.5 rounded-2xl text-right">
          <div className="text-[10px] font-bold text-industrial-textMuted uppercase tracking-wider">HORÁRIO DA FÁBRICA</div>
          <div className="font-mono text-xl font-bold text-white">{formatDateTime(now)}</div>
        </div>
      </div>

      {/* Grid of 3 Ovens Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {([1, 2, 3] as OvenId[]).map(ovenId => {
          const session = activeRoasts[ovenId];
          const isRoasting = session && session.status === 'roasting';

          const lastAnalysis = session && session.analyses.length > 0
            ? session.analyses[session.analyses.length - 1]
            : null;

          return (
            <div
              key={ovenId}
              className={`bg-industrial-card border rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-6 transition-all ${
                isRoasting
                  ? 'border-emerald-500/60 bg-gradient-to-b from-industrial-card to-emerald-950/20 shadow-success-glow'
                  : 'border-industrial-border'
              }`}
            >
              {/* Top Oven Badge */}
              <div className="flex items-center justify-between border-b border-industrial-border pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono font-black text-2xl ${
                    isRoasting ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-industrial-bg text-industrial-textMuted border border-industrial-border'
                  }`}>
                    F{ovenId}
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-white font-mono">FORNO {ovenId}</h3>
                    <div className="text-xs text-industrial-textMuted flex items-center gap-1.5 mt-0.5">
                      <User className="w-3.5 h-3.5 text-blue-400" />
                      <span>{isRoasting ? session.operatorName : 'Nenhum Operador'}</span>
                    </div>
                  </div>
                </div>

                {/* Status LED */}
                {isRoasting ? (
                  <div className="flex items-center gap-2 bg-emerald-950/90 border border-emerald-500/60 px-3.5 py-1.5 rounded-full">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-black text-emerald-400 tracking-wider">TORRANDO</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-industrial-bg border border-industrial-border px-3.5 py-1.5 rounded-full">
                    <span className="w-3 h-3 rounded-full bg-slate-600" />
                    <span className="text-xs font-bold text-industrial-textMuted tracking-wider">PARADO</span>
                  </div>
                )}
              </div>

              {/* Giant Digital Stopwatch */}
              <div className="bg-industrial-bg border border-industrial-border p-6 rounded-2xl text-center space-y-1">
                <span className="text-xs font-bold text-industrial-textMuted uppercase tracking-wider block">TEMPO DE CORRIDO</span>
                <span className={`font-mono text-5xl sm:text-6xl font-black tracking-tight ${
                  isRoasting ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'text-industrial-textMuted'
                }`}>
                  {isRoasting ? formatSecondsToMMSS(session.durationSeconds) : '00:00'}
                </span>
              </div>

              {/* Latest AI Classification Badge */}
              <div className="bg-industrial-cardHover p-4 rounded-2xl border border-industrial-border min-h-[70px] flex items-center justify-between">
                <span className="text-xs text-industrial-textSecondary font-bold flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-400" />
                  Classificação Roboflow:
                </span>
                {isRoasting && lastAnalysis ? (
                  (() => {
                    const styles = getStageBadgeStyles(lastAnalysis.stage);
                    return (
                      <span className={`text-sm font-extrabold px-3 py-1.5 rounded-xl border ${styles.bg} ${styles.text} ${styles.border}`}>
                        {getStageLabel(lastAnalysis.stage)} ({lastAnalysis.confidence}%)
                      </span>
                    );
                  })()
                ) : (
                  <span className="text-xs text-industrial-textMuted italic">Aguardando...</span>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
