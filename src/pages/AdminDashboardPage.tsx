import React, { useState, useEffect } from 'react';
import { analyticsEngine } from '../services/analyticsEngine';
import { supabaseService } from '../services/supabaseService';
import { RoastSession, PredictiveAlert } from '../types/roast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, Award, AlertTriangle, Users, Flame, Clock, Loader2 } from 'lucide-react';

import { AnalyticsSubNav } from '../components/common/AnalyticsSubNav';

interface AdminDashboardPageProps {
  onTabChange?: (tab: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onTabChange }) => {
  const [sessions, setSessions] = useState<RoastSession[]>([]);
  const [alerts, setAlerts] = useState<PredictiveAlert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [remoteSessions, remoteAlerts] = await Promise.all([
          supabaseService.fetchSessions(),
          supabaseService.fetchAlerts(),
        ]);
        if (remoteSessions) setSessions(remoteSessions);
        if (remoteAlerts) setAlerts(remoteAlerts);
      } catch (e) {
        console.warn('[AdminDashboardPage] Erro ao buscar dados do Supabase DB:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const kpis = analyticsEngine.getGlobalKpis(sessions, alerts);

  const ovenChartData = kpis.ovenStats.map(stat => ({
    name: `Forno ${stat.ovenId}`,
    avgMin: Math.round(stat.avgDurationSeconds / 60),
    totalRoasts: stat.totalRoasts,
    efficiency: stat.efficiencyRating,
  }));

  const operatorChartData = kpis.operatorChartData && kpis.operatorChartData.length > 0
    ? kpis.operatorChartData
    : [
        { name: 'Nenhum operador', roasts: 0, avgMin: 0 },
      ];

  const COLORS = ['#10B981', '#F59E0B', '#3875F6'];

  if (isLoading) {
    return (
      <div className="space-y-6 pb-20">
        {onTabChange && <AnalyticsSubNav activeTab="admin" setActiveTab={onTabChange} />}
        <div className="bg-industrial-card border border-industrial-border rounded-2xl p-12 text-center text-industrial-textMuted text-sm flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-industrial-accent animate-spin" />
          <span>Carregando métricas SCADA do Supabase DB...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      
      {/* SubNav for quick switching */}
      {onTabChange && <AnalyticsSubNav activeTab="admin" setActiveTab={onTabChange} />}
      
      {/* Top Banner */}
      <div className="bg-industrial-card border border-industrial-border rounded-3xl p-6 shadow-scada bg-gradient-to-r from-industrial-card via-industrial-card to-blue-950/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-industrial-accent/20 border border-industrial-accent/40 text-industrial-accent flex items-center justify-center shadow-scada-glow">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white font-mono tracking-tight">DASHBOARD ADMINISTRATIVO — MÉTRICAS SCADA</h2>
            <p className="text-xs text-industrial-textSecondary">Análise preditiva de eficiência, comparativo entre fornos e produtividade da equipe</p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-industrial-card border border-industrial-border p-4 rounded-2xl shadow-scada space-y-1">
          <div className="flex items-center justify-between text-industrial-textMuted text-xs font-bold uppercase">
            <span>Total de Torras</span>
            <Flame className="w-4 h-4 text-industrial-accent" />
          </div>
          <div className="font-mono text-3xl font-black text-white">{kpis.totalRoasts}</div>
          <div className="text-[10px] text-industrial-textMuted font-semibold">
            {kpis.totalRoasts > 0 ? `${kpis.totalRoasts} torras concluídas` : 'Nenhuma torra registrada'}
          </div>
        </div>

        <div className="bg-industrial-card border border-industrial-border p-4 rounded-2xl shadow-scada space-y-1">
          <div className="flex items-center justify-between text-industrial-textMuted text-xs font-bold uppercase">
            <span>Tempo Médio Global</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-3xl font-black text-emerald-400">
            {Math.floor(kpis.avgDurationSeconds / 60)} min {kpis.avgDurationSeconds % 60}s
          </div>
          <div className="text-[10px] text-industrial-textMuted">Meta fabril: ~10:00 min</div>
        </div>

        <div className="bg-industrial-card border border-industrial-border p-4 rounded-2xl shadow-scada space-y-1">
          <div className="flex items-center justify-between text-industrial-textMuted text-xs font-bold uppercase">
            <span>Melhor Forno</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono text-3xl font-black text-amber-400">
            {kpis.totalRoasts > 0 ? `Forno ${kpis.bestOvenId}` : 'N/A'}
          </div>
          <div className="text-[10px] text-amber-300/80 font-semibold">
            {kpis.totalRoasts > 0 ? 'Maior estabilidade de torração' : 'Aguardando histórico'}
          </div>
        </div>

        <div className="bg-industrial-card border border-industrial-border p-4 rounded-2xl shadow-scada space-y-1">
          <div className="flex items-center justify-between text-industrial-textMuted text-xs font-bold uppercase">
            <span>Destaque Equipe</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="font-bold text-lg text-white truncate">{kpis.topOperatorName}</div>
          <div className="text-[10px] text-purple-300/80 font-semibold">{kpis.topOperatorCount} torras operadas</div>
        </div>

      </div>

      {/* Predictive Maintenance Warning Banner (exibido apenas quando detectado desvio real de forno) */}
      {kpis.maintenanceAlert && (
        <div className="bg-rose-950/70 border border-rose-600/50 p-5 rounded-2xl shadow-danger-glow flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-900/80 text-rose-400 flex items-center justify-center flex-shrink-0 mt-0.5 animate-pulse">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-rose-200 font-mono">ALERTA DE MANUTENÇÃO PREDITIVA — FORNO {kpis.maintenanceAlert.ovenId}</h4>
            <p className="text-xs text-rose-300 mt-1 leading-relaxed">
              {kpis.maintenanceAlert.reason}
            </p>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Average Time per Oven */}
        <div className="bg-industrial-card border border-industrial-border rounded-2xl p-5 shadow-scada space-y-4">
          <h3 className="font-extrabold text-sm text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Clock className="w-4 h-4 text-industrial-accent" />
            TEMPO MÉDIO POR FORNO (MINUTOS)
          </h3>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ovenChartData}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} unit="m" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#121820', borderColor: '#232F3E', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="avgMin" radius={[8, 8, 0, 0]}>
                  {ovenChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Operator Productivity */}
        <div className="bg-industrial-card border border-industrial-border rounded-2xl p-5 shadow-scada space-y-4">
          <h3 className="font-extrabold text-sm text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            TORRAS OPERADAS POR FUNCIONÁRIO
          </h3>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={operatorChartData} layout="vertical">
                <XAxis type="number" stroke="#64748B" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={11} width={110} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#121820', borderColor: '#232F3E', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="roasts" fill="#3875F6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
