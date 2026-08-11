import React, { useState } from 'react';
import { Plus, X, Flame, FileText } from 'lucide-react';

interface AddOvenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, notes?: string) => void;
}

export const AddOvenModal: React.FC<AddOvenModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), notes.trim());
    setName('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-industrial-card border border-industrial-border rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-industrial-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-industrial-accent/20 text-industrial-accent border border-industrial-accent/40 flex items-center justify-center font-mono font-extrabold">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white font-mono tracking-tight">CADASTRAR NOVO FORNO</h3>
              <p className="text-xs text-industrial-textMuted">Adicionar novo equipamento à linha de produção</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-industrial-textSecondary uppercase tracking-wider mb-1.5 flex items-center gap-2">
              <Flame className="w-4 h-4 text-industrial-accent" />
              Nome do Forno
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Forno 4 - Linha Alta Capacidade"
              className="w-full bg-industrial-bg border border-industrial-border rounded-xl p-3.5 text-white text-sm focus:border-industrial-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-industrial-textSecondary uppercase tracking-wider mb-1.5 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              Observações / Especificação <span className="text-industrial-textMuted text-[10px]">(Opcional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex: Equipamento de queima direta instalado em 2026"
              className="w-full bg-industrial-bg border border-industrial-border rounded-xl p-3.5 text-white text-sm focus:border-industrial-accent focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-industrial-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-industrial-card hover:bg-industrial-cardHover border border-industrial-border text-white text-xs font-bold rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-industrial-accent hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-scada-glow flex items-center gap-2 uppercase tracking-wider transition-all"
            >
              <Plus className="w-4 h-4" />
              Cadastrar Forno
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
