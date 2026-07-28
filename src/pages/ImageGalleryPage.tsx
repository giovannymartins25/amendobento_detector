import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { AnalysisResult } from '../types/roast';
import { formatDateTime, getStageBadgeStyles, getStageLabel, formatSecondsToReadable } from '../utils/formatters';
import { Image as ImageIcon, Clock, User, CheckCircle2, AlertTriangle } from 'lucide-react';

export const ImageGalleryPage: React.FC = () => {
  const sessions = storageService.getSessions();
  const allAnalyses: AnalysisResult[] = [];

  sessions.forEach(s => {
    if (s.analyses && s.analyses.length > 0) {
      allAnalyses.push(...s.analyses);
    }
  });

  const [filterOven, setFilterOven] = useState<string>('all');
  const [filterStage, setFilterStage] = useState<string>('all');

  const filteredAnalyses = allAnalyses.filter(item => {
    const matchesOven = filterOven === 'all' || String(item.ovenId) === filterOven;
    const matchesStage = filterStage === 'all' || item.stage === filterStage;
    return matchesOven && matchesStage;
  });

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="bg-industrial-card border border-industrial-border rounded-3xl p-6 shadow-scada bg-gradient-to-r from-industrial-card via-industrial-card to-purple-950/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center shadow-scada-glow">
            <ImageIcon className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white font-mono tracking-tight">BANCO INTELIGENTE DE IMAGENS & METADADOS</h2>
            <p className="text-xs text-industrial-textSecondary">Repositório visual de amostragem de torra com tags de IA e validação de operador</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-industrial-card border border-industrial-border rounded-2xl p-4 shadow-scada grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] font-bold text-industrial-textMuted uppercase block mb-1">Filtrar por Forno</label>
          <select
            value={filterOven}
            onChange={(e) => setFilterOven(e.target.value)}
            className="w-full bg-industrial-bg border border-industrial-border rounded-xl px-3 py-2 text-xs font-semibold text-white focus:border-industrial-accent focus:outline-none"
          >
            <option value="all">Todos os Fornos</option>
            <option value="1">Forno 1</option>
            <option value="2">Forno 2</option>
            <option value="3">Forno 3</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-industrial-textMuted uppercase block mb-1">Filtrar por Classificação IA</label>
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="w-full bg-industrial-bg border border-industrial-border rounded-xl px-3 py-2 text-xs font-semibold text-white focus:border-industrial-accent focus:outline-none"
          >
            <option value="all">Todas as Classificações</option>
            <option value="cru">Cru</option>
            <option value="clara">Torra Clara</option>
            <option value="quase">Quase no Ponto</option>
            <option value="ideal">Ponto Ideal 🟢</option>
            <option value="passou">Passou do Ponto ⚠️</option>
          </select>
        </div>

        <div className="text-right text-xs text-industrial-textMuted flex items-end justify-end font-mono pb-1">
          {filteredAnalyses.length} imagens registradas
        </div>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAnalyses.length === 0 ? (
          <div className="col-span-full bg-industrial-card border border-industrial-border rounded-2xl p-8 text-center text-industrial-textMuted text-sm">
            Nenhuma imagem encontrada com os filtros selecionados.
          </div>
        ) : (
          filteredAnalyses.map(item => {
            const styles = getStageBadgeStyles(item.stage);

            return (
              <div
                key={item.id}
                className="bg-industrial-card border border-industrial-border hover:border-industrial-borderActive rounded-2xl overflow-hidden shadow-scada transition-all group"
              >
                {/* Image */}
                <div className="relative h-48 bg-industrial-bg overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt="Amostra"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-industrial-card/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-industrial-border text-xs font-mono font-bold text-white">
                    F{item.ovenId}
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border ${styles.bg} ${styles.text} ${styles.border}`}>
                      {getStageLabel(item.stage)} ({item.confidence}%)
                    </span>
                  </div>
                </div>

                {/* Metadata Details */}
                <div className="p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-industrial-textSecondary">
                    <span className="flex items-center gap-1 font-semibold text-white">
                      <User className="w-3.5 h-3.5 text-blue-400" />
                      {item.operatorName}
                    </span>
                    <span className="font-mono text-[10px] text-industrial-textMuted">{formatDateTime(item.timestamp)}</span>
                  </div>

                  <div className="flex items-center justify-between text-industrial-textMuted pt-1 border-t border-industrial-border text-[11px]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      Instante da foto: {formatSecondsToReadable(item.timeInRoastSeconds)}
                    </span>
                    {item.humanFeedback && (
                      <span className={`font-bold flex items-center gap-1 ${
                        item.humanFeedback === 'agreed' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {item.humanFeedback === 'agreed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                        {item.humanFeedback === 'agreed' ? 'Confirmado' : 'Corrigido'}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
