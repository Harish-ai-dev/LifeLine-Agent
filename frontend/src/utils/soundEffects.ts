'use client';

// Mission-Critical Real Hospital & EMS Sound Effects Synthesizer (Web Audio API)
// Engineered for authentic clinical alarms (Code Blue, Level 1 Trauma, STAT Sirens, Motorola Hospital Pagers)

class RealisticEmergencySoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  // 1. HARD STAT TRAUMA / CODE BLUE ALARM (Authentic Hospital Patient Monitor Crisis Alarm)
  // Sharp, piercing, high-urgency multi-tone crisis burst
  playEmergencySiren() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Pulse 1: 960 Hz / 770 Hz (Hospital Critical Alarm Standard)
      const playBeep = (timeOffset: number, freq: number, duration: number = 0.12) => {
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc2.type = 'square';

        osc.frequency.setValueAtTime(freq, now + timeOffset);
        osc2.frequency.setValueAtTime(freq * 1.01, now + timeOffset); // Slight detune for urgency

        gain.gain.setValueAtTime(0.28, now + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + timeOffset + duration);

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + timeOffset);
        osc2.start(now + timeOffset);
        osc.stop(now + timeOffset + duration);
        osc2.stop(now + timeOffset + duration);
      };

      // 5-Pulse Rapid Crisis Burst: High - High - High - Med - High
      playBeep(0.00, 960, 0.12);
      playBeep(0.16, 960, 0.12);
      playBeep(0.32, 960, 0.12);
      playBeep(0.48, 770, 0.16);
      playBeep(0.68, 960, 0.22);
    } catch (e) {
      console.warn('Audio synthesis error:', e);
    }
  }

  playStatCodeBlueAlarm() {
    this.playEmergencySiren();
  }

  // 2. HEAVY INDUSTRIAL / MILITARY AIR-GAP DISASTER KLAXON
  // Deep resonant emergency buzzer for system blackout / air-gap intercept
  playFailureKlaxon() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc2.type = 'square';

      // Harsh dissonance: 440 Hz + 466 Hz (tritone / minor second tension)
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(370, now + 0.5);

      osc2.frequency.setValueAtTime(466, now);
      osc2.frequency.linearRampToValueAtTime(392, now + 0.5);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.setValueAtTime(0.35, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.65);
      osc2.stop(now + 0.65);
    } catch (e) {
      console.warn('Audio synthesis error:', e);
    }
  }

  playAirGapKlaxon() {
    this.playFailureKlaxon();
  }

  // 3. AMBULANCE / DISPATCH PROXIMITY ALERT (Dual Tone EMS Chirp)
  playAmbulanceArrivalChime() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.setValueAtTime(1200, now + 0.15);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      console.warn('Audio synthesis error:', e);
    }
  }

  // 4. PROFESSIONAL CLINICAL ACKNOWLEDGE TONE (Sharp Medical Double-Tap)
  playAcknowledgeChime() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      const playTone = (offset: number, freq: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + offset);
        gain.gain.setValueAtTime(0.2, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.1);
      };

      playTone(0.0, 1000);
      playTone(0.12, 1500);
    } catch (e) {
      console.warn('Audio synthesis error:', e);
    }
  }

  // 5. TELEMETRY HEARTBEAT BLIP
  playTelemetryPing() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      console.warn('Audio synthesis error:', e);
    }
  }
}

export const soundEffects = new RealisticEmergencySoundEngine();
