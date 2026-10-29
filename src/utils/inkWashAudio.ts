// ============================================================================
// CHINESE INK WASH (THỦY MẶC CHU DỊCH · 水墨周易) — STUDIO WEB AUDIO ENGINE
// Plays the studio-mastered Guqin & Xiao score (/assets/ink-wash-guqin-score.mp3)
// + pure harmonic Tibetan/Guqin chimes (zero white-noise static, zero clipping)
// + 100% genuine Vietnamese Cloud TTS narration (/api/tts -> AudioBuffer)
//   with sequential queueing and exact audio-duration measurement so every
//   AI-summarized cue is read 100% in full without ever cutting off mid-sentence.
// ============================================================================

import { resolveVietnameseVoiceProfile, synthesizeVoxCpmAnchored } from "./edgeNeuralTts";

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
  private voiceLoadingPromises: Map<string, Promise<AudioBuffer | null>> = new Map();
  private activeVoiceSource: AudioBufferSourceNode | null = null;
  private queuedVoiceBuffers: AudioBuffer[] = [];
  private lastVoiceEndedAtMs: number = 0;

  private isMuted: boolean = false;
  private isVoiceEnabled: boolean = true; // Default true: pure Vietnamese narration enabled
  private voiceProfile: string = "nam_tram_am"; // Default: Giọng Nam Trầm Ấm Đọc Quẻ Kinh Dịch
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

      this.masterGain.gain.value = this.isMuted ? 0 : 0.92;
      this.musicGain.gain.value = 0.72;
      this.sfxGain.gain.value = 0.42;
      this.voiceGain.gain.value = 1.12;

      // Warm Baritone EQ on voice bus (Trầm ấm đọc quẻ Kinh Dịch)
      const warmthEq = this.ctx.createBiquadFilter();
      warmthEq.type = "lowshelf";
      warmthEq.frequency.value = 145;
      warmthEq.gain.value = 2.8;

      const presenceEq = this.ctx.createBiquadFilter();
      presenceEq.type = "peaking";
      presenceEq.frequency.value = 2600;
      presenceEq.Q.value = 1.1;
      presenceEq.gain.value = 1.2;

      this.musicGain.connect(this.compressor);
      this.sfxGain.connect(this.compressor);
      this.voiceGain.connect(warmthEq);
      warmthEq.connect(presenceEq);
      presenceEq.connect(this.compressor);
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

  public setVoiceProfile(voice: string): void {
    const next = (voice || "nam_tram_am").trim();
    if (this.voiceProfile !== next) {
      this.voiceProfile = next;
    }
  }

  public getVoiceProfile(): string {
    return this.voiceProfile;
  }

  private getVoiceCacheKey(clean: string): string {
    return `${this.voiceProfile}::${clean}`;
  }

  private fetchAndDecodeSingleVoice(clean: string): Promise<AudioBuffer | null> {
    const ctx = this.init();
    const cacheKey = this.getVoiceCacheKey(clean);
    if (this.voiceBuffers.has(cacheKey)) {
      return Promise.resolve(this.voiceBuffers.get(cacheKey)!);
    }
    if (this.voiceLoadingPromises.has(cacheKey)) {
      return this.voiceLoadingPromises.get(cacheKey)!;
    }

    const p = (async () => {
      try {
        // Call /api/tts (100% pure Vietnamese Edge Neural vi-VN-NamMinhNeural / vi-VN-HoaiMyNeural or Google tl=vi)
        const res = await fetch(
          `/api/tts?text=${encodeURIComponent(clean)}&voice=${encodeURIComponent(this.voiceProfile)}`
        );
        if (res.ok) {
          const ab = await res.arrayBuffer();
          if (ab.byteLength > 256) {
            const decoded = await ctx.decodeAudioData(ab.slice(0));
            this.voiceBuffers.set(cacheKey, decoded);
            return decoded;
          }
        }
      } catch {
        // Fallback estimation if offline
      } finally {
        this.voiceLoadingPromises.delete(cacheKey);
      }
      return null;
    })();

    this.voiceLoadingPromises.set(cacheKey, p);
    return p;
  }

  // Preload Vietnamese TTS audio buffers for all narration cues
  public async preloadNarrationCues(cues: InkWashNarrationCue[]): Promise<void> {
    await this.preloadAndMeasureCues(cues);
  }

  // Preload all cues and return generous duration (in seconds) of each cue id so timeline never cuts off speech
  public async preloadAndMeasureCues(cues: InkWashNarrationCue[]): Promise<Map<string, number>> {
    this.init();
    const durations = new Map<string, number>();

    await Promise.all(
      cues.map(async (cue) => {
        const clean = InkWashAudioEngine.sanitizeVietnameseForSpeech(cue.speakText || cue.text);
        if (!clean) {
          durations.set(cue.id, 3.8);
          return;
        }
        const buf = await this.fetchAndDecodeSingleVoice(clean);
        if (buf && buf.duration > 0.5) {
          // Add +0.6s breathing cushion to the measured audio buffer duration
          durations.set(cue.id, buf.duration + 0.6);
        } else {
          // Generous Vietnamese speech rate estimation (~2.2 words/sec + 1.8s margin)
          const wordCount = clean.split(/\s+/).filter(Boolean).length;
          durations.set(cue.id, Math.max(4.8, wordCount / 2.2 + 1.8));
        }
      })
    );

    return durations;
  }

  // Check if AI voice is currently speaking or has queued buffers or just finished within the last 1.2s tail
  public isVoiceSpeaking(): boolean {
    if (!this.isVoiceEnabled || this.isMuted) return false;
    if (this.activeVoiceSource !== null || this.queuedVoiceBuffers.length > 0) {
      return true;
    }
    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      window.speechSynthesis.speaking
    ) {
      return true;
    }
    if (this.lastVoiceEndedAtMs > 0 && performance.now() - this.lastVoiceEndedAtMs < 1200) {
      return true;
    }
    return false;
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
    this.queuedVoiceBuffers = [];
    this.lastVoiceEndedAtMs = 0;
    if (this.activeVoiceSource) {
      try {
        this.activeVoiceSource.onended = null;
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
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.92, this.ctx.currentTime, 0.05);
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

  // ── VIETNAMESE SPEECH NARRATION (CLOUD /API/TTS MP3 + SEQUENTIAL QUEUEING + BGM DUCKING, ZERO HANZI) ──
  public static sanitizeVietnameseForSpeech(raw: string): string {
    return (raw || "")
      // Strip all Chinese characters (Hanzi / CJK) so Vietnamese TTS never tries to read Chinese glyphs
      .replace(/[\u2E80-\u2EFF\u3000-\u303F\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF]+/g, " ")
      .replace(/\(\s*[-·•,;:]*\s*\)/g, " ")
      .replace(/\[\s*[-·•,;:]*\s*\]/g, " ")
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
      .replace(/[䷀-䷿⚊⚏☰☱☲☳☴☵☶☷➔•·|#*~_`]/g, " ")
      .replace(/\s+([,.;:!?])/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
  }

  private playDecodedVoiceBuffer(buf: AudioBuffer): void {
    const ctx = this.init();
    if (!this.voiceGain || this.isMuted || !this.isVoiceEnabled) return;

    // Never cut off an actively speaking sentence! Queue it to play right after current finishes.
    if (this.activeVoiceSource) {
      this.queuedVoiceBuffers.push(buf);
      return;
    }

    // Smoothly duck background Guqin music so Vietnamese voice is crystal-clear
    if (this.musicGain) {
      this.musicGain.gain.setTargetAtTime(0.24, ctx.currentTime, 0.12);
    }

    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(this.voiceGain);
    src.onended = () => {
      if (this.activeVoiceSource === src) {
        this.activeVoiceSource = null;
        this.lastVoiceEndedAtMs = performance.now();

        if (this.queuedVoiceBuffers.length > 0 && this.isVoiceEnabled && !this.isMuted) {
          const nextBuf = this.queuedVoiceBuffers.shift()!;
          window.setTimeout(() => {
            if (this.isVoiceEnabled && !this.isMuted) {
              this.playDecodedVoiceBuffer(nextBuf);
            }
          }, 280);
        } else if (this.musicGain && this.ctx) {
          this.musicGain.gain.setTargetAtTime(0.72, this.ctx.currentTime, 0.4);
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

    const cached = this.voiceBuffers.get(this.getVoiceCacheKey(clean));
    if (cached) {
      this.playDecodedVoiceBuffer(cached);
      return;
    }

    // Fetch from /api/tts on demand if not yet preloaded
    this.fetchAndDecodeSingleVoice(clean)
      .then((decoded) => {
        if (decoded && this.isVoiceEnabled && !this.isMuted) {
          this.playDecodedVoiceBuffer(decoded);
        }
      })
      .catch(() => {});
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
      this.stopVoiceOnly();
      if (this.bgmBuffer) {
        this.startBgmAt(timeSec);
      }
    }
    this.lastTimeSec = timeSec;

    // 1. Subtle harmonic chime on shot transitions
    shotStartTimes.forEach((st, idx) => {
      const key = `shot_${idx}`;
      if (timeSec >= st && timeSec < st + 0.35 && !this.triggeredEvents.has(key)) {
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
        if (timeSec >= cue.startSec && timeSec < cue.startSec + 0.45 && !this.triggeredEvents.has(cueKey)) {
          this.triggeredEvents.add(cueKey);
          this.speakCue(cue.speakText || cue.text);
        }
      });
    }
  }
}
