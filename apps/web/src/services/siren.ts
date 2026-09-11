// Web Audio API Emergency Siren Controller

class EmergencySirenController {
  private audioCtx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private intervalId: any = null;
  private isMuted: boolean = false;

  public initContext(): boolean {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return !!this.audioCtx;
  }

  public isAudioEnabled(): boolean {
    return !!this.audioCtx && this.audioCtx.state === 'running';
  }

  public playSiren(severity: 'HIGH' | 'CRITICAL' = 'CRITICAL') {
    if (this.isMuted || this.isPlaying) return;
    if (!this.initContext() || !this.audioCtx) return;

    try {
      this.isPlaying = true;
      const now = this.audioCtx.currentTime;

      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(0.15, now);
      this.gainNode.connect(this.audioCtx.destination);

      this.osc1 = this.audioCtx.createOscillator();
      this.osc2 = this.audioCtx.createOscillator();

      this.osc1.type = 'sawtooth';
      this.osc2.type = 'sine';

      this.osc1.connect(this.gainNode);
      this.osc2.connect(this.gainNode);

      this.osc1.start(now);
      this.osc2.start(now);

      // Alternating 2-tone emergency siren frequencies (600 Hz <-> 900 Hz)
      let highTone = false;
      this.intervalId = setInterval(() => {
        if (!this.audioCtx || !this.osc1 || !this.osc2) return;
        const t = this.audioCtx.currentTime;
        const freq1 = highTone ? 960 : 640;
        const freq2 = highTone ? 480 : 320;

        this.osc1.frequency.exponentialRampToValueAtTime(freq1, t + 0.15);
        this.osc2.frequency.exponentialRampToValueAtTime(freq2, t + 0.15);
        highTone = !highTone;
      }, 350);
    } catch (e) {
      console.warn('Siren audio error:', e);
      this.stopSiren();
    }
  }

  public stopSiren() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.osc1) {
      try { this.osc1.stop(); } catch (e) {}
      this.osc1.disconnect();
      this.osc1 = null;
    }
    if (this.osc2) {
      try { this.osc2.stop(); } catch (e) {}
      this.osc2.disconnect();
      this.osc2 = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    this.isPlaying = false;
  }

  public silence30s() {
    this.stopSiren();
    this.isMuted = true;
    setTimeout(() => {
      this.isMuted = false;
    }, 30000);
  }

  public testSiren() {
    this.playSiren('CRITICAL');
    setTimeout(() => {
      this.stopSiren();
    }, 2500);
  }
}

export const sirenService = new EmergencySirenController();
