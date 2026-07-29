import React, { useState } from 'react';
import { useRoast } from '../contexts/RoastContext';
import { Plus, CheckCircle2, Trash2, Power, AlertTriangle, ShieldCheck } from 'lucide-react';

export const OvenManagementPage: React.FC = () => {
  const { ovens, addOven, toggleOvenStatus, deleteOven } = useRoast();
  const [newOvenName, setNewOvenName] = useState('');
  const [newOvenNotes, setNewOvenNotes] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOvenName.trim()) return;
    addOven(newOvenName.trim(), newOvenNotes.trim());
    setNewOvenName('');
    setNewOvenNotes('');
  };

  return (
    <div className="space-y-6 pb-24">
      
      {/* Top Banner */}
      <div className="bg-industrial-card border border-industrial-border rounded-3xl p-6 shadow-scada flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Módulo de Engenharia e Controle
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
            GERENCIAMENTO DA FROTA DE FORNOS
          </h2>
          <p className="text-xs sm:text-sm text-industrial-textSecondary mt-1">
            Ative novos fornos quando instalados (ex: Forno 3) ou adicione equipamentos à linha de produção.
          </p>
        </div>
      </div>

      {/* Grid of Ovens Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ovens.map(oven => {
          const isActive = oven.status === 'active';
          return (
            <div
              key={oven.id}
              className={`bg-industrial-card border rounded-3xl p-6 shadow-scada space-y-4 flex flex-col justify-between transition-all ${
                isActive
                  ? 'border-emerald-500/50 bg-gradient-to-b from-industrial-card to-emerald-950/10'
                  : 'border-amber-500/40 bg-gradient-to-b from-industrial-card to-amber-950/20 opacity-85'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-extrabold text-xl ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}>
                      F{oven.id}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-white font-mono">{oven.name}</h3>
                      <span className="text-[11px] text-industrial-textMuted font-mono">
                        {isActive ? `Instalado em: ${oven.installedAt}` : oven.installedAt}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-industrial-bg rounded-2xl border border-industrial-border text-xs text-industrial-textSecondary">
                  <span className="font-bold text-white block mb-0.5">Status operacional:</span>
                  {isActive ? (
                    <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Ativo & Disponível na Fábrica
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-4 h-4" /> Inativo / Aguardando Instalação
                    </span>
                  )}
                  {oven.notes && (
                    <div className="mt-2 pt-2 border-t border-industrial-border/60 text-[11px] text-industrial-textMuted">
                      📝 {oven.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => toggleOvenStatus(oven.id)}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    isActive
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-success-glow font-extrabold'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  {isActive ? 'Desativar / Ocultar' : '🟢 Ativar (Forno Chegou)'}
                </button>

                <button
                  onClick={() => deleteOven(oven.id)}
                  className="p-3 bg-rose-950/60 border border-rose-600/40 text-rose-300 hover:bg-rose-900 rounded-xl transition-colors"
                  title="Remover Forno"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add New Oven Form */}
      <div className="bg-industrial-card border border-industrial-border rounded-3xl p-6 shadow-scada space-y-4">
        <h3 className="font-extrabold text-lg text-white font-mono flex items-center gap-2">
          <Plus className="w-5 h-5 text-industrial-accent" />
          CADASTRAR NOVO FORNO NA LINHA
        </h3>
        
        <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-industrial-textSecondary uppercase tracking-wider mb-1.5">
              Nome do Forno
            </label>
            <input
              type="text"
              value={newOvenName}
              onChange={e => setNewOvenName(e.target.value)}
              placeholder={`Ex: Forno ${ovens.length + 1}`}
              className="w-full bg-industrial-bg border border-industrial-border rounded-xl p-3 text-white text-sm focus:border-industrial-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-industrial-textSecondary uppercase tracking-wider mb-1.5">
              Observação / Descrição
            </label>
            <input
              type="text"
              value={newOvenNotes}
              onChange={e => setNewOvenNotes(e.target.value)}
              placeholder="Ex: Forno de alta capacidade linha 2"
              className="w-full bg-industrial-bg border border-industrial-border rounded-xl p-3 text-white text-sm focus:border-industrial-accent focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-industrial-accent hover:bg-blue-600 text-white font-extrabold rounded-xl shadow-scada-glow flex items-center justify-center gap-2 text-sm uppercase tracking-wider transition-all"
          >
            <Plus className="w-5 h-5" />
            Adicionar Forno
          </button>
        </form>
      </div>

    </div>
  );
};
