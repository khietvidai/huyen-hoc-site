// ============================================================================
// CHINESE INK WASH (THỦY MẶC CHU DỊCH · 水墨周易) — REAL-TIME WEB AUDIO ENGINE
// Synthesizes Guqin (Karplus-Strong silk string), Bamboo Xiao Flute,
// Ceremonial Drum, Bronze Seal Gong, Ink/Brush/Rain/Thunder Foley, and
// Vietnamese Narration ("Lá bài số một", "Lá bài số hai", ...)
// Routes to both speakers and MediaStreamAudioDestinationNode for video export.
// ============================================================================

export interface InkWashNarrationCue {
  id: string;
  startSec: number;
  endSec: number;
  text: string;      // Displayed subtitle text
  speakText: string; // Pronunciation-safe TTS text (e.g. "Lá bài số hai")
}

export class InkWashAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private streamDest: MediaStreamAudioDestinationNode | null = null;
  private isMuted: boolean = false;
  private isVoiceEnabled: boolean = true;
  private triggeredEvents: Set<string> = new Set();
  private lastTimeSec: number = -1;

  // Pentatonic Guqin scale in D (Re - Mi - Fa# - La - Si / D2..A4)
  private static readonly GUQIN_NOTES_HZ = [
    73.42,  // D2
    82.41,  // E2
    98.00,  // G2
    110.00, // A2
    123.47, // B2
    146.83, // D3
    164.81, // E3
    196.00, // G3
    220.00, // A3
    246.94, // B3
    293.66, // D4
  ];

  public init(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.masterGain.gain.value = this.isMuted ? 0 : 0.88;
      this.musicGain.gain.value = 0.65;
      this.sfxGain.gain.value = 0.78;

      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      try {
        this.streamDest = this.ctx.createMediaStreamDestination();
        this.masterGain.connect(this.streamDest);
      } catch {
        this.streamDest = null;
      }
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getMediaStream(): MediaStream | null {
    this.init();
    return this.streamDest ? this.streamDest.stream : null;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.88, this.ctx.currentTime, 0.05);
    }
    if (muted && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  public setVoiceEnabled(enabled: boolean): void {
    this.isVoiceEnabled = enabled;
    if (!enabled && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  public resetTimeline(): void {
    this.triggeredEvents.clear();
    this.lastTimeSec = -1;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  public stopAll(): void {
    this.resetTimeline();
    if (this.ctx && this.ctx.state === "running") {
      try {
        this.ctx.suspend();
      } catch {}
    }
  }

  public destroy(): void {
    this.stopAll();
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {}
      this.ctx = null;
    }
  }

  // ── 1. GUQIN PLUCK (Karplus-Strong Silk String + Wooden Body Resonance) ──
  public playGuqinPluck(freqHz: number, durationSec: number = 3.6, slideRatio: number = 1.0, velocity: number = 0.35): void {
    const ctx = this.init();
    if (!this.musicGain) return;

    const now = ctx.currentTime;
    const sampleRate = ctx.sampleRate;
    const totalSamples = Math.floor(sampleRate * durationSec);
    const buffer = ctx.createBuffer(1, totalSamples, sampleRate);
    const data = buffer.getChannelData(0);

    const period = Math.max(8, Math.round(sampleRate / freqHz));
    const delayLine = new Float32Array(period);
    for (let i = 0; i < period; i++) {
      // Warm silk string initial pluck profile
      const window = Math.sin((Math.PI * i) / period);
      delayLine[i] = (Math.random() * 2 - 1) * window;
    }

    let ptr = 0;
    let prev = 0;
    const damping = 0.9945;
    const brightness = 0.42; // Soft silk string warmth

    for (let i = 0; i < totalSamples; i++) {
      const current = delayLine[ptr];
      const filtered = (1 - brightness) * current + brightness * prev;
      prev = current;
      delayLine[ptr] = filtered * damping;
      ptr = (ptr + 1) % period;
      data[i] = current * Math.exp(-i / (sampleRate * (durationSec * 0.65)));
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    if (slideRatio !== 1.0) {
      src.playbackRate.setValueAtTime(1.0, now);
      src.playbackRate.exponentialRampToValueAtTime(slideRatio, now + Math.min(0.65, durationSec * 0.4));
    }

    // Guqin cedar & paulownia wood body resonance filter
    const bodyFilter = ctx.createBiquadFilter();
    bodyFilter.type = "peaking";
    bodyFilter.frequency.value = 210;
    bodyFilter.Q.value = 2.4;
    bodyFilter.gain.value = 5.5;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 1850;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.001, now);
    env.gain.linearRampToValueAtTime(velocity, now + 0.018);
    env.gain.exponentialRampToValueAtTime(0.0008, now + durationSec);

    src.connect(bodyFilter);
    bodyFilter.connect(lowpass);
    lowpass.connect(env);
    env.connect(this.musicGain);

    src.start(now);
    src.stop(now + durationSec);
  }

  // ── 2. XIAO BAMBOO FLUTE (Breathy Harmonic Tone + Gentle Vibrato) ──
  public playXiaoFlute(freqHz: number, durationSec: number = 3.2, gainVal: number = 0.14): void {
    const ctx = this.init();
    if (!this.musicGain) return;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = "sine";
    osc2.type = "triangle";

    osc1.frequency.setValueAtTime(freqHz, now);
    osc2.frequency.setValueAtTime(freqHz * 2, now); // 2nd harmonic warmth

    // Subtle breath vibrato after 0.6s
    const vib = ctx.createOscillator();
    const vibGain = ctx.createGain();
    vib.frequency.value = 4.6;
    vibGain.gain.setValueAtTime(0, now);
    vibGain.gain.linearRampToValueAtTime(freqHz * 0.011, now + 0.8);
    vib.connect(vibGain);
    vibGain.connect(osc1.frequency);

    const mix = ctx.createGain();
    const g2 = ctx.createGain();
    g2.gain.value = 0.18;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(gainVal, now + 0.45);
    env.gain.setValueAtTime(gainVal * 0.85, now + Math.max(0.5, durationSec - 0.6));
    env.gain.exponentialRampToValueAtTime(0.0005, now + durationSec);

    osc1.connect(mix);
    osc2.connect(g2);
    g2.connect(mix);
    mix.connect(env);
    env.connect(this.musicGain);

    osc1.start(now);
    osc2.start(now);
    vib.start(now);
    osc1.stop(now + durationSec);
    osc2.stop(now + durationSec);
    vib.stop(now + durationSec);
  }

  // ── 3. CEREMONIAL DRUM & BRONZE GONG (Shot Transitions & Final Seal) ──
  public playCeremonialDrum(intensity: number = 0.45): void {
    const ctx = this.init();
    if (!this.sfxGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(92, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.45);
    osc.frequency.exponentialRampToValueAtTime(28, now + 1.4);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.001, now);
    env.gain.linearRampToValueAtTime(intensity, now + 0.015);
    env.gain.exponentialRampToValueAtTime(0.0008, now + 1.5);

    osc.connect(env);
    env.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 1.55);
  }

  public playBronzeSealGong(intensity: number = 0.32): void {
    const ctx = this.init();
    if (!this.sfxGain) return;

    const now = ctx.currentTime;
    const partials = [293.66, 440.0, 587.33, 880.0, 1174.66];
    partials.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(f, now);

      const env = ctx.createGain();
      const amp = (intensity / (idx + 1.2)) * 0.7;
      const decay = 2.8 - idx * 0.35;
      env.gain.setValueAtTime(0.0005, now);
      env.gain.linearRampToValueAtTime(amp, now + 0.012);
      env.gain.exponentialRampToValueAtTime(0.0005, now + decay);

      osc.connect(env);
      env.connect(this.sfxGain!);
      osc.start(now);
      osc.stop(now + decay + 0.05);
    });
  }

  // ── 4. PROCEDURAL FOLEY (Brush Stroke, Ink Drop, Flying-White Slash, Seal Stamp) ──
  public playBrushStroke(durationSec: number = 0.45, fast: boolean = false): void {
    const ctx = this.init();
    if (!this.sfxGain) return;

    const now = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * durationSec);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const t = i / len;
      const env = Math.sin(Math.PI * t);
      d[i] = (Math.random() * 2 - 1) * env;
    }

    const src = ctx.createBufferSource();
    src.buffer = buf;

    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(fast ? 1600 : 950, now);
    bp.frequency.exponentialRampToValueAtTime(fast ? 2600 : 1350, now + durationSec);
    bp.Q.value = 1.8;

    const g = ctx.createGain();
    g.gain.value = fast ? 0.16 : 0.09;

    src.connect(bp);
    bp.connect(g);
    g.connect(this.sfxGain);
    src.start(now);
  }

  public playSealStamp(): void {
    this.playCeremonialDrum(0.52);
    this.playBronzeSealGong(0.35);
    this.playBrushStroke(0.22, true);
  }

  // ── 5. VIETNAMESE SPEECH NARRATION (WITH CARD NUMBER PRONUNCIATION FIX) ──
  public static sanitizeVietnameseForSpeech(raw: string): string {
    return raw
      .replace(/\bLá\s*(\d+)\b/gi, (_m, d) => {
        const map: Record<string, string> = {
          "1": "Lá bài số một",
          "2": "Lá bài số hai",
          "3": "Lá bài số ba",
          "4": "Lá bài số bốn",
          "5": "Lá bài số năm",
          "6": "Lá bài số sáu",
          "7": "Lá bài số bảy",
          "8": "Lá bài số tám",
          "9": "Lá bài số chín",
          "10": "Lá bài số mười",
        };
        return map[d] || `Lá bài số ${d}`;
      })
      .replace(/[䷀-䷿⚊⚏☰☱☲☳☴☵☶☷➔•·|]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  public speakCue(text: string): void {
    if (!this.isVoiceEnabled || this.isMuted) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    try {
      window.speechSynthesis.cancel();
      const clean = InkWashAudioEngine.sanitizeVietnameseForSpeech(text);
      if (!clean) return;

      const utter = new SpeechSynthesisUtterance(clean);
      utter.lang = "vi-VN";
      utter.rate = 0.98;
      utter.pitch = 0.95;
      utter.volume = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const viVoice =
        voices.find((v) => v.lang.toLowerCase().includes("vi") && v.name.toLowerCase().includes("nam")) ||
        voices.find((v) => v.lang.toLowerCase().includes("vi")) ||
        null;
      if (viVoice) {
        utter.voice = viVoice;
      }

      window.speechSynthesis.speak(utter);
    } catch {
      // Ignore speech synthesis errors on restricted browsers
    }
  }

  // ── 6. FRAME-SYNCHRONIZED TIMELINE TICK ──
  public tick(
    timeSec: number,
    shotStartTimes: number[],
    sealTimeSec: number,
    narrationCues: InkWashNarrationCue[]
  ): void {
    if (timeSec < this.lastTimeSec - 0.3) {
      this.triggeredEvents.clear();
    }
    this.lastTimeSec = timeSec;

    // 1. Trigger shot transition drums & Guqin chords
    shotStartTimes.forEach((st, idx) => {
      const key = `shot_${idx}`;
      if (timeSec >= st && timeSec < st + 0.35 && !this.triggeredEvents.has(key)) {
        this.triggeredEvents.add(key);
        this.playCeremonialDrum(idx === 0 ? 0.42 : 0.35);
        const rootHz = InkWashAudioEngine.GUQIN_NOTES_HZ[(idx * 2) % 6];
        this.playGuqinPluck(rootHz, 4.2, 1.0, 0.36);
        this.playXiaoFlute(rootHz * 2, 3.4, 0.12);
      }
    });

    // 2. Periodic meditative Guqin plucks & brush whispers every 2.2s
    const beatIndex = Math.floor(timeSec / 2.2);
    const beatKey = `beat_${beatIndex}`;
    if (timeSec >= beatIndex * 2.2 && !this.triggeredEvents.has(beatKey)) {
      this.triggeredEvents.add(beatKey);
      const pattern = [0, 3, 4, 2, 5, 3, 6, 4, 7, 5, 2, 0];
      const noteIdx = pattern[beatIndex % pattern.length];
      const freq = InkWashAudioEngine.GUQIN_NOTES_HZ[noteIdx];
      const slide = beatIndex % 3 === 1 ? 1.08 : beatIndex % 4 === 2 ? 0.94 : 1.0;
      this.playGuqinPluck(freq, 3.5, slide, 0.26);

      if (beatIndex % 2 === 0) {
        this.playBrushStroke(0.38, beatIndex % 4 === 0);
      }
    }

    // 3. Final Cinnabar Seal Stamp
    const sealKey = "final_seal_stamp";
    if (timeSec >= sealTimeSec && timeSec < sealTimeSec + 0.4 && !this.triggeredEvents.has(sealKey)) {
      this.triggeredEvents.add(sealKey);
      this.playSealStamp();
    }

    // 4. Voice Narration Cues
    narrationCues.forEach((cue) => {
      const cueKey = `cue_${cue.id}`;
      if (timeSec >= cue.startSec && timeSec < cue.startSec + 0.4 && !this.triggeredEvents.has(cueKey)) {
        this.triggeredEvents.add(cueKey);
        this.speakCue(cue.speakText || cue.text);
      }
    });
  }
}
