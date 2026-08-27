import { RoastSession, AnalysisResult, PredictiveAlert, User, OvenId, RoastStage, OvenConfig } from '../types/roast';

const STORAGE_KEYS = {
  SESSIONS: 'amendobento_roast_sessions',
  ACTIVE_ROASTS: 'amendobento_active_roasts',
  ALERTS: 'amendobento_alerts',
  CURRENT_USER: 'amendobento_current_user',
  CUSTOM_IMAGES: 'amendobento_custom_images',
  OVENS: 'amendobento_ovens',
  IS_LOGGED_IN: 'amendobento_is_logged_in',
};

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

// Initial mock dataset for industrial calculations & charts
function generateInitialHistoricalSessions(): RoastSession[] {
  const sessions: RoastSession[] = [];
  const operators = INITIAL_USERS.filter(u => u.role === 'operator');
  const stages: RoastStage[] = ['ideal', 'ideal', 'ideal', 'quase', 'passou'];

  const now = new Date();

  // Create 45 historical sessions spread over the past 30 days
  for (let i = 45; i >= 1; i--) {
    const ovenId = ((i % 3) + 1) as OvenId;
    const operator = operators[i % operators.length];
    const sessionDate = new Date(now.getTime() - i * 16 * 60 * 60 * 1000); // spread across days

    // Oven 1 has target range 1h to 1h15m (avg ~3900s = 65 min)
    let baseDuration = 3900;
    if (ovenId === 1) baseDuration = 3900;
    if (ovenId === 2) baseDuration = 730; // 18% slower -> triggers maintenance alert!
    if (ovenId === 3) baseDuration = 590;

    const durationSeconds = baseDuration + Math.floor((Math.sin(i) * 35));
    const finalStage = stages[i % stages.length];

    const mockAnalysis: AnalysisResult = {
      id: `ans-hist-${i}`,
      timestamp: sessionDate.toISOString(),
      timeInRoastSeconds: durationSeconds - 30,
      stage: finalStage,
      confidence: 91 + (i % 8),
      detectedObjects: [
        { class: finalStage === 'ideal' ? 'Ponto Ideal' : finalStage, confidence: 0.94, bbox: { x: 50, y: 50, width: 200, height: 150 } }
      ],
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
      ovenId,
      operatorName: operator.name,
      humanFeedback: i % 5 === 0 ? 'disagreed' : 'agreed',
      correctedStage: i % 5 === 0 ? 'ideal' : undefined,
    };

    sessions.push({
      id: `roast-hist-${i}`,
      ovenId,
      operatorId: operator.id,
      operatorName: operator.name,
      startTime: sessionDate.toISOString(),
      endTime: new Date(sessionDate.getTime() + durationSeconds * 1000).toISOString(),
      durationSeconds,
      status: 'completed',
      targetQuantityKg: 50,
      finalStage,
      analyses: [mockAnalysis],
      timeline: [
        {
          id: `tl-hist-1-${i}`,
          timestamp: sessionDate.toISOString(),
          type: 'started',
          title: 'Torra Iniciada',
          description: `Torra iniciada por ${operator.name} no Forno ${ovenId}`,
        },
        {
          id: `tl-hist-2-${i}`,
          timestamp: new Date(sessionDate.getTime() + (durationSeconds - 30) * 1000).toISOString(),
          type: 'analysis',
          title: 'Análise de Inteligência IA',
          description: `Classificação: ${finalStage.toUpperCase()} (${mockAnalysis.confidence}% de confiança)`,
          stage: finalStage,
          analysisId: mockAnalysis.id,
        },
        {
          id: `tl-hist-3-${i}`,
          timestamp: new Date(sessionDate.getTime() + durationSeconds * 1000).toISOString(),
          type: 'completed',
          title: 'Torra Finalizada',
          description: `Finalizada com sucesso após ${Math.floor(durationSeconds / 60)} min.`,
        }
      ]
    });
  }

  return sessions;
}

export const storageService = {
  getOvens(): OvenConfig[] {
    const data = localStorage.getItem(STORAGE_KEYS.OVENS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.OVENS, JSON.stringify(INITIAL_OVENS));
      return INITIAL_OVENS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_OVENS;
    }
  },

  saveOvens(ovens: OvenConfig[]): void {
    localStorage.setItem(STORAGE_KEYS.OVENS, JSON.stringify(ovens));
  },

  getSessions(): RoastSession[] {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!data) {
      const initial = generateInitialHistoricalSessions();
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(data);
    } catch {
      return generateInitialHistoricalSessions();
    }
  },

  saveSessions(sessions: RoastSession[]): void {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  },

  addSession(session: RoastSession): void {
    const sessions = this.getSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.unshift(session);
    }
    this.saveSessions(sessions);
  },

  getActiveRoasts(): Record<OvenId, RoastSession | null> {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_ROASTS);
    if (!data) {
      return {};
    }
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  },

  saveActiveRoasts(activeRoasts: Record<OvenId, RoastSession | null>): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ROASTS, JSON.stringify(activeRoasts));
  },

  getAlerts(): PredictiveAlert[] {
    const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveAlerts(alerts: PredictiveAlert[]): void {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  },

  addAlert(alert: PredictiveAlert): void {
    const alerts = this.getAlerts();
    alerts.unshift(alert);
    this.saveAlerts(alerts);
  },

  getCurrentUser(): User {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!data) return DEFAULT_OPERATOR;
    try {
      const user: User = JSON.parse(data);
      if (user.id === 'admin-1' || user.role === 'admin') {
        user.name = 'Fábio ADM';
      }
      return user;
    } catch {
      return DEFAULT_OPERATOR;
    }
  },

  saveCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  getIsLoggedIn(): boolean {
    const data = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
    return data ? JSON.parse(data) : false;
  },

  saveIsLoggedIn(isLoggedIn: boolean): void {
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, JSON.stringify(isLoggedIn));
  }
};
