/**
 * ice-audio.js
 * Synthesized ice-slide audio using Web Audio API — zero external files.
 * Plays a soothing layered sound when penguins belly-slide on the ice:
 *   • Icy shimmer  — filtered white noise (scraped-crystal texture)
 *   • Sub whoosh   — low-frequency swept sine (momentum feeling)
 *   • Frost tinkle — short pitched pings (ice crystal spray)
 *   • Tail fade     — reverb-like echo that decays as slide ends
 *
 * Also plays a gentle ambient winter wind loop in the background.
 */
const IceAudio = (() => {
  let ctx = null;
  let masterGain = null;
  let ambientStarted = false;
  let unlocked = false;

  /* ── CREATE AUDIO CONTEXT (must be triggered by user gesture) ── */
  function unlock() {
    if (unlocked) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.72;
      masterGain.connect(ctx.destination);
      unlocked = true;
      if (!ambientStarted) { startAmbientWind(); ambientStarted = true; }
    } catch(e) { console.warn('IceAudio: Web Audio not available', e); }
  }

  /* ══════════════════════════════════════════════════════════════
     AMBIENT WIND LOOP
     Soft filtered noise that loops quietly in the background,
     giving the scene a persistent "frozen tundra" atmosphere.
     ══════════════════════════════════════════════════════════════ */
  function startAmbientWind() {
    if (!ctx) return;

    const bufSize = ctx.sampleRate * 3; // 3-second buffer looped
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    // Pink-ish noise (weighted random)
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0;
    for (let i = 0; i < bufSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886*b0 + white*0.0555179; b1 = 0.99332*b1 + white*0.0750759;
      b2 = 0.96900*b2 + white*0.1538520; b3 = 0.86650*b3 + white*0.3104856;
      b4 = 0.55000*b4 + white*0.5329522; b5 = -0.7616*b5 - white*0.0168980;
      data[i] = (b0+b1+b2+b3+b4+b5 + white*0.5362) * 0.11;
    }

    const source = ctx.createBufferSource();
    source.buffer = buf;
    source.loop = true;

    // Low-pass — makes it "wind" not "hiss"
    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass'; lpf.frequency.value = 320; lpf.Q.value = 0.5;

    // High-pass to remove rumble
    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass'; hpf.frequency.value = 60; hpf.Q.value = 0.4;

    const windGain = ctx.createGain();
    windGain.gain.value = 0.0; // start silent, fade in

    source.connect(hpf); hpf.connect(lpf); lpf.connect(windGain); windGain.connect(masterGain);
    source.start();

    // Gentle fade-in over 2 seconds
    windGain.gain.setValueAtTime(0, ctx.currentTime);
    windGain.gain.linearRampToValueAtTime(0.38, ctx.currentTime + 2);

    // Slow LFO to make wind "breathe"
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.08; // very slow — ~12s period
    lfoGain.gain.value = 0.14;
    lfo.connect(lfoGain); lfoGain.connect(windGain.gain);
    lfo.start();
  }

  /* ══════════════════════════════════════════════════════════════
     ICE SLIDE SOUND
     Three layered components fired together:
     1. Crystal scrape — bandpass noise swept upward
     2. Whoosh         — sine sweep from low to mid
     3. Tinkle spray   — 4 quick pitched pings
     ══════════════════════════════════════════════════════════════ */
  function playSlideSoundAt(panX) {
    if (!ctx) return;
    const now = ctx.currentTime;

    /* Stereo panner based on penguin x position (0–1 range) */
    function pan(node) {
      const panner = ctx.createStereoPanner();
      panner.pan.value = Math.max(-0.85, Math.min(0.85, (panX * 2 - 1) * 0.7));
      node.connect(panner); panner.connect(masterGain); return panner;
    }

    /* ── 1. CRYSTAL ICE SCRAPE (filtered noise) ── */
    (() => {
      const bufLen = Math.floor(ctx.sampleRate * 1.4);
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) d[i] = (Math.random() * 2 - 1);

      const src = ctx.createBufferSource();
      src.buffer = buf;

      // Bandpass centred on icy frequency range
      const bpf = ctx.createBiquadFilter();
      bpf.type = 'bandpass'; bpf.Q.value = 3.2;
      bpf.frequency.setValueAtTime(1800, now);
      bpf.frequency.linearRampToValueAtTime(2800, now + 0.4);  // sweep up
      bpf.frequency.linearRampToValueAtTime(1200, now + 1.4);  // settle

      // High-shelf sparkle
      const shelf = ctx.createBiquadFilter();
      shelf.type = 'highshelf'; shelf.frequency.value = 5000; shelf.gain.value = 7;

      const g = ctx.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.28, now + 0.05);  // quick attack
      g.gain.linearRampToValueAtTime(0.18, now + 0.7);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.4); // fade tail

      src.connect(bpf); bpf.connect(shelf); shelf.connect(g); pan(g);
      src.start(now); src.stop(now + 1.4);
    })();

    /* ── 2. SUB WHOOSH (sine sweep) ── */
    (() => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(55, now);
      osc.frequency.linearRampToValueAtTime(180, now + 0.35);
      osc.frequency.exponentialRampToValueAtTime(40, now + 1.1);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.22, now + 0.08);
      g.gain.linearRampToValueAtTime(0.12, now + 0.5);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

      // Low-pass to keep it smooth
      const lpf = ctx.createBiquadFilter();
      lpf.type = 'lowpass'; lpf.frequency.value = 300;

      osc.connect(lpf); lpf.connect(g); pan(g);
      osc.start(now); osc.stop(now + 1.1);
    })();

    /* ── 3. FROST TINKLE PINGS (4 quick crystal notes) ── */
    const pingFreqs = [1047, 1319, 1568, 2093]; // C6 E6 G6 C7
    pingFreqs.forEach((freq, i) => {
      const delay = now + i * 0.07 + Math.random() * 0.04;

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq * (0.96 + Math.random() * 0.08); // slight detune

      // Soft attack then exponential decay (bell-like)
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, delay);
      g.gain.linearRampToValueAtTime(0.12, delay + 0.008);
      g.gain.exponentialRampToValueAtTime(0.001, delay + 0.55);

      // Add a harmonic for richness
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine'; osc2.frequency.value = freq * 2.01;
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0, delay);
      g2.gain.linearRampToValueAtTime(0.04, delay + 0.006);
      g2.gain.exponentialRampToValueAtTime(0.001, delay + 0.3);

      osc.connect(g); pan(g);
      osc2.connect(g2); pan(g2);
      osc.start(delay); osc.stop(delay + 0.6);
      osc2.start(delay); osc2.stop(delay + 0.35);
    });

    /* ── 4. SOFT REVERB TAIL (convolution approximation via delay) ── */
    (() => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, now + 0.2);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.9);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0, now + 0.2);
      g.gain.linearRampToValueAtTime(0.06, now + 0.3);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

      const delay = ctx.createDelay(1);
      delay.delayTime.value = 0.08;
      const fb = ctx.createGain(); fb.gain.value = 0.38;
      const lpf = ctx.createBiquadFilter(); lpf.type='lowpass'; lpf.frequency.value=1400;

      osc.connect(g); g.connect(delay); delay.connect(lpf); lpf.connect(fb); fb.connect(delay);
      pan(g);
      osc.start(now + 0.2); osc.stop(now + 1.0);
    })();
  }

  /* ══════════════════════════════════════════════════════════════
     WOBBLE RECOVERY SOUND
     Short soft "thud + ting" as penguin rights itself after slide
     ══════════════════════════════════════════════════════════════ */
  function playWobbleSound(panX) {
    if (!ctx) return;
    const now = ctx.currentTime;

    function pan(node) {
      const p = ctx.createStereoPanner();
      p.pan.value = Math.max(-0.85, Math.min(0.85, (panX * 2 - 1) * 0.6));
      node.connect(p); p.connect(masterGain);
    }

    // Soft thud
    const osc = ctx.createOscillator();
    osc.type = 'sine'; osc.frequency.setValueAtTime(90, now); osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.18, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(g); pan(g); osc.start(now); osc.stop(now + 0.25);

    // Little ting
    setTimeout(() => {
      if (!ctx) return;
      const n2 = ctx.currentTime;
      const o2 = ctx.createOscillator(); o2.type='sine'; o2.frequency.value=1760;
      const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.07, n2); g2.gain.exponentialRampToValueAtTime(0.001, n2+0.3);
      o2.connect(g2); pan(g2); o2.start(n2); o2.stop(n2+0.32);
    }, 60);
  }

  /* ── PUBLIC ── */
  return {
    unlock,
    playSlideSoundAt,
    playWobbleSound,
    /** Convenience: resume if browser suspended context */
    resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); },
    /** Ramp master volume (0 = mute, 0.72 = default) */
    setMaster(vol) {
      if (!masterGain) return;
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.3);
    }
  };
})();
