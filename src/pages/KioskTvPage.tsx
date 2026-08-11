import React, { useState, useEffect } from 'react';
import { useRoast } from '../contexts/RoastContext';
import { analyticsEngine } from '../services/analyticsEngine';
import { audioAlarmService } from '../services/audioAlarmService';
import { formatSecondsToMMSS, formatDateTime, getStageBadgeStyles, getStageLabel } from '../utils/formatters';
import { Tv, User, Award, Bell, BellOff, AlertTriangle, Flame } from 'lucide-react';

export const KioskTvPage: React.FC = () => {
  const { ovens, activeRoasts } = useRoast();
  const [now, setNow] = useState(new Date());
  const [isAudioMuted, setIsAudioMuted] = useState(audioAlarmService.getIsMuted());

  const activeOvens = ovens.filter(o => o.status === 'active' && (o.isVisibleOnBoard || activeRoasts[o.id]?.status === 'roasting'));

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleMute = () => {
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);
    audioAlarmService.setMuted(nextMuted);
  };

  // Check if any roasting oven is near ideal completion (e.g. within 2 min or stage 'quase' / 'ideal')
  const anyOvenNearCompletion = activeOvens.some(oven => {
    const session = activeRoasts[oven.id];
    if (!session || session.status !== 'roasting') return false;

    const stats = analyticsEngine.getOvenStats(oven.id);
    const avgDuration = stats.avgDurationSeconds || 600;
    const isTimeNear = session.durationSeconds >= (avgDuration - 120);

    const lastAnalysis = session.analyses.length > 0
      ? session.analyses[session.analyses.length - 1]
      : null;

    const isStageNear = lastAnalysis?.stage === 'quase' || lastAnalysis?.stage === 'ideal';

    return isTimeNear || isStageNear;
  });

  // Control alarm sound
  useEffect(() => {
    if (anyOvenNearCompletion && !isAudioMuted) {
      audioAlarmService.startAlarmPattern();
    } else {
      audioAlarmService.stopAlarm();
    }

    return () => {
      audioAlarmService.stopAlarm();
    };
  }, [anyOvenNearCompletion, isAudioMuted]);

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
            <p className="text-xs text-industrial-textSecondary">Monitoramento em tempo real dos fornos de torração</p>
          </div>
        </div>

        {/* Audio Alarm Toggle & Clock */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={toggleMute}
            className={`px-4 py-2.5 rounded-2xl border font-mono font-bold text-xs flex items-center gap-2 transition-all ${
              isAudioMuted
                ? 'bg-industrial-bg border-industrial-border text-industrial-textMuted hover:text-white'
                : 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse'
            }`}
          >
            {isAudioMuted ? (
              <>
                <BellOff className="w-4 h-4 text-slate-400" />
                <span>ALARME: MUTADO</span>
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
                <span>ALARME: ATIVADO</span>
              </>
            )}
          </button>

          <div className="bg-industrial-bg border border-industrial-border px-5 py-2 rounded-2xl text-right">
            <div className="text-[10px] font-bold text-industrial-textMuted uppercase tracking-wider">HORÁRIO DA FÁBRICA</div>
            <div className="font-mono text-xl font-bold text-white">{formatDateTime(now)}</div>
          </div>
        </div>
      </div>

      {/* Grid of Ovens Side-by-Side */}
      {activeOvens.length === 0 ? (
        <div className="bg-industrial-card/40 border border-dashed border-industrial-border rounded-3xl p-16 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-industrial-card border border-industrial-border text-emerald-400 flex items-center justify-center mx-auto shadow-scada">
            <Tv className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white font-mono">NENHUMA TORRA EM ANDAMENTO NO MOMENTO</h3>
          <p className="text-xs text-industrial-textMuted max-w-md mx-auto">
            Assim que você iniciar a torra em qualquer forno no painel de controle, o monitoramento em tempo real aparecerá automaticamente nesta tela TV.
          </p>
        </div>
      ) : (
        <div className={`grid gap-6 ${
          activeOvens.length === 1
            ? 'grid-cols-1 max-w-3xl mx-auto'
            : activeOvens.length === 2
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-1 md:grid-cols-3'
        }`}>
          {activeOvens.map(oven => {
          const ovenId = oven.id;
          const session = activeRoasts[ovenId];
          const isRoasting = session && session.status === 'roasting';

          const estimate = analyticsEngine.getPredictiveEstimate(ovenId, session?.durationSeconds || 0, session?.startTime);
          const isTimeNear = isRoasting && session.durationSeconds >= (estimate.estimatedTotalDurationSeconds - 120);

          const lastAnalysis = session && session.analyses.length > 0
            ? session.analyses[session.analyses.length - 1]
            : null;

          const isStageNear = lastAnalysis?.stage === 'quase' || lastAnalysis?.stage === 'ideal';
          const isNearCompletion = isRoasting && (isTimeNear || isStageNear);

          return (
            <div
              key={ovenId}
              className={`bg-industrial-card border rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-6 transition-all ${
                isNearCompletion
                  ? 'border-2 border-amber-500 bg-gradient-to-b from-amber-950/40 via-industrial-card to-industrial-card shadow-[0_0_35px_rgba(245,158,11,0.6)] animate-pulse'
                  : isRoasting
                    ? 'border-emerald-500/60 bg-gradient-to-b from-industrial-card to-emerald-950/20 shadow-success-glow'
                    : 'border-industrial-border'
              }`}
            >
              {/* Top Oven Badge */}
              <div className="flex items-center justify-between border-b border-industrial-border pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono font-black text-2xl ${
                    isNearCompletion
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-500/60 animate-bounce'
                      : isRoasting
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-industrial-bg text-industrial-textMuted border border-industrial-border'
                  }`}>
                    F{ovenId}
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-white font-mono">{oven.name}</h3>
                    <div className="text-xs text-industrial-textMuted flex items-center gap-1.5 mt-0.5">
                      <User className="w-3.5 h-3.5 text-blue-400" />
                      <span>{isRoasting ? session.operatorName : 'Nenhum Operador'}</span>
                    </div>
                  </div>
                </div>

                {/* Status LED */}
                {isNearCompletion ? (
                  <div className="flex items-center gap-2 bg-amber-950/90 border border-amber-500/80 px-3.5 py-1.5 rounded-full">
                    <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-xs font-black text-amber-300 tracking-wider">QUASE PRONTO!</span>
                  </div>
                ) : isRoasting ? (
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
              <div className="bg-industrial-bg border border-industrial-border p-6 rounded-2xl text-center space-y-1 relative">
                <span className="text-xs font-bold text-industrial-textMuted uppercase tracking-wider block">TEMPO DECORRIDO</span>
                <span className={`font-mono text-5xl sm:text-6xl font-black tracking-tight ${
                  isNearCompletion
                    ? 'text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]'
                    : isRoasting
                      ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                      : 'text-industrial-textMuted'
                }`}>
                  {isRoasting ? formatSecondsToMMSS(session.durationSeconds) : '00:00'}
                </span>

                {estimate.isFirstRoastOfDay && isRoasting && (
                  <div className="mt-2 text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5 font-mono animate-pulse">
                    <Flame className="w-4 h-4 text-amber-400" />
                    1ª TORRA DO DIA — FORNO FRIO (+5 MIN PRÉ-AQUECIMENTO)
                  </div>
                )}

                {isNearCompletion && (
                  <div className="mt-2 text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5 font-mono animate-pulse">
                    <AlertTriangle className="w-4 h-4" />
                    ATENÇÃO: FALTA ~2 MINUTOS (ESTIMATIVA AJUSTADA)
                  </div>
                )}
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
    )}

    </div>
  );
};
