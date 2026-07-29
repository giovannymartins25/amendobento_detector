import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Flame, User, ShieldCheck, ArrowRight, Zap } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { users, loginAs } = useAuth();

  const operators = users.filter(u => u.role === 'operator');
  const admins = users.filter(u => u.role === 'admin');

  return (
    <div className="min-h-screen bg-industrial-bg text-industrial-textPrimary flex flex-col justify-center items-center p-4 sm:p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-industrial-card via-industrial-bg to-black">
      
      {/* Container */}
      <div className="w-full max-w-4xl space-y-8 animate-fade-in">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-industrial-accent/15 border border-industrial-accent/40 text-industrial-accent text-xs font-mono font-bold uppercase tracking-wider">
            <Flame className="w-4 h-4" />
            SISTEMA SCADA • AMENDOBENTO DETECTOR v2.0
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-mono tracking-tight">
            CONTROLE DE TORRA DE AMENDOIM
          </h1>
          <p className="text-sm sm:text-base text-industrial-textSecondary max-w-xl mx-auto">
            Selecione o seu perfil para acessar o painel operacional de monitoramento e classificação por Inteligência Artificial.
          </p>
        </div>

        {/* Roles Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Operator Access Box */}
          <div className="bg-industrial-card border border-industrial-border rounded-3xl p-6 shadow-scada space-y-5 flex flex-col justify-between hover:border-emerald-500/50 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold">
                  <User className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-extrabold px-3 py-1 bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 rounded-full uppercase tracking-wider">
                  OPERACIONAL
                </span>
              </div>
              <div>
                <h2 className="text-xl font-mono font-extrabold text-white">OPERADORES DE CHÃO DE FÁBRICA</h2>
                <p className="text-xs text-industrial-textMuted mt-1">
                  Acesso simplificado aos fornos ativos, disparo de fotos para IA e cronômetro em tempo real.
                </p>
              </div>

              {/* Operators List */}
              <div className="space-y-2.5 pt-2">
                {operators.map(op => (
                  <button
                    key={op.id}
                    onClick={() => loginAs(op.id)}
                    className="w-full p-3.5 bg-industrial-bg border border-industrial-border hover:border-emerald-500/60 hover:bg-emerald-950/20 text-left rounded-2xl flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-industrial-card flex items-center justify-center font-bold text-sm text-emerald-400 border border-industrial-border">
                        {op.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{op.name}</div>
                        <div className="text-[11px] text-industrial-textMuted">{op.shift}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-industrial-textMuted group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-industrial-textMuted bg-industrial-bg/50 p-2.5 rounded-xl border border-industrial-border/60">
              ⚡ Interface otimizada para acionamento rápido no celular/tablet.
            </div>
          </div>

          {/* Admin Access Box */}
          <div className="bg-industrial-card border border-industrial-border rounded-3xl p-6 shadow-scada space-y-5 flex flex-col justify-between hover:border-industrial-accent/50 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-extrabold px-3 py-1 bg-blue-950/80 border border-blue-500/50 text-blue-400 rounded-full uppercase tracking-wider">
                  SUPERVISÃO / ADMIN
                </span>
              </div>
              <div>
                <h2 className="text-xl font-mono font-extrabold text-white">ENGENHARIA E GESTÃO</h2>
                <p className="text-xs text-industrial-textMuted mt-1">
                  Acesso completo a métricas industriais, histórico de lotes, calibração de IA e cadastro de fornos.
                </p>
              </div>

              {/* Admins List */}
              <div className="space-y-2.5 pt-2">
                {admins.map(admin => (
                  <button
                    key={admin.id}
                    onClick={() => loginAs(admin.id)}
                    className="w-full p-3.5 bg-industrial-bg border border-industrial-border hover:border-industrial-accent/60 hover:bg-blue-950/20 text-left rounded-2xl flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-industrial-card flex items-center justify-center font-bold text-sm text-blue-400 border border-industrial-border">
                        {admin.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{admin.name}</div>
                        <div className="text-[11px] text-industrial-textMuted">{admin.shift}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-industrial-textMuted group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-industrial-textMuted bg-industrial-bg/50 p-2.5 rounded-xl border border-industrial-border/60">
              🛠 Permite ativar o Forno 3, adicionar novos fornos e visualizar relatórios.
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-industrial-textMuted flex items-center justify-center gap-2 font-mono">
          <Zap className="w-3.5 h-3.5 text-industrial-accent" />
          <span>Indústria Amendobento S/A • Painel SCADA Integrado ao Roboflow Vision</span>
        </div>

      </div>
    </div>
  );
};
