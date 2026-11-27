"use client";
/**
 * Original, royalty-free sound design synthesised live with the Web Audio API — no audio files,
 * no licensing. Browsers need one user gesture before audio can start (`unlock()`).
 */
class Sfx {
  ctx: AudioContext | null = null;
  muted = false;
  private master: GainNode | null = null;

  get ready() { return !!this.ctx && this.ctx.state === "running"; }
  unlock = async () => {
    if (typeof window === "undefined") return false;
    if (!this.ctx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.gain.value = 0.55;
      const comp = this.ctx.createDynamicsCompressor();
      this.master.connect(comp); comp.connect(this.ctx.destination);
    }
    if (this.ctx.state !== "running") await this.ctx.resume().catch(() => {});
    return this.ready;
  };

  private tone(freq: number, t0: number, dur: number, type: OscillatorType, vol: number, attack = 0.02, glideTo?: number) {
    const c = this.ctx!, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t0);
    if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(this.master!); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  private noise(t0: number, dur: number, f0: number, f1: number, vol: number) {
    const c = this.ctx!, len = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const s = c.createBufferSource(); s.buffer = buf;
    const f = c.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 1.2;
    f.frequency.setValueAtTime(f0, t0); f.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + dur * 0.8); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(this.master!); s.start(t0);
  }
  private ok() { return !!this.ctx && this.ready && !this.muted; }

  /** Warm, summery title sting: rising swell + major-7 chord + sparkle run. */
  opening() {
    if (!this.ok()) return; const t = this.ctx!.currentTime + 0.05;
    this.noise(t, 2.4, 300, 5200, 0.22);
    [261.63, 329.63, 392, 493.88, 659.25].forEach((f, i) => this.tone(f, t + 2.2, 3.2, "sine", 0.13 - i * 0.012, 0.25));
    [783.99, 987.77, 1174.66, 1318.5, 1567.98, 1975.5].forEach((f, i) => this.tone(f, t + 2.35 + i * 0.09, 1.2, "triangle", 0.06, 0.01));
  }
  whoosh() { if (!this.ok()) return; this.noise(this.ctx!.currentTime, 0.7, 400, 4200, 0.18); }
  /** Cast reveal: whoosh + bright bell. */
  reveal() {
    if (!this.ok()) return; const t = this.ctx!.currentTime;
    this.noise(t, 0.6, 500, 3800, 0.16);
    [880, 1318.5, 1760].forEach((f, i) => this.tone(f, t + 0.45 + i * 0.06, 1.3, "sine", 0.1, 0.005));
    this.tone(220, t + 0.45, 0.5, "triangle", 0.12, 0.01);
  }
  /** Bombshell alert: two-tone siren pulses. */
  siren() {
    if (!this.ok()) return; const t = this.ctx!.currentTime + 0.02;
    for (let i = 0; i < 4; i++) {
      this.tone(620, t + i * 0.9, 0.42, "sawtooth", 0.07, 0.03, 880);
      this.tone(880, t + i * 0.9 + 0.45, 0.42, "sawtooth", 0.07, 0.03, 620);
    }
    this.tone(55, t, 3.6, "sine", 0.22, 0.4);
  }
  /** Big glamorous reveal: swell, brass-ish chord, glitter cascade. */
  fanfare() {
    if (!this.ok()) return; const t = this.ctx!.currentTime + 0.02;
    this.noise(t, 0.9, 300, 6500, 0.24);
    [261.63, 329.63, 392, 523.25].forEach((f) => this.tone(f, t + 0.7, 2.6, "sawtooth", 0.07, 0.04));
    [523.25, 659.25, 783.99, 1046.5].forEach((f) => this.tone(f, t + 0.7, 2.6, "triangle", 0.09, 0.04));
    for (let i = 0; i < 14; i++) this.tone(1200 + Math.random() * 2400, t + 0.9 + i * 0.07, 0.8, "sine", 0.04, 0.005);
  }
  /** 3-2-1 beeps then a bright "go" ding. */
  countdown() {
    if (!this.ok()) return; const t = this.ctx!.currentTime + 0.02;
    [0, 1, 2].forEach((i) => this.tone(660, t + i, 0.18, "square", 0.06, 0.005));
    [880, 1318.5].forEach((f) => this.tone(f, t + 3, 0.7, "triangle", 0.1, 0.005));
  }
  /** Rubber-stamp thud for verdicts. */
  stamp() { if (!this.ok()) return; const t = this.ctx!.currentTime; this.tone(110, t, 0.35, "sine", 0.3, 0.003, 45); this.noise(t, 0.12, 900, 300, 0.2); }
  chime() { if (!this.ok()) return; const t = this.ctx!.currentTime; [659.25, 987.77].forEach((f, i) => this.tone(f, t + i * 0.12, 0.9, "sine", 0.1, 0.005)); }
}
export const sfx = new Sfx();
