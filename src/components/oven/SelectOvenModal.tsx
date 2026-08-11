import React from 'react';
import { OvenConfig, OvenId } from '../../types/roast';
import { Flame, Play, X } from 'lucide-react';

interface SelectOvenModalProps {
  isOpen: boolean;
  availableOvens: OvenConfig[];
  onClose: () => void;
  onSelectOven: (ovenId: OvenId) => void;
}

export const SelectOvenModal: React.FC<SelectOvenModalProps> = ({
  isOpen,
  availableOvens,
  onClose,
  onSelectOven,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-xl bg-industrial-card border border-industrial-border rounded-3xl p-6 shadow-2xl space-y-6 animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-industrial-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-mono font-extrabold shadow-success-glow">
              <Flame className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-black text-xl text-white font-mono tracking-tight">SELECIONE O FORNO</h3>
              <p className="text-xs text-industrial-textMuted mt-0.5">Em qual forno você deseja iniciar o processo de torra?</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-industrial-cardHover text-industrial-textMuted hover:text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Available Ovens */}
        {availableOvens.length === 0 ? (
          <div className="bg-industrial-bg p-8 rounded-2xl border border-industrial-border text-center space-y-2">
            <span className="text-sm font-bold text-amber-400 block font-mono">TODOS OS FORNOS JÁ ESTÃO EM TORRA</span>
            <p className="text-xs text-industrial-textMuted">Finalize alguma torra ativa antes de iniciar um novo lote.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {availableOvens.map(oven => (
              <button
                key={oven.id}
                onClick={() => onSelectOven(oven.id)}
                className="bg-industrial-bg hover:bg-emerald-950/40 border border-industrial-border hover:border-emerald-500/60 rounded-2xl p-5 text-left transition-all group flex flex-col justify-between space-y-4 shadow-scada active:scale-98"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 font-mono font-black text-xl flex items-center justify-center border border-emerald-500/40 group-hover:scale-105 transition-transform">
                    F{oven.id}
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                    🟢 LIVRE
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-base text-white font-mono group-hover:text-emerald-300 transition-colors">
                    {oven.name}
                  </h4>
                  <p className="text-xs text-industrial-textMuted mt-0.5">
                    {oven.notes || 'Pronto para pré-aquecimento e carga'}
                  </p>
                </div>

                <div className="w-full py-2.5 bg-emerald-600 group-hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-success-glow flex items-center justify-center gap-2 uppercase tracking-wider transition-all">
                  <Play className="w-4 h-4 fill-current" />
                  Iniciar Torra no F{oven.id}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Footer Close */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-industrial-card hover:bg-industrial-cardHover border border-industrial-border text-industrial-textSecondary hover:text-white text-xs font-bold rounded-xl transition-all"
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
};
