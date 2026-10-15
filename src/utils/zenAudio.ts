/**
 * Zen Meditation Audio Engine (Web Audio API)
 * Provides 100% reliable, offline, non-blocking, organic meditation soundscapes:
 * 1. Trầm Hương & Chuông Xoay (136.1Hz OM Drone & Tibetan Singing Bowls)
 * 2. Chuông Gió Trúc Khê (Oriental Pentatonic Temple Wind Chimes)
 * 3. Suối Nước Thiền Tịnh (Gentle River Stream & Singing Bowl Resonance)
 * 4. Tần Số 432Hz Thiền Định (432Hz Deep Theta Healing Waves)
 */

export interface SoundscapeOption {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  description: string;
  isYouTube?: boolean;
  youtubeId?: string;
  youtubeUrl?: string;
  artist?: string;
}

export const SOUNDSCAPE_OPTIONS: SoundscapeOption[] = [
  {
    id: "youtube_yulinling",
    name: "Vũ Lâm Linh (雨霖铃 - Nghiêu Thập Tam)",
    shortName: "Vũ Lâm Linh",
    icon: "🪕",
    description: "Khúc ca cổ phong thiền tịnh Vũ Lâm Linh (雨霖铃 - 尧十三) từ YouTube, thanh âm cổ cầm u tịnh sâu lắng khi gieo quẻ.",
    isYouTube: true,
    youtubeId: "bbMRtYuE1PU",
    youtubeUrl: "https://www.youtube.com/watch?v=bbMRtYuE1PU",
    artist: "Nghiêu Thập Tam (尧十三)",
  },
  {
    id: "singing_bowl",
    name: "Trầm Hương & Chuông Xoay",
    shortName: "Chuông Xoay OM",
    icon: "🕉️",
    description: "Tần số OM 136.1Hz hòa cùng tiếng chuông đồng Tây Tạng ngân vang trầm ấm.",
  },
  {
    id: "wind_chimes",
    name: "Chuông Gió Trúc Khê",
    shortName: "Chuông Gió Cổ Phong",
    icon: "🎐",
    description: "Tiếng chuông gió ngũ cung thanh thoát bên hiên chùa cổ thanh tịnh.",
  },
  {
    id: "zen_stream",
    name: "Suối Nước Thiền Tịnh",
    shortName: "Suối Nước & Trầm",
    icon: "🌊",
    description: "Âm thanh dòng suối chảy róc rách hòa điệu chuông thiền định tâm.",
  },
  {
    id: "healing_432hz",
    name: "Tần Số 432Hz Thiền Định",
    shortName: "Sóng 432Hz Theta",
    icon: "🧘",
    description: "Tần số chữa lành 432Hz giúp giải phóng âu lo, tĩnh tâm sáng suốt.",
  },
];

class ZenAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isRunning: boolean = false;
  private currentSoundscape: string = "singing_bowl";
  private volume: number = 0.45;
  private activeNodes: { stop?: () => void; disconnect?: () => void }[] = [];
  private chimeTimer: any = null;

  // Initialize or get the audio context
  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Ensure master gain is ready
  private getMasterGain(): GainNode {
    const ctx = this.getContext();
    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, ctx.currentTime);
      this.masterGain.connect(ctx.destination);
    }
    return this.masterGain;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public getCurrentSoundscape(): string {
    return this.currentSoundscape;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.08);
    }
  }

  /**
   * Strike a realistic Tibetan Singing Bowl chime manually or periodically
   */
  public strikeSingingBowl(fundamental: number = 216, strength: number = 0.6) {
    try {
      const ctx = this.getContext();
      const master = this.getMasterGain();
      const now = ctx.currentTime;

      // Tibetan bowls feature inharmonic partials: fundamental, ~2.76x, ~5.4x, ~8.1x
      const partials = [
        { mult: 1.0, gain: 0.8 * strength, decay: 8.5 },
        { mult: 2.76, gain: 0.45 * strength, decay: 6.0 },
        { mult: 5.4, gain: 0.25 * strength, decay: 4.2 },
        { mult: 8.1, gain: 0.12 * strength, decay: 2.8 },
      ];

      partials.forEach(({ mult, gain: pGain, decay }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Slight micro-detuning for shimmering organic warmth
        const detune = (Math.random() - 0.5) * 4;
        osc.frequency.setValueAtTime(fundamental * mult + detune, now);
        osc.type = "sine";

        // Attack: soft mallet strike
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(pGain, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

        osc.connect(gain);
        gain.connect(master);

        osc.start(now);
        osc.stop(now + decay + 0.1);
      });
    } catch (e) {
      console.warn("Could not strike singing bowl:", e);
    }
  }

  /**
   * Sound effect: Realistic 64-card riffle shuffle with paper flutter, cascade, tap, and chime (5.5s duration)
   */
  public playCardShuffleSound() {
    try {
      const ctx = this.getContext();
      const master = this.getMasterGain();
      const now = ctx.currentTime;

      // 1. Initial paper slide & split (0s - 1.2s)
      const slideOsc = ctx.createOscillator();
      const slideGain = ctx.createGain();
      const slideFilter = ctx.createBiquadFilter();
      slideOsc.type = "sine";
      slideOsc.frequency.setValueAtTime(140, now);
      slideOsc.frequency.exponentialRampToValueAtTime(80, now + 0.9);
      slideFilter.type = "lowpass";
      slideFilter.frequency.setValueAtTime(450, now);
      slideGain.gain.setValueAtTime(0.0001, now);
      slideGain.gain.linearRampToValueAtTime(0.15, now + 0.15);
      slideGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
      slideOsc.connect(slideFilter);
      slideFilter.connect(slideGain);
      slideGain.connect(master);
      slideOsc.start(now);
      slideOsc.stop(now + 1.0);

      // 2. Riffle flutter flurry across phase 2 (1.8s - 3.2s): 36 rapid interlaced card clicks
      const numFlutters = 36;
      for (let i = 0; i < numFlutters; i++) {
        const timeOffset = 1.8 + (i / numFlutters) * 1.35 + (Math.random() - 0.5) * 0.02;
        const snapTime = now + timeOffset;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        const isLeft = i % 2 === 0;
        osc.type = "triangle";
        osc.frequency.setValueAtTime(isLeft ? 380 + Math.random() * 90 : 460 + Math.random() * 100, snapTime);
        osc.frequency.exponentialRampToValueAtTime(110, snapTime + 0.038);

        filter.type = "bandpass";
        filter.frequency.setValueAtTime(1300 + Math.random() * 700, snapTime);
        filter.Q.setValueAtTime(3.8, snapTime);

        const clickVol = 0.26 * Math.min(1, (i + 4) / 16);
        gain.gain.setValueAtTime(0.0001, snapTime);
        gain.gain.linearRampToValueAtTime(clickVol, snapTime + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, snapTime + 0.038);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(master);

        osc.start(snapTime);
        osc.stop(snapTime + 0.045);
      }

      // 3. Waterfall cascade paper rush (3.3s - 4.2s)
      const cascadeOsc = ctx.createOscillator();
      const cascadeGain = ctx.createGain();
      const cascadeFilter = ctx.createBiquadFilter();
      cascadeOsc.type = "triangle";
      cascadeOsc.frequency.setValueAtTime(320, now + 3.3);
      cascadeOsc.frequency.exponentialRampToValueAtTime(140, now + 4.2);
      cascadeFilter.type = "bandpass";
      cascadeFilter.frequency.setValueAtTime(850, now + 3.3);
      cascadeFilter.Q.setValueAtTime(2.0, now + 3.3);
      cascadeGain.gain.setValueAtTime(0.0001, now + 3.3);
      cascadeGain.gain.linearRampToValueAtTime(0.18, now + 3.5);
      cascadeGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);
      cascadeOsc.connect(cascadeFilter);
      cascadeFilter.connect(cascadeGain);
      cascadeGain.connect(master);
      cascadeOsc.start(now + 3.3);
      cascadeOsc.stop(now + 4.25);

      // 4. Deck cut & alignment tap (4.4s)
      const tapOsc = ctx.createOscillator();
      const tapGain = ctx.createGain();
      tapOsc.type = "sine";
      tapOsc.frequency.setValueAtTime(220, now + 4.4);
      tapOsc.frequency.exponentialRampToValueAtTime(60, now + 4.48);
      tapGain.gain.setValueAtTime(0.0001, now + 4.4);
      tapGain.gain.linearRampToValueAtTime(0.22, now + 4.41);
      tapGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.49);
      tapOsc.connect(tapGain);
      tapGain.connect(master);
      tapOsc.start(now + 4.4);
      tapOsc.stop(now + 4.5);

      // 5. Grand concluding flourish: sacred Tibetan singing bowl chime (4.9s - 5.5s+)
      setTimeout(() => {
        this.strikeSingingBowl(324, 0.5);
      }, 4850);
    } catch (e) {
      console.warn("Could not play card shuffle sound:", e);
    }
  }

  /**
   * Sound effect: Spiritual suspense heartbeat / tremble pulse when holding a card
   */
  public playCardHoldTremble(intensity: number = 1) {
    try {
      const ctx = this.getContext();
      const master = this.getMasterGain();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const subOsc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(108, now); // Sacred A2 harmonic
      osc.frequency.linearRampToValueAtTime(116, now + 0.15);

      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(54, now); // Sub-bass heartbeat

      const vol = Math.min(0.35, 0.12 * intensity);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc.connect(gain);
      subOsc.connect(gain);
      gain.connect(master);

      osc.start(now);
      subOsc.start(now);
      osc.stop(now + 0.25);
      subOsc.stop(now + 0.25);
    } catch (e) {
      // Ignore
    }
  }

  /**
   * Sound effect: Spiritual card draw - silk/paper glide followed by celestial singing bowl chime & OM resonance
   */
  public playCardDrawSound() {
    try {
      const ctx = this.getContext();
      const master = this.getMasterGain();
      const now = ctx.currentTime;

      // 1. Paper / Silk glide whoosh (0 - 0.22s)
      const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.25), ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseBuffer.length; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.075));
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(820, now);
      filter.frequency.exponentialRampToValueAtTime(320, now + 0.2);
      filter.Q.setValueAtTime(2.2, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.0001, now);
      noiseGain.gain.linearRampToValueAtTime(0.24, now + 0.02);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      noiseSource.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(master);
      noiseSource.start(now);

      // 2. Divine Pentatonic Chime (432Hz Cosmos & 648Hz Fifth Harmonic & 864Hz Octave)
      [432, 648, 864].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        const startTime = now + 0.04 + idx * 0.035;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq + (idx === 0 ? 0 : (Math.random() - 0.5) * 2), startTime);

        const vol = 0.26 / (idx + 1);
        oscGain.gain.setValueAtTime(0.0001, startTime);
        oscGain.gain.linearRampToValueAtTime(vol, startTime + 0.02);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.0 - idx * 0.3);

        osc.connect(oscGain);
        oscGain.connect(master);
        osc.start(startTime);
        osc.stop(startTime + 2.1);
      });

      // 3. Sacred OM Sub-resonance (108Hz)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(108, now);
      subGain.gain.setValueAtTime(0.0001, now);
      subGain.gain.linearRampToValueAtTime(0.12, now + 0.05);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
      subOsc.connect(subGain);
      subGain.connect(master);
      subOsc.start(now);
      subOsc.stop(now + 0.95);
    } catch (e) {
      console.warn("Could not play card draw sound:", e);
    }
  }

  /**
   * Sound effect: Spiritual 3D card flip - crisp card snap/turn + 528Hz Solfeggio clarity bell
   */
  public playCardFlipSound() {
    try {
      const ctx = this.getContext();
      const master = this.getMasterGain();
      const now = ctx.currentTime;

      // 1. Crisp card paper snap / turn (0 - 0.08s)
      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();
      const snapFilter = ctx.createBiquadFilter();

      snapOsc.type = "triangle";
      snapOsc.frequency.setValueAtTime(460, now);
      snapOsc.frequency.exponentialRampToValueAtTime(120, now + 0.07);

      snapFilter.type = "bandpass";
      snapFilter.frequency.setValueAtTime(1600, now);
      snapFilter.Q.setValueAtTime(2.5, now);

      snapGain.gain.setValueAtTime(0.0001, now);
      snapGain.gain.linearRampToValueAtTime(0.26, now + 0.008);
      snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      snapOsc.connect(snapFilter);
      snapFilter.connect(snapGain);
      snapGain.connect(master);
      snapOsc.start(now);
      snapOsc.stop(now + 0.09);

      // 2. Solfeggio 528Hz (Transformation & Miracles) + 1056Hz harmonic
      [528, 1056].forEach((freq, idx) => {
        const bellOsc = ctx.createOscillator();
        const bellGain = ctx.createGain();
        const startTime = now + 0.02;

        bellOsc.type = "sine";
        bellOsc.frequency.setValueAtTime(freq, startTime);

        const bellVol = idx === 0 ? 0.32 : 0.14;
        bellGain.gain.setValueAtTime(0.0001, startTime);
        bellGain.gain.linearRampToValueAtTime(bellVol, startTime + 0.015);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.8);

        bellOsc.connect(bellGain);
        bellGain.connect(master);
        bellOsc.start(startTime);
        bellOsc.stop(startTime + 1.85);
      });
    } catch (e) {
      console.warn("Could not play card flip sound:", e);
    }
  }

  /**
   * Sound effect: Grand revelation chime - cascading sacred Tibetan singing bowls & harmony
   */
  public playSpiritualRevealChime() {
    try {
      const ctx = this.getContext();
      const master = this.getMasterGain();
      const now = ctx.currentTime;

      // Pentatonic ascension chords: 216Hz, 324Hz, 432Hz, 540Hz
      const freqs = [216, 324, 432, 540];
      freqs.forEach((freq, idx) => {
        const startTime = now + idx * 0.09;
        const osc = ctx.createOscillator();
        const overtone = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);

        overtone.type = "sine";
        overtone.frequency.setValueAtTime(freq * 2.76, startTime); // Tibetan singing bowl partial

        const vol = 0.28;
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(vol, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 3.2 - idx * 0.3);

        osc.connect(gain);
        overtone.connect(gain);
        gain.connect(master);

        osc.start(startTime);
        overtone.start(startTime);
        osc.stop(startTime + 3.3);
        overtone.stop(startTime + 3.3);
      });
    } catch (e) {
      console.warn("Could not play spiritual reveal chime:", e);
    }
  }

  /**
   * Sound effect: Celestial chime when a card is selected
   */
  public playCardDrawChime() {
    this.playCardDrawSound();
  }

  /**
   * Sound effect: Antique bronze coins rattling and shaking in hand / tortoise shell
   */
  public playCoinShake() {
    try {
      const ctx = this.getContext();
      const master = this.getMasterGain();
      const now = ctx.currentTime;

      // 4-6 rapid metallic coin clinks
      const numClinks = 5;
      for (let i = 0; i < numClinks; i++) {
        const timeOffset = now + i * 0.045 + (Math.random() - 0.5) * 0.015;
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        const baseFreq = 1800 + Math.random() * 800;
        osc.type = "sine";
        osc.frequency.setValueAtTime(baseFreq, timeOffset);

        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(baseFreq * 1.58, timeOffset);

        filter.type = "highpass";
        filter.frequency.setValueAtTime(1200, timeOffset);

        const vol = 0.14 * (0.8 + Math.random() * 0.4);
        gain.gain.setValueAtTime(0.0001, timeOffset);
        gain.gain.linearRampToValueAtTime(vol, timeOffset + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0001, timeOffset + 0.06);

        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(master);

        osc.start(timeOffset);
        osc2.start(timeOffset);
        osc.stop(timeOffset + 0.07);
        osc2.stop(timeOffset + 0.07);
      }
    } catch {
      // Ignore
    }
  }

  /**
   * Sound effect: Single crisp antique bronze coin clink
   */
  public playCoinClink(pitchMultiplier: number = 1.0) {
    try {
      const ctx = this.getContext();
      const master = this.getMasterGain();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      const freq = (2200 + (Math.random() - 0.5) * 300) * pitchMultiplier;
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(freq * 2.42, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(master);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.3);
      osc2.stop(now + 0.3);
    } catch {
      // Ignore
    }
  }

  /**
   * Sound effect: Coin landing, bouncing, and settling on ceramic / bronze plate
   */
  public playCoinPlateLanding() {
    try {
      const ctx = this.getContext();
      const master = this.getMasterGain();
      const now = ctx.currentTime;

      // 3 bouncing taps with decaying intervals and volume
      const bounces = [0, 0.06, 0.11, 0.15];
      bounces.forEach((offset, idx) => {
        const time = now + offset;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(1400 - idx * 80 + Math.random() * 100, time);

        const vol = (0.2 / (idx + 1)) * 0.8;
        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.linearRampToValueAtTime(vol, time + 0.003);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.09 - idx * 0.015);

        osc.connect(gain);
        gain.connect(master);

        osc.start(time);
        osc.stop(time + 0.1);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Sound effect: Yarrow stalks / bamboo sticks rustling & dividing
   */
  public playYarrowStalkRustle() {
    try {
      const ctx = this.getContext();
      const master = this.getMasterGain();
      const now = ctx.currentTime;

      // Filtered noise swoosh representing wooden reed stalks sliding
      const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.35), ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < buffer.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.12));
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1100, now);
      filter.frequency.exponentialRampToValueAtTime(550, now + 0.3);
      filter.Q.setValueAtTime(3.0, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(master);

      source.start(now);
    } catch {
      // Ignore
    }
  }

  /**
   * Sound effect: Single wooden yarrow reed tap / count of 4
   */
  public playYarrowCountClick(pitchMult: number = 1.0) {
    try {
      const ctx = this.getContext();
      const master = this.getMasterGain();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(580 * pitchMult, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.035);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Ignore
    }
  }

  /**
   * Strike a delicate pentatonic wind chime note
   */
  private strikeWindChime() {
    if (!this.isRunning || this.currentSoundscape !== "wind_chimes") return;
    try {
      const ctx = this.getContext();
      const master = this.getMasterGain();
      const now = ctx.currentTime;

      // Oriental Pentatonic notes (D5, E5, G5, A5, B5, D6, E6)
      const pentatonicFreqs = [587.33, 659.25, 783.99, 880.0, 987.77, 1174.66, 1318.51];
      const freq = pentatonicFreqs[Math.floor(Math.random() * pentatonicFreqs.length)];

      const osc = ctx.createOscillator();
      const overtone = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      overtone.type = "sine";
      overtone.frequency.setValueAtTime(freq * 3.01, now); // Metallic metallic overtone

      const chimeVolume = 0.15 + Math.random() * 0.12;
      const decayTime = 2.5 + Math.random() * 1.8;

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(chimeVolume, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decayTime);

      osc.connect(gain);
      overtone.connect(gain);
      gain.connect(master);

      osc.start(now);
      overtone.start(now);
      osc.stop(now + decayTime + 0.1);
      overtone.stop(now + decayTime + 0.1);
    } catch (e) {
      // Ignore
    }
  }

  /**
   * Creates pink noise buffer for realistic gentle flowing water
   */
  private createPinkNoiseNode(): AudioNode {
    const ctx = this.getContext();
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;
    return noiseSource;
  }

  /**
   * Start generating the active soundscape
   */
  public async start(soundscapeId: string = this.currentSoundscape) {
    this.currentSoundscape = soundscapeId;
    const ctx = this.getContext();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    this.stopCurrentNodes();
    if (soundscapeId.startsWith("youtube")) {
      this.isRunning = false;
      return;
    }
    this.isRunning = true;
    const master = this.getMasterGain();
    const now = ctx.currentTime;

    // Smooth fade in
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(0.001, now);
    master.gain.linearRampToValueAtTime(this.volume, now + 1.2);

    if (soundscapeId === "singing_bowl") {
      // 136.1 Hz OM Drone + Octave Harmonics + Warm LFO Breathing
      const fundamental = 136.1; // Frequency of OM / Earth Year
      const freqs = [fundamental * 0.5, fundamental, fundamental * 2, fundamental * 3];
      const gains = [0.28, 0.22, 0.12, 0.05];

      // Slow Breathing LFO (0.07 Hz = ~14 seconds per breath cycle)
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.065, now);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.08, now);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, now);

      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now);
        g.gain.setValueAtTime(gains[idx], now);

        osc.connect(g);
        g.connect(filter);
        osc.start(now);
        this.activeNodes.push(osc);
      });

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      filter.connect(master);
      lfo.start(now);
      this.activeNodes.push(lfo);

      // Initial welcoming singing bowl strike
      setTimeout(() => {
        if (this.isRunning) this.strikeSingingBowl(216, 0.55);
      }, 500);

      // Periodic singing bowl chime every 18 seconds
      this.chimeTimer = setInterval(() => {
        if (this.isRunning && this.currentSoundscape === "singing_bowl") {
          const notes = [216, 272.2, 324];
          const note = notes[Math.floor(Math.random() * notes.length)];
          this.strikeSingingBowl(note, 0.45);
        }
      }, 18000);
    } else if (soundscapeId === "wind_chimes") {
      // Gentle Temple Wind Chimes with warm wooden / bamboo drone
      const droneOsc1 = ctx.createOscillator();
      const droneOsc2 = ctx.createOscillator();
      const droneGain = ctx.createGain();

      droneOsc1.type = "sine";
      droneOsc1.frequency.setValueAtTime(164.81, now); // E3
      droneOsc2.type = "sine";
      droneOsc2.frequency.setValueAtTime(246.94, now); // B3

      droneGain.gain.setValueAtTime(0.14, now);

      droneOsc1.connect(droneGain);
      droneOsc2.connect(droneGain);
      droneGain.connect(master);

      droneOsc1.start(now);
      droneOsc2.start(now);
      this.activeNodes.push(droneOsc1, droneOsc2);

      // Random natural wind chimes striking every 1.5 - 3.5 seconds
      const scheduleNextChime = () => {
        if (!this.isRunning || this.currentSoundscape !== "wind_chimes") return;
        this.strikeWindChime();
        const nextDelay = 1200 + Math.random() * 2600;
        this.chimeTimer = setTimeout(scheduleNextChime, nextDelay);
      };
      scheduleNextChime();
    } else if (soundscapeId === "zen_stream") {
      // Soft mountain stream water ripples + distant temple bell
      const noiseSource = this.createPinkNoiseNode() as AudioBufferSourceNode;
      const waterFilter = ctx.createBiquadFilter();
      waterFilter.type = "bandpass";
      waterFilter.frequency.setValueAtTime(550, now);
      waterFilter.Q.setValueAtTime(1.8, now);

      // Slow filter sweep for dynamic water flow
      const waterLfo = ctx.createOscillator();
      waterLfo.frequency.setValueAtTime(0.2, now);
      const waterLfoGain = ctx.createGain();
      waterLfoGain.gain.setValueAtTime(160, now);

      const waterGain = ctx.createGain();
      waterGain.gain.setValueAtTime(0.18, now);

      waterLfo.connect(waterLfoGain);
      waterLfoGain.connect(waterFilter.frequency);

      noiseSource.connect(waterFilter);
      waterFilter.connect(waterGain);
      waterGain.connect(master);

      noiseSource.start(now);
      waterLfo.start(now);
      this.activeNodes.push(noiseSource, waterLfo);

      // Gentle warm drone underneath stream
      const streamDrone = ctx.createOscillator();
      const streamDroneGain = ctx.createGain();
      streamDrone.type = "sine";
      streamDrone.frequency.setValueAtTime(108, now);
      streamDroneGain.gain.setValueAtTime(0.12, now);
      streamDrone.connect(streamDroneGain);
      streamDroneGain.connect(master);
      streamDrone.start(now);
      this.activeNodes.push(streamDrone);

      // Soft singing bowl every 22 seconds
      this.chimeTimer = setInterval(() => {
        if (this.isRunning && this.currentSoundscape === "zen_stream") {
          this.strikeSingingBowl(272.2, 0.35);
        }
      }, 22000);
    } else if (soundscapeId === "healing_432hz") {
      // 432 Hz Sacred Geometry & 4Hz Theta Binaural Beat
      const leftOsc = ctx.createOscillator();
      const rightOsc = ctx.createOscillator();
      const subOsc = ctx.createOscillator();

      const leftGain = ctx.createGain();
      const rightGain = ctx.createGain();
      const subGain = ctx.createGain();

      leftOsc.type = "sine";
      leftOsc.frequency.setValueAtTime(432.0, now); // 432Hz
      leftGain.gain.setValueAtTime(0.12, now);

      rightOsc.type = "sine";
      rightOsc.frequency.setValueAtTime(436.0, now); // 436Hz -> 4Hz Theta Beat
      rightGain.gain.setValueAtTime(0.12, now);

      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(108.0, now); // 108Hz Sacred Sub-harmonic
      subGain.gain.setValueAtTime(0.2, now);

      // Stereo panning if supported
      if (ctx.createStereoPanner) {
        const leftPan = ctx.createStereoPanner();
        leftPan.pan.setValueAtTime(-0.8, now);
        const rightPan = ctx.createStereoPanner();
        rightPan.pan.setValueAtTime(0.8, now);

        leftOsc.connect(leftGain);
        leftGain.connect(leftPan);
        leftPan.connect(master);

        rightOsc.connect(rightGain);
        rightGain.connect(rightPan);
        rightPan.connect(master);
      } else {
        leftOsc.connect(leftGain);
        leftGain.connect(master);
        rightOsc.connect(rightGain);
        rightGain.connect(master);
      }

      subOsc.connect(subGain);
      subGain.connect(master);

      leftOsc.start(now);
      rightOsc.start(now);
      subOsc.start(now);

      this.activeNodes.push(leftOsc, rightOsc, subOsc);

      // Bell chime on start
      setTimeout(() => {
        if (this.isRunning) this.strikeSingingBowl(432, 0.4);
      }, 600);
    }
  }

  /**
   * Stop active audio nodes with smooth fade out
   */
  public stop() {
    if (!this.isRunning) return;
    this.isRunning = false;

    if (this.chimeTimer) {
      clearInterval(this.chimeTimer);
      clearTimeout(this.chimeTimer);
      this.chimeTimer = null;
    }

    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.8);
      setTimeout(() => {
        this.stopCurrentNodes();
      }, 850);
    } else {
      this.stopCurrentNodes();
    }
  }

  private stopCurrentNodes() {
    if (this.chimeTimer) {
      clearInterval(this.chimeTimer);
      clearTimeout(this.chimeTimer);
      this.chimeTimer = null;
    }
    this.activeNodes.forEach((node) => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {
        // Ignore
      }
    });
    this.activeNodes = [];
  }
}

export const zenAudio = new ZenAudioEngine();
