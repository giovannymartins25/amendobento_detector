import React from 'react';
import { useRoast } from '../../contexts/RoastContext';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, ArrowRight } from 'lucide-react';

interface AlertBannerProps {
  onOpenAlerts?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ onOpenAlerts }) => {
  const { alerts } = useRoast();
  const { isAdmin } = useAuth();

  if (!isAdmin || alerts.length === 0) return null;

  const count = alerts.length;
  const hasDanger = alerts.some(a => a.severity === 'danger');

  return (
    <div className="max-w-7xl mx-auto px-4 pt-3">
      <div
        onClick={onOpenAlerts}
        className={`px-4 py-2.5 rounded-2xl border flex items-center justify-between gap-3 shadow-scada cursor-pointer transition-all hover:scale-[1.005] group ${
          hasDanger
            ? 'bg-gradient-to-r from-rose-950/90 via-rose-900/80 to-amber-950/90 border-rose-500/60 shadow-danger-glow'
            : 'bg-gradient-to-r from-amber-950/80 via-industrial-card to-blue-950/80 border-amber-500/50'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center flex-shrink-0 animate-pulse">
            <Bell className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider font-mono">
                ATENÇÃO: VOCÊ TEM {count} {count === 1 ? 'NOTIFICAÇÃO' : 'NOTIFICAÇÕES'} PENDENTE(S)
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
            </div>
            <p className="text-[11px] text-industrial-textSecondary hidden sm:block">
              Clique para acessar a Central de Avisos da fábrica e gerenciar os alertas de produção.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-300 group-hover:text-white transition-colors flex-shrink-0 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
          <span>Ver Avisos</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};

