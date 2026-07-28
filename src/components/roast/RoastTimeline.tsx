import React from 'react';
import { RoastTimelineEvent } from '../../types/roast';
import { formatTimeOnly } from '../../utils/formatters';
import { Camera, CheckCircle2, Play, AlertCircle, FileText } from 'lucide-react';

interface RoastTimelineProps {
  events: RoastTimelineEvent[];
}

export const RoastTimeline: React.FC<RoastTimelineProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="bg-industrial-card border border-industrial-border rounded-2xl p-6 text-center text-industrial-textMuted text-xs">
        Nenhum evento registrado nesta sessão ainda.
      </div>
    );
  }

  return (
    <div className="bg-industrial-card border border-industrial-border rounded-2xl p-5 shadow-scada space-y-4">
      <h3 className="font-extrabold text-sm text-white uppercase tracking-wider font-mono flex items-center gap-2">
        <FileText className="w-4 h-4 text-industrial-accent" />
        TIMELINE CRONOLÓGICA DA TORRA
      </h3>

      <div className="relative border-l-2 border-industrial-border ml-3 pl-4 space-y-4">
        {events.map((evt, idx) => {
          let icon = <Play className="w-3.5 h-3.5 text-blue-400" />;
          let dotBg = 'bg-blue-950 border-blue-500 text-blue-400';

          if (evt.type === 'analysis') {
            icon = <Camera className="w-3.5 h-3.5 text-purple-400" />;
            dotBg = 'bg-purple-950 border-purple-500 text-purple-400';
          } else if (evt.type === 'completed') {
            icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
            dotBg = 'bg-emerald-950 border-emerald-500 text-emerald-400';
          } else if (evt.type === 'alert') {
            icon = <AlertCircle className="w-3.5 h-3.5 text-amber-400" />;
            dotBg = 'bg-amber-950 border-amber-500 text-amber-400';
          }

          return (
            <div key={evt.id || idx} className="relative group">
              {/* Timeline Node Icon */}
              <div className={`absolute -left-[27px] top-0.5 w-6 h-6 rounded-full border flex items-center justify-center ${dotBg}`}>
                {icon}
              </div>

              <div className="bg-industrial-bg/60 border border-industrial-border p-3 rounded-xl hover:border-industrial-borderActive transition-colors">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-bold text-xs text-white">{evt.title}</h4>
                  <span className="font-mono text-[10px] text-industrial-textMuted">{formatTimeOnly(evt.timestamp)}</span>
                </div>
                <p className="text-xs text-industrial-textSecondary">{evt.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
