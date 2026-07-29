import React, { useState } from 'react';
import { OvenId } from '../../types/roast';
import { useAuth } from '../../contexts/AuthContext';
import { useRoast } from '../../contexts/RoastContext';
import { Play, X, User, Scale, FileText } from 'lucide-react';

interface NewRoastModalProps {
  ovenId: OvenId | null;
  onClose: () => void;
  onRoastStarted: (ovenId: OvenId) => void;
}

export const NewRoastModal: React.FC<NewRoastModalProps> = ({
  ovenId,
  onClose,
  onRoastStarted,
}) => {
  const { users, currentUser } = useAuth();
  const { startRoast } = useRoast();

  const [selectedOperatorId, setSelectedOperatorId] = useState(currentUser.id);
  const [targetQuantityKg, setTargetQuantityKg] = useState<number>(50);
  const [notes, setNotes] = useState('');

  if (ovenId === null) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const op = users.find(u => u.id === selectedOperatorId) || currentUser;

    startRoast({
      ovenId,
      operatorId: op.id,
      operatorName: op.name,
      targetQuantityKg,
      notes,
    });

    onRoastStarted(ovenId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in overflow-hidden">
      <div className="w-full max-w-lg bg-industrial-card border border-industrial-border rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90dvh] sm:max-h-[85vh] my-0 sm:my-auto overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-industrial-border p-4 sm:p-5 shrink-0 bg-industrial-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-extrabold border border-emerald-500/40">
              F{ovenId}
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white font-mono">INICIAR NOVA TORRA</h3>
              <p className="text-xs text-industrial-textMuted">Configuração do Lote para o Forno {ovenId}</p>
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

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          
          {/* Scrollable Fields */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            
            {/* Operator Select */}
            <div>
              <label className="block text-xs font-bold text-industrial-textSecondary uppercase tracking-wider mb-1.5 flex items-center gap-2">
                <User className="w-4 h-4 text-industrial-accent" />
                Operador Responsável
              </label>
              <select
                value={selectedOperatorId}
                onChange={(e) => setSelectedOperatorId(e.target.value)}
                className="w-full bg-industrial-bg border border-industrial-border rounded-xl p-3 text-white font-semibold text-sm focus:border-industrial-accent focus:outline-none"
              >
                {users.filter(u => u.role === 'operator').map(u => (
                  <option key={u.id} value={u.id} className="bg-industrial-card text-white">
                    {u.name} — {u.shift}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity (Kg) */}
            <div>
              <label className="block text-xs font-bold text-industrial-textSecondary uppercase tracking-wider mb-1.5 flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                Quantidade da Carga (Kg) <span className="text-industrial-textMuted text-[10px]">(Opcional)</span>
              </label>
              <input
                type="number"
                value={targetQuantityKg}
                onChange={(e) => setTargetQuantityKg(Number(e.target.value))}
                placeholder="Ex: 50"
                className="w-full bg-industrial-bg border border-industrial-border rounded-xl p-3 text-white font-mono font-bold text-sm focus:border-industrial-accent focus:outline-none"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-industrial-textSecondary uppercase tracking-wider mb-1.5 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                Observações do Lote <span className="text-industrial-textMuted text-[10px]">(Opcional)</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Lote de amendoim cultivar IAC Tatu ST..."
                className="w-full bg-industrial-bg border border-industrial-border rounded-xl p-3 text-white text-sm focus:border-industrial-accent focus:outline-none"
              />
            </div>

          </div>

          {/* Sticky/Fixed Footer Action Button */}
          <div className="shrink-0 p-4 sm:p-6 pt-3 border-t border-industrial-border/60 bg-industrial-card pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <button
              type="submit"
              className="w-full h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl shadow-success-glow flex items-center justify-center gap-3 text-lg tracking-wide active:scale-98 transition-all shrink-0"
            >
              <Play className="w-6 h-6 fill-current" />
              INICIAR CRONÔMETRO
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
