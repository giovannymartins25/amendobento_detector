import React from 'react';
import { Cpu, Download, Database, RefreshCw, FileSpreadsheet, Layers, Sparkles } from 'lucide-react';

export const ModelEvolutionPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="bg-industrial-card border border-industrial-border rounded-3xl p-6 shadow-scada bg-gradient-to-r from-industrial-card via-industrial-card to-blue-950/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shadow-scada-glow">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white font-mono tracking-tight">EVOLUÇÃO DO MODELO IA & DATASET</h2>
            <p className="text-xs text-industrial-textSecondary">Módulo preparado para exportação de dados, anotações de imagens e retreinamento do Roboflow</p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-industrial-card border border-industrial-border rounded-2xl p-5 shadow-scada flex items-start gap-4">
        <Sparkles className="w-6 h-6 text-industrial-accent flex-shrink-0 mt-1" />
        <div>
          <h4 className="font-extrabold text-sm text-white font-mono">ESTRUTURA PREPARADA PARA EXPORTAÇÃO</h4>
          <p className="text-xs text-industrial-textSecondary mt-1 leading-relaxed">
            As imagens capturadas e as validações humanas registradas pelos operadores estão prontas para formar novos pacotes de dados. Escolha uma das opções abaixo para estruturar a próxima versão do modelo.
          </p>
        </div>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Export CSV */}
        <div className="bg-industrial-card border border-industrial-border p-6 rounded-2xl shadow-scada space-y-4">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base text-white">Exportar Relatório CSV</h3>
              <p className="text-xs text-industrial-textMuted">Tabela completa de sessões, tempos, operadores e classificações</p>
            </div>
          </div>
          <button
            onClick={() => alert('Download do arquivo CSV de sessões iniciado.')}
            className="w-full h-12 bg-industrial-cardHover border border-industrial-borderHover text-emerald-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-950/40 transition-colors"
          >
            <Download className="w-4 h-4" />
            BAIXAR DATAFRAME CSV
          </button>
        </div>

        {/* Card 2: Export Image Dataset */}
        <div className="bg-industrial-card border border-industrial-border p-6 rounded-2xl shadow-scada space-y-4">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-purple-400" />
            <div>
              <h3 className="font-bold text-base text-white">Gerar Pacote de Imagens Roboflow</h3>
              <p className="text-xs text-industrial-textMuted">Imagens rotuladas com caixas delimitadoras e correções humanas</p>
            </div>
          </div>
          <button
            onClick={() => alert('Compilando pacote ZIP de imagens rotuladas...')}
            className="w-full h-12 bg-industrial-cardHover border border-industrial-borderHover text-purple-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-purple-950/40 transition-colors"
          >
            <Download className="w-4 h-4" />
            EXPORTAR DATASET (.ZIP)
          </button>
        </div>

        {/* Card 3: Model Versioning */}
        <div className="bg-industrial-card border border-industrial-border p-6 rounded-2xl shadow-scada space-y-4">
          <div className="flex items-center gap-3">
            <Layers className="w-8 h-8 text-industrial-accent" />
            <div>
              <h3 className="font-bold text-base text-white">Versão do Modelo Roboflow</h3>
              <p className="text-xs text-industrial-textMuted">Endpoint atual: <code className="text-industrial-accent">amendobento/1</code></p>
            </div>
          </div>
          <div className="bg-industrial-bg p-3 rounded-xl border border-industrial-border text-xs text-industrial-textSecondary">
            Status: <span className="text-emerald-400 font-bold">Ativo em Produção (v1.0)</span>
          </div>
        </div>

        {/* Card 4: Retrain */}
        <div className="bg-industrial-card border border-industrial-border p-6 rounded-2xl shadow-scada space-y-4">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-8 h-8 text-amber-400" />
            <div>
              <h3 className="font-bold text-base text-white">Solicitar Retreinamento Automático</h3>
              <p className="text-xs text-industrial-textMuted">Disparar pipeline no Roboflow com novas amostras da fábrica</p>
            </div>
          </div>
          <button
            onClick={() => alert('Pipeline de retreinamento Roboflow agendado.')}
            className="w-full h-12 bg-industrial-cardHover border border-industrial-borderHover text-amber-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-amber-950/40 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            AGENDAR RETREINAMENTO (v2.0)
          </button>
        </div>

      </div>

    </div>
  );
};
