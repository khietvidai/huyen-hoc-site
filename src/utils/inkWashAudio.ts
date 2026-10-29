// ============================================================================
// CHINESE INK WASH (THỦY MẶC CHU DỊCH · 水墨周易) — STUDIO WEB AUDIO ENGINE
// Plays the studio-mastered Guqin & Xiao score (/assets/ink-wash-guqin-score.mp3)
// + pure harmonic Tibetan/Guqin chimes (zero white-noise static, zero clipping)
// + 100% genuine Vietnamese Cloud TTS narration (/api/tts -> AudioBuffer)
//   with automatic BGM ducking and MediaStreamAudioDestinationNode export.
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
  private voiceGain: GainNode | null = null;
  private streamDest: MediaStreamAudioDestinationNode | null = null;

  private bgmBuffer: AudioBuffer | null = null;
  private bgmSource: AudioBufferSourceNode | null = null;
  private bgmLoading: boolean = false;
  private isPlayingBgm: boolean = false;

  private voiceBuffers: Map<string, AudioBuffer> = new Map();
  private voiceLoadingSet: Set<string> = new Set();
  private activeVoiceSource: AudioBufferSourceNode | null = null;

  private isMuted: boolean = false;
  private isVoiceEnabled: boolean = true; // Default true: pure Vietnamese narration enabled
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
      this.voiceGain = this.ctx.createGain();

      this.masterGain.gain.value = this.isMuted ? 0 : 0.90;
      this.musicGain.gain.value = 0.72;
      this.sfxGain.gain.value = 0.42;
      this.voiceGain.gain.value = 1.05;

      this.musicGain.connect(this.compressor);
      this.sfxGain.connect(this.compressor);
      this.voiceGain.connect(this.compressor);
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

  // Preload Vietnamese TTS audio buffers for all narration cues so playback & video recording have zero lag
  public async preloadNarrationCues(cues: InkWashNarrationCue[]): Promise<void> {
    const ctx = this.init();
    for (const cue of cues) {
      const clean = InkWashAudioEngine.sanitizeVietnameseForSpeech(cue.speakText || cue.text);
      if (!clean) continue;
      if (this.voiceBuffers.has(clean) || this.voiceLoadingSet.has(clean)) continue;
      this.voiceLoadingSet.add(clean);

      (async () => {
        try {
          const res = await fetch(
            `/api/tts?text=${encodeURIComponent(clean)}&voice=vi-VN-NamMinhNeural`
          );
          if (res.ok) {
            const ab = await res.arrayBuffer();
            if (ab.byteLength > 256) {
              const decoded = await ctx.decodeAudioData(ab.slice(0));
              this.voiceBuffers.set(clean, decoded);
            }
          }
        } catch {
          // Will fallback to speechSynthesis or retry on demand
        } finally {
          this.voiceLoadingSet.delete(clean);
        }
      })();
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

  public stopVoiceOnly(): void {
    if (this.activeVoiceSource) {
      try {
        this.activeVoiceSource.stop();
        this.activeVoiceSource.disconnect();
      } catch {}
      this.activeVoiceSource = null;
    }
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(0.72, this.ctx.currentTime, 0.25);
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  public getMediaStream(): MediaStream | null {
    this.init();
    return this.streamDest ? this.streamDest.stream : null;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.90, this.ctx.currentTime, 0.05);
    }
    if (muted) {
      this.stopVoiceOnly();
    }
  }

  public setVoiceEnabled(enabled: boolean): void {
    this.isVoiceEnabled = enabled;
    if (!enabled) {
      this.stopVoiceOnly();
    }
  }

  public resetTimeline(): void {
    this.triggeredEvents.clear();
    this.lastTimeSec = -1;
    this.stopVoiceOnly();
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

  // ── VIETNAMESE SPEECH NARRATION (CLOUD /API/TTS MP3 + BGM DUCKING) ──
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

  private playDecodedVoiceBuffer(buf: AudioBuffer): void {
    const ctx = this.init();
    if (!this.voiceGain || this.isMuted || !this.isVoiceEnabled) return;

    this.stopVoiceOnly();

    // Smoothly duck background Guqin music so Vietnamese voice is crystal-clear
    if (this.musicGain) {
      this.musicGain.gain.setTargetAtTime(0.26, ctx.currentTime, 0.12);
    }

    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(this.voiceGain);
    src.onended = () => {
      if (this.activeVoiceSource === src) {
        this.activeVoiceSource = null;
        if (this.musicGain && this.ctx) {
          this.musicGain.gain.setTargetAtTime(0.72, this.ctx.currentTime, 0.35);
        }
      }
    };
    src.start(0);
    this.activeVoiceSource = src;
  }

  public speakCue(text: string): void {
    if (!this.isVoiceEnabled || this.isMuted) return;
    const clean = InkWashAudioEngine.sanitizeVietnameseForSpeech(text);
    if (!clean) return;

    const cached = this.voiceBuffers.get(clean);
    if (cached) {
      this.playDecodedVoiceBuffer(cached);
      return;
    }

    // Fetch from /api/tts on demand if not yet preloaded
    const ctx = this.init();
    fetch(`/api/tts?text=${encodeURIComponent(clean)}&voice=vi-VN-NamMinhNeural`)
      .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject(new Error("TTS HTTP error"))))
      .then((ab) => {
        if (ab.byteLength <= 256) throw new Error("Empty TTS buffer");
        return ctx.decodeAudioData(ab.slice(0));
      })
      .then((decoded) => {
        this.voiceBuffers.set(clean, decoded);
        if (this.isVoiceEnabled && !this.isMuted) {
          this.playDecodedVoiceBuffer(decoded);
        }
      })
      .catch(() => {
        // Fallback to native Vietnamese browser voice if available
        if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
        try {
          const voices = window.speechSynthesis.getVoices();
          const viVoice =
            voices.find((v) => v.lang.toLowerCase().includes("vi") && v.name.toLowerCase().includes("nam")) ||
            voices.find((v) => v.lang.toLowerCase().includes("vi")) ||
            null;
          if (!viVoice) return;
          window.speechSynthesis.cancel();
          const utter = new SpeechSynthesisUtterance(clean);
          utter.voice = viVoice;
          utter.lang = "vi-VN";
          utter.rate = 1.0;
          utter.pitch = 0.96;
          utter.volume = 0.95;
          window.speechSynthesis.speak(utter);
        } catch {}
      });
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

    // 4. Vietnamese Voice Narration Cues
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
