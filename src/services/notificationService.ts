// Notification Service — envia notificações de sistema (browser)
// para alertas de torra mesmo quando o site está em segundo plano

class NotificationService {
  private hasPermission: boolean = false;

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications API não suportada neste browser.');
      return false;
    }
    if (Notification.permission === 'granted') {
      this.hasPermission = true;
      return true;
    }
    if (Notification.permission === 'denied') {
      this.hasPermission = false;
      return false;
    }
    const result = await Notification.requestPermission();
    this.hasPermission = result === 'granted';
    return this.hasPermission;
  }

  getPermission(): boolean {
    if (!('Notification' in window)) return false;
    return Notification.permission === 'granted';
  }

  send(title: string, body: string, options?: { icon?: string; tag?: string }) {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    try {
      new Notification(title, {
        body,
        icon: options?.icon ?? '/favicon.ico',
        tag: options?.tag,
        requireInteraction: true, // fica visível até o usuário interagir
      });
    } catch (e) {
      console.warn('Erro ao enviar notificação:', e);
    }
  }

  // Só envia se o usuário não está na página (background)
  sendIfBackground(title: string, body: string, tag?: string) {
    if (document.hidden) {
      this.send(title, body, { tag });
    }
  }
}

export const notificationService = new NotificationService();
