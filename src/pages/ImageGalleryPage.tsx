import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { supabaseService } from '../services/supabaseService';
import { useAuth } from '../contexts/AuthContext';
import { AnalysisResult } from '../types/roast';
import { formatDateTime, getStageBadgeStyles, getStageLabel, formatSecondsToReadable } from '../utils/formatters';
import { Image as ImageIcon, Clock, User, CheckCircle2, AlertTriangle, Trash2, AlertOctagon, Loader2, X, Database } from 'lucide-react';
import { AnalyticsSubNav } from '../components/common/AnalyticsSubNav';

interface ImageGalleryPageProps {
  onTabChange?: (tab: string) => void;
}

export const ImageGalleryPage: React.FC<ImageGalleryPageProps> = ({ onTabChange }) => {
  const { isAdmin } = useAuth();
  const [allAnalyses, setAllAnalyses] = useState<AnalysisResult[]>([]);
  const [filterOven, setFilterOven] = useState<string>('all');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState<boolean>(true);

  // Deletion Modal state
  const [analysisToDelete, setAnalysisToDelete] = useState<AnalysisResult | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadAnalyses = async () => {
    setIsLoadingAnalyses(true);
    try {
      const [remoteAnalyses, remoteSessions] = await Promise.all([
        supabaseService.fetchAnalyses(),
        supabaseService.fetchSessions(),
      ]);

      const map = new Map<string, AnalysisResult>();

      // 1. Adicionar análises registradas na tabela `public.analyses` do Supabase DB
      if (remoteAnalyses && remoteAnalyses.length > 0) {
        remoteAnalyses.forEach(a => {
          if (a && a.id && (a.imageUrl || (a as any).image_url)) {
            const url = a.imageUrl || (a as any).image_url;
            map.set(a.id, { ...a, imageUrl: url });
          }
        });
      }

      // 2. Adicionar análises anexadas às sessões remotas `public.roast_sessions`
      if (remoteSessions && remoteSessions.length > 0) {
        remoteSessions.forEach(s => {
          if (s.analyses && s.analyses.length > 0) {
            s.analyses.forEach(a => {
              if (a && a.id) {
                const url = a.imageUrl || (a as any).image_url;
                if (!map.has(a.id)) {
                  map.set(a.id, { ...a, imageUrl: url });
                }
              }
            });
          }
        });
      }

      // 3. Adicionar análises armazenadas em memória local
      const localSessions = storageService.getSessions();
      if (localSessions && localSessions.length > 0) {
        localSessions.forEach(s => {
          if (s.analyses && s.analyses.length > 0) {
            s.analyses.forEach(a => {
              if (a && a.id && !map.has(a.id)) {
                map.set(a.id, a);
              }
            });
          }
        });
      }

      // 4. Adicionar análises de torras ativas em andamento
      const activeRoasts = storageService.getActiveRoasts();
      Object.values(activeRoasts).forEach(s => {
        if (s && s.analyses && s.analyses.length > 0) {
          s.analyses.forEach(a => {
            if (a && a.id && !map.has(a.id)) {
              map.set(a.id, a);
            }
          });
        }
      });

      const combinedAnalyses = Array.from(map.values()).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setAllAnalyses(combinedAnalyses);
    } catch (e) {
      console.warn('[ImageGalleryPage] Exceção ao consultar análises do Supabase DB:', e);
      setAllAnalyses([]);
    } finally {
      setIsLoadingAnalyses(false);
    }
  };

  useEffect(() => {
    loadAnalyses();
  }, []);

  const handleOpenDeleteModal = (analysis: AnalysisResult) => {
    setDeleteError(null);
    setAnalysisToDelete(analysis);
  };

  const handleConfirmDelete = async () => {
    if (!analysisToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      // 1. Deletar a imagem/análise diretamente do banco de dados do Supabase
      const success = await supabaseService.deleteAnalysis(analysisToDelete.id);
      
      // 2. Sincronizar cache local de sessões
      storageService.deleteAnalysis(analysisToDelete.id);

      if (success) {
        setAllAnalyses(prev => prev.filter(item => item.id !== analysisToDelete.id));
        setAnalysisToDelete(null);
      } else {
        setDeleteError('Não foi possível excluir a imagem do banco de dados do Supabase. Tente novamente.');
      }
    } catch (e) {
      console.error('[ImageGalleryPage] Erro ao excluir análise:', e);
      setDeleteError('Erro ao comunicar com o banco de dados do Supabase.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAnalyses = allAnalyses.filter(item => {
    const matchesOven = filterOven === 'all' || String(item.ovenId) === filterOven;
    const matchesStage = filterStage === 'all' || item.stage === filterStage;
    return matchesOven && matchesStage;
  });

  return (
    <div className="space-y-6 pb-20">
      
      {/* SubNav para navegação rápida */}
      {onTabChange && <AnalyticsSubNav activeTab="gallery" setActiveTab={onTabChange} />}

      {/* Header */}
      <div className="bg-industrial-card border border-industrial-border rounded-3xl p-6 shadow-scada bg-gradient-to-r from-industrial-card via-industrial-card to-purple-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center shadow-scada-glow shrink-0">
            <ImageIcon className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white font-mono tracking-tight">BANCO INTELIGENTE DE IMAGENS & METADADOS</h2>
            <p className="text-xs text-industrial-textSecondary">Repositório visual de amostragem de torra armazenado no Supabase DB</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-industrial-bg px-3.5 py-1.5 rounded-xl border border-industrial-border text-xs font-mono text-purple-300 shrink-0">
          <Database className="w-4 h-4 text-purple-400" />
          <span>Sincronizado Supabase DB</span>
        </div>
      </div>

      {/* Filtros */}
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
          {filteredAnalyses.length} imagens encontradas
        </div>
      </div>

      {/* Grid de Imagens */}
      {isLoadingAnalyses ? (
        <div className="bg-industrial-card border border-industrial-border rounded-2xl p-12 text-center text-industrial-textMuted text-sm flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <span>Carregando banco de imagens do Supabase...</span>
        </div>
      ) : (
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
                  className="bg-industrial-card border border-industrial-border hover:border-industrial-borderActive rounded-2xl overflow-hidden shadow-scada transition-all group relative"
                >
                  {/* Imagem */}
                  <div className="relative h-48 bg-industrial-bg overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt="Amostra"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-industrial-card/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-industrial-border text-xs font-mono font-bold text-white">
                      F{item.ovenId}
                    </div>
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border ${styles.bg} ${styles.text} ${styles.border}`}>
                        {getStageLabel(item.stage)} ({item.confidence}%)
                      </span>

                      {/* Botão de Exclusão com Modal */}
                      <button
                        type="button"
                        onClick={() => handleOpenDeleteModal(item)}
                        title="Excluir imagem do banco de dados Supabase"
                        className="p-1.5 bg-rose-950/80 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg border border-rose-600/50 transition-colors shadow-md active:scale-95"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Detalhes de Metadados */}
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
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO NO BANCO DE DADOS */}
      {analysisToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-industrial-card border border-industrial-border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative border-rose-900/50">
            
            {/* Botão Fechar */}
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => {
                setAnalysisToDelete(null);
                setDeleteError(null);
              }}
              className="absolute top-4 right-4 p-2 text-industrial-textMuted hover:text-white rounded-xl hover:bg-industrial-bg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho */}
            <div className="flex items-center gap-3 border-b border-industrial-border pb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0 shadow-lg">
                <AlertOctagon className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white font-mono tracking-tight">EXCLUIR IMAGEM DO BANCO DE DADOS</h3>
                <p className="text-xs text-rose-400 font-semibold">Ação permanente • Tabela public.analyses (Supabase DB)</p>
              </div>
            </div>

            {/* Card Preview da Imagem */}
            <div className="bg-industrial-bg border border-industrial-border rounded-2xl p-3 flex gap-4 items-center">
              <img
                src={analysisToDelete.imageUrl}
                alt="Amostra para exclusão"
                className="w-20 h-20 object-cover rounded-xl border border-industrial-border shrink-0"
              />
              <div className="space-y-1.5 text-xs text-industrial-textSecondary">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white bg-industrial-card px-2 py-0.5 rounded border border-industrial-border">
                    Forno {analysisToDelete.ovenId}
                  </span>
                  <span className="font-bold text-emerald-400">
                    {getStageLabel(analysisToDelete.stage)} ({analysisToDelete.confidence}%)
                  </span>
                </div>
                <p className="flex items-center gap-1 font-semibold text-white">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  Operador: {analysisToDelete.operatorName}
                </p>
                <p className="font-mono text-[10px] text-industrial-textMuted flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDateTime(analysisToDelete.timestamp)}
                </p>
              </div>
            </div>

            {/* Mensagem de confirmação */}
            <p className="text-xs text-industrial-textSecondary leading-relaxed">
              Você está prestes a excluir definitivamente esta imagem e seus metadados de análise do banco de dados relacional no Supabase. {isAdmin && <strong className="text-purple-400 block mt-1">Autorização de Administrador confirmada.</strong>} <strong className="text-white">Esta ação não poderá ser desfeita.</strong>
            </p>

            {deleteError && (
              <div className="p-3 bg-rose-950/80 border border-rose-600/60 rounded-xl text-xs text-rose-300 flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setAnalysisToDelete(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2.5 bg-industrial-bg hover:bg-industrial-card border border-industrial-border rounded-xl text-xs font-extrabold uppercase tracking-wider text-industrial-textSecondary hover:text-white transition-all disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-700 hover:from-red-700 hover:to-rose-600 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all disabled:opacity-50 active:scale-95"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    EXCLUINDO DO BANCO...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    SIM, EXCLUIR DO BANCO DE DADOS
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
