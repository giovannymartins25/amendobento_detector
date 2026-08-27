import { OvenId, OvenStats, AiModelMetrics, RoastStage } from '../types/roast';
import { storageService } from './storageService';

export interface PredictiveEstimate {
  estimatedTotalDurationSeconds: number;
  remainingSeconds: number;
  progressPercentage: number;
  message: string;
  isOverAverage: boolean;
  deviationPercent: number;
  isFirstRoastOfDay: boolean;
  coldStartBonusSeconds: number;
}

export const analyticsEngine = {
  isFirstRoastOfDay(ovenId: OvenId, sessionStartTime?: string): boolean {
    const targetDateStr = sessionStartTime
      ? new Date(sessionStartTime).toDateString()
      : new Date().toDateString();

    const completedSessions = storageService.getSessions().filter(s => s.status === 'completed');

    const countToday = completedSessions.filter(s => {
      if (s.ovenId !== ovenId) return false;
      const dateStr = new Date(s.startTime).toDateString();
      return dateStr === targetDateStr;
    }).length;

    return countToday === 0;
  },

  getOvenStats(ovenId: OvenId): OvenStats {
    const allSessions = storageService.getSessions().filter(s => s.status === 'completed' && s.ovenId === ovenId);
    const globalSessions = storageService.getSessions().filter(s => s.status === 'completed');

    if (allSessions.length === 0) {
      const isOven1 = ovenId === 1;
      return {
        ovenId,
        totalRoasts: 0,
        avgDurationSeconds: isOven1 ? 3900 : 600,
        minDurationSeconds: isOven1 ? 3600 : 540,
        maxDurationSeconds: isOven1 ? 4500 : 660,
        efficiencyRating: 95,
        status: 'idle',
        isMaintenanceRequired: false,
      };
    }

    const totalRoasts = allSessions.length;
    const durations = allSessions.map(s => s.durationSeconds);
    const totalDuration = durations.reduce((acc, curr) => acc + curr, 0);
    const avgDurationSeconds = Math.round(totalDuration / totalRoasts);
    const minDurationSeconds = Math.min(...durations);
    const maxDurationSeconds = Math.max(...durations);

    const otherSessions = globalSessions.filter(s => s.ovenId !== ovenId);
    let isMaintenanceRequired = false;
    let maintenanceReason: string | undefined = undefined;

    if (otherSessions.length > 0) {
      const otherAvg = otherSessions.reduce((acc, curr) => acc + curr.durationSeconds, 0) / otherSessions.length;
      const deviation = ((avgDurationSeconds - otherAvg) / otherAvg) * 100;

      if (deviation >= 15) {
        isMaintenanceRequired = true;
        maintenanceReason = `⚠️ O Forno ${ovenId} está ${Math.round(deviation)}% mais lento que a média dos demais fornos. Recomenda-se inspeção técnica nos aquecedores.`;
      }
    }

    return {
      ovenId,
      totalRoasts,
      avgDurationSeconds,
      minDurationSeconds,
      maxDurationSeconds,
      efficiencyRating: Math.max(70, Math.min(99, 100 - Math.round((avgDurationSeconds - 580) / 10))),
      status: 'idle',
      isMaintenanceRequired,
      maintenanceReason,
    };
  },

  getPredictiveEstimate(ovenId: OvenId, currentSeconds: number, sessionStartTime?: string): PredictiveEstimate {
    // Configuração para o FORNO 1 (Tempo ideal de 1h a 1h e 15 min: 3600s a 4500s)
    if (ovenId === 1) {
      const expectedTotal = 3900; // 1h 05 min (média da faixa de 1h a 1h15)
      const remainingSeconds = Math.max(0, expectedTotal - currentSeconds);
      const progressPercentage = Math.min(100, Math.round((currentSeconds / expectedTotal) * 100));
      const isOverAverage = currentSeconds > expectedTotal;
      const deviationPercent = expectedTotal > 0 ? Math.round(((currentSeconds - expectedTotal) / expectedTotal) * 100) : 0;

      let message = '';
      if (currentSeconds >= 4200) {
        message = `🚨 ALERTA VERMELHO (Forno 1): 1h e 10 min de torra atingidos!`;
      } else if (currentSeconds >= 3300) {
        message = `🟡 ALERTA AMARELO (Forno 1): 55 min de torra atingidos (Ponto ideal: 1h a 1h15)!`;
      } else if (currentSeconds < 3600) {
        const minsLeft = Math.ceil((3600 - currentSeconds) / 60);
        message = `💡 Forno 1 (Faixa 1h - 1h15): Faltam ~${minsLeft} min para iniciar a janela ideal.`;
      } else {
        message = `🟢 Forno 1 em faixa ideal de torra (entre 1h e 1h15).`;
      }

      return {
        estimatedTotalDurationSeconds: expectedTotal,
        remainingSeconds,
        progressPercentage,
        message,
        isOverAverage,
        deviationPercent,
        isFirstRoastOfDay: false,
        coldStartBonusSeconds: 0,
      };
    }

    // Modo de Teste especial para o FORNO 2 (Torra de 1 minuto = 60s)
    if (ovenId === 2) {
      const expectedTotal = 60; // 1 minuto
      const remainingSeconds = Math.max(0, expectedTotal - currentSeconds);
      const progressPercentage = Math.min(100, Math.round((currentSeconds / expectedTotal) * 100));
      const isOverAverage = currentSeconds > expectedTotal;
      const deviationPercent = expectedTotal > 0 ? Math.round(((currentSeconds - expectedTotal) / expectedTotal) * 100) : 0;

      let message = '';
      if (isOverAverage) {
        message = `⚠️ Torra no Forno 2 ultrapassou a estimativa de teste (1 min).`;
      } else if (remainingSeconds <= 50) {
        message = `🟢 ALERTA TESTE (Forno 2): Ponto ideal aproximando-se! Faltam ${remainingSeconds}s!`;
      } else {
        message = `💡 Forno 2 (Modo Teste 1 min): Faltam ~${remainingSeconds}s para a conclusão.`;
      }

      return {
        estimatedTotalDurationSeconds: expectedTotal,
        remainingSeconds,
        progressPercentage,
        message,
        isOverAverage,
        deviationPercent,
        isFirstRoastOfDay: false,
        coldStartBonusSeconds: 0,
      };
    }

    const stats = this.getOvenStats(ovenId);
    const firstRoast = this.isFirstRoastOfDay(ovenId, sessionStartTime);
    const coldStartBonusSeconds = firstRoast ? 300 : 0; // +5 minutos (300s) devido a forno frio em temperatura ambiente

    const expectedTotal = stats.avgDurationSeconds + coldStartBonusSeconds;
    const remainingSeconds = Math.max(0, expectedTotal - currentSeconds);
    const progressPercentage = Math.min(100, Math.round((currentSeconds / expectedTotal) * 100));

    const isOverAverage = currentSeconds > expectedTotal;
    const deviationPercent = Math.round(((currentSeconds - expectedTotal) / expectedTotal) * 100);

    let message = '';
    if (firstRoast) {
      if (isOverAverage) {
        message = `⚠️ 1ª Torra do dia no Forno ${ovenId} (Forno Frio). Ultrapassou a estimativa ajustada (+5 min de aquecimento).`;
      } else if (remainingSeconds <= 120) {
        message = `🟢 1ª Torra do dia (Forno Frio): Ponto ideal se aproximando (~${Math.ceil(remainingSeconds / 60)} min restantes).`;
      } else {
        const remainingMins = Math.ceil(remainingSeconds / 60);
        message = `🔥 1ª Torra do dia no Forno ${ovenId} (Forno Frio: +5 min de aquecimento estimados). Faltam ~${remainingMins} min.`;
      }
    } else {
      if (isOverAverage) {
        message = `⚠️ Torra ${deviationPercent}% acima da média habitual do Forno ${ovenId}.`;
      } else if (remainingSeconds <= 120) {
        message = `🟢 Ponto ideal aproximando-se! Estimativa de ~${Math.ceil(remainingSeconds / 60)} min restantes.`;
      } else {
        const remainingMins = Math.ceil(remainingSeconds / 60);
        message = `💡 Baseado nas últimas torras do Forno ${ovenId}, faltam aproximadamente ${remainingMins} minutos.`;
      }
    }

    return {
      estimatedTotalDurationSeconds: expectedTotal,
      remainingSeconds,
      progressPercentage,
      message,
      isOverAverage,
      deviationPercent,
      isFirstRoastOfDay: firstRoast,
      coldStartBonusSeconds,
    };
  },

  getGlobalKpis() {
    const sessions = storageService.getSessions().filter(s => s.status === 'completed');
    const totalRoasts = sessions.length;

    const totalSeconds = sessions.reduce((acc, curr) => acc + curr.durationSeconds, 0);
    const avgDurationSeconds = totalRoasts > 0 ? Math.round(totalSeconds / totalRoasts) : 600;

    const ovenStats = [1, 2, 3].map(id => this.getOvenStats(id as OvenId));

    const sortedBySpeed = [...ovenStats].sort((a, b) => a.avgDurationSeconds - b.avgDurationSeconds);
    const bestOven = sortedBySpeed[0];
    const slowestOven = sortedBySpeed[sortedBySpeed.length - 1];

    const operatorMap: Record<string, { count: number; totalDuration: number }> = {};
    sessions.forEach(s => {
      if (!operatorMap[s.operatorName]) {
        operatorMap[s.operatorName] = { count: 0, totalDuration: 0 };
      }
      operatorMap[s.operatorName].count += 1;
      operatorMap[s.operatorName].totalDuration += s.durationSeconds;
    });

    let topOperator = { name: 'Sem dados', count: 0 };
    Object.entries(operatorMap).forEach(([name, data]) => {
      if (data.count > topOperator.count) {
        topOperator = { name, count: data.count };
      }
    });

    const totalAnalyses = sessions.reduce((acc, curr) => acc + curr.analyses.length, 0);
    const totalAlerts = storageService.getAlerts().length;

    return {
      totalRoasts,
      avgDurationSeconds,
      bestOvenId: bestOven.ovenId,
      slowestOvenId: slowestOven.ovenId,
      topOperatorName: topOperator.name,
      topOperatorCount: topOperator.count,
      totalAnalyses,
      totalAlerts,
      ovenStats,
    };
  },

  getAiModelMetrics(): AiModelMetrics {
    const sessions = storageService.getSessions();
    const allAnalyses: Array<any> = [];

    sessions.forEach(s => {
      if (s.analyses && s.analyses.length > 0) {
        allAnalyses.push(...s.analyses);
      }
    });

    const totalAnalyses = allAnalyses.length;
    let agreedCount = 0;
    let disagreedCount = 0;
    let totalConfidenceSum = 0;

    const classDistribution: Record<RoastStage, number> = {
      cru: 0,
      clara: 0,
      quase: 0,
      ideal: 0,
      passou: 0,
    };

    allAnalyses.forEach(a => {
      totalConfidenceSum += (a.confidence || 90);
      if (a.stage && classDistribution[a.stage as RoastStage] !== undefined) {
        classDistribution[a.stage as RoastStage] += 1;
      }
      if (a.humanFeedback === 'agreed') agreedCount++;
      if (a.humanFeedback === 'disagreed') disagreedCount++;
    });

    const evaluatedCount = agreedCount + disagreedCount;
    const perceivedAccuracy = evaluatedCount > 0 ? Math.round((agreedCount / evaluatedCount) * 100) : 95;
    const avgConfidence = totalAnalyses > 0 ? Math.round(totalConfidenceSum / totalAnalyses) : 94;

    const accuracyTrend = [
      { date: 'Segunda', accuracy: 92 },
      { date: 'Terça', accuracy: 94 },
      { date: 'Quarta', accuracy: 93 },
      { date: 'Quinta', accuracy: 96 },
      { date: 'Sexta', accuracy: 95 },
      { date: 'Hoje', accuracy: perceivedAccuracy },
    ];

    return {
      totalAnalyses,
      agreedCount,
      disagreedCount,
      perceivedAccuracy,
      avgConfidence,
      classDistribution,
      accuracyTrend,
    };
  }
};
