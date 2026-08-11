import React, { useState } from 'react';
import { useRoast } from '../contexts/RoastContext';
import { Plus, CheckCircle2, Trash2, Power, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { AddOvenModal } from '../components/oven/AddOvenModal';
import { OvenConfig } from '../types/roast';

export const OvenManagementPage: React.FC = () => {
  const { ovens, addOven, toggleOvenStatus, deleteOven } = useRoast();
  const [ovenToDelete, setOvenToDelete] = useState<OvenConfig | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleConfirmDelete = () => {
    if (ovenToDelete) {
      deleteOven(ovenToDelete.id);
      setOvenToDelete(null);
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-6xl mx-auto">
      
      {/* Top Header Banner + Add Oven Button */}
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
            Cadastre novos fornos, remova ou coloque equipamentos em circulação na fábrica.
          </p>
        </div>

        {/* Primary Action Button: Cadastrar Forno */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full md:w-auto px-5 py-3.5 bg-industrial-accent hover:bg-blue-600 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-scada-glow flex items-center justify-center gap-2.5 uppercase tracking-wider active:scale-98 transition-all shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Cadastrar Novo Forno</span>
        </button>
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
                  <span className="font-bold text-white block mb-0.5">Status da frota:</span>
                  {isActive ? (
                    <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Em Circulação na Fábrica
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-4 h-4" /> Fora de Circulação / Manutenção
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
                  {isActive ? 'Tirar de Circulação' : '🟢 Colocar em Circulação'}
                </button>

                <button
                  onClick={() => setOvenToDelete(oven)}
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

      {/* Add Oven Modal */}
      <AddOvenModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addOven}
      />

      {/* Custom Confirmation Modal for Deleting Oven */}
      <ConfirmModal
        isOpen={ovenToDelete !== null}
        title="Excluir Forno"
        message={`Deseja realmente excluir o ${ovenToDelete?.name || 'Forno'} da frota de produção? Esta ação não pode ser desfeita e removerá os dados do equipamento.`}
        variant="danger"
        confirmText="Excluir Forno"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setOvenToDelete(null)}
      />

    </div>
  );
};
