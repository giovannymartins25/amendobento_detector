import React, { useState } from 'react';
import { RoastStage } from '../../types/roast';
import { getStageLabel } from '../../utils/formatters';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface HumanFeedbackButtonsProps {
  currentStage: RoastStage;
  currentFeedback?: 'agreed' | 'disagreed';
  onFeedback: (feedback: 'agreed' | 'disagreed', correctedStage?: RoastStage) => void;
}

const STAGES: RoastStage[] = ['cru', 'clara', 'quase', 'ideal', 'passou'];

export const HumanFeedbackButtons: React.FC<HumanFeedbackButtonsProps> = ({
  currentStage,
  currentFeedback,
  onFeedback,
}) => {
  const [showCorrectionSelector, setShowCorrectionSelector] = useState(false);

  const handleAgree = () => {
    onFeedback('agreed');
    setShowCorrectionSelector(false);
  };

  const handleDisagree = () => {
    setShowCorrectionSelector(true);
  };

  const handleSelectCorrection = (stage: RoastStage) => {
    onFeedback('disagreed', stage);
    setShowCorrectionSelector(false);
  };

  return (
    <div className="bg-industrial-card border border-industrial-border rounded-2xl p-4 shadow-scada space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold text-industrial-textSecondary uppercase tracking-wider">
          VALIDAÇÃO HUMANA DA IA (OPERADOR)
        </span>
        {currentFeedback && (
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${
            currentFeedback === 'agreed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-amber-950 text-amber-400 border border-amber-500/40'
          }`}>
            {currentFeedback === 'agreed' ? '✓ Classificação Confirmada' : '⚠️ Discordância Registrada'}
          </span>
        )}
      </div>

      {!showCorrectionSelector ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleAgree}
            className={`h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all active:scale-98 ${
              currentFeedback === 'agreed'
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-success-glow'
                : 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/80'
            }`}
          >
            <ThumbsUp className="w-5 h-5" />
            ✅ CONCORDO
          </button>

          <button
            onClick={handleDisagree}
            className={`h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all active:scale-98 ${
              currentFeedback === 'disagreed'
                ? 'bg-amber-600 text-white border-amber-400 shadow-warning-glow'
                : 'bg-amber-950/60 text-amber-300 border-amber-700/60 hover:bg-amber-900/80'
            }`}
          >
            <ThumbsDown className="w-5 h-5" />
            ❌ DISCORDO
          </button>
        </div>
      ) : (
        <div className="space-y-2 bg-industrial-bg p-3 rounded-xl border border-industrial-border animate-fade-in">
          <p className="text-xs font-bold text-amber-300">Qual é o estágio correto segundo sua avaliação?</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {STAGES.map(stg => (
              <button
                key={stg}
                onClick={() => handleSelectCorrection(stg)}
                className={`py-2 px-1 text-center rounded-lg text-xs font-bold border transition-colors ${
                  stg === currentStage
                    ? 'bg-industrial-card border-industrial-border text-industrial-textMuted opacity-50 cursor-not-allowed'
                    : 'bg-industrial-cardHover text-white border-industrial-borderActive hover:bg-industrial-accent hover:border-white'
                }`}
              >
                {getStageLabel(stg)}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCorrectionSelector(false)}
            className="w-full text-center text-xs text-industrial-textMuted hover:text-white pt-1"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};
