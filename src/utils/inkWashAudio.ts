// ============================================================================
// CHINESE INK WASH (THỦY MẶC CHU DỊCH · 水墨周易) — STUDIO WEB AUDIO ENGINE
// Plays the studio-mastered Guqin & Xiao score (/assets/ink-wash-guqin-score.mp3)
// + pure harmonic Tibetan/Guqin chimes (zero white-noise static, zero clipping)
// + verified Vietnamese TTS narration.
// Routes to both speakers and MediaStreamAudioDestinationNode for video export.
// ============================================================================

export interface InkWashNarrationCue {
  id: string;
  startSec: number;
  endSec: number;
  text: string;
  speakText: string;
}

export class InkWashAudioEngine {
  private ctx: AudioContext | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private streamDest: MediaStreamAudioDestinationNode | null = null;

  private bgmBuffer: AudioBuffer | null = null;
  private bgmSource: AudioBufferSourceNode | null = null;
  private bgmLoading: boolean = false;
  private isPlayingBgm: boolean = false;

  private isMuted: boolean = false;
  private isVoiceEnabled: boolean = false; // Default false so music plays pure without SAPI robotic interference
  private triggeredEvents: Set<string> = new Set();
  private lastTimeSec: number = -1;

  // Pure pentatonic harmonic frequencies (D - F - G - A - C)
  private static readonly PENTATONIC_HZ = [
    146.83, // D3
    174.61, // F3
    196.00, // G3
    220.00, // A3
    261.63, // C4
    293.66, // D4
    349.23, // F4
    440.00, // A4
    587.33, // D5
  ];

  public init(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master soft limiter / compressor to guarantee zero clipping or crackling
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.value = -10;
      this.compressor.knee.value = 12;
      this.compressor.ratio.value = 4;
      this.compressor.attack.value = 0.005;
      this.compressor.release.value = 0.18;

      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.masterGain.gain.value = this.isMuted ? 0 : 0.85;
      this.musicGain.gain.value = 0.78;
      this.sfxGain.gain.value = 0.45;

      this.musicGain.connect(this.compressor);
      this.sfxGain.connect(this.compressor);
      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      try {
        this.streamDest = this.ctx.createMediaStreamDestination();
        this.masterGain.connect(this.streamDest);
      } catch {
        this.streamDest = null;
      }

      this.preloadStudioScore();
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private async preloadStudioScore(): Promise<void> {
    if (this.bgmBuffer || this.bgmLoading || !this.ctx) return;
    this.bgmLoading = true;
    try {
      const res = await fetch("/assets/ink-wash-guqin-score.mp3");
      if (res.ok && this.ctx) {
        const arr = await res.arrayBuffer();
        this.bgmBuffer = await this.ctx.decodeAudioData(arr);
      }
    } catch {
      // Fallback to pure harmonic synthesis if offline
    } finally {
      this.bgmLoading = false;
    }
  }

  public startBgmAt(offsetSec: number = 0): void {
    const ctx = this.init();
    this.stopBgmOnly();
    if (!this.bgmBuffer || !this.musicGain) return;

    try {
      const src = ctx.createBufferSource();
      src.buffer = this.bgmBuffer;
      src.loop = true;
      src.connect(this.musicGain);
      const safeOffset = Math.max(0, offsetSec % this.bgmBuffer.duration);
      src.start(0, safeOffset);
      this.bgmSource = src;
      this.isPlayingBgm = true;
    } catch {
      this.isPlayingBgm = false;
    }
  }

  public stopBgmOnly(): void {
    if (this.bgmSource) {
      try {
        this.bgmSource.stop();
        this.bgmSource.disconnect();
      } catch {}
      this.bgmSource = null;
    }
    this.isPlayingBgm = false;
  }

  public getMediaStream(): MediaStream | null {
    this.init();
    return this.streamDest ? this.streamDest.stream : null;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.85, this.ctx.currentTime, 0.05);
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
    this.stopBgmOnly();
    this.resetTimeline();
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

  // ── PURE WARM SILK-STRING HARMONIC PLUCK (ZERO WHITE NOISE, ZERO CLIPPING) ──
  public playSilkHarmonicNote(freqHz: number, durationSec: number = 3.2, gainVal: number = 0.14): void {
    const ctx = this.init();
    if (!this.sfxGain) return;

    const now = ctx.currentTime;
    const harmonics = [
      { mult: 1.0, amp: 1.0, decay: durationSec },
      { mult: 2.0, amp: 0.38, decay: durationSec * 0.72 },
      { mult: 3.0, amp: 0.16, decay: durationSec * 0.5 },
    ];

    harmonics.forEach(({ mult, amp, decay }) => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = mult === 1.0 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freqHz * mult, now);

      const peak = Math.max(0.001, gainVal * amp);
      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(peak, now + 0.025);
      env.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(env);
      env.connect(this.sfxGain!);
      osc.start(now);
      osc.stop(now + decay + 0.05);
    });
  }

  // ── CEREMONIAL BRONZE BELL / SEAL CHIME (WARM INHARMONIC PARTIALS) ──
  public playSealBellChime(strength: number = 0.22): void {
    const ctx = this.init();
    if (!this.sfxGain) return;

    const now = ctx.currentTime;
    const partials = [
      { freq: 146.83, amp: 0.55, decay: 3.2 },
      { freq: 293.66, amp: 0.45, decay: 2.8 },
      { freq: 440.0, amp: 0.28, decay: 2.2 },
      { freq: 587.33, amp: 0.18, decay: 1.8 },
    ];

    partials.forEach(({ freq, amp, decay }) => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      const peak = Math.max(0.001, strength * amp);
      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(peak, now + 0.02);
      env.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(env);
      env.connect(this.sfxGain!);
      osc.start(now);
      osc.stop(now + decay + 0.05);
    });
  }

  // ── VIETNAMESE SPEECH NARRATION (ONLY WHEN NATIVE VI-VN VOICE IS PRESENT) ──
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
      const voices = window.speechSynthesis.getVoices();
      // Only speak if a real Vietnamese voice is installed (prevents English SAPI from garbling Vietnamese)
      const viVoice =
        voices.find((v) => v.lang.toLowerCase().includes("vi") && v.name.toLowerCase().includes("nam")) ||
        voices.find((v) => v.lang.toLowerCase().includes("vi")) ||
        null;
      if (!viVoice) return;

      const clean = InkWashAudioEngine.sanitizeVietnameseForSpeech(text);
      if (!clean) return;

      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(clean);
      utter.voice = viVoice;
      utter.lang = "vi-VN";
      utter.rate = 1.0;
      utter.pitch = 0.96;
      utter.volume = 0.9;
      window.speechSynthesis.speak(utter);
    } catch {
      // Ignore speech synthesis errors
    }
  }

  // ── FRAME-SYNCHRONIZED TIMELINE TICK ──
  public tick(
    timeSec: number,
    shotStartTimes: number[],
    sealTimeSec: number,
    narrationCues: InkWashNarrationCue[]
  ): void {
    // Ensure studio BGM is playing if loaded
    if (this.bgmBuffer && !this.isPlayingBgm) {
      this.startBgmAt(timeSec);
    }

    if (timeSec < this.lastTimeSec - 0.3) {
      this.triggeredEvents.clear();
      if (this.bgmBuffer) {
        this.startBgmAt(timeSec);
      }
    }
    this.lastTimeSec = timeSec;

    // 1. Subtle harmonic chime on shot transitions
    shotStartTimes.forEach((st, idx) => {
      const key = `shot_${idx}`;
      if (timeSec >= st && timeSec < st + 0.3 && !this.triggeredEvents.has(key)) {
        this.triggeredEvents.add(key);
        const noteHz = InkWashAudioEngine.PENTATONIC_HZ[(idx * 2) % InkWashAudioEngine.PENTATONIC_HZ.length];
        this.playSilkHarmonicNote(noteHz, 3.0, this.bgmBuffer ? 0.08 : 0.18);
      }
    });

    // 2. Fallback pentatonic notes only if studio MP3 hasn't loaded yet
    if (!this.bgmBuffer) {
      const beatIndex = Math.floor(timeSec / 2.4);
      const beatKey = `beat_${beatIndex}`;
      if (timeSec >= beatIndex * 2.4 && !this.triggeredEvents.has(beatKey)) {
        this.triggeredEvents.add(beatKey);
        const pattern = [0, 3, 4, 2, 5, 3, 6, 4, 7, 5];
        const freq = InkWashAudioEngine.PENTATONIC_HZ[pattern[beatIndex % pattern.length]];
        this.playSilkHarmonicNote(freq, 2.8, 0.14);
      }
    }

    // 3. Final Cinnabar Seal Stamp ("玖貳") Bell Resonance
    const sealKey = "final_seal_stamp";
    if (timeSec >= sealTimeSec && timeSec < sealTimeSec + 0.35 && !this.triggeredEvents.has(sealKey)) {
      this.triggeredEvents.add(sealKey);
      this.playSealBellChime(0.24);
    }

    // 4. Optional Vietnamese Voice Narration
    if (this.isVoiceEnabled) {
      narrationCues.forEach((cue) => {
        const cueKey = `cue_${cue.id}`;
        if (timeSec >= cue.startSec && timeSec < cue.startSec + 0.35 && !this.triggeredEvents.has(cueKey)) {
          this.triggeredEvents.add(cueKey);
          this.speakCue(cue.speakText || cue.text);
        }
      });
    }
  }
}
