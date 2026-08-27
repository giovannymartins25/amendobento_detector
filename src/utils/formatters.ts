import { RoastStage } from '../types/roast';

export function formatSecondsToMMSS(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    const formattedHrs = String(hrs).padStart(2, '0');
    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');
    return `${formattedHrs}:${formattedMins}:${formattedSecs}`;
  }

  const formattedMins = String(mins).padStart(2, '0');
  const formattedSecs = String(secs).padStart(2, '0');
  return `${formattedMins}:${formattedSecs}`;
}

export function formatSecondsToReadable(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins} min ${secs}s`;
}

export function formatDateTime(dateInput: string | Date): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTimeOnly(dateInput: string | Date): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function getStageLabel(stage: RoastStage): string {
  switch (stage) {
    case 'cru': return 'Cru';
    case 'clara': return 'Torra Clara';
    case 'quase': return 'Quase no Ponto';
    case 'ideal': return 'Ponto Ideal';
    case 'passou': return 'Passou do Ponto';
    default: return 'Desconhecido';
  }
}

export function getStageProgressPercent(stage: RoastStage): number {
  switch (stage) {
    case 'cru': return 20;
    case 'clara': return 45;
    case 'quase': return 75;
    case 'ideal': return 100;
    case 'passou': return 100;
    default: return 0;
  }
}

export function getStageColorHex(stage: RoastStage): string {
  switch (stage) {
    case 'cru': return '#94A3B8';       // Cinza
    case 'clara': return '#FBBF24';     // Amarelo claro
    case 'quase': return '#F59E0B';     // Laranja
    case 'ideal': return '#10B981';     // Verde Esmeralda
    case 'passou': return '#EF4444';    // Vermelho Alerta
    default: return '#3875F6';
  }
}

export function getStageBadgeStyles(stage: RoastStage): { bg: string; text: string; border: string } {
  switch (stage) {
    case 'cru':
      return { bg: 'bg-slate-800/80', text: 'text-slate-300', border: 'border-slate-700' };
    case 'clara':
      return { bg: 'bg-amber-950/60', text: 'text-amber-300', border: 'border-amber-700/50' };
    case 'quase':
      return { bg: 'bg-orange-950/60', text: 'text-orange-300', border: 'border-orange-700/50' };
    case 'ideal':
      return { bg: 'bg-emerald-950/80', text: 'text-emerald-300', border: 'border-emerald-500/60' };
    case 'passou':
      return { bg: 'bg-rose-950/80', text: 'text-rose-300', border: 'border-rose-600/60' };
    default:
      return { bg: 'bg-blue-950/60', text: 'text-blue-300', border: 'border-blue-700/50' };
  }
}
