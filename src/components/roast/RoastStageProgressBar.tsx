import React from 'react';
import { RoastStage } from '../../types/roast';
import { getStageProgressPercent, getStageLabel, getStageBadgeStyles } from '../../utils/formatters';

interface RoastStageProgressBarProps {
  currentStage: RoastStage | null;
  confidence?: number;
}

const STAGES: RoastStage[] = ['cru', 'clara', 'quase', 'ideal', 'passou'];

export const RoastStageProgressBar: React.FC<RoastStageProgressBarProps> = ({
  currentStage,
  confidence,
}) => {
  const activeStage = currentStage || 'cru';
  const progressPercent = getStageProgressPercent(activeStage);
  const activeStyles = getStageBadgeStyles(activeStage);

  return (
    <div className="bg-industrial-card border border-industrial-border rounded-2xl p-4 space-y-3 shadow-scada">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold text-industrial-textSecondary uppercase tracking-wider">
          ESTÁGIO DE TORRAÇÃO (IA ROBOFLOW)
        </span>
        {currentStage ? (
          <span className={`text-xs font-extrabold px-3 py-1 rounded-lg border ${activeStyles.bg} ${activeStyles.text} ${activeStyles.border}`}>
            {getStageLabel(activeStage)} {confidence ? `(${confidence}%)` : ''}
          </span>
        ) : (
          <span className="text-xs text-industrial-textMuted italic">Aguardando primeira foto...</span>
        )}
      </div>

      {/* Progress Bar Container */}
      <div className="relative w-full h-4 bg-industrial-bg rounded-full border border-industrial-border overflow-hidden">
        <div
          className={`h-full transition-all duration-700 ease-out rounded-full ${
            activeStage === 'ideal'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-success-glow'
              : activeStage === 'passou'
              ? 'bg-gradient-to-r from-rose-500 to-red-600 shadow-danger-glow'
              : 'bg-gradient-to-r from-blue-500 via-amber-500 to-emerald-500'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Stage Labels Grid */}
      <div className="grid grid-cols-5 text-center text-[10px] font-bold text-industrial-textMuted uppercase tracking-wider pt-1">
        {STAGES.map(stg => {
          const isCurrent = stg === activeStage;
          return (
            <div
              key={stg}
              className={`transition-colors ${
                isCurrent ? 'text-white font-extrabold scale-105' : 'text-industrial-textMuted'
              }`}
            >
              {getStageLabel(stg)}
              {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mx-auto mt-1 animate-ping" />}
            </div>
          );
        })}
      </div>

    </div>
  );
};
