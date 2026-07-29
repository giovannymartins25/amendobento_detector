import React from 'react';
import { useRoast } from '../../contexts/RoastContext';
import { useAuth } from '../../contexts/AuthContext';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export const AlertBanner: React.FC = () => {
  const { alerts, dismissAlert } = useRoast();
  const { isAdmin } = useAuth();

  if (!isAdmin || alerts.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 pt-4 space-y-2">
      {alerts.slice(0, 3).map(alert => {
        let bgClass = 'bg-blue-950/80 border-blue-600/60 text-blue-200';
        let icon = <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />;

        if (alert.severity === 'warning') {
          bgClass = 'bg-amber-950/80 border-amber-500/60 text-amber-200';
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />;
        } else if (alert.severity === 'danger') {
          bgClass = 'bg-rose-950/90 border-rose-600/70 text-rose-100 shadow-danger-glow';
          icon = <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 animate-bounce" />;
        } else if (alert.severity === 'success') {
          bgClass = 'bg-emerald-950/90 border-emerald-500/70 text-emerald-100 shadow-success-glow';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
        }

        return (
          <div
            key={alert.id}
            className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 shadow-scada transition-all animate-fade-in ${bgClass}`}
          >
            <div className="flex items-start gap-3">
              {icon}
              <div>
                <h4 className="font-bold text-sm leading-snug">{alert.title}</h4>
                <p className="text-xs opacity-90 mt-0.5">{alert.message}</p>
              </div>
            </div>
            <button
              onClick={() => dismissAlert(alert.id)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
