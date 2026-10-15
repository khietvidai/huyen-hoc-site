/**
 * Jiazi Sound Synthesizer (Web Audio API)
 * Tạo âm thanh tượng trưng sống động theo Lục Thập Hoa Giáp
 */

class JiaziSoundSynthesizer {
  private ctx: AudioContext | null = null;
  private currentNodes: {
    stop: () => void;
  } | null = null;
  private isPlaying: boolean = false;
  private currentSoundType: string | null = null;

  private initContext() {
    if (!this.ctx || this.ctx.state === "closed") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public getActiveSound(): string | null {
    return this.isPlaying ? this.currentSoundType : null;
  }

  public stopSound() {
    if (this.currentNodes) {
      try {
        this.currentNodes.stop();
      } catch (e) {
        // ignore
      }
      this.currentNodes = null;
    }
    this.isPlaying = false;
    this.currentSoundType = null;
  }

  public playSound(soundType: string, onEnd?: () => void) {
    this.stopSound();
    this.initContext();
    if (!this.ctx) return;

    this.isPlaying = true;
    this.currentSoundType = soundType;

    const ctx = this.ctx;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.7, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const cleanupFns: Array<() => void> = [];
    let isTerminated = false;

    const stopAll = () => {
      if (isTerminated) return;
      isTerminated = true;
      try {
        masterGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.2);
        setTimeout(() => {
          cleanupFns.forEach((fn) => {
            try {
              fn();
            } catch (err) {}
          });
          try {
            masterGain.disconnect();
          } catch (err) {}
        }, 300);
      } catch (e) {}
      this.isPlaying = false;
      this.currentSoundType = null;
      if (onEnd) onEnd();
    };

    this.currentNodes = { stop: stopAll };

    // White / Pink Noise generator helper
    const createNoiseBuffer = (isPink: boolean = false): AudioBuffer => {
      const bufferSize = ctx.sampleRate * 3; // 3 seconds loop
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0,
        b1 = 0,
        b2 = 0,
        b3 = 0,
        b4 = 0,
        b5 = 0,
        b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (isPink) {
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.969 * b2 + white * 0.153852;
          b3 = 0.8665 * b3 + white * 0.3104856;
          b4 = 0.55 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.016898;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        } else {
          data[i] = white;
        }
      }
      return buffer;
    };

    // Helper: Loop noise source
    const createLoopingNoise = (isPink: boolean = false) => {
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(isPink);
      noise.loop = true;
      return noise;
    };

    const now = ctx.currentTime;

    switch (soundType) {
      // 1. Hải Trung Kim - Tiếng kim khí trầm đục, nghẹt dưới đáy nước sâu
      case "hai_trung_kim": {
        // Deep sub water drone + muffled metallic clang
        const noise = createLoopingNoise(true);
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(140, now);
        filter.Q.setValueAtTime(4, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.4, now);
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(masterGain);
        noise.start(now);
        cleanupFns.push(() => noise.stop());

        // Muffled metallic underwater bells periodically
        const playClang = (time: number) => {
          const osc = ctx.createOscillator();
          const oscFilter = ctx.createBiquadFilter();
          const g = ctx.createGain();

          osc.type = "triangle";
          osc.frequency.setValueAtTime(95, time);
          oscFilter.type = "lowpass";
          oscFilter.frequency.setValueAtTime(220, time);

          g.gain.setValueAtTime(0.6, time);
          g.gain.exponentialRampToValueAtTime(0.001, time + 2.5);

          osc.connect(oscFilter);
          oscFilter.connect(g);
          g.connect(masterGain);

          osc.start(time);
          osc.stop(time + 2.6);
        };

        playClang(now + 0.2);
        playClang(now + 2.8);
        playClang(now + 5.5);
        break;
      }

      // 2. Kim Bạc Kim - Tiếng lụa bay sột soạt, kim loại dát mỏng chạm nhau thanh mảnh
      case "kim_bac_kim": {
        // High delicate metallic chimes + soft silk whisper
        const noise = createLoopingNoise(false);
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(3200, now);
        filter.Q.setValueAtTime(1.5, now);

        const silkGain = ctx.createGain();
        silkGain.gain.setValueAtTime(0.15, now);
        noise.connect(filter);
        filter.connect(silkGain);
        silkGain.connect(masterGain);
        noise.start(now);
        cleanupFns.push(() => noise.stop());

        // Delicate silver leaf chimes
        const chimeFrequencies = [2400, 3100, 3800, 4400, 2700, 3500];
        chimeFrequencies.forEach((freq, idx) => {
          const t = now + 0.3 + idx * 0.9;
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, t);
          g.gain.setValueAtTime(0.18, t);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(t);
          osc.stop(t + 1.3);
        });
        break;
      }

      // 3. Bạch Chá Kim - Tiếng búa đập đá quặng, thanh mà sắc
      case "bach_cha_kim": {
        const strikeHammer = (time: number) => {
          // Sharp attack clink
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const g = ctx.createGain();

          osc1.type = "sine";
          osc1.frequency.setValueAtTime(1150, time);
          osc1.frequency.exponentialRampToValueAtTime(980, time + 0.3);

          osc2.type = "triangle";
          osc2.frequency.setValueAtTime(2350, time);

          g.gain.setValueAtTime(0.7, time);
          g.gain.exponentialRampToValueAtTime(0.001, time + 0.7);

          osc1.connect(g);
          osc2.connect(g);
          g.connect(masterGain);

          osc1.start(time);
          osc1.stop(time + 0.8);
          osc2.start(time);
          osc2.stop(time + 0.8);
        };

        strikeHammer(now + 0.3);
        strikeHammer(now + 1.8);
        strikeHammer(now + 3.4);
        strikeHammer(now + 5.0);
        break;
      }

      // 4. Sa Trung Kim - Tiếng đãi cát lạo xạo, kim sa chạm đá dưới dòng nước
      case "sa_trung_kim": {
        // Water wash + sand grating
        const noise = createLoopingNoise(true);
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.setValueAtTime(1200, now);
        bp.Q.setValueAtTime(2, now);

        const g = ctx.createGain();
        g.gain.setValueAtTime(0.3, now);

        noise.connect(bp);
        bp.connect(g);
        g.connect(masterGain);
        noise.start(now);
        cleanupFns.push(() => noise.stop());

        // Intermittent gold flecks clinking against pebbles
        for (let i = 0; i < 8; i++) {
          const t = now + 0.5 + i * 0.8 + Math.random() * 0.3;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(2200 + Math.random() * 800, t);
          gain.gain.setValueAtTime(0.12, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.25);
        }
        break;
      }

      // 5. Kiếm Phong Kim - Tiếng gươm rút khỏi vỏ, keng rợn lạnh lùng
      case "kiem_phong_kim": {
        // High pitch scrape sliding into pure sharp ring
        const playSwordDraw = (time: number) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(600, time);
          osc.frequency.exponentialRampToValueAtTime(3200, time + 0.4);
          osc.frequency.setValueAtTime(3200, time + 0.4);

          g.gain.setValueAtTime(0.1, time);
          g.gain.linearRampToValueAtTime(0.7, time + 0.38);
          g.gain.exponentialRampToValueAtTime(0.0001, time + 3.5);

          // Second harmonic for razor sheen
          const oscHarmonic = ctx.createOscillator();
          oscHarmonic.type = "triangle";
          oscHarmonic.frequency.setValueAtTime(6400, time + 0.38);
          const harmGain = ctx.createGain();
          harmGain.gain.setValueAtTime(0.2, time + 0.38);
          harmGain.gain.exponentialRampToValueAtTime(0.0001, time + 2.5);

          osc.connect(g);
          g.connect(masterGain);
          oscHarmonic.connect(harmGain);
          harmGain.connect(masterGain);

          osc.start(time);
          osc.stop(time + 3.6);
          oscHarmonic.start(time + 0.38);
          oscHarmonic.stop(time + 3.6);
        };

        playSwordDraw(now + 0.2);
        playSwordDraw(now + 4.2);
        break;
      }

      // 6. Thoa Xuyến Kim - Tiếng trâm ngọc va chạm khe khẽ, tao nhã
      case "thoa_xuyen_kim": {
        // Pentatonic gentle jade clinks
        const jadeFreqs = [1760, 2093, 2349, 2793, 3135, 2349, 2093];
        jadeFreqs.forEach((freq, i) => {
          const t = now + 0.4 + i * 0.75;
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, t);
          g.gain.setValueAtTime(0.35, t);
          g.gain.exponentialRampToValueAtTime(0.0005, t + 1.1);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(t);
          osc.stop(t + 1.2);
        });
        break;
      }

      // 7. Tang Chá Mộc - Tiếng tằm ăn rào rào, tiếng thoi đưa kẽo kẹt
      case "tang_cha_moc": {
        // Rustling tằm ăn rào rào
        const noise = createLoopingNoise(true);
        const filter = ctx.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.setValueAtTime(3500, now);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.25, now);
        noise.connect(filter);
        filter.connect(g);
        g.connect(masterGain);
        noise.start(now);
        cleanupFns.push(() => noise.stop());

        // Rhythmic loom shuttle (tiếng thoi đưa kẽo kẹt)
        for (let i = 0; i < 6; i++) {
          const t = now + 0.5 + i * 1.1;
          const osc = ctx.createOscillator();
          const loomGain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(180, t);
          osc.frequency.linearRampToValueAtTime(120, t + 0.15);
          loomGain.gain.setValueAtTime(0.4, t);
          loomGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
          osc.connect(loomGain);
          loomGain.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.35);
        }
        break;
      }

      // 8. Tùng Bách Mộc - Tiếng gió rít qua rừng thông u u, trầm hùng
      case "tung_bach_moc": {
        const noise = createLoopingNoise(true);
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.setValueAtTime(380, now);
        bp.Q.setValueAtTime(5, now);

        // Modulate frequency like mountain wind howling
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.25, now);
        lfoGain.gain.setValueAtTime(180, now);
        lfo.connect(lfoGain);
        lfoGain.connect(bp.frequency);
        lfo.start(now);
        cleanupFns.push(() => lfo.stop());

        const g = ctx.createGain();
        g.gain.setValueAtTime(0.65, now);
        noise.connect(bp);
        bp.connect(g);
        g.connect(masterGain);
        noise.start(now);
        cleanupFns.push(() => noise.stop());
        break;
      }

      // 9. Đại Lâm Mộc - Tiếng đại ngàn gầm vang, gió lay tán lá ào ạt
      case "dai_lam_moc": {
        const noise = createLoopingNoise(true);
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.setValueAtTime(600, now);

        const g = ctx.createGain();
        g.gain.setValueAtTime(0.4, now);
        g.gain.linearRampToValueAtTime(0.85, now + 3);
        g.gain.linearRampToValueAtTime(0.5, now + 6);

        noise.connect(lp);
        lp.connect(g);
        g.connect(masterGain);
        noise.start(now);
        cleanupFns.push(() => noise.stop());
        break;
      }

      // 10. Dương Liễu Mộc - Tiếng cành liễu phất nhẹ trong gió thoảng
      case "duong_lieu_moc": {
        const noise = createLoopingNoise(false);
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.setValueAtTime(1800, now);
        bp.Q.setValueAtTime(1.2, now);

        const g = ctx.createGain();
        g.gain.setValueAtTime(0.12, now);
        g.gain.linearRampToValueAtTime(0.22, now + 2);
        g.gain.linearRampToValueAtTime(0.1, now + 5);

        noise.connect(bp);
        bp.connect(g);
        g.connect(masterGain);
        noise.start(now);
        cleanupFns.push(() => noise.stop());
        break;
      }

      // 11. Thạch Lựu Mộc - Tiếng quả nứt hạt, cành cứng cọ xát giòn sắc
      case "thach_luu_moc": {
        for (let i = 0; i < 7; i++) {
          const t = now + 0.4 + i * 0.9 + Math.random() * 0.4;
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(450 + Math.random() * 300, t);
          osc.frequency.exponentialRampToValueAtTime(180, t + 0.08);
          g.gain.setValueAtTime(0.5, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.15);
        }
        break;
      }

      // 12. Bình Địa Mộc - Tiếng mầm cây cựa mình nứt đất êm đềm
      case "binh_dia_moc": {
        // Deep warm earthy pulse with soft micro-cracks
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(65, now);
        g.gain.setValueAtTime(0.4, now);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(now);
        cleanupFns.push(() => osc.stop());

        // Soft popping buds
        for (let i = 0; i < 5; i++) {
          const t = now + 0.8 + i * 1.3;
          const pop = ctx.createOscillator();
          const popG = ctx.createGain();
          pop.type = "sine";
          pop.frequency.setValueAtTime(260, t);
          pop.frequency.exponentialRampToValueAtTime(110, t + 0.06);
          popG.gain.setValueAtTime(0.3, t);
          popG.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
          pop.connect(popG);
          popG.connect(masterGain);
          pop.start(t);
          pop.stop(t + 0.12);
        }
        break;
      }

      // 13. Phích Lịch Hỏa - Tiếng sét nổ đanh vang rền giữa cơn giông
      case "phich_lich_hoa": {
        const strikeLightning = (time: number) => {
          // 1. Initial thunder crack (sharp blast)
          const blast = ctx.createOscillator();
          const blastGain = ctx.createGain();
          blast.type = "sawtooth";
          blast.frequency.setValueAtTime(120, time);
          blast.frequency.exponentialRampToValueAtTime(40, time + 0.2);
          blastGain.gain.setValueAtTime(0.85, time);
          blastGain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
          blast.connect(blastGain);
          blastGain.connect(masterGain);
          blast.start(time);
          blast.stop(time + 0.45);

          // 2. Rolling thunder rumble
          const rumble = createLoopingNoise(true);
          const filter = ctx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(160, time);
          const rGain = ctx.createGain();
          rGain.gain.setValueAtTime(0.7, time + 0.1);
          rGain.gain.exponentialRampToValueAtTime(0.001, time + 3.2);
          rumble.connect(filter);
          filter.connect(rGain);
          rGain.connect(masterGain);
          rumble.start(time + 0.05);
          rumble.stop(time + 3.3);
        };

        strikeLightning(now + 0.2);
        strikeLightning(now + 3.8);
        break;
      }

      // 14. Lư Trung Hỏa - Tiếng củi nổ lách tách, lửa phì phò trong lò
      case "lu_trung_hoa": {
        // Low warm fire hum
        const hum = ctx.createOscillator();
        const hGain = ctx.createGain();
        hum.type = "triangle";
        hum.frequency.setValueAtTime(80, now);
        hGain.gain.setValueAtTime(0.3, now);
        hum.connect(hGain);
        hGain.connect(masterGain);
        hum.start(now);
        cleanupFns.push(() => hum.stop());

        // Crackles (lách tách)
        for (let i = 0; i < 15; i++) {
          const t = now + 0.2 + i * 0.45 + Math.random() * 0.2;
          const crack = ctx.createOscillator();
          const cGain = ctx.createGain();
          crack.type = "sine";
          crack.frequency.setValueAtTime(800 + Math.random() * 1200, t);
          cGain.gain.setValueAtTime(0.25, t);
          cGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
          crack.connect(cGain);
          cGain.connect(masterGain);
          crack.start(t);
          crack.stop(t + 0.05);
        }
        break;
      }

      // 15. Phúc Đăng Hỏa - Tiếng dầu bấc tí tách rất khẽ trong đêm tĩnh
      case "phuc_dang_hoa": {
        // Gentle peaceful quiet drone
        const hum = ctx.createOscillator();
        const hGain = ctx.createGain();
        hum.type = "sine";
        hum.frequency.setValueAtTime(136.1, now); // OM frequency / warm calm
        hGain.gain.setValueAtTime(0.15, now);
        hum.connect(hGain);
        hGain.connect(masterGain);
        hum.start(now);
        cleanupFns.push(() => hum.stop());

        // Tiny quiet oil wick crackles
        for (let i = 0; i < 6; i++) {
          const t = now + 0.8 + i * 1.1;
          const wick = ctx.createOscillator();
          const wGain = ctx.createGain();
          wick.type = "sine";
          wick.frequency.setValueAtTime(1500 + Math.random() * 500, t);
          wGain.gain.setValueAtTime(0.08, t);
          wGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
          wick.connect(wGain);
          wGain.connect(masterGain);
          wick.start(t);
          wick.stop(t + 0.04);
        }
        break;
      }

      // 16. Thiên Thượng Hỏa - Yên lặng tuyệt đối nhưng chói chang, áp đảo vạn vật
      case "thien_thuong_hoa": {
        // High shimmering celestial solar harmonics (pure cosmic radiant tone)
        const freqs = [432, 528, 864];
        freqs.forEach((f) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(f, now);
          g.gain.setValueAtTime(0.18, now);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(now);
          cleanupFns.push(() => osc.stop());
        });
        break;
      }

      // 17. Sơn Hạ Hỏa - Tiếng cỏ khô cháy xèo xèo, lụi dần
      case "son_ha_hoa": {
        const noise = createLoopingNoise(false);
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(2400, now);
        filter.Q.setValueAtTime(2.5, now);

        const g = ctx.createGain();
        g.gain.setValueAtTime(0.4, now);
        g.gain.linearRampToValueAtTime(0.05, now + 6); // Lụi dần

        noise.connect(filter);
        filter.connect(g);
        g.connect(masterGain);
        noise.start(now);
        cleanupFns.push(() => noise.stop());
        break;
      }

      // 18. Sơn Đầu Hỏa - Tiếng lửa táp gió hú lồng lộng trên đỉnh núi
      case "son_dau_hoa": {
        const noise = createLoopingNoise(true);
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.setValueAtTime(500, now);
        bp.Q.setValueAtTime(3, now);

        const g = ctx.createGain();
        g.gain.setValueAtTime(0.65, now);
        noise.connect(bp);
        bp.connect(g);
        g.connect(masterGain);
        noise.start(now);
        cleanupFns.push(() => noise.stop());
        break;
      }

      // 19. Bích Thượng Thổ - Tiếng gió rít đập vào vách tường bị chặn đứng
      case "bich_thuong_tho": {
        // Wind rushing then abruptly cut / buffeted by wall
        const playGust = (time: number) => {
          const noise = createLoopingNoise(false);
          const filter = ctx.createBiquadFilter();
          filter.type = "bandpass";
          filter.frequency.setValueAtTime(700, time);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.1, time);
          g.gain.linearRampToValueAtTime(0.7, time + 0.8);
          // Sudden hit against wall
          g.gain.setValueAtTime(0.05, time + 1.2);
          g.gain.linearRampToValueAtTime(0.001, time + 2.0);

          noise.connect(filter);
          filter.connect(g);
          g.connect(masterGain);
          noise.start(time);
          noise.stop(time + 2.1);
        };
        playGust(now + 0.2);
        playGust(now + 2.8);
        playGust(now + 5.2);
        break;
      }

      // 20. Thành Đầu Thổ - Tiếng bước chân lính tuần và tiếng gió dội tường đá
      case "thanh_dau_tho": {
        // Heavy footsteps on stone battlement (bước chân lính tuần)
        for (let i = 0; i < 7; i++) {
          const t = now + 0.4 + i * 0.95;
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(95, t);
          osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);
          g.gain.setValueAtTime(0.6, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.3);
        }
        break;
      }

      // 21. Sa Trung Thổ - Tiếng sóng vỗ bờ cát ì oạp, đất lở bồi trầm
      case "sa_trung_tho": {
        const playSiltWave = (time: number) => {
          const noise = createLoopingNoise(true);
          const lp = ctx.createBiquadFilter();
          lp.type = "lowpass";
          lp.frequency.setValueAtTime(320, time);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.1, time);
          g.gain.linearRampToValueAtTime(0.6, time + 0.8);
          g.gain.exponentialRampToValueAtTime(0.01, time + 2.4);

          noise.connect(lp);
          lp.connect(g);
          g.connect(masterGain);
          noise.start(time);
          noise.stop(time + 2.5);
        };
        playSiltWave(now + 0.2);
        playSiltWave(now + 2.6);
        playSiltWave(now + 5.0);
        break;
      }

      // 22. Lộ Bàng Thổ - Tiếng vó ngựa, bánh xe lăn lọc cọc trên lối đi
      case "lo_bang_tho": {
        // Horse clopping cadence
        for (let i = 0; i < 12; i++) {
          const t = now + 0.3 + i * 0.48;
          const clop = ctx.createOscillator();
          const cGain = ctx.createGain();
          clop.type = "triangle";
          clop.frequency.setValueAtTime(i % 2 === 0 ? 320 : 260, t);
          clop.frequency.exponentialRampToValueAtTime(140, t + 0.08);
          cGain.gain.setValueAtTime(0.5, t);
          cGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
          clop.connect(cGain);
          cGain.connect(masterGain);
          clop.start(t);
          clop.stop(t + 0.15);
        }
        break;
      }

      // 23. Đại Dịch Thổ - Tiếng xe cộ dập dìu, người qua lại nhộn nhịp
      case "dai_dich_tho": {
        // Ambience of travelers and rolling carriage wheels
        const noise = createLoopingNoise(true);
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(420, now);
        filter.Q.setValueAtTime(1.5, now);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.45, now);
        noise.connect(filter);
        filter.connect(g);
        g.connect(masterGain);
        noise.start(now);
        cleanupFns.push(() => noise.stop());
        break;
      }

      // 24. Ốc Thượng Thổ - Tiếng mưa rơi lộp bộp gõ đều trên mái ngói
      case "oc_thuong_tho": {
        // Raindrops tapping on terracotta roof tiles
        for (let i = 0; i < 20; i++) {
          const t = now + 0.2 + i * 0.32 + Math.random() * 0.15;
          const drop = ctx.createOscillator();
          const dGain = ctx.createGain();
          drop.type = "triangle";
          drop.frequency.setValueAtTime(520 + Math.random() * 280, t);
          drop.frequency.exponentialRampToValueAtTime(220, t + 0.06);
          dGain.gain.setValueAtTime(0.4, t);
          dGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
          drop.connect(dGain);
          dGain.connect(masterGain);
          drop.start(t);
          drop.stop(t + 0.1);
        }
        break;
      }

      // 25. Giản Hạ Thủy - Tiếng suối ngầm róc rách luồn qua khe đá
      case "gian_ha_thuy": {
        // Underground babbling stream
        const noise = createLoopingNoise(false);
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.setValueAtTime(900, now);
        bp.Q.setValueAtTime(3, now);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.25, now);
        noise.connect(bp);
        bp.connect(g);
        g.connect(masterGain);
        noise.start(now);
        cleanupFns.push(() => noise.stop());

        // Water droplet resonant bubbles
        for (let i = 0; i < 12; i++) {
          const t = now + 0.3 + i * 0.5 + Math.random() * 0.3;
          const bub = ctx.createOscillator();
          const bGain = ctx.createGain();
          bub.type = "sine";
          bub.frequency.setValueAtTime(450 + Math.random() * 350, t);
          bub.frequency.exponentialRampToValueAtTime(750, t + 0.08);
          bGain.gain.setValueAtTime(0.25, t);
          bGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
          bub.connect(bGain);
          bGain.connect(masterGain);
          bub.start(t);
          bub.stop(t + 0.12);
        }
        break;
      }

      // 26. Đại Khê Thủy - Tiếng thác đổ cuồn cuộn, nước va bờ đá rền vang
      case "dai_khe_thuy": {
        // Powerful cascading waterfall & boulder impact
        const noise = createLoopingNoise(true);
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(750, now);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.7, now);
        noise.connect(filter);
        filter.connect(g);
        g.connect(masterGain);
        noise.start(now);
        cleanupFns.push(() => noise.stop());

        // Sub bass roar of waterfall base
        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.type = "sine";
        sub.frequency.setValueAtTime(55, now);
        subGain.gain.setValueAtTime(0.5, now);
        sub.connect(subGain);
        subGain.connect(masterGain);
        sub.start(now);
        cleanupFns.push(() => sub.stop());
        break;
      }

      // 27. Trường Lưu Thủy - Tiếng dòng chảy êm đềm, nước vỗ mạn thuyền đều đặn
      case "truong_luu_thuy": {
        // Continuous gentle river flow
        const noise = createLoopingNoise(true);
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(450, now);
        filter.Q.setValueAtTime(1.8, now);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.4, now);
        noise.connect(filter);
        filter.connect(g);
        g.connect(masterGain);
        noise.start(now);
        cleanupFns.push(() => noise.stop());

        // Periodic boat hull slaps (nước vỗ mạn thuyền đều đặn)
        for (let i = 0; i < 5; i++) {
          const t = now + 0.5 + i * 1.4;
          const slap = ctx.createOscillator();
          const sGain = ctx.createGain();
          slap.type = "triangle";
          slap.frequency.setValueAtTime(110, t);
          slap.frequency.exponentialRampToValueAtTime(60, t + 0.2);
          sGain.gain.setValueAtTime(0.4, t);
          sGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
          slap.connect(sGain);
          sGain.connect(masterGain);
          slap.start(t);
          slap.stop(t + 0.4);
        }
        break;
      }

      // 28. Thiên Hà Thủy - Tiếng mưa rào sầm sập từ trời cao
      case "thien_ha_thuy": {
        // Pouring rainstorm
        const noise = createLoopingNoise(false);
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1800, now);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.6, now);
        noise.connect(filter);
        filter.connect(g);
        g.connect(masterGain);
        noise.start(now);
        cleanupFns.push(() => noise.stop());
        break;
      }

      // 29. Tỉnh Tuyền Thủy - Tiếng gàu múc nước bì bõm, giọt nước rỏ tõm xuống lòng giếng
      case "tinh_tuyen_thuy": {
        const playWellDrop = (time: number) => {
          // Hollow well droplet: pitch sweep downwards with deep hollow echo
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(1100, time);
          osc.frequency.exponentialRampToValueAtTime(320, time + 0.12);
          g.gain.setValueAtTime(0.65, time);
          g.gain.exponentialRampToValueAtTime(0.001, time + 0.9);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(time);
          osc.stop(time + 1.0);
        };

        playWellDrop(now + 0.3);
        playWellDrop(now + 1.8);
        playWellDrop(now + 3.4);
        playWellDrop(now + 5.2);
        break;
      }

      // 30. Đại Hải Thủy - Tiếng sóng đại dương gầm thét, triều dâng ầm ầm
      case "dai_hai_thuy": {
        const playOceanBreaker = (time: number) => {
          const noise = createLoopingNoise(true);
          const filter = ctx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(260, time);
          filter.frequency.linearRampToValueAtTime(900, time + 1.8);
          filter.frequency.linearRampToValueAtTime(200, time + 3.8);

          const g = ctx.createGain();
          g.gain.setValueAtTime(0.1, time);
          g.gain.linearRampToValueAtTime(0.85, time + 1.8);
          g.gain.exponentialRampToValueAtTime(0.01, time + 4.0);

          noise.connect(filter);
          filter.connect(g);
          g.connect(masterGain);
          noise.start(time);
          noise.stop(time + 4.1);
        };

        playOceanBreaker(now + 0.1);
        playOceanBreaker(now + 3.5);
        break;
      }

      default: {
        // Universal serene ambient chime
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(432, now);
        g.gain.setValueAtTime(0.4, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 3);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(now);
        osc.stop(now + 3.1);
        break;
      }
    }

    // Auto terminate after 7 seconds if not manually stopped
    setTimeout(() => {
      if (this.currentSoundType === soundType) {
        stopAll();
      }
    }, 7000);
  }
}

export const jiaziSoundSynthesizer = new JiaziSoundSynthesizer();
