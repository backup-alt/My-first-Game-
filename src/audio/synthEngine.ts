/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Procedural Web Audio Synth Engine for FrostPlow
// Zero external audio files: 100% synthesized in real time via Web Audio API.

class SynthEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isBgmEnabled: boolean = true;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;

  // Engine sound nodes
  private engineOsc1: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private engineGain: GainNode | null = null;

  // Snow crunch / plowing swoosh noise nodes
  private snowNoiseNode: AudioBufferSourceNode | null = null;
  private snowNoiseFilter: BiquadFilterNode | null = null;
  private snowNoiseGain: GainNode | null = null;

  // Ambient BGM state
  private bgmTimer: number | null = null;
  private currentChordIndex: number = 0;
  private isInitialized: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user interaction to comply with browser autoplay policies.
  }

  public init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // SFX Bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // BGM Bus
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      this.setupEngineSound();
      this.setupSnowNoise();
      this.startAmbientBgm();

      this.isInitialized = true;
    } catch {
      // Audio not supported or blocked
    }
  }

  public ensureContext() {
    if (!this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- Dynamic Vehicle Engine Sound ---
  private setupEngineSound() {
    if (!this.ctx || !this.sfxGain) return;

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.setValueAtTime(140, this.ctx.currentTime);
    this.engineFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    // Primary low rumble
    this.engineOsc1 = this.ctx.createOscillator();
    this.engineOsc1.type = 'sawtooth';
    this.engineOsc1.frequency.setValueAtTime(38, this.ctx.currentTime);

    // Sub harmonic triangle
    this.engineOsc2 = this.ctx.createOscillator();
    this.engineOsc2.type = 'triangle';
    this.engineOsc2.frequency.setValueAtTime(19, this.ctx.currentTime);

    this.engineOsc1.connect(this.engineFilter);
    this.engineOsc2.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.sfxGain);

    this.engineOsc1.start();
    this.engineOsc2.start();
  }

  public updateEngineSound(speedRatio: number, isThrottleHeld: boolean, isBoosting: boolean) {
    if (!this.ctx || !this.engineOsc1 || !this.engineOsc2 || !this.engineFilter || !this.engineGain) return;
    if (this.isMuted) {
      this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
      return;
    }

    const baseFreq = isBoosting ? 75 : 35;
    const targetFreq1 = baseFreq + speedRatio * (isBoosting ? 90 : 55);
    const targetFreq2 = targetFreq1 * 0.5;
    const filterFreq = 120 + speedRatio * 320 + (isThrottleHeld ? 80 : 0) + (isBoosting ? 200 : 0);
    const targetVolume = (isThrottleHeld || speedRatio > 0.05) ? (isBoosting ? 0.32 : 0.22) : 0.08;

    const time = this.ctx.currentTime;
    this.engineOsc1.frequency.setTargetAtTime(targetFreq1, time, 0.08);
    this.engineOsc2.frequency.setTargetAtTime(targetFreq2, time, 0.08);
    this.engineFilter.frequency.setTargetAtTime(filterFreq, time, 0.08);
    this.engineGain.gain.setTargetAtTime(targetVolume, time, 0.1);
  }

  // --- Snow Plowing Slush / Crunch Noise ---
  private setupSnowNoise() {
    if (!this.ctx || !this.sfxGain) return;

    // Generate 2 seconds of pink/white noise buffer
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99 * b0 + white * 0.05;
      b1 = 0.96 * b1 + white * 0.11;
      b2 = 0.86 * b2 + white * 0.25;
      data[i] = (b0 + b1 + b2 + white * 0.1) * 0.35;
    }

    this.snowNoiseNode = this.ctx.createBufferSource();
    this.snowNoiseNode.buffer = buffer;
    this.snowNoiseNode.loop = true;

    this.snowNoiseFilter = this.ctx.createBiquadFilter();
    this.snowNoiseFilter.type = 'bandpass';
    this.snowNoiseFilter.frequency.setValueAtTime(650, this.ctx.currentTime);
    this.snowNoiseFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    this.snowNoiseGain = this.ctx.createGain();
    this.snowNoiseGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    this.snowNoiseNode.connect(this.snowNoiseFilter);
    this.snowNoiseFilter.connect(this.snowNoiseGain);
    this.snowNoiseGain.connect(this.sfxGain);

    this.snowNoiseNode.start();
  }

  public updateSnowCrunch(isPlowing: boolean, speedRatio: number) {
    if (!this.ctx || !this.snowNoiseGain || !this.snowNoiseFilter) return;
    if (this.isMuted || !isPlowing || speedRatio < 0.05) {
      this.snowNoiseGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.08);
      return;
    }

    const targetGain = Math.min(0.28, speedRatio * 0.3);
    const targetFreq = 450 + speedRatio * 550;

    const time = this.ctx.currentTime;
    this.snowNoiseGain.gain.setTargetAtTime(targetGain, time, 0.06);
    this.snowNoiseFilter.frequency.setTargetAtTime(targetFreq, time, 0.06);
  }

  // --- Combo Synth Bell Chime (Multi-tiered Arpeggios) ---
  public playComboChime(multiplier: number) {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.ensureContext();

    // Pentatonic scale frequencies [C5, D5, E5, G5, A5, C6, D6, E6, G6, A6]
    const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98, 1760.0];
    const baseIdx = Math.min(Math.floor(multiplier - 1) % scale.length, scale.length - 2);

    const now = this.ctx.currentTime;
    const noteCount = multiplier >= 5 ? 3 : 2;

    for (let i = 0; i < noteCount; i++) {
      const freq = scale[(baseIdx + i) % scale.length];
      const startTime = now + i * 0.06;

      // FM Synth Carrier + Modulator for crystalline winter bell chime
      const carrier = this.ctx.createOscillator();
      const carrierGain = this.ctx.createGain();
      const mod = this.ctx.createOscillator();
      const modGain = this.ctx.createGain();

      carrier.type = 'sine';
      carrier.frequency.setValueAtTime(freq, startTime);

      mod.type = 'sine';
      mod.frequency.setValueAtTime(freq * 2.01, startTime); // Harmonic ratio

      modGain.gain.setValueAtTime(freq * 1.5, startTime);
      modGain.gain.exponentialRampToValueAtTime(1, startTime + 0.35);

      mod.connect(carrier.frequency);

      carrierGain.gain.setValueAtTime(0.0, startTime);
      carrierGain.gain.linearRampToValueAtTime(0.18, startTime + 0.015);
      carrierGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

      carrier.connect(carrierGain);
      carrierGain.connect(this.sfxGain);

      mod.start(startTime);
      carrier.start(startTime);
      mod.stop(startTime + 0.5);
      carrier.stop(startTime + 0.5);
    }
  }

  // --- Turbo Boost Swoosh / Riser ---
  public playTurboBoost() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.ensureContext();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.3);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(2400, now + 0.25);
    filter.Q.setValueAtTime(4, now);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  // --- Collectible Coin / Hot Cocoa Pickup ---
  public playCoinPickup() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.ensureContext();

    const now = this.ctx.currentTime;
    const notes = [987.77, 1318.51]; // B5 -> E6 high sparkle

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.0, now + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.05 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.35);
    });
  }

  // --- Obstacle Bump / Metal Clank ---
  public playBump() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.ensureContext();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // --- Upgrade Success Analog Brass Fanfare ---
  public playUpgradeFanfare() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.ensureContext();

    const now = this.ctx.currentTime;
    // C Major Triad with 9th: C4, G4, C5, E5, D6
    const chord = [261.63, 392.00, 523.25, 659.25, 1174.66];

    chord.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const filter = this.ctx!.createBiquadFilter();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now + idx * 0.04);
      filter.frequency.exponentialRampToValueAtTime(1800, now + idx * 0.04 + 0.15);

      gain.gain.setValueAtTime(0.0, now + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.7);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.75);
    });
  }

  // --- Procedural Generative Cozy Winter Ambient BGM ---
  // A gentle warm synth pad progression: EbMaj7 -> Cm7 -> AbMaj7 -> Bb7sus4 (warm, melancholic cozy snow feel)
  private startAmbientBgm() {
    if (this.bgmTimer) return;

    const chords = [
      // Eb Maj7 (Eb3, G3, Bb3, D4)
      [155.56, 196.00, 233.08, 293.66],
      // Cm9 (C3, G3, Bb3, D4)
      [130.81, 196.00, 233.08, 293.66],
      // Ab Maj7 (Ab2, Eb3, G3, C4)
      [103.83, 155.56, 196.00, 261.63],
      // Bb sus4 (Bb2, F3, Bb3, Eb4)
      [116.54, 174.61, 233.08, 311.13]
    ];

    const playNextPadChord = () => {
      if (!this.ctx || !this.bgmGain || this.isMuted || !this.isBgmEnabled) {
        this.bgmTimer = window.setTimeout(playNextPadChord, 4500);
        return;
      }

      const chord = chords[this.currentChordIndex];
      this.currentChordIndex = (this.currentChordIndex + 1) % chords.length;

      const now = this.ctx.currentTime;
      const duration = 4.2;

      chord.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const filter = this.ctx!.createBiquadFilter();
        const gain = this.ctx!.createGain();

        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Soft filter swell
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, now);
        filter.frequency.linearRampToValueAtTime(750, now + 1.8);
        filter.frequency.linearRampToValueAtTime(350, now + duration);

        // Soft ADSR envelope for cozy pad
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.045, now + 1.2);
        gain.gain.setValueAtTime(0.045, now + 2.8);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain!);

        osc.start(now);
        osc.stop(now + duration + 0.1);
      });

      // Play a soft arpeggio glockenspiel note randomly
      if (Math.random() > 0.3) {
        const arpHigherFreq = chord[Math.floor(Math.random() * chord.length)] * 2;
        const arpTime = now + 1.0 + Math.random() * 1.5;
        const arpOsc = this.ctx.createOscillator();
        const arpGain = this.ctx.createGain();

        arpOsc.type = 'sine';
        arpOsc.frequency.setValueAtTime(arpHigherFreq, arpTime);

        arpGain.gain.setValueAtTime(0.001, arpTime);
        arpGain.gain.linearRampToValueAtTime(0.035, arpTime + 0.02);
        arpGain.gain.exponentialRampToValueAtTime(0.001, arpTime + 0.9);

        arpOsc.connect(arpGain);
        arpGain.connect(this.bgmGain);

        arpOsc.start(arpTime);
        arpOsc.stop(arpTime + 1.0);
      }

      this.bgmTimer = window.setTimeout(playNextPadChord, 4200);
    };

    this.bgmTimer = window.setTimeout(playNextPadChord, 1000);
  }

  // --- Controls ---
  public toggleMute(): boolean {
    this.ensureContext();
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.75, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setMute(muted: boolean) {
    this.ensureContext();
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.75, this.ctx.currentTime, 0.05);
    }
  }

  public destroy() {
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.isInitialized = false;
  }
}

export const synth = new SynthEngine();
