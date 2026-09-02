import React, { useState, useEffect } from 'react';
import { analyticsEngine } from '../services/analyticsEngine';
import { supabaseService } from '../services/supabaseService';
import { AnalysisResult, RoastSession, RoastStage } from '../types/roast';
import { getStageLabel } from '../utils/formatters';
import { BrainCircuit, ThumbsUp, ThumbsDown, TrendingUp, Layers, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AnalyticsSubNav } from '../components/common/AnalyticsSubNav';

interface AiPerformancePageProps {
  onTabChange?: (tab: string) => void;
}

export const AiPerformancePage: React.FC<AiPerformancePageProps> = ({ onTabChange }) => {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [sessions, setSessions] = useState<RoastSession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [remoteAnalyses, remoteSessions] = await Promise.all([
          supabaseService.fetchAnalyses(),
          supabaseService.fetchSessions(),
        ]);
        if (remoteAnalyses) setAnalyses(remoteAnalyses);
        if (remoteSessions) setSessions(remoteSessions);
      } catch (e) {
        console.warn('[AiPerformancePage] Erro ao buscar análises no Supabase DB:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const metrics = analyticsEngine.getAiModelMetrics(analyses, sessions);

  if (isLoading) {
    return (
      <div className="space-y-6 pb-20">
        {onTabChange && <AnalyticsSubNav activeTab="ai-performance" setActiveTab={onTabChange} />}
        <div className="bg-industrial-card border border-industrial-border rounded-2xl p-12 text-center text-industrial-textMuted text-sm flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <span>Carregando dados de inteligência computacional do Supabase DB...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* SubNav for quick switching */}
      {onTabChange && <AnalyticsSubNav activeTab="ai-performance" setActiveTab={onTabChange} />}

      <div className="bg-industrial-card border border-industrial-border rounded-3xl p-6 shadow-scada bg-gradient-to-r from-industrial-card via-industrial-card to-purple-950/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center shadow-scada-glow">
            <BrainCircuit className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white font-mono tracking-tight">DASHBOARD DE DESEMPENHO DA IA ROBOFLOW</h2>
            <p className="text-xs text-industrial-textSecondary">Validação Humana (Human-in-the-Loop), taxa de acerto percebida e métricas do modelo</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-industrial-card border border-industrial-border p-4 rounded-2xl shadow-scada space-y-1">
          <div className="text-industrial-textMuted text-xs font-bold uppercase">Total de Análises</div>
          <div className="font-mono text-3xl font-black text-white">{metrics.totalAnalyses}</div>
          <div className="text-[10px] text-industrial-textMuted">Capturas classificadas</div>
        </div>

        <div className="bg-industrial-card border border-industrial-border p-4 rounded-2xl shadow-scada space-y-1">
          <div className="text-industrial-textMuted text-xs font-bold uppercase">Taxa de Acerto (IA)</div>
          <div className="font-mono text-3xl font-black text-emerald-400">{metrics.perceivedAccuracy}%</div>
          <div className="text-[10px] text-emerald-300/80 font-semibold">Confirmado pelos operadores</div>
        </div>

        <div className="bg-industrial-card border border-industrial-border p-4 rounded-2xl shadow-scada space-y-1">
          <div className="text-industrial-textMuted text-xs font-bold uppercase">Confiança Média</div>
          <div className="font-mono text-3xl font-black text-purple-400">{metrics.avgConfidence}%</div>
          <div className="text-[10px] text-purple-300/80 font-semibold">Grau de certeza do Roboflow</div>
        </div>

        <div className="bg-industrial-card border border-industrial-border p-4 rounded-2xl shadow-scada space-y-1">
          <div className="text-industrial-textMuted text-xs font-bold uppercase">Validação Operadores</div>
          <div className="flex items-center gap-3 font-mono text-lg font-bold pt-1">
            <span className="text-emerald-400 flex items-center gap-1"><ThumbsUp className="w-4 h-4" /> {metrics.agreedCount}</span>
            <span className="text-amber-400 flex items-center gap-1"><ThumbsDown className="w-4 h-4" /> {metrics.disagreedCount}</span>
          </div>
          <div className="text-[10px] text-industrial-textMuted">Concordou vs Discordou</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-industrial-card border border-industrial-border rounded-2xl p-5 shadow-scada space-y-4">
          <h3 className="font-extrabold text-sm text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Layers className="w-4 h-4 text-industrial-accent" />
            DISTRIBUIÇÃO DE DETECÇÃO POR CLASSE
          </h3>

          <div className="space-y-3 pt-2">
            {(Object.keys(metrics.classDistribution) as RoastStage[]).map(stg => {
              const count = metrics.classDistribution[stg];
              const pct = metrics.totalAnalyses > 0 ? Math.round((count / metrics.totalAnalyses) * 100) : 0;

              return (
                <div key={stg} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white">{getStageLabel(stg)}</span>
                    <span className="text-industrial-textMuted font-mono">{count} capturas ({pct}%)</span>
                  </div>
                  <div className="w-full h-3 bg-industrial-bg rounded-full border border-industrial-border overflow-hidden">
                    <div
                      className="h-full bg-industrial-accent rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-industrial-card border border-industrial-border rounded-2xl p-5 shadow-scada space-y-4">
          <h3 className="font-extrabold text-sm text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            EVOLUÇÃO DA PRECISÃO AO LONGO DO TEMPO
          </h3>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.accuracyTrend}>
                <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} domain={[80, 100]} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#121820', borderColor: '#232F3E', borderRadius: '12px', color: '#fff' }}
                />
                <Line type="monotone" dataKey="accuracy" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
