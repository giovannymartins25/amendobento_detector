import { RoastSession, PredictiveAlert, User, OvenId, OvenConfig } from '../types/roast';
import { supabaseService } from './supabaseService';

// Limpar obrigatoriamente qualquer dado prévio de cache do LocalStorage
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.clear();
  }
} catch (e) {
  console.warn('[storageService] Não foi possível limpar LocalStorage:', e);
}

export const INITIAL_USERS: User[] = [
  { id: 'op-1', name: 'João Silva', role: 'operator', shift: 'Turno A (Manhã)' },
  { id: 'op-2', name: 'Carlos Souza', role: 'operator', shift: 'Turno B (Tarde)' },
  { id: 'op-3', name: 'Mariana Oliveira', role: 'operator', shift: 'Turno C (Noite)' },
  { id: 'admin-1', name: 'Fábio ADM', role: 'admin', shift: 'Geral / Supervisão' },
];

export const DEFAULT_OPERATOR = INITIAL_USERS[0];
export const DEFAULT_ADMIN = INITIAL_USERS[3];

export const INITIAL_OVENS: OvenConfig[] = [
  { id: 1, name: 'Forno 1', status: 'active', isVisibleOnBoard: false, installedAt: '2025-01-15', notes: 'Linha Principal' },
  { id: 2, name: 'Forno 2', status: 'active', isVisibleOnBoard: false, installedAt: '2025-02-01', notes: 'Linha Secundária' },
  { id: 3, name: 'Forno 3', status: 'active', isVisibleOnBoard: false, installedAt: '2025-03-01', notes: 'Linha 3' },
];

// Estado exclusivamente em memória durante a execução da aplicação (Zero LocalStorage)
let memoryOvens: OvenConfig[] = [...INITIAL_OVENS];
let memorySessions: RoastSession[] = [];
let memoryActiveRoasts: Record<OvenId, RoastSession | null> = { 1: null, 2: null, 3: null };
let memoryAlerts: PredictiveAlert[] = [];
let memoryCurrentUser: User = DEFAULT_OPERATOR;
let memoryIsLoggedIn: boolean = false;

export const storageService = {
  getOvens(): OvenConfig[] {
    return memoryOvens;
  },

  saveOvens(ovens: OvenConfig[]): void {
    memoryOvens = ovens;
    supabaseService.upsertOvens(ovens).catch(() => {});
  },

  getSessions(): RoastSession[] {
    return memorySessions;
  },

  saveSessions(sessions: RoastSession[]): void {
    memorySessions = sessions;
  },

  addSession(session: RoastSession): void {
    const existingIndex = memorySessions.findIndex(s => s.id === session.id);
    if (existingIndex >= 0) {
      memorySessions[existingIndex] = session;
    } else {
      memorySessions.unshift(session);
    }
    
    // Salvar estritamente no banco de dados do Supabase
    supabaseService.saveSession(session).catch(e => {
      console.warn('[StorageService] Erro ao salvar sessão de torra no Supabase DB:', e);
    });
  },

  getActiveRoasts(): Record<OvenId, RoastSession | null> {
    return memoryActiveRoasts;
  },

  saveActiveRoasts(activeRoasts: Record<OvenId, RoastSession | null>): void {
    memoryActiveRoasts = activeRoasts;
  },

  getAlerts(): PredictiveAlert[] {
    return memoryAlerts;
  },

  saveAlerts(alerts: PredictiveAlert[]): void {
    memoryAlerts = alerts;
  },

  addAlert(alert: PredictiveAlert): void {
    memoryAlerts.unshift(alert);
    supabaseService.addAlert(alert).catch(() => {});
  },

  getCurrentUser(): User {
    return memoryCurrentUser;
  },

  saveCurrentUser(user: User): void {
    memoryCurrentUser = user;
  },

  deleteAnalysis(analysisId: string): void {
    // Remover do estado em memória
    memorySessions.forEach(session => {
      if (session.analyses) {
        session.analyses = session.analyses.filter(a => a.id !== analysisId);
      }
    });

    // Deletar diretamente do banco de dados do Supabase (tabela public.analyses)
    supabaseService.deleteAnalysis(analysisId).catch(e => {
      console.warn('[StorageService] Erro ao deletar imagem do Supabase DB:', e);
    });
  },

  getIsLoggedIn(): boolean {
    return memoryIsLoggedIn;
  },

  saveIsLoggedIn(isLoggedIn: boolean): void {
    memoryIsLoggedIn = isLoggedIn;
  }
};
