import React, { useState, useEffect } from 'react';
import { useRoast } from '../contexts/RoastContext';
import { analyticsEngine } from '../services/analyticsEngine';
import { audioAlarmService } from '../services/audioAlarmService';
import { formatSecondsToMMSS, formatDateTime, getStageBadgeStyles, getStageLabel } from '../utils/formatters';
import { OvenId } from '../types/roast';
import { Tv, User, Award, Bell, BellOff, AlertTriangle, Flame, Eye } from 'lucide-react';

interface KioskTvPageProps {
  onNavigateToRoast?: (ovenId: OvenId) => void;
}

export const KioskTvPage: React.FC<KioskTvPageProps> = ({ onNavigateToRoast }) => {
  const { ovens, activeRoasts } = useRoast();
  const [now, setNow] = useState(new Date());
  const [isAudioMuted, setIsAudioMuted] = useState(audioAlarmService.getIsMuted());

  const activeOvens = ovens.filter(o => o.status === 'active' && (o.isVisibleOnBoard || activeRoasts[o.id]?.status === 'roasting'));

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unlockAudio = () => {
      audioAlarmService.initContext();
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  const toggleMute = () => {
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);
    audioAlarmService.setMuted(nextMuted);
    if (!nextMuted) {
      audioAlarmService.initContext();
    }
  };

  // Check if any roasting oven is near ideal completion (Forno 1: 55m, Forno 2: 50s before 60s total, others: 120s before total)
  const anyOvenNearCompletion = activeOvens.some(oven => {
    const session = activeRoasts[oven.id];
    if (!session || session.status !== 'roasting') return false;

    if (oven.id === 1) {
      return session.durationSeconds >= 3300 && session.durationSeconds < 4200;
    }

    const estimate = analyticsEngine.getPredictiveEstimate(oven.id, session.durationSeconds, session.startTime);
    const alertThreshold = oven.id === 2 ? 50 : 120;
    const isTimeNear = session.durationSeconds >= (estimate.estimatedTotalDurationSeconds - alertThreshold);

    const lastAnalysis = session.analyses.length > 0
      ? session.analyses[session.analyses.length - 1]
      : null;

    const isStageNear = lastAnalysis?.stage === 'quase' || lastAnalysis?.stage === 'ideal';

    return isTimeNear || isStageNear;
  });

  // Check if any oven is at critical urgent red stage (Forno 1: 1h 10m / 4200s, Forno 2: 10s or less)
  const anyOvenUrgentRed = activeOvens.some(oven => {
    const session = activeRoasts[oven.id];
    if (!session || session.status !== 'roasting') return false;
    if (oven.id === 1) {
      return session.durationSeconds >= 4200;
    }
    const estimate = analyticsEngine.getPredictiveEstimate(oven.id, session.durationSeconds, session.startTime);
    return oven.id === 2 && estimate.remainingSeconds <= 10;
  });

  // Control alarm sound (Urgent loud alarm vs Standard alarm)
  useEffect(() => {
    if (isAudioMuted) {
      audioAlarmService.stopAlarm();
      return;
    }

    if (anyOvenUrgentRed) {
      audioAlarmService.startUrgentAlarmPattern();
    } else if (anyOvenNearCompletion) {
      audioAlarmService.startAlarmPattern();
    } else {
      audioAlarmService.stopAlarm();
    }

    return () => {
      audioAlarmService.stopAlarm();
    };
  }, [anyOvenNearCompletion, anyOvenUrgentRed, isAudioMuted]);

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
              PAINEL GERAL DA PRODUÇÃO
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
                : anyOvenUrgentRed
                  ? 'bg-rose-500/30 border-rose-500 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.6)] animate-pulse'
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
                <span>ALARME: ATIVADO {anyOvenUrgentRed ? '(SOM ALTO URGENTE)' : ''}</span>
              </>
            )}
          </button>

          <div className="bg-industrial-bg border border-industrial-border px-5 py-2 rounded-2xl text-right">
            <div className="text-[10px] font-bold text-industrial-textMuted uppercase tracking-wider">HORÁRIO DA FÁBRICA</div>
            <div className="font-mono text-xl font-bold text-white">{formatDateTime(now)}</div>
          </div>
        </div>
      </div>

      {/* Visual Alarm Banner on Painel TV when near completion or urgent red */}
      {anyOvenUrgentRed ? (
        <div className="bg-rose-950/95 border-2 border-rose-500 text-rose-200 p-4 sm:p-5 rounded-3xl flex items-center justify-between gap-4 shadow-[0_0_60px_rgba(244,63,94,0.8)] animate-pulse">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <AlertTriangle className="w-9 h-9 text-rose-400 animate-bounce shrink-0" />
            <div>
              <h3 className="font-mono font-black text-xl text-rose-100 uppercase tracking-wider">
                🚨 ALERTA VERMELHO CRÍTICO NO PAINEL
              </h3>
              <p className="text-xs text-rose-300 font-bold mt-0.5">
                {activeRoasts[1]?.status === 'roasting' && activeRoasts[1].durationSeconds >= 4200
                  ? 'Atenção máxima! Forno 1 atingiu 1h e 10 min de torra (Alerta Vermelho).'
                  : 'Atenção máxima! Forno 2 atingiu a contagem regressiva final do ponto de torra.'}
              </p>
            </div>
          </div>
        </div>
      ) : anyOvenNearCompletion ? (
        <div className="bg-amber-950/90 border-2 border-amber-500 text-amber-300 p-4 sm:p-5 rounded-3xl flex items-center justify-between gap-4 shadow-[0_0_40px_rgba(245,158,11,0.6)] animate-pulse">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <AlertTriangle className="w-8 h-8 text-amber-400 animate-bounce shrink-0" />
            <div>
              <h3 className="font-mono font-black text-lg text-amber-200 uppercase tracking-wider">
                ⚠️ ALERTA AMARELO DE TORRA PRÓXIMA DO PONTO
              </h3>
              <p className="text-xs text-amber-300 font-medium mt-0.5">
                {activeRoasts[1]?.status === 'roasting' && activeRoasts[1].durationSeconds >= 3300 && activeRoasts[1].durationSeconds < 4200
                  ? 'Aviso disparado! Forno 1 atingiu 55 minutos de torra (ponto ideal: 1h a 1h15).'
                  : activeRoasts[2]?.status === 'roasting' && activeRoasts[2].durationSeconds >= 10
                    ? 'Aviso disparado! Forno 2 com aviso ativado (faltando 50s no modo teste de 1 min).'
                    : 'Aviso disparado! Torra próxima do ponto de conclusão.'}
              </p>
            </div>
          </div>
        </div>
      ) : null}

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
          const remainingSeconds = estimate.remainingSeconds;

          const isUrgentRed = isRoasting && (
            ovenId === 1 ? session.durationSeconds >= 4200 :
            ovenId === 2 ? remainingSeconds <= 10 : false
          );

          const alertThreshold = ovenId === 2 ? 50 : 120;
          const lastAnalysis = session && session.analyses.length > 0
            ? session.analyses[session.analyses.length - 1]
            : null;

          const isTimeNear = isRoasting && session.durationSeconds >= (estimate.estimatedTotalDurationSeconds - alertThreshold);
          const isStageNear = lastAnalysis?.stage === 'quase' || lastAnalysis?.stage === 'ideal';

          const isNearCompletion = isRoasting && !isUrgentRed && (
            ovenId === 1 ? session.durationSeconds >= 3300 :
            ovenId === 2 ? session.durationSeconds >= (estimate.estimatedTotalDurationSeconds - 50) :
            (isTimeNear || isStageNear)
          );

          return (
            <div
              key={ovenId}
              className={`bg-industrial-card border rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-6 transition-all ${
                isUrgentRed
                  ? 'border-2 border-rose-500 bg-gradient-to-b from-rose-950/70 via-industrial-card to-industrial-card shadow-[0_0_50px_rgba(244,63,94,0.8)] animate-pulse'
                  : isNearCompletion
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
                    isUrgentRed
                      ? 'bg-rose-500/30 text-rose-300 border border-rose-500/60 animate-bounce'
                      : isNearCompletion
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
                {isUrgentRed ? (
                  <div className="flex items-center gap-2 bg-rose-950/95 border border-rose-500/90 px-3.5 py-1.5 rounded-full">
                    <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-xs font-black text-rose-300 tracking-wider">
                      {ovenId === 1 ? '🔴 ALERTA VERMELHO (1h10m)' : '🔴 URGENTE: FALTA 10s!'}
                    </span>
                  </div>
                ) : isNearCompletion ? (
                  <div className="flex items-center gap-2 bg-amber-950/90 border border-amber-500/80 px-3.5 py-1.5 rounded-full">
                    <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-xs font-black text-amber-300 tracking-wider">
                      {ovenId === 1 ? '🟡 ALERTA AMARELO (55m)' : 'QUASE PRONTO!'}
                    </span>
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
                  isUrgentRed
                    ? 'text-rose-400 drop-shadow-[0_0_25px_rgba(244,63,94,0.8)]'
                    : isNearCompletion
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

                {isUrgentRed ? (
                  <div className="mt-2 text-xs font-black text-rose-300 flex items-center justify-center gap-1.5 font-mono animate-pulse">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    {ovenId === 1
                      ? '🚨 ALERTA VERMELHO: FORNO 1 ATINGIU 1H E 10 MIN!'
                      : `🚨 CRÍTICO: FALTA APENAS ${Math.max(0, remainingSeconds)} SEGUNDOS!`
                    }
                  </div>
                ) : isNearCompletion ? (
                  <div className="mt-2 text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5 font-mono animate-pulse">
                    <AlertTriangle className="w-4 h-4" />
                    {ovenId === 1
                      ? '⚠️ ALERTA AMARELO: FORNO 1 ATINGIU 55 MINUTOS (PONTO IDEAL: 1H A 1H 15MIN)'
                      : ovenId === 2
                        ? `ATENÇÃO: FALTA ~${Math.max(0, remainingSeconds)} SEGUNDOS (FORNO 2 MODO TESTE 1 MIN)`
                        : `ATENÇÃO: FALTA ~${Math.ceil(remainingSeconds / 60)} MINUTOS (ESTIMATIVA AJUSTADA)`
                    }
                  </div>
                ) : null}
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

              {/* Action Button: Visualizar Torra (Active Roast Page) */}
              {isRoasting && onNavigateToRoast && (
                <button
                  onClick={() => onNavigateToRoast(ovenId)}
                  className="w-full py-3.5 bg-gradient-to-r from-industrial-accent to-blue-600 hover:from-blue-600 hover:to-indigo-600 text-white font-extrabold text-xs rounded-2xl shadow-scada-glow flex items-center justify-center gap-2 uppercase tracking-wider transition-all active:scale-98"
                >
                  <Eye className="w-4 h-4" />
                  <span>👁 Visualizar Torra (Forno {ovenId})</span>
                </button>
              )}

            </div>
          );
        })}
      </div>
    )}

    </div>
  );
};
