import React, { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';
import { RoastSession } from '../types/roast';
import { formatDateTime, formatSecondsToReadable, getStageBadgeStyles, getStageLabel } from '../utils/formatters';
import { History as HistoryIcon, Search, Filter, X, Clock, User, Loader2 } from 'lucide-react';
import { AnalyticsSubNav } from '../components/common/AnalyticsSubNav';

interface HistoryPageProps {
  onTabChange?: (tab: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onTabChange }) => {
  const [sessions, setSessions] = useState<RoastSession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOven, setFilterOven] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<RoastSession | null>(null);

  useEffect(() => {
    async function loadSessions() {
      setIsLoading(true);
      try {
        const data = await supabaseService.fetchSessions();
        if (data) {
          setSessions(data.filter(s => s.status === 'completed'));
        }
      } catch (e) {
        console.warn('[HistoryPage] Erro ao buscar histórico no Supabase DB:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadSessions();
  }, []);

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          session.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (session.notes && session.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesOven = filterOven === 'all' || String(session.ovenId) === filterOven;

    return matchesSearch && matchesOven;
  });

  return (
    <div className="space-y-6 pb-20">
      
      {/* SubNav for quick switching */}
      {onTabChange && <AnalyticsSubNav activeTab="history" setActiveTab={onTabChange} />}

      {/* Header */}
      <div className="bg-industrial-card border border-industrial-border rounded-3xl p-6 shadow-scada bg-gradient-to-r from-industrial-card via-industrial-card to-blue-950/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-industrial-accent/20 border border-industrial-accent/40 text-industrial-accent flex items-center justify-center shadow-scada-glow">
            <HistoryIcon className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white font-mono tracking-tight">HISTÓRICO COMPLETO DE TORRAS</h2>
            <p className="text-xs text-industrial-textSecondary">Consulta auditável de todas as torras finalizadas, timelines e registros de IA</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-industrial-card border border-industrial-border rounded-2xl p-4 shadow-scada grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-industrial-textMuted absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Pesquisar por operador, notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-industrial-bg border border-industrial-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-industrial-textMuted focus:border-industrial-accent focus:outline-none"
          />
        </div>

        {/* Filter Oven */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-industrial-accent flex-shrink-0" />
          <select
            value={filterOven}
            onChange={(e) => setFilterOven(e.target.value)}
            className="w-full bg-industrial-bg border border-industrial-border rounded-xl px-3 py-2.5 text-xs font-semibold text-white focus:border-industrial-accent focus:outline-none"
          >
            <option value="all">Todos os Fornos (1, 2, 3)</option>
            <option value="1">Apenas Forno 1</option>
            <option value="2">Apenas Forno 2</option>
            <option value="3">Apenas Forno 3</option>
          </select>
        </div>

        <div className="text-right text-xs text-industrial-textMuted flex items-center justify-end font-mono">
          {filteredSessions.length} torras encontradas
        </div>

      </div>

      {/* Sessions Table / List */}
      {isLoading ? (
        <div className="bg-industrial-card border border-industrial-border rounded-2xl p-12 text-center text-industrial-textMuted text-sm flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-industrial-accent animate-spin" />
          <span>Carregando histórico de torras do Supabase...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSessions.length === 0 ? (
            <div className="bg-industrial-card border border-industrial-border rounded-2xl p-8 text-center text-industrial-textMuted text-sm">
              Nenhuma torra encontrada com os filtros selecionados.
            </div>
          ) : (
          filteredSessions.map(session => {
            const finalStage = session.finalStage || 'ideal';
            const styles = getStageBadgeStyles(finalStage);

            return (
              <div
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className="bg-industrial-card border border-industrial-border hover:border-industrial-borderActive rounded-2xl p-4 shadow-scada transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-industrial-bg border border-industrial-border flex items-center justify-center font-mono font-extrabold text-white text-lg flex-shrink-0">
                    F{session.ovenId}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Torra #{session.id.slice(-6)}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${styles.bg} ${styles.text} ${styles.border}`}>
                        {getStageLabel(finalStage)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-industrial-textMuted mt-1">
                      <span className="flex items-center gap-1"><User className="w-3 h-3 text-blue-400" /> {session.operatorName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-emerald-400" /> {formatSecondsToReadable(session.durationSeconds)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right w-full sm:w-auto border-t sm:border-t-0 border-industrial-border pt-2 sm:pt-0 flex items-center justify-between sm:justify-end gap-3">
                  <span className="text-xs font-mono text-industrial-textMuted">{formatDateTime(session.startTime)}</span>
                  <button className="px-3 py-1.5 bg-industrial-cardHover text-white text-xs font-bold rounded-lg border border-industrial-border">
                    Ver Detalhes
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      )}

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-industrial-card border border-industrial-border rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-industrial-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-industrial-accent/20 text-industrial-accent flex items-center justify-center font-mono font-extrabold">
                  F{selectedSession.ovenId}
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white font-mono">DETALHES DA TORRA #{selectedSession.id.slice(-6)}</h3>
                  <p className="text-xs text-industrial-textMuted">{formatDateTime(selectedSession.startTime)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="p-2 hover:bg-industrial-cardHover text-industrial-textMuted hover:text-white rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-industrial-bg p-3 rounded-xl border border-industrial-border">
                <span className="text-[10px] text-industrial-textMuted uppercase font-bold block">Operador</span>
                <span className="font-bold text-white text-sm">{selectedSession.operatorName}</span>
              </div>
              <div className="bg-industrial-bg p-3 rounded-xl border border-industrial-border">
                <span className="text-[10px] text-industrial-textMuted uppercase font-bold block">Duração Total</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{formatSecondsToReadable(selectedSession.durationSeconds)}</span>
              </div>
              <div className="bg-industrial-bg p-3 rounded-xl border border-industrial-border col-span-2 sm:col-span-1">
                <span className="text-[10px] text-industrial-textMuted uppercase font-bold block">Resultado Final</span>
                <span className="font-bold text-white text-sm">{getStageLabel(selectedSession.finalStage || 'ideal')}</span>
              </div>
            </div>

            {/* Photos Captured in Session */}
            {selectedSession.analyses && selectedSession.analyses.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-white uppercase tracking-wider">Imagens Capturadas nesta Torra</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedSession.analyses.map(ans => (
                    <div key={ans.id} className="relative rounded-xl overflow-hidden border border-industrial-border bg-industrial-bg">
                      <img src={ans.imageUrl} alt="Captura" className="w-full h-24 object-cover" />
                      <div className="absolute bottom-0 inset-x-0 bg-black/80 p-1 text-[10px] font-bold text-white text-center">
                        {getStageLabel(ans.stage)} ({ans.confidence}%)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
