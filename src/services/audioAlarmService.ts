// Web Audio API Synthesizer for Industrial Alarms
class AudioAlarmService {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private alarmInterval: number | null = null;

  public initContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopAlarm();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public playBeep(frequency: number = 880, durationMs: number = 200) {
    if (this.isMuted) return;

    try {
      this.initContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + (durationMs / 1000));

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + (durationMs / 1000));
    } catch (e) {
      console.warn('Erro ao tocar som:', e);
    }
  }

  public startAlarmPattern() {
    if (this.alarmInterval !== null || this.isMuted) return;

    // Play initial beep immediately
    this.playBeep(950, 150);
    setTimeout(() => this.playBeep(1200, 200), 200);

    // Continuous double beep every 1.0 second until stopAlarm is called
    this.alarmInterval = window.setInterval(() => {
      this.playBeep(950, 150);
      setTimeout(() => this.playBeep(1200, 200), 200);
    }, 1000);
  }

  public stopAlarm() {
    if (this.alarmInterval !== null) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
  }
}

export const audioAlarmService = new AudioAlarmService();
