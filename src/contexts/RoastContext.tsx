import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { RoastSession, OvenId, AnalysisResult, PredictiveAlert, RoastStage, OvenConfig } from '../types/roast';
import { storageService } from '../services/storageService';
import { analyticsEngine } from '../services/analyticsEngine';
import { getStageLabel } from '../utils/formatters';

interface RoastContextType {
  ovens: OvenConfig[];
  activeRoasts: Record<OvenId, RoastSession | null>;
  alerts: PredictiveAlert[];
  startRoast: (params: { ovenId: OvenId; operatorId: string; operatorName: string; targetQuantityKg?: number; notes?: string }) => void;
  finishRoast: (ovenId: OvenId) => void;
  addAnalysis: (ovenId: OvenId, analysis: Omit<AnalysisResult, 'id' | 'timestamp' | 'ovenId' | 'operatorName'>) => Promise<AnalysisResult>;
  recordHumanFeedback: (ovenId: OvenId, analysisId: string, feedback: 'agreed' | 'disagreed', correctedStage?: RoastStage) => void;
  getOvenSession: (ovenId: OvenId) => RoastSession | null;
  dismissAlert: (alertId: string) => void;
  refreshHistoricalData: () => void;
  addOven: (name: string, notes?: string) => void;
  toggleOvenStatus: (ovenId: OvenId) => void;
  deleteOven: (ovenId: OvenId) => void;
}

const RoastContext = createContext<RoastContextType | undefined>(undefined);

export const RoastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ovens, setOvens] = useState<OvenConfig[]>(() => storageService.getOvens());
  const [activeRoasts, setActiveRoasts] = useState<Record<OvenId, RoastSession | null>>(() => storageService.getActiveRoasts());
  const [alerts, setAlerts] = useState<PredictiveAlert[]>(() => storageService.getAlerts());

  // Save ovens on change
  useEffect(() => {
    storageService.saveOvens(ovens);
  }, [ovens]);

  // Save active roasts on change
  useEffect(() => {
    storageService.saveActiveRoasts(activeRoasts);
  }, [activeRoasts]);

  // Save alerts on change
  useEffect(() => {
    storageService.saveAlerts(alerts);
  }, [alerts]);

  // Real-time ticking for active roasts & predictive checks
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveRoasts(prev => {
        let updated = false;
        const nextState = { ...prev };

        ovens.filter(o => o.status === 'active').forEach(oven => {
          const ovenId = oven.id;
          const session = nextState[ovenId];
          if (session && session.status === 'roasting') {
            updated = true;
            const newDuration = session.durationSeconds + 1;

            // Check if photo reminder is needed (no analysis in last 150 seconds)
            const lastAnalysis = session.analyses[session.analyses.length - 1];
            const secondsSinceLastAnalysis = lastAnalysis
              ? newDuration - lastAnalysis.timeInRoastSeconds
              : newDuration;

            if (secondsSinceLastAnalysis === 150) {
              const reminderAlert: PredictiveAlert = {
                id: `reminder-${ovenId}-${Date.now()}`,
                timestamp: new Date().toISOString(),
                ovenId,
                severity: 'warning',
                title: `⚠️ Lembrete de Análise (${oven.name})`,
                message: `Torra em andamento há mais de 2.5 min sem nova captura de foto.`,
                read: false,
                type: 'photo_reminder',
              };
              setAlerts(currAlerts => [reminderAlert, ...currAlerts]);
            }

            // Check near completion alert (e.g. at ~80% average duration)
            const stats = analyticsEngine.getOvenStats(ovenId);
            const avgDuration = stats.avgDurationSeconds || 600;
            const timeRemaining = avgDuration - newDuration;

            if (timeRemaining <= 120 && timeRemaining > 118) {
              const nearIdealAlert: PredictiveAlert = {
                id: `near-ideal-${ovenId}-${Date.now()}`,
                timestamp: new Date().toISOString(),
                ovenId,
                severity: 'warning',
                title: `⏳ Torra Próxima do Ponto Ideal (${oven.name})`,
                message: `Faltam aproximadamente 2 minutos para atingir a média ideal (${Math.floor(avgDuration / 60)} min).`,
                read: false,
                type: 'delay',
              };
              setAlerts(currAlerts => [nearIdealAlert, ...currAlerts]);
            }

            nextState[ovenId] = {
              ...session,
              durationSeconds: newDuration,
            };
          }
        });

        return updated ? nextState : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [ovens]);

  // Check Maintenance warning on startup
  useEffect(() => {
    ovens.forEach(o => {
      const id = o.id;
      const stats = analyticsEngine.getOvenStats(id);
      if (stats.isMaintenanceRequired && stats.maintenanceReason) {
        setAlerts(prev => {
          const exists = prev.some(a => a.ovenId === id && a.type === 'maintenance');
          if (exists) return prev;
          return [{
            id: `maint-${id}-${Date.now()}`,
            timestamp: new Date().toISOString(),
            ovenId: id,
            severity: 'danger',
            title: `⚠️ Manutenção Preditiva Requerida`,
            message: stats.maintenanceReason!,
            read: false,
            type: 'maintenance',
          }, ...prev];
        });
      }
    });
  }, [ovens]);

  const addOven = useCallback((name: string, notes?: string) => {
    setOvens(prev => {
      const nextId = prev.length > 0 ? Math.max(...prev.map(o => o.id)) + 1 : 1;
      const newOven: OvenConfig = {
        id: nextId,
        name: name || `Forno ${nextId}`,
        status: 'active',
        installedAt: new Date().toISOString().split('T')[0],
        notes: notes || 'Recém adicionado',
      };
      return [...prev, newOven];
    });
  }, []);

  const toggleOvenStatus = useCallback((ovenId: OvenId) => {
    setOvens(prev => prev.map(o => {
      if (o.id === ovenId) {
        const nextStatus = o.status === 'active' ? 'inactive' : 'active';
        return {
          ...o,
          status: nextStatus,
          installedAt: nextStatus === 'active' ? new Date().toISOString().split('T')[0] : o.installedAt,
        };
      }
      return o;
    }));
  }, []);

  const deleteOven = useCallback((ovenId: OvenId) => {
    if (window.confirm(`Tem certeza que deseja remover o Forno ${ovenId}?`)) {
      setOvens(prev => prev.filter(o => o.id !== ovenId));
      setActiveRoasts(prev => {
        const next = { ...prev };
        delete next[ovenId];
        return next;
      });
    }
  }, []);

  const startRoast = useCallback(({ ovenId, operatorId, operatorName, targetQuantityKg, notes }: {
    ovenId: OvenId;
    operatorId: string;
    operatorName: string;
    targetQuantityKg?: number;
    notes?: string;
  }) => {
    const oven = ovens.find(o => o.id === ovenId);
    const ovenName = oven ? oven.name : `Forno ${ovenId}`;
    const nowISO = new Date().toISOString();
    const newSession: RoastSession = {
      id: `roast-${ovenId}-${Date.now()}`,
      ovenId,
      operatorId,
      operatorName,
      startTime: nowISO,
      durationSeconds: 0,
      status: 'roasting',
      targetQuantityKg,
      notes,
      analyses: [],
      timeline: [
        {
          id: `tl-start-${Date.now()}`,
          timestamp: nowISO,
          type: 'started',
          title: '🚀 Torra Iniciada',
          description: `Torra iniciada por ${operatorName} no ${ovenName}`,
          severity: 'info',
        }
      ]
    };

    setActiveRoasts(prev => ({
      ...prev,
      [ovenId]: newSession,
    }));
  }, [ovens]);

  const finishRoast = useCallback((ovenId: OvenId) => {
    setActiveRoasts(prev => {
      const current = prev[ovenId];
      if (!current) return prev;

      const nowISO = new Date().toISOString();
      const completedSession: RoastSession = {
        ...current,
        status: 'completed',
        endTime: nowISO,
        finalStage: current.analyses.length > 0
          ? current.analyses[current.analyses.length - 1].stage
          : 'ideal',
        timeline: [
          ...current.timeline,
          {
            id: `tl-end-${Date.now()}`,
            timestamp: nowISO,
            type: 'completed',
            title: '🏁 Torra Finalizada',
            description: `Torra encerrada com sucesso após ${Math.floor(current.durationSeconds / 60)} min ${current.durationSeconds % 60}s.`,
            severity: 'success',
          }
        ]
      };

      // Save to persistent history
      storageService.addSession(completedSession);

      return {
        ...prev,
        [ovenId]: null,
      };
    });
  }, []);

  const addAnalysis = useCallback(async (
    ovenId: OvenId,
    analysisInput: Omit<AnalysisResult, 'id' | 'timestamp' | 'ovenId' | 'operatorName'>
  ): Promise<AnalysisResult> => {
    const session = activeRoasts[ovenId];
    const nowISO = new Date().toISOString();

    const newAnalysis: AnalysisResult = {
      ...analysisInput,
      id: `ans-${Date.now()}`,
      timestamp: nowISO,
      ovenId,
      operatorName: session ? session.operatorName : 'Operador',
      roastSessionId: session ? session.id : undefined,
    };

    if (session) {
      const isIdeal = newAnalysis.stage === 'ideal';
      const isQuase = newAnalysis.stage === 'quase';
      const stageLabel = getStageLabel(newAnalysis.stage);

      const timelineEvent = {
        id: `tl-ans-${Date.now()}`,
        timestamp: nowISO,
        type: 'analysis' as const,
        title: `📷 Análise de IA (${stageLabel})`,
        description: `Roboflow detectou: ${stageLabel} (${newAnalysis.confidence}% de confiança)`,
        stage: newAnalysis.stage,
        analysisId: newAnalysis.id,
        severity: isIdeal ? 'success' as const : (isQuase ? 'warning' as const : 'info' as const),
      };

      const updatedSession: RoastSession = {
        ...session,
        analyses: [...session.analyses, newAnalysis],
        timeline: [...session.timeline, timelineEvent],
      };

      setActiveRoasts(prev => ({
        ...prev,
        [ovenId]: updatedSession,
      }));

      // If Quase or Ideal reached, trigger alert
      if (isQuase) {
        setAlerts(currAlerts => [
          {
            id: `quase-alert-${Date.now()}`,
            timestamp: nowISO,
            ovenId,
            severity: 'warning',
            title: `⏳ Torra Quase no Ponto Ideal (Forno ${ovenId})`,
            message: `A IA identificou o estágio 'QUASE NO PONTO'! Atenção para finalizar em breve.`,
            read: false,
            type: 'delay',
          },
          ...currAlerts,
        ]);
      } else if (isIdeal) {
        setAlerts(currAlerts => [
          {
            id: `ideal-alert-${Date.now()}`,
            timestamp: nowISO,
            ovenId,
            severity: 'success',
            title: `🟢 Ponto Ideal Detectado (Forno ${ovenId})`,
            message: `A IA identificou o ponto ideal de torra com ${newAnalysis.confidence}% de confiança!`,
            read: false,
            type: 'ideal_reached',
          },
          ...currAlerts,
        ]);
      }
    }

    return newAnalysis;
  }, [activeRoasts]);

  const recordHumanFeedback = useCallback((
    ovenId: OvenId,
    analysisId: string,
    feedback: 'agreed' | 'disagreed',
    correctedStage?: RoastStage
  ) => {
    setActiveRoasts(prev => {
      const session = prev[ovenId];
      if (!session) return prev;

      const updatedAnalyses = session.analyses.map(a => {
        if (a.id === analysisId) {
          return {
            ...a,
            humanFeedback: feedback,
            correctedStage: feedback === 'disagreed' ? correctedStage : undefined,
          };
        }
        return a;
      });

      return {
        ...prev,
        [ovenId]: {
          ...session,
          analyses: updatedAnalyses,
        }
      };
    });
  }, []);

  const getOvenSession = useCallback((ovenId: OvenId) => {
    return activeRoasts[ovenId];
  }, [activeRoasts]);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  const refreshHistoricalData = useCallback(() => {
    // Triggers recalculation
  }, []);

  return (
    <RoastContext.Provider value={{
      ovens,
      activeRoasts,
      alerts,
      startRoast,
      finishRoast,
      addAnalysis,
      recordHumanFeedback,
      getOvenSession,
      dismissAlert,
      refreshHistoricalData,
      addOven,
      toggleOvenStatus,
      deleteOven,
    }}>
      {children}
    </RoastContext.Provider>
  );
};

export const useRoast = (): RoastContextType => {
  const context = useContext(RoastContext);
  if (!context) {
    throw new Error('useRoast deve ser usado dentro de RoastProvider');
  }
  return context;
};
