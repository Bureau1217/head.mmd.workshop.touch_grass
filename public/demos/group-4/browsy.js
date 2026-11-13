/* Browsy (group 4, src/content.ts), bundled unchanged for the Touch_Grass demo. chrome.* comes from browser-host.js. */
"use strict";
(() => {
  // ../groups/g4/src/config.ts
  var CONFIG = {
    size: 240,
    // how big Browsy is on screen, in pixels
    // PRESENCE: Browsy only shows up when it gets crowded
    appearAtTabs: 15,
    // he appears when this many tabs (or more) are open
    leaveDelay: 4e3,
    // ms he lingers after you close tabs (so he can finish his sentence)
    // SENSES → each one becomes a "pressure" between 0 (fine) and 1 (too much).
    // Below the "Calm" number = no pressure at all. At the "Max" number = 100%.
    mouseCalm: 250,
    mouseMax: 1500,
    // mouse speed, pixels per second (across the screen in 1 s ≈ 1400)
    typingCalm: 1.5,
    typingMax: 5,
    // keys per second (1.5 ≈ 18 wpm, 5 ≈ 60 wpm)
    clicksCalm: 1,
    clicksMax: 6,
    // clicks within the last 3 seconds
    scrollCalm: 100,
    scrollMax: 1e3,
    // scroll speed, pixels per second (one mouse-wheel notch ≈ 100 px)
    switchesCalm: 1,
    switchesMax: 3,
    // tab switches within the last `switchMemory`
    tabsCalm: 15,
    tabsMax: 33,
    // open tabs (squeezed thinnest at the limit below)
    rageClicks: 3,
    // rage click = this many clicks within 1 second, all on about the same spot
    switchMemory: 1e4,
    // ms a tab switch keeps counting before he forgets it (max 60 s)
    dizzyAt: 3,
    // he gets dizzy at this many switches within switchMemory
    // How much each activity counts toward stress
    weights: { mouse: 2.5, typing: 2, clicks: 1, scroll: 2.5, switching: 2 },
    switchStress: 0.05,
    // …and every time you switch to another tab he takes this little hit (it adds up)
    comfort: 0.6,
    // activity below this level lets Browsy calm down
    riseSpeed: 0.06,
    // how fast stress climbs when you're "too much"
    calmSpeed: 0.1,
    // how fast stress drains (per second) when you're gentle
    // Lots of tabs and a bad internet connection don't stress him directly.
    // They make him FRAGILE: the same behaviour stresses him faster.
    tabFragility: 0.6,
    netFragility: 1,
    // DEATH: stress maxed out AND at least this many senses overloaded at once
    deathFactors: 2,
    overloaded: 0.75,
    // a sense counts as "overloaded" above this pressure
    deathHold: 1500,
    // ms both conditions must last before he actually dies
    maxedDeath: 4e3,
    // …or: ms at max stress before he dies anyway (even with just one overloaded sense)
    tabsDeathAt: 33,
    // …or: this many open tabs kill him, however calm you are (a warning comes 3 tabs before)
    catAt: 0.7,
    // stress level where he pulls out a cat picture
    catDuration: 8e3,
    // how long the cat stays (ms)
    catCooldown: 12e4,
    // ms before he can show another cat (2 min)
    catCooldownDemo: 3e4,
    // …the same in demo mode (shorter, so you can show it off)
    // CLOSING TABS: when he pulls out the cat, and every time he turns orange,
    // he closes a few of the tabs you've looked at least recently (between min and max)
    closeTabsMin: 2,
    closeTabsMax: 3,
    orangeAt: 0.7,
    // stress where he turns orange (same as catAt: if the cat comes out right then, the cat's tabs count instead)
    orangeEvery: 1,
    // closes tabs every time he turns orange (2 = only the 1st, 3rd, 5th… time)
    orangeReset: 0.5,
    // he has to calm down below this before turning orange counts again
    // RUSHING: type this fast for this long, and he closes some of your tabs
    rushKeysPerSec: 4,
    // 4 letters a second ≈ 48 wpm
    rushTime: 2500,
    // ms of rushing before he acts
    rushCloseTabs: 3,
    // how many tabs he closes (the ones you looked at least recently)
    rushCooldown: 6e4,
    // ms before he can do it again
    // RIPPING: scrolling faster than ripScrollSpeed fills up his "rip meter"; it slowly
    // empties again when you slow down, so fast bursts add up too. Half full → a warning.
    // Full → he rips the tab in half (it closes).
    ripScrollSpeed: 600,
    // px/s (≈ 6 mouse-wheel notches a second)
    ripTime: 1500,
    // the meter is full after this many ms of fast scrolling
    ripDrain: 0.2,
    // how fast it empties when you slow down (1 = as fast as it fills)
    stillToRevive: 5e3,
    // ms of total stillness needed to bring him back (only in safe mode)
    // POKING: clicking him over and over. The n-th click in a row adds n × pokeStress,
    // so it escalates (6 clicks in a row ≈ +0.63 stress). While you keep clicking he
    // can't calm down. A pause longer than pokeReset ms ends the row.
    pokeStress: 0.03,
    pokeReset: 1500,
    // THE CRASH: when he dies, he closes every tab one by one and then shuts
    // the whole browser down. Your tabs do NOT come back — that's the point.
    // Tick "safe mode" in the popup to turn this off while you're working on him.
    crashDelay: 3500,
    // ms to read the tombstone before the tabs start closing
    crashCountdown: 7,
    // seconds the crash screen shows before the browser closes
    // DEMO MODE (switch in the popup): hyper-sensitive, for showing him off.
    // Mouse, typing, clicks and scrolling count from a fraction of the usual speed,
    // and stress climbs faster. (Rushing and ripping keep their normal numbers.)
    demoSensitivity: 3,
    // 3 = he reacts to a third of the usual speed
    demoRiseSpeed: 4,
    // stress climbs this many times faster
    // He comments when you've been on one website this long (minutes).
    // In demo mode these become seconds, so you can show it off quickly.
    siteMinutes: [5, 10, 20, 45, 90],
    // Photos he shows to calm down. Drop your own into public/cats/ and list them here.
    catImages: [
      "cats/cat1.jpg",
      "cats/cat2.jpg",
      "cats/cat3.png",
      "cats/cat4.jpg",
      "cats/cat5.jpg"
    ]
  };
  var load = (keys) => chrome.storage.local.get(keys);
  var save = (values) => chrome.storage.local.set(values);
  var send = (message) => chrome.runtime.sendMessage(message);
  var CONFIG_DEFAULTS = structuredClone(CONFIG);
  function applyTuning(tuning) {
    const fresh = structuredClone(CONFIG_DEFAULTS);
    for (const [path, value] of Object.entries(tuning ?? {})) {
      const keys = path.split(".");
      const last = keys.pop();
      const target = keys.reduce((obj, key) => obj?.[key], fresh);
      if (target && last in target) target[last] = value;
    }
    Object.assign(CONFIG, fresh);
  }
  try {
    load(["browsyTuning"]).then((data) => applyTuning(data.browsyTuning)).catch(() => {
    });
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes.browsyTuning) applyTuning(changes.browsyTuning.newValue);
    });
  } catch {
  }

  // ../groups/g4/src/frames.ts
  var NOT_TYPING = ["Shift", "Control", "Alt", "Meta", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "PageUp", "PageDown", "Home", "End"];
  var isTyping = (e) => !e.repeat && !NOT_TYPING.includes(e.key);
  if (window !== window.top) {
    addEventListener("keydown", (e) => {
      if (isTyping(e)) window.top?.postMessage({ browsy: "key" }, "*");
    }, { capture: true, passive: true });
  }

  // ../groups/g4/src/sound.ts
  var ctx = null;
  var master = null;
  var echoBus = null;
  var noiseBuffer = null;
  var gritCurve = null;
  var muted = false;
  var VOLUME = 0.45;
  var setMuted = (value) => {
    muted = value;
  };
  function unlock() {
    try {
      if (!ctx) {
        ctx = new AudioContext();
        const squash = ctx.createDynamicsCompressor();
        squash.threshold.value = -16;
        squash.ratio.value = 6;
        squash.connect(ctx.destination);
        master = ctx.createGain();
        master.gain.value = VOLUME;
        master.connect(squash);
        const delay = ctx.createDelay(1);
        delay.delayTime.value = 0.23;
        const feedback = ctx.createGain();
        feedback.gain.value = 0.4;
        const dull = ctx.createBiquadFilter();
        dull.type = "lowpass";
        dull.frequency.value = 2200;
        echoBus = ctx.createGain();
        echoBus.gain.value = 0.55;
        echoBus.connect(delay);
        delay.connect(dull).connect(feedback).connect(delay);
        dull.connect(master);
      }
      if (ctx.state === "suspended") ctx.resume().catch(() => {
      });
    } catch {
    }
  }
  var ready = () => !muted && ctx?.state === "running" && master ? ctx : null;
  function envelope(c, t, dur, vol, shape2) {
    const gain = c.createGain();
    gain.gain.setValueAtTime(1e-4, t);
    if (shape2 === "swell") {
      gain.gain.linearRampToValueAtTime(vol, t + dur * 0.92);
    } else {
      gain.gain.exponentialRampToValueAtTime(vol, t + 0.015);
      if (shape2 === "hold") gain.gain.linearRampToValueAtTime(vol * 0.7, t + dur * 0.8);
    }
    gain.gain.exponentialRampToValueAtTime(1e-4, t + dur);
    return gain;
  }
  function out(gain, echo) {
    gain.connect(master);
    if (echo && echoBus) gain.connect(echoBus);
  }
  function tone({
    type = "sine",
    from,
    to = from,
    dur,
    at = 0,
    vol = 0.5,
    hold = false,
    swell = false,
    wobble: wobble2 = 0,
    wobbleSpeed = 12,
    muffle,
    grit = false,
    echo = false
  }) {
    const c = ready();
    if (!c) return;
    const t = c.currentTime + at;
    const osc = c.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + dur);
    let sound = osc;
    if (grit) {
      if (!gritCurve) {
        gritCurve = new Float32Array(1024);
        for (let i = 0; i < gritCurve.length; i++) gritCurve[i] = Math.tanh((i / 1024 * 2 - 1) * 4);
      }
      const shaper = c.createWaveShaper();
      shaper.curve = gritCurve;
      sound = sound.connect(shaper);
    }
    if (muffle) {
      const filter = c.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = muffle;
      sound = sound.connect(filter);
    }
    const gain = envelope(c, t, dur, vol, swell ? "swell" : hold ? "hold" : "hit");
    sound.connect(gain);
    out(gain, echo);
    if (wobble2) {
      const lfo = c.createOscillator();
      const depth = c.createGain();
      lfo.frequency.value = wobbleSpeed;
      depth.gain.value = wobble2;
      lfo.connect(depth).connect(osc.frequency);
      lfo.start(t);
      lfo.stop(t + dur);
    }
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }
  function hiss(c) {
    if (!noiseBuffer) {
      noiseBuffer = c.createBuffer(1, c.sampleRate, c.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    const src = c.createBufferSource();
    src.buffer = noiseBuffer;
    src.loop = true;
    return src;
  }
  function noise({ dur, at = 0, vol = 0.4, filter = "bandpass", from = 1e3, to = from, q = 1, hold = false, swell = false, echo = false }) {
    const c = ready();
    if (!c) return;
    const t = c.currentTime + at;
    const src = hiss(c);
    const f = c.createBiquadFilter();
    f.type = filter;
    f.Q.value = q;
    f.frequency.setValueAtTime(from, t);
    f.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + dur);
    const gain = envelope(c, t, dur, vol, swell ? "swell" : hold ? "hold" : "hit");
    src.connect(f).connect(gain);
    out(gain, echo);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.05);
  }
  function timpani(pitch, at = 0, vol = 0.8) {
    tone({ from: pitch, to: pitch * 0.55, dur: 0.9, at, vol, echo: true });
    noise({ filter: "lowpass", from: 700, to: 100, dur: 0.25, at, vol: vol * 0.5 });
  }
  var rumble = null;
  var rumbleLevel = 0;
  function setRumble(level) {
    const c = ctx;
    if (!c || !master || c.state !== "running") return;
    if (muted) level = 0;
    if (Math.abs(level - rumbleLevel) < 0.01 && (level > 0 || rumbleLevel === 0)) return;
    rumbleLevel = level;
    if (!rumble) {
      if (level <= 0) return;
      const volume = c.createGain();
      volume.gain.value = 0;
      volume.connect(master);
      const shaker = c.createGain();
      shaker.gain.value = 0.6;
      shaker.connect(volume);
      const shake = c.createOscillator();
      const depth = c.createGain();
      depth.gain.value = 0.4;
      shake.connect(depth).connect(shaker.gain);
      const low = c.createBiquadFilter();
      low.type = "lowpass";
      low.Q.value = 1.2;
      hiss(c).connect(low).connect(shaker);
      const hum = c.createOscillator();
      hum.type = "triangle";
      const humVolume = c.createGain();
      humVolume.gain.value = 0.5;
      hum.connect(humVolume).connect(shaker);
      const chatter = c.createBiquadFilter();
      chatter.type = "bandpass";
      chatter.frequency.value = 1400;
      chatter.Q.value = 3;
      const rattle = c.createGain();
      rattle.gain.value = 0;
      hiss(c).connect(chatter).connect(rattle).connect(shaker);
      for (const node of [shake, hum]) node.start();
      rumble = { volume, low, hum, shake, rattle };
    }
    const t = c.currentTime;
    rumble.volume.gain.setTargetAtTime(level * 0.6, t, 0.15);
    rumble.low.frequency.setTargetAtTime(90 + level * 400, t, 0.15);
    rumble.hum.frequency.setTargetAtTime(38 + level * 26, t, 0.15);
    rumble.shake.frequency.setTargetAtTime(6 + level * 14, t, 0.15);
    rumble.rattle.gain.setTargetAtTime(Math.max(0, level - 0.6) * 0.6, t, 0.15);
  }
  function pop() {
    tone({ from: 400, to: 1200, dur: 0.07, vol: 0.4 });
    tone({ from: 600, to: 1600, dur: 0.07, at: 0.08, vol: 0.3 });
  }
  function blip(mood) {
    const pitch = mood === "happy" ? 1.3 : mood === "sad" ? 0.75 : mood === "hurt" || mood === "worried" ? 1.1 : 1;
    tone({ type: "square", from: (420 + Math.random() * 200) * pitch, dur: 0.045, vol: 0.05, muffle: 2500 });
  }
  function boing() {
    tone({ from: 150, to: 600, dur: 0.35, vol: 0.4, wobble: 60, wobbleSpeed: 16 });
  }
  function eep(pokes) {
    const up = 1 + pokes * 0.07;
    tone({ type: "square", from: 950 * up, to: 600 * up, dur: 0.09, vol: 0.12, muffle: 3e3 });
    tone({ from: 700 * up, to: 420 * up, dur: 0.13, vol: 0.25 });
  }
  var whistleUp = () => tone({ from: 350, to: 1300, dur: 0.35, vol: 0.25, wobble: 25, wobbleSpeed: 9 });
  var whistleDown = () => tone({ from: 1300, to: 350, dur: 0.4, vol: 0.22, wobble: 25, wobbleSpeed: 9 });
  function thud() {
    tone({ from: 140, to: 50, dur: 0.18, vol: 0.5 });
    noise({ filter: "lowpass", from: 300, to: 80, dur: 0.12, vol: 0.25 });
  }
  function catChime() {
    [523, 659, 784, 1047].forEach((f, i) => tone({ type: "triangle", from: f, dur: 0.35, at: i * 0.09, vol: 0.15 }));
    tone({ from: 500, to: 900, dur: 0.12, at: 0.45, vol: 0.18 });
    tone({ from: 900, to: 650, dur: 0.16, at: 0.57, vol: 0.18 });
  }
  function uhOh() {
    tone({ type: "triangle", from: 620, dur: 0.16, vol: 0.35 });
    tone({ type: "triangle", from: 466, dur: 0.3, at: 0.2, vol: 0.35, wobble: 12, wobbleSpeed: 7 });
  }
  function wobble() {
    tone({ from: 520, dur: 0.9, vol: 0.22, hold: true, wobble: 140, wobbleSpeed: 6 });
    tone({ type: "triangle", from: 780, dur: 0.9, vol: 0.1, hold: true, wobble: 200, wobbleSpeed: 9 });
  }
  var sigh = () => noise({ filter: "lowpass", from: 1400, to: 200, dur: 0.6, vol: 0.15 });
  function whooshes(count) {
    for (let i = 0; i < count; i++) noise({ from: 400, to: 2400, q: 0.8, dur: 0.3, at: i * 0.5, vol: 0.3 });
  }
  function strain() {
    noise({ from: 250, to: 1900, q: 9, dur: 0.68, vol: 0.6, swell: true });
    tone({ type: "sawtooth", from: 55, to: 115, dur: 0.68, vol: 0.35, muffle: 320, swell: true });
    tone({ from: 500, to: 2e3, dur: 0.68, vol: 0.09, swell: true });
    [0.12, 0.3, 0.45, 0.56].forEach((at) => (
      // the fibres starting to pop
      noise({ from: 2500 + Math.random() * 2500, q: 3, dur: 0.03, at, vol: 0.35 })
    ));
  }
  function rip() {
    [130.8, 155.6, 196, 261.6].forEach((f) => (
      // a dark chord, all at once
      tone({ type: "sawtooth", from: f, to: f * 0.97, dur: 1, vol: 0.15, muffle: 2400, echo: true })
    ));
    tone({ from: 95, to: 28, dur: 1.1, vol: 0.9, echo: true });
    let t = 0;
    for (let i = 0; i < 55; i++) {
      noise({ from: 1200 + Math.random() * 4e3, q: 1.5, dur: 0.03 + Math.random() * 0.05, at: t, vol: 0.9 * (1 - i / 75) });
      t += 8e-3 + i * 5e-4 + Math.random() * 0.012;
    }
    noise({ from: 3200, to: 500, q: 0.6, dur: 1.4, vol: 0.5, hold: true, echo: true });
    noise({ filter: "lowpass", from: 300, to: 2600, dur: 1.1, at: 0.2, vol: 0.4, hold: true });
    tone({ from: 60, to: 30, dur: 0.9, at: 0.85, vol: 0.6, echo: true });
  }
  function dunDunDunn() {
    const brass = (f, at, dur, hold = false) => {
      const bend = hold ? 0.94 : 1;
      tone({ type: "sawtooth", from: f, to: f * bend, dur, at, vol: 0.32, hold, muffle: 1600, wobble: hold ? 5 : 0, wobbleSpeed: 5.5, echo: true });
      tone({ type: "sawtooth", from: f / 2, to: f / 2 * bend, dur, at, vol: 0.28, hold, muffle: 900, echo: true });
      tone({ type: "square", from: f * 1.5, to: f * 1.5 * bend, dur, at, vol: 0.07, hold, muffle: 2200 });
    };
    brass(196, 0, 0.24);
    timpani(98, 0);
    brass(196, 0.32, 0.24);
    timpani(98, 0.32);
    brass(155.6, 0.64, 2.2, true);
    timpani(77.8, 0.64, 1);
    noise({ filter: "highpass", from: 5e3, dur: 2.2, at: 0.64, vol: 0.16, echo: true });
  }
  function falling(seconds) {
    tone({ from: 2400, to: 300, dur: seconds, vol: 0.22, echo: true });
    noise({ filter: "lowpass", from: 150, to: 700, dur: seconds, vol: 0.4, swell: true });
  }
  function impact() {
    tone({ from: 70, to: 24, dur: 1.5, vol: 1, echo: true });
    tone({ type: "triangle", from: 150, to: 40, dur: 0.5, vol: 0.6 });
    noise({ filter: "lowpass", from: 1400, to: 60, dur: 0.9, vol: 0.8 });
    noise({ filter: "lowpass", from: 220, to: 50, dur: 2.4, vol: 0.45, echo: true });
    for (let i = 0; i < 10; i++) {
      noise({ from: 2500 + Math.random() * 3e3, q: 4, dur: 0.03, at: 0.15 + Math.random() * 0.9, vol: 0.2 });
    }
  }
  function crashSting() {
    [55, 82.4, 110].forEach((f) => tone({ type: "sawtooth", from: f, to: f * 0.98, dur: 2.2, vol: 0.3, hold: true, muffle: 700, grit: true, echo: true }));
    noise({ filter: "lowpass", from: 400, to: 80, dur: 2, vol: 0.4 });
    const notes = [233, 220, 207.7, 196];
    notes.forEach((f, i) => {
      const last = i === notes.length - 1;
      tone({
        type: "sawtooth",
        from: f,
        to: last ? f * 0.94 : f * 0.98,
        dur: last ? 1.2 : 0.38,
        at: 1.7 + i * 0.42,
        vol: 0.25,
        hold: true,
        muffle: 900,
        wobble: last ? 6 : 0,
        wobbleSpeed: 5
      });
    });
  }
  var beep = () => tone({ type: "square", from: 880, dur: 0.08, vol: 0.07, muffle: 3e3 });
  var goodbye = () => tone({ type: "square", from: 220, to: 110, dur: 0.6, vol: 0.1, muffle: 1500, wobble: 8, wobbleSpeed: 20 });
  function sparkle() {
    [1047, 1319, 1568, 2093].forEach((f, i) => tone({ type: "triangle", from: f, dur: 0.25, at: i * 0.07, vol: 0.13 }));
  }

  // ../groups/g4/src/content.ts
  var clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  var ramp = (v, lo, hi) => clamp((v - lo) / (hi - lo), 0, 1);
  var rand = (a, b) => a + Math.random() * (b - a);
  var lerp = (a, b, t) => a + (b - a) * t;
  var pick = (list) => list[Math.floor(Math.random() * list.length)];
  var BROWSY_CSS = `
:host { all: initial; }

.stage {
  position: fixed; inset: 0; overflow: hidden;
  pointer-events: none;            /* clicks pass straight through to the page */
  user-select: none; -webkit-user-select: none; /* clicking him never selects text */
  z-index: 2147483647;             /* on top of everything */
  font-family: 'Comic Sans MS', 'Comic Neue', 'Chalkboard SE', cursive;
}

/* \u2500\u2500 the frame: a soft glow around the whole tab, in his colour, breathing with him \u2500\u2500
   (drawn once; only its opacity changes every frame \u2014 cheap for the graphics card) */
.frame { position: absolute; inset: 0; --fc: hsl(135 100% 50%); transition: opacity .8s; }
.frame.absent { opacity: 0; }
.frame-glow { position: absolute; inset: 0; opacity: 0; will-change: opacity; }
.frame-glow.thin { box-shadow: inset 0 0 4vmin 0 var(--fc); }
.frame-glow.thick { box-shadow: inset 0 0 16vmin 3vmin var(--fc); } /* fades in when he's stressed: the frame "thickens" */

/* \u2500\u2500 Browsy himself \u2500\u2500 */
.browsy {
  position: absolute; left: 0; top: 0;
  width: var(--size); height: var(--size);
  --c: hsl(135 100% 45%);          /* his colour, updated every frame from JS */
  will-change: transform;
  transform-origin: 50% 25%;       /* the pendulum swing pivots near the top, where you hold him */
  transition: opacity .4s;
}
.browsy.crushed, .browsy.absent { opacity: 0; }
/* the part of him you can touch: only his solid round core, so the page
   around him (and behind his glow and arms) stays clickable */
.grab {
  position: absolute; left: 22%; top: 22%; width: 56%; height: 56%; border-radius: 50%;
  pointer-events: none; cursor: grab; touch-action: none;
}
.browsy.touchable .grab { pointer-events: auto; } /* only when he's here and alive */
.browsy.held .grab { cursor: grabbing; }
.squash { position: absolute; inset: 0; transform-origin: 50% 85%; }
.browsy.booting .squash { animation: boot .9s cubic-bezier(.3, 1.6, .5, 1); }
@keyframes boot { from { transform: scale(.1); } to { transform: scale(1); } }

/* the soft glowing ball: solid in the middle, fading out at the edge */
.glow {
  position: absolute; inset: 0; border-radius: 50%;
  background: radial-gradient(circle closest-side,
    var(--c) 0%, var(--c) 48%,
    color-mix(in srgb, var(--c) 55%, transparent) 66%,
    transparent 100%);
  filter: blur(calc(var(--size) * .02));
}

/* the white line-art face */
.face {
  position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible;
  fill: none; stroke: #fff; stroke-width: 11;
  stroke-linecap: round; stroke-linejoin: round;
}
.part { transition: d .45s ease; }           /* paths smoothly morph between moods */
.eyes { transform-box: fill-box; transform-origin: center; }
.eyes-x, .eyes-dizzy, .eyes-squint, .eyes-happy { display: none; }
[data-mood="dead"] .eyes-open,
[data-mood="hurt"] .eyes-open,
[data-mood="ripping"] .eyes-open,
[data-mood="happy"] .eyes-open,
.browsy[data-dizzy="1"] .eyes-open { display: none; }
[data-mood="dead"] .eyes-x { display: inline; }
[data-mood="hurt"] .eyes-squint, [data-mood="ripping"] .eyes-squint { display: inline; }
[data-mood="happy"] .eyes-happy { display: inline; }
.browsy[data-dizzy="1"] .eyes-squint, .browsy[data-dizzy="1"] .eyes-happy { display: none; }
.browsy[data-dizzy="1"]:not([data-mood="dead"]) .eyes-dizzy { display: inline; }
.spiral { stroke-width: 5; transform-box: fill-box; transform-origin: center; animation: spin .6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* \u2500\u2500 speech \u2500\u2500 */
.bubble {
  position: absolute; bottom: 92%; right: 6%;
  width: max-content; max-width: min(460px, 70vw);
  color: #fff; font-size: calc(var(--size) * .13); line-height: 1.2;
  white-space: pre-line; text-align: left;
  text-shadow: 0 0 2px rgba(0,0,0,.7), 0 0 10px var(--c), 0 0 18px var(--c);
  opacity: 0; transform: translateY(8px);
  transition: opacity .25s, transform .25s;
}
.bubble.show { opacity: 1; transform: none; }

/* \u2500\u2500 the calming cat \u2500\u2500 */
.cat {
  position: absolute; top: 4vh; left: 50%; height: 84vh;
  background: #222; box-shadow: 0 20px 60px rgba(0,0,0,.5);
  opacity: 0; transform: translate(-60%, 20px) scale(.97);
  transition: opacity .5s, transform .5s;
}
.cat.show { opacity: 1; transform: translate(-60%, 0); }
.cat img { display: block; height: 100%; width: auto; max-width: 42vw; object-fit: cover; }
.cat.emoji { width: 50vh; display: grid; place-items: center; font-size: 30vh; }
.cat.emoji img { display: none; }
.cat.emoji::after { content: '\u{1F408}'; }
.cat-arm {
  position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible;
  fill: none; stroke: #fff; stroke-linecap: round;
  opacity: 0; transition: opacity .4s;
}
.cat-arm.show { opacity: 1; }

/* \u2500\u2500 ripping the tab in half: two halves of a screenshot, laid exactly over the page \u2500\u2500 */
.rip-page { position: absolute; inset: 0; pointer-events: auto; background: #0d0d0d; contain: strict; }
/* each half is its own layer that the graphics card just slides and turns (no filters: they're slow on a whole screen) */
.rip-half { position: absolute; inset: 0; will-change: transform; contain: strict; }
.rip-paper { position: absolute; inset: 0; background: #ecebe6 0 0 no-repeat; } /* (blank paper if there's no screenshot) */
/* the torn paper edge: a thin white jagged line along the tear */
.rip-edge { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; fill: none; stroke: #f4f4f0; stroke-width: 3; stroke-linejoin: round; }

/* \u2500\u2500 the tombstone \u2500\u2500 */
.tomb {
  position: absolute; bottom: -2vh; height: 78vh; aspect-ratio: 300 / 520;
  transform: translateY(-130vh);
}
.tomb-art { display: block; width: 100%; height: 100%; overflow: visible; filter: drop-shadow(0 10px 25px rgba(0,0,0,.5)); }
.tomb.dropping { animation: drop .75s forwards; }
.tomb.landed { transform: none; }
.tomb.lifting { animation: lift 1.1s forwards; }
@keyframes drop {
  0%   { transform: translateY(-130vh); animation-timing-function: cubic-bezier(.55, 0, 1, .45); }
  80%  { transform: translateY(0);      animation-timing-function: ease-out; }
  90%  { transform: translateY(-2vh);   animation-timing-function: ease-in; }
  100% { transform: translateY(0); }
}
@keyframes lift {
  0%   { transform: none; }
  15%  { transform: translateY(1vh); animation-timing-function: cubic-bezier(.5, 0, .75, 0); }
  100% { transform: translateY(-130vh); }
}
.carve { fill: none; stroke: rgba(38,38,34,.55); stroke-width: 2.2; stroke-linejoin: round; stroke-linecap: round; }
.carve-light { fill: none; stroke: rgba(255,255,255,.4); stroke-width: 1.6; stroke-linejoin: round; stroke-linecap: round; }

/* the writing: dark charcoal "carved" into the light stone (a thin light edge under each letter) */
.inscription {
  position: absolute; left: 18%; right: 18%; top: 18.5%; bottom: 14%; /* inside the carved border */
  display: flex; flex-direction: column; align-items: center; text-align: center;
  color: #22221f; text-shadow: 0 1px 0 rgba(255,255,255,.45);
}
.rip { font: 700 4.8vh/1 Georgia, 'Times New Roman', serif; letter-spacing: .14em; margin-right: -.14em; }
.name { margin-top: 1vh; font: 1.7vh/1 Georgia, serif; letter-spacing: .45em; margin-right: -.45em; text-transform: uppercase; color: #33332f; }
.divider {
  width: 45%; margin: 2.4vh 0 2.8vh;
  border-top: 2px solid rgba(34,34,31,.5); box-shadow: 0 1px 0 rgba(255,255,255,.45);
}
.epitaph { width: 100%; display: flex; flex-direction: column; gap: 2.3vh; }
.epitaph:has(.stat:nth-child(6)) { gap: 1.4vh; } /* lots of lines \u2192 a bit closer together */
.stat { display: flex; justify-content: space-between; align-items: baseline; gap: 1vh; }
.stat span {
  font: 700 1.4vh/1.2 system-ui, 'Segoe UI', sans-serif; letter-spacing: .12em;
  text-transform: uppercase; text-align: left; white-space: nowrap; color: #2e2e2a;
}
.stat b { font: 700 2.7vh/1.1 Georgia, serif; white-space: nowrap; }
.stat span:empty + b { margin: 0 auto; }
.tomb-note { margin-top: auto; width: 100%; font: italic 1.9vh/1.4 Georgia, serif; color: #2a2a26; white-space: pre-line; }

/* \u2500\u2500 the crash screen: the last thing you see before the browser closes \u2500\u2500 */
.crash {
  position: absolute; inset: 0; display: none;
  pointer-events: auto;            /* blocks the page underneath */
  flex-direction: column; justify-content: center; gap: 2.4vh; padding: 0 12vw;
  background: #0b0b0b; color: #f2f2f2;
  font: 2.4vh/1.5 'Segoe UI', system-ui, sans-serif;
}
.crash.show { display: flex; animation: flicker .35s steps(2) 2; }
@keyframes flicker { 50% { opacity: .2; } }
.crash-browsy {
  position: relative; width: 24vh; height: 24vh; margin-left: -4vh;
  --c: hsl(0 100% 47%);
  animation: glitch 1.6s steps(1) infinite;
}
@keyframes glitch {
  0%, 100% { transform: none; }
  20% { transform: translate(-6px, 2px) skewX(-6deg); }
  23% { transform: none; }
  61% { transform: translate(5px, -3px); }
  63% { transform: none; }
}
.crash-title { font-size: 6vh; font-weight: 600; letter-spacing: .03em; line-height: 1.1; max-width: 60vw; }
.crash-text { color: #cfcfcf; max-width: 60vw; }
.crash-small { font: 1.8vh/1.7 ui-monospace, Consolas, monospace; color: #9a9a9a; }
.crash-count { margin-top: 2vh; font-size: 2.8vh; color: #ff3b3b; }

/* \u2500\u2500 debug meters (toggle in the popup) \u2500\u2500 */
.hud {
  position: absolute; top: 12px; left: 12px; margin: 0; padding: 10px 12px;
  background: rgba(10,10,10,.85); color: #e8e8e8; border-radius: 8px;
  font: 12px/1.45 ui-monospace, Consolas, monospace; white-space: pre;
  display: none;
}
.hud.show { display: block; }
`;
  var senses = {
    mouseSpeed: 0,
    // px per second, smoothed
    scrollSpeed: 0,
    // px per second, smoothed (the bigger of the two below)
    wheelSpeed: 0,
    //   …how fast the mouse wheel / touchpad turns
    pageSpeed: 0,
    //   …how fast the page really moves (scroll bar, keyboard too)
    keyTimes: [],
    // timestamps of recent key presses
    clickTimes: [],
    // recent clicks
    rageUntil: 0,
    // set when rage-clicking is detected
    pointer: { x: innerWidth / 2, y: innerHeight / 2 },
    lastActive: Date.now(),
    // last time you did anything at all
    tabInfo: null,
    // from background.ts
    net: null
    // from background.ts
  };
  var movedPx = 0;
  var wheeledPx = 0;
  var pageMovedPx = 0;
  var scrollTops = /* @__PURE__ */ new WeakMap();
  var lastPointer = null;
  var listen = (type, fn) => addEventListener(type, fn, { capture: true, passive: true });
  listen("pointermove", (e) => {
    if (lastPointer) movedPx += Math.hypot(e.clientX - lastPointer.x, e.clientY - lastPointer.y);
    lastPointer = senses.pointer = { x: e.clientX, y: e.clientY };
    senses.lastActive = Date.now();
  });
  var typed = () => {
    senses.keyTimes.push(Date.now());
    senses.lastActive = Date.now();
  };
  listen("keydown", (e) => {
    senses.lastActive = Date.now();
    unlock();
    if (isTyping(e)) typed();
  });
  listen("message", (e) => {
    if (e.data?.browsy === "key") typed();
  });
  listen("pointerdown", (e) => {
    const now = Date.now();
    senses.lastActive = now;
    unlock();
    if (e.target?.localName === "browsy-host") return;
    senses.clickTimes.push({ t: now, x: e.clientX, y: e.clientY });
    const sameSpot = senses.clickTimes.filter(
      (c) => now - c.t < 1e3 && Math.hypot(c.x - e.clientX, c.y - e.clientY) < 60
    );
    if (sameSpot.length >= CONFIG.rageClicks) senses.rageUntil = now + 2500;
  });
  listen("wheel", (e) => {
    wheeledPx += Math.abs(e.deltaY) * (e.deltaMode === 1 ? 16 : 1);
    senses.lastActive = Date.now();
  });
  listen("scroll", (e) => {
    const box = e.target === document ? document.scrollingElement : e.target;
    if (!(box instanceof Element)) return;
    const before = scrollTops.get(box);
    scrollTops.set(box, box.scrollTop);
    if (before == null) return;
    const moved = Math.abs(box.scrollTop - before);
    if (moved > innerHeight * 2) return;
    pageMovedPx += moved;
    senses.lastActive = Date.now();
  });
  if (document.scrollingElement) scrollTops.set(document.scrollingElement, document.scrollingElement.scrollTop);
  function networkCongestion(settings) {
    if (settings.badNet) return 1;
    const net = senses.net;
    if (!net) return 0;
    if (net.rtt == null) return 1;
    const slowPing = ramp(net.rtt, 100, 600);
    if (net.downlink == null) return slowPing;
    const lowSpeed = 1 - ramp(net.downlink, 1, 10);
    return slowPing * (0.5 + 0.5 * lowSpeed);
  }
  function readSenses(dt, settings) {
    const now = Date.now();
    const k = 1 - Math.exp(-dt / 0.3);
    senses.mouseSpeed += (movedPx / dt - senses.mouseSpeed) * k;
    senses.wheelSpeed += (wheeledPx / dt - senses.wheelSpeed) * k;
    senses.pageSpeed += (pageMovedPx / dt - senses.pageSpeed) * k;
    senses.scrollSpeed = Math.max(senses.wheelSpeed, senses.pageSpeed);
    movedPx = wheeledPx = pageMovedPx = 0;
    senses.keyTimes = senses.keyTimes.filter((t) => now - t < 2e3);
    senses.clickTimes = senses.clickTimes.filter((c) => now - c.t < 3e3);
    const keysPerSec = senses.keyTimes.length / 2;
    const tabs = senses.tabInfo?.count ?? 1;
    const switches = (senses.tabInfo?.switches ?? []).filter((t) => now - t < CONFIG.switchMemory).length;
    const clicks = senses.clickTimes.length;
    const d = settings.demo ? CONFIG.demoSensitivity : 1;
    const pressure = {
      mouse: ramp(senses.mouseSpeed, CONFIG.mouseCalm / d, CONFIG.mouseMax / d),
      typing: ramp(keysPerSec, CONFIG.typingCalm / d, CONFIG.typingMax / d),
      clicks: now < senses.rageUntil ? 1 : ramp(clicks, CONFIG.clicksCalm / d, CONFIG.clicksMax / d),
      scroll: ramp(senses.scrollSpeed, CONFIG.scrollCalm / d, CONFIG.scrollMax / d),
      switching: ramp(switches, CONFIG.switchesCalm, CONFIG.switchesMax),
      tabs: ramp(tabs, CONFIG.tabsCalm, CONFIG.tabsMax),
      network: networkCongestion(settings)
    };
    const stats = {
      mouseSpeed: senses.mouseSpeed,
      scrollSpeed: senses.scrollSpeed,
      keysPerSec,
      wpm: keysPerSec * 12,
      // 1 word ≈ 5 keys → keys/s × 60 / 5
      clicks,
      tabs,
      switches,
      rtt: senses.net?.rtt ?? null,
      downlink: senses.net?.downlink ?? null
    };
    return { pressure, stats, stillFor: now - senses.lastActive };
  }
  var PARTS = ["mouth", "armL", "armR", "legL", "legR"];
  var SHAPES = {
    happy: {
      // ^ ^  big smile, little cheer (when you boop him)
      mouth: "M -20 16 C -12 42, 12 42, 20 16",
      armL: "M -85 12 Q -140 -10 -158 -40",
      armR: "M 90 10 Q 145 -10 158 -45",
      legL: "M -40 75 Q -70 75 -68 108 Q -66 135 -90 140",
      legR: "M 25 75 Q 55 75 55 105 Q 55 132 80 138"
    },
    ripping: {
      // tearing the tab apart: arms out wide, legs braced, eyes squeezed > <
      mouth: "M -18 34 C -10 16, 10 16, 18 34",
      armL: "M -85 10 Q -150 -5 -195 -20",
      armR: "M 85 10 Q 150 -5 195 -20",
      legL: "M -40 75 Q -75 85 -85 115 Q -95 140 -115 145",
      legR: "M 25 75 Q 60 85 70 115 Q 80 140 100 145"
    },
    held: {
      // picked up: arms up, legs dangling straight down, wide eyes
      mouth: "M -16 30 C -6 20, 6 38, 16 26",
      armL: "M -85 10 Q -125 -40 -110 -95",
      armR: "M 85 10 Q 125 -40 110 -95",
      legL: "M -40 75 Q -45 100 -42 125 Q -40 150 -44 172",
      legR: "M 25 75 Q 30 100 27 125 Q 25 150 29 172"
    },
    calm: {
      mouth: "M -16 18 C -12 34, 12 34, 16 18",
      armL: "M -85 18 Q -140 0 -165 45",
      armR: "M 90 15 Q 150 30 155 75",
      legL: "M -40 75 Q -70 75 -68 108 Q -66 135 -90 140",
      legR: "M 25 75 Q 55 75 55 105 Q 55 132 80 138"
    },
    uneasy: {
      mouth: "M -16 28 C -6 20, 6 36, 16 26",
      armL: "M -85 12 Q -140 -10 -160 20",
      armR: "M 88 12 Q 150 10 160 40",
      legL: "M -40 75 Q -66 80 -62 108 Q -60 135 -82 142",
      legR: "M 25 75 Q 52 80 50 108 Q 50 134 72 142"
    },
    stressed: {
      mouth: "M -18 34 C -10 16, 10 16, 18 34",
      armL: "M -85 5 Q -150 -20 -150 -85",
      armR: "M 85 5 Q 150 -20 150 -85",
      legL: "M -40 75 Q -60 85 -55 110 Q -50 130 -70 145",
      legR: "M 25 75 Q 45 85 40 110 Q 35 130 55 145"
    },
    // Faces for single comments (say(text, { face: 'sad' })), whatever his stress is
    sad: {
      // :(
      mouth: "M -16 34 C -10 22, 10 22, 16 34",
      armL: "M -85 22 Q -120 40 -128 88",
      armR: "M 85 22 Q 120 40 128 88",
      legL: "M -40 75 Q -70 75 -68 108 Q -66 135 -90 140",
      legR: "M 25 75 Q 55 75 55 105 Q 55 132 80 138"
    },
    meh: {
      // :|
      mouth: "M -14 28 C -5 28, 5 28, 14 28",
      armL: "M -85 18 Q -132 18 -148 58",
      armR: "M 88 18 Q 140 32 144 72",
      legL: "M -40 75 Q -70 75 -68 108 Q -66 135 -90 140",
      legR: "M 25 75 Q 55 75 55 105 Q 55 132 80 138"
    },
    worried: {
      // wide eyes, wobbly mouth, arms half up
      mouth: "M -16 30 C -6 20, 6 38, 16 26",
      armL: "M -85 10 Q -140 -15 -150 -60",
      armR: "M 85 10 Q 140 -15 150 -60",
      legL: "M -40 75 Q -60 85 -55 110 Q -50 130 -70 145",
      legR: "M 25 75 Q 45 85 40 110 Q 35 130 55 145"
    },
    hurt: {
      // > <  eyes squeezed shut, grimace, arms up shielding his head
      mouth: "M -18 32 C -8 18, 8 44, 18 28",
      armL: "M -85 5 Q -132 -10 -112 -58",
      armR: "M 85 5 Q 132 -10 112 -58",
      legL: "M -40 75 Q -60 85 -55 110 Q -50 130 -70 145",
      legR: "M 25 75 Q 45 85 40 110 Q 35 130 55 145"
    },
    chill: {
      // holding up the cat picture (frame 2) — the long left arm is drawn separately
      mouth: "M -14 30 C -5 30, 5 30, 14 30",
      armL: "M -85 30 Q -85 30 -85 30",
      armR: "M 85 20 Q 140 35 140 70",
      legL: "M -40 75 Q -70 75 -68 108 Q -66 135 -90 140",
      legR: "M 25 75 Q 55 75 55 105 Q 55 132 80 138"
    },
    dead: {
      // frame 3
      mouth: "M -40 52 C -15 44, 15 30, 40 22",
      armL: "M -80 30 Q -135 30 -140 90",
      armR: "M 80 40 Q 160 50 160 -20",
      legL: "M -40 75 Q -20 70 -40 95 Q -65 120 -78 115",
      legR: "M 20 80 Q 50 75 40 105 Q 30 130 50 145"
    }
  };
  var EYE_SIZE = { sad: [1, 0.6], worried: [1.15, 1.45], held: [1.15, 1.45] };
  var SPIRAL = "M 0 0 a 5 5 0 1 1 10 0 a 10 10 0 1 1 -20 0 a 15 15 0 1 1 30 0 a 20 20 0 1 1 -40 0";
  var SVG_NS = "http://www.w3.org/2000/svg";
  function dress(node, attrs, children) {
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
    node.append(...children);
    return node;
  }
  var h = (tag, attrs = {}, children = []) => dress(document.createElement(tag), attrs, children);
  var s = (tag, attrs = {}, children = []) => dress(document.createElementNS(SVG_NS, tag), attrs, children);
  var shape = (path, d) => path.style.setProperty("d", `path("${d}")`);
  function buildFace() {
    const part = (name) => s("path", { class: `part ${name}` });
    return s("svg", { class: "face", viewBox: "-200 -200 400 400" }, [
      part("armL"),
      part("armR"),
      part("legL"),
      part("legR"),
      s("g", { class: "eyes" }, [
        s("g", { class: "eyes-open" }, [
          s("ellipse", { cx: -45, cy: -20, rx: 13, ry: 9 }),
          s("ellipse", { cx: 45, cy: -20, rx: 13, ry: 9 })
        ]),
        s("path", { class: "eyes-x", d: "M -58 -33 L -32 -7 M -58 -7 L -32 -33 M 32 -33 L 58 -7 M 32 -7 L 58 -33" }),
        s("path", { class: "eyes-squint", d: "M -58 -32 L -34 -20 L -58 -8 M 58 -32 L 34 -20 L 58 -8" }),
        s("path", { class: "eyes-happy", d: "M -58 -14 Q -45 -36 -32 -14 M 32 -14 Q 45 -36 58 -14" }),
        // ^ ^
        s("g", { class: "eyes-dizzy" }, [-45, 45].map((x) => s("g", { transform: `translate(${x} -20)` }, [s("path", { class: "spiral", d: SPIRAL })])))
      ]),
      part("mouth")
    ]);
  }
  function buildTomb() {
    const stone = "M 30 470 L 30 150 Q 30 118 58 108 Q 72 38 150 30 Q 228 38 242 108 Q 270 118 270 150 L 270 470 Z";
    const border = "M 48 462 L 48 158 Q 48 134 72 125 Q 86 60 150 52 Q 214 60 228 125 Q 252 134 252 158 L 252 462";
    const mossBack = "M 0 512 Q 14 478 40 488 Q 58 466 86 484 Q 112 470 140 486 Q 168 468 194 486 Q 222 466 250 484 Q 278 472 300 500 L 300 520 L 0 520 Z";
    const mossFront = "M 0 520 Q 20 494 52 504 Q 80 490 110 504 Q 140 492 170 506 Q 204 492 236 504 Q 268 494 300 512 L 300 520 Z";
    const carve = (d) => [
      s("path", { class: "carve-light", d, transform: "translate(1.4 1.4)" }),
      s("path", { class: "carve", d })
    ];
    return h("div", { class: "tomb" }, [
      s("svg", { class: "tomb-art", viewBox: "0 0 300 520" }, [
        s("defs", {}, [
          // light comes from the top left
          s("linearGradient", { id: "browsy-stone", x1: 0, y1: 0, x2: 0.6, y2: 1 }, [
            s("stop", { offset: 0, "stop-color": "#d6d5cd" }),
            s("stop", { offset: 1, "stop-color": "#94938b" })
          ]),
          s("linearGradient", { id: "browsy-base", x1: 0, y1: 0, x2: 0, y2: 1 }, [
            s("stop", { offset: 0, "stop-color": "#aeada5" }),
            s("stop", { offset: 1, "stop-color": "#6c6b64" })
          ]),
          // grainy stone texture made from random noise
          s("filter", { id: "browsy-grain" }, [
            s("feTurbulence", { type: "fractalNoise", baseFrequency: 0.9, numOctaves: 2, result: "noise" }),
            s("feColorMatrix", {
              in: "noise",
              type: "matrix",
              result: "grey",
              values: "0.3 0 0 0 0.7  0.3 0 0 0 0.7  0.3 0 0 0 0.7  0 0 0 0 1"
            }),
            s("feBlend", { in: "SourceGraphic", in2: "grey", mode: "multiply", result: "mix" }),
            s("feComposite", { in: "mix", in2: "SourceGraphic", operator: "in" })
          ])
        ]),
        s("path", { d: stone, fill: "#5b5a54", transform: "translate(9 0)" }),
        // the stone's thickness, seen on the right
        s("path", { d: stone, fill: "url(#browsy-stone)", filter: "url(#browsy-grain)" }),
        ...carve(border),
        // cracks stay near the edges, so they never run through the writing
        ...carve("M 62 112 L 74 138 L 66 166 L 78 190"),
        ...carve("M 268 236 L 258 266 L 264 292 L 256 330"),
        ...carve("M 34 384 L 50 402 L 44 434"),
        s("rect", { x: 6, y: 460, width: 288, height: 44, rx: 5, fill: "url(#browsy-base)", filter: "url(#browsy-grain)" }),
        s("rect", { x: 6, y: 460, width: 288, height: 3, rx: 1.5, fill: "rgba(255,255,255,.35)" }),
        // lit top edge of the base
        s("path", { d: mossBack, fill: "#3f5a1f" }),
        s("path", { d: mossFront, fill: "#6b8c32" })
      ]),
      h("div", { class: "inscription" }, [
        h("div", { class: "rip" }, ["RIP"]),
        h("div", { class: "name" }, ["Browsy"]),
        h("div", { class: "divider" }),
        h("div", { class: "epitaph" }),
        // your stats, filled in when he dies
        h("div", { class: "tomb-note" })
        // "There will be consequences – Browsy" before the crash
      ])
    ]);
  }
  function buildCrashScreen() {
    const deadFace = buildFace();
    for (const name of PARTS) shape(deadFace.querySelector(`.${name}`), SHAPES.dead[name]);
    return h("div", { class: "crash" }, [
      h("div", { class: "crash-browsy", "data-mood": "dead" }, [h("div", { class: "glow" }), deadFace]),
      h("div", { class: "crash-title" }, ["ERROR 2442"]),
      h("div", { class: "crash-text" }, ["Browsy got overwhelmed."]),
      h("div", { class: "crash-small" }, [
        "STOP CODE: TOO_MUCH_EVERYTHING",
        h("br"),
        h("span", { class: "crash-stats" })
      ]),
      h("div", { class: "crash-count" })
    ]);
  }
  var Body = (() => {
    const size = CONFIG.size;
    const unit = size / 400;
    const host = document.createElement("browsy-host");
    const root = host.attachShadow({ mode: "open" });
    try {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(BROWSY_CSS);
      root.adoptedStyleSheets = [sheet];
    } catch {
      root.append(h("style", {}, [BROWSY_CSS]));
    }
    const face = buildFace();
    const glow = h("div", { class: "glow" });
    const squash = h("div", { class: "squash" }, [glow, face]);
    const bubble = h("div", { class: "bubble" });
    const grab = h("div", { class: "grab" });
    const browsy = h("div", { class: "browsy absent" }, [squash, bubble, grab]);
    const catImg = h("img", { alt: "a calming cat" });
    const catCard = h("div", { class: "cat" }, [catImg]);
    const catArmPath = s("path");
    const catArm = s("svg", { class: "cat-arm" }, [catArmPath]);
    const tomb = buildTomb();
    const hud = h("pre", { class: "hud" });
    const crash = buildCrashScreen();
    const frameThin = h("div", { class: "frame-glow thin" });
    const frameThick = h("div", { class: "frame-glow thick" });
    const frame = h("div", { class: "frame absent" }, [frameThin, frameThick]);
    const stage = h("div", { class: "stage" }, [frame, catCard, browsy, catArm, tomb, hud, crash]);
    stage.style.setProperty("--size", `${size}px`);
    root.append(stage);
    document.documentElement.append(host);
    const parts = {};
    for (const name of PARTS) parts[name] = face.querySelector(`.${name}`);
    const eyes = face.querySelector(".eyes");
    const epitaph2 = tomb.querySelector(".epitaph");
    const tombNote2 = tomb.querySelector(".tomb-note");
    const crashStats = crash.querySelector(".crash-stats");
    const crashCount = crash.querySelector(".crash-count");
    const m = {
      x: innerWidth - size * 0.8,
      y: innerHeight - size * 0.55,
      from: { x: 0, y: 0 },
      to: null,
      // where he's hopping/walking to (null = standing still)
      moveStart: 0,
      moveDur: 1,
      hop: 0,
      nextMove: performance.now() + 1500,
      landAt: -1e9,
      breath: 0,
      hue: 135,
      eye: { x: 0, y: 0 },
      dart: { x: 0, y: 0 },
      nextDart: 0,
      blinkUntil: 0,
      nextBlink: performance.now() + 2e3,
      mood: null,
      catShown: false,
      crowd: 0,
      // being touched
      hold: null,
      // carried: follows the mouse
      falling: false,
      vy: 0,
      // dropped: falls down with gravity (px/s)
      swing: 0,
      swingSpeed: 0,
      // hanging from your mouse he swings like a pendulum (degrees)
      boopAt: -1e9,
      // when you last booped him (little bounce)
      rip: null,
      // ripping the tab: where he stands (in the middle of the tear)
      dash: null,
      // dying: he goes to the middle of the screen, under the tombstone
      flash: 0,
      // a quick flare of the frame (pokes, death…), fades by itself
      frameHue: -1
      // the frame's colour right now (only redrawn when it really changes)
    };
    function zone(crowd) {
      const right = innerWidth - size * 0.45;
      const width = Math.max(size * 0.3, innerWidth * 0.28 * (1 - 0.7 * crowd));
      return { minX: right - width, maxX: right, minY: innerHeight * 0.42, maxY: innerHeight - size * 0.38 };
    }
    function planMove(now, stress, crowd) {
      const z = zone(crowd);
      const hop = Math.random() < 0.35 + stress * 0.6;
      m.from = { x: m.x, y: m.y };
      m.to = { x: rand(z.minX, z.maxX), y: rand(z.minY, z.maxY) };
      m.hop = hop ? rand(40, 110) * unit * 2 : 0;
      m.moveDur = hop ? rand(500, 800) - stress * 250 : rand(1800, 3200) - stress * 1200;
      m.moveStart = now;
      m.nextMove = now + m.moveDur + rand(2500, 7e3) * (1 - stress * 0.85);
    }
    let touchHandler = () => {
    };
    let press = null;
    grab.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      grab.setPointerCapture(e.pointerId);
      press = { x: e.clientX, y: e.clientY };
    });
    grab.addEventListener("mousedown", (e) => e.preventDefault());
    grab.addEventListener("pointermove", (e) => {
      if (m.hold) m.hold.pointer = { x: e.clientX, y: e.clientY };
      else if (press && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 6) pickUp(press);
    });
    grab.addEventListener("pointerup", () => {
      if (m.hold) drop();
      else if (press) boop();
      press = null;
    });
    grab.addEventListener("pointercancel", () => {
      if (m.hold) drop();
      press = null;
    });
    function boop() {
      m.boopAt = performance.now();
      m.blinkUntil = m.boopAt + 120;
      touchHandler({ kind: "boop" });
    }
    function pickUp(at) {
      m.hold = { pointer: at, offset: { x: m.x - at.x, y: m.y - at.y } };
      m.to = null;
      m.falling = false;
      browsy.classList.add("held");
      whistleUp();
      touchHandler({ kind: "pickup" });
    }
    function drop() {
      const z = zone(m.crowd);
      m.hold = null;
      press = null;
      m.falling = true;
      m.vy = 0;
      browsy.classList.remove("held");
      if (m.y < z.maxY - 40) whistleDown();
      touchHandler({ kind: "drop", outside: m.x < z.minX || m.x > z.maxX });
    }
    function setMood(mood) {
      if (mood === m.mood) return;
      m.mood = mood;
      browsy.dataset.mood = mood;
      for (const name of PARTS) shape(parts[name], SHAPES[mood][name]);
    }
    function toScreen(px, py, sx, sy, rotDeg, left, top) {
      const oy = 140;
      const a = rotDeg * Math.PI / 180;
      const x = px * sx;
      const y = (py - oy) * sy;
      return {
        x: left + size / 2 + (x * Math.cos(a) - y * Math.sin(a)) * unit,
        y: top + size / 2 + (x * Math.sin(a) + y * Math.cos(a) + oy) * unit
      };
    }
    function update(dt, now, { stress, mood, dizzy, crowd, pointer, touchable }) {
      m.crowd = crowd;
      browsy.classList.toggle("touchable", touchable);
      if (m.hold && !touchable) drop();
      const showCommentFace = commentFaceName && commentFaceUntil > Date.now() && mood !== "dead" && mood !== "chill";
      setMood(m.rip ? "ripping" : m.hold ? "held" : showCommentFace ? commentFaceName : mood);
      browsy.dataset.dizzy = dizzy ? "1" : "";
      const alive = mood !== "dead";
      const frozen = mood === "dead" || mood === "chill";
      const z = zone(crowd);
      let lean = 0;
      if (m.hold) {
        const before = m.x;
        const k = 1 - Math.exp(-dt * 18);
        m.x += (m.hold.pointer.x + m.hold.offset.x - m.x) * k;
        m.y += (m.hold.pointer.y + m.hold.offset.y - m.y) * k;
        lean = clamp((m.x - before) / dt / 40, -35, 35);
      } else if (m.rip) {
        const k = 1 - Math.exp(-dt * 10);
        m.x += (m.rip.x - m.x) * k;
        m.y += (m.rip.y - m.y) * k;
      } else if (m.dash) {
        const k = 1 - Math.exp(-dt * 5);
        m.x += (m.dash.x - m.x) * k;
        m.y += (m.dash.y - m.y) * k;
      } else if (m.falling) {
        m.vy += 2600 * dt;
        m.y += m.vy * dt;
        if (m.y >= z.maxY) {
          m.y = z.maxY;
          m.falling = false;
          if (m.vy > 400) thud();
          m.landAt = now;
          m.nextMove = now + rand(600, 1500);
        }
      } else {
        if (!frozen && !m.to && now > m.nextMove) planMove(now, stress, crowd);
        if (m.to) {
          const t = Math.min(1, (now - m.moveStart) / m.moveDur);
          const ease = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
          m.x = lerp(m.from.x, m.to.x, ease);
          m.y = lerp(m.from.y, m.to.y, ease) - m.hop * Math.sin(Math.PI * t);
          if (t >= 1) {
            if (m.hop) m.landAt = now;
            m.to = null;
          }
        }
        if (frozen && !m.to) {
          m.x = clamp(m.x, z.minX, z.maxX);
          m.y = clamp(m.y, z.minY, z.maxY);
        }
      }
      m.swingSpeed += ((lean - m.swing) * 60 - m.swingSpeed * 4) * dt;
      m.swing += m.swingSpeed * dt;
      m.breath += dt * (0.22 + stress * 1.2) * Math.PI * 2;
      const amp = alive ? 0.04 - stress * 0.025 : 0;
      let sx = 1 + Math.sin(m.breath) * amp;
      let sy = 1 + Math.sin(m.breath) * amp * 1.3;
      const sinceLand = now - m.landAt;
      if (sinceLand < 250) {
        const q = Math.sin(sinceLand / 250 * Math.PI) * 0.18;
        sx += q;
        sy -= q;
      }
      if (m.to && m.hop || m.falling) {
        sx -= 0.04;
        sy += 0.06;
      }
      if (m.hold) {
        sx -= 0.06;
        sy += 0.1;
      }
      sx *= 1 - 0.15 * crowd;
      const tremble = mood === "dead" ? 4 : mood === "chill" ? 0 : Math.max(0, stress - 0.6) * 12;
      const jx = rand(-tremble, tremble);
      const jy = rand(-tremble, tremble);
      const rot = dizzy ? Math.sin(now / 140) * 14 : 0;
      const bob = alive && !m.hold && !m.falling && !m.rip ? Math.sin(now / 900) * 5 : 0;
      const sinceBoop = now - m.boopAt;
      const boing2 = sinceBoop < 320 ? Math.sin(sinceBoop / 320 * Math.PI) * 22 * unit * 1.7 : 0;
      const left = m.x - size / 2 + jx;
      const top = m.y - size / 2 + bob + jy - boing2;
      browsy.style.transform = `translate3d(${left}px, ${top}px, 0) rotate(${m.swing}deg)`;
      squash.style.transform = `rotate(${rot}deg) scale(${sx}, ${sy})`;
      if (alive) {
        const dx = pointer.x - m.x;
        const dy = pointer.y - m.y;
        const dist = Math.hypot(dx, dy) || 1;
        const reach = Math.min(1, dist / 400);
        let tx = dx / dist * reach * 8 + Math.sin(now / 1700) * 3;
        let ty = dy / dist * reach * 6 + Math.sin(now / 2300) * 2;
        const darting = stress > 0.55;
        if (darting && now > m.nextDart) {
          m.dart = { x: rand(-12, 12), y: rand(-8, 8) };
          m.nextDart = now + rand(150, 600) / stress;
        }
        if (darting) {
          tx += m.dart.x;
          ty += m.dart.y;
        }
        const ek = 1 - Math.exp(-dt * (darting ? 25 : 6));
        m.eye.x += (tx - m.eye.x) * ek;
        m.eye.y += (ty - m.eye.y) * ek;
        if (now > m.nextBlink) {
          m.blinkUntil = now + 130;
          m.nextBlink = now + rand(1500, 6e3) * (1 - stress * 0.6);
          if (Math.random() < 0.2) m.nextBlink = now + 280;
        }
      }
      const [eyeW, eyeH] = (m.mood && EYE_SIZE[m.mood]) ?? [1, 1];
      const blink = alive && now < m.blinkUntil ? 0.1 : eyeH;
      eyes.style.transform = `translate(${m.eye.x}px, ${m.eye.y}px) scale(${eyeW}, ${blink})`;
      const targetHue = mood === "dead" ? 0 : mood === "chill" ? 205 : 135 * (1 - stress);
      m.hue += (targetHue - m.hue) * (1 - Math.exp(-dt * 3));
      browsy.style.setProperty("--c", `hsl(${m.hue} 100% 47%)`);
      const breath = 0.5 + 0.5 * Math.sin(m.breath);
      const calming = mood === "chill";
      const dead = mood === "dead";
      const shown = dead ? 1 : calming ? 0 : clamp((stress - 0.5) / 0.5, 0, 1);
      let thin = (dead ? 0.6 : shown * 0.7) * (0.7 + 0.3 * breath);
      let thick = (dead ? 0.3 : calming ? 0 : clamp((stress - 0.65) / 0.35, 0, 1)) * (0.55 + 0.45 * breath);
      if (alive && !calming && stress > 0.8) thin *= 0.8 + Math.random() * 0.4;
      m.flash *= Math.exp(-dt * 5);
      frameThin.style.opacity = String(Math.min(1, thin + m.flash));
      frameThick.style.opacity = String(Math.min(1, thick + m.flash * 0.8));
      const frameHue = Math.round(Math.min(m.hue, 50) / 4) * 4;
      if (frameHue !== m.frameHue) {
        m.frameHue = frameHue;
        frame.style.setProperty("--fc", `hsl(${frameHue} 100% 50%)`);
      }
      const catReady = m.catShown && catImg.complete && catImg.naturalWidth > 0;
      catArm.classList.toggle("show", catReady);
      if (catReady) {
        const { x: x0, y: y0 } = toScreen(-85, 30, sx, sy, rot, left, top);
        const r = catImg.getBoundingClientRect();
        const x1 = r.right - 8;
        const y1 = clamp(y0, r.top + r.height * 0.3, r.bottom - r.height * 0.1);
        catArmPath.setAttribute("d", `M ${x0} ${y0} Q ${(x0 + x1) / 2} ${Math.max(y0, y1) + 40} ${x1} ${y1}`);
        catArmPath.style.strokeWidth = `${11 * unit}px`;
      }
    }
    let typer = 0;
    let hideTimer = 0;
    let speakingUntil = 0;
    let speakingPriority = 0;
    let commentFaceName = null;
    let commentFaceUntil = 0;
    function say2(text, { priority = 1, ms = 3500, face: face2 = null } = {}) {
      text = text.toLowerCase();
      const now = Date.now();
      if (now < speakingUntil && priority < speakingPriority) return false;
      clearInterval(typer);
      clearTimeout(hideTimer);
      const letterMs = 30;
      speakingPriority = priority;
      speakingUntil = now + ms + text.length * letterMs;
      commentFaceName = face2;
      commentFaceUntil = face2 ? speakingUntil : 0;
      bubble.textContent = "";
      bubble.classList.add("show");
      let i = 0;
      typer = setInterval(() => {
        bubble.textContent = text.slice(0, ++i);
        if (i % 3 === 1 && text[i - 1].trim()) blip(face2);
        if (i >= text.length) clearInterval(typer);
      }, letterMs);
      hideTimer = setTimeout(hush, ms + text.length * letterMs);
      return true;
    }
    function hush() {
      clearInterval(typer);
      bubble.classList.remove("show");
      speakingUntil = 0;
      commentFaceUntil = 0;
    }
    let catRequest = 0;
    const loadPhoto = (img, src) => {
      img.src = src;
      return img.decode().then(() => true, () => false);
    };
    async function showCat2(src, fallbackSrc) {
      const request = ++catRequest;
      const photo = new Image();
      const found = await loadPhoto(photo, src) || await loadPhoto(photo, fallbackSrc);
      if (found) await loadPhoto(catImg, photo.src);
      if (request !== catRequest) return;
      catCard.classList.toggle("emoji", !found);
      catCard.classList.add("show");
      m.catShown = true;
    }
    function hideCat() {
      catRequest++;
      catCard.classList.remove("show");
      m.catShown = false;
    }
    async function withoutMe(fn) {
      const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));
      stage.style.visibility = "hidden";
      await nextFrame();
      await nextFrame();
      try {
        return await fn();
      } finally {
        stage.style.visibility = "";
      }
    }
    async function ripPage(shot) {
      if (shot) {
        const img = new Image();
        img.src = shot;
        await img.decode().catch(() => {
        });
      }
      const tear = [];
      for (let i = 0; i <= 22; i++) tear.push({ x: 50 + rand(-1.8, 1.8), y: i / 22 * 100 });
      const tearPath = tear.map((p) => `${p.x.toFixed(2)}% ${p.y.toFixed(2)}%`);
      const half = (outline, origin) => {
        const paper = h("div", { class: "rip-paper" });
        paper.style.clipPath = `polygon(${outline.join(", ")})`;
        if (shot) paper.style.backgroundImage = `url("${shot}")`;
        paper.style.backgroundSize = `${innerWidth}px ${innerHeight}px`;
        const edge = s("svg", { class: "rip-edge", viewBox: "0 0 100 100", preserveAspectRatio: "none" }, [
          s("polyline", { points: tear.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" "), "vector-effect": "non-scaling-stroke" })
        ]);
        const el = h("div", { class: "rip-half" }, [paper, edge]);
        el.style.transformOrigin = origin;
        return el;
      };
      const left = half(["0% 0%", ...tearPath, "0% 100%"], "25% 60%");
      const right = half(["100% 0%", ...tearPath, "100% 100%"], "75% 60%");
      const page = h("div", { class: "rip-page" }, [left, right]);
      stage.insertBefore(page, browsy);
      m.rip = { x: innerWidth / 2, y: innerHeight * 0.62 };
      m.to = null;
      const html = document.documentElement;
      const pageVisibility = html.style.visibility;
      html.style.visibility = "hidden";
      host.style.visibility = "visible";
      try {
        const tug = (dir) => [
          { transform: "none" },
          { transform: `translateX(${dir * 5}px) rotate(${dir * 0.4}deg)` },
          { transform: `translateX(${dir * 2}px)` },
          { transform: `translateX(${dir * 10}px) rotate(${dir * 0.9}deg)` }
        ];
        strain();
        await Promise.all([left, right].map((el, i) => el.animate(tug(i ? 1 : -1), { duration: 650, easing: "ease-in", fill: "forwards" }).finished));
        rip();
        const fly = (dir) => [
          { transform: `translateX(${dir * 10}px) rotate(${dir * 0.9}deg)` },
          { transform: `translate(${dir * 65}vw, 40vh) rotate(${dir * 24}deg)` }
        ];
        await Promise.all([left, right].map((el, i) => el.animate(fly(i ? 1 : -1), { duration: 1100, easing: "cubic-bezier(.45, 0, .8, .4)", fill: "forwards" }).finished));
      } finally {
        html.style.visibility = pageVisibility;
        host.style.visibility = "";
      }
    }
    function dashToMiddle() {
      m.dash = { x: innerWidth / 2, y: innerHeight - size * 0.55 };
      m.to = null;
      m.falling = false;
    }
    function placeTomb(lines, note) {
      const tombW = innerHeight * 0.78 * (300 / 520);
      tomb.style.left = `${(innerWidth - tombW) / 2}px`;
      epitaph2.replaceChildren(...(lines ?? "").split("\n").filter(Boolean).map((line) => {
        const colon = line.indexOf(": ");
        const label = colon < 0 ? "" : line.slice(0, colon);
        return h("div", { class: "stat" }, [h("span", {}, [label]), h("b", {}, [line.slice(colon + 2)])]);
      }));
      tombNote2.textContent = note;
    }
    function dropTomb(lines, note, onLand) {
      placeTomb(lines, note);
      tomb.className = "tomb dropping";
      falling(0.6);
      setTimeout(() => {
        impact();
        m.flash = 1;
        browsy.classList.add("crushed");
        document.documentElement.animate(
          [
            { transform: "none" },
            { transform: "translate(-10px, 7px)" },
            { transform: "translate(8px, -5px)" },
            { transform: "translate(-4px, 3px)" },
            { transform: "none" }
          ],
          { duration: 380 }
        );
        onLand?.();
      }, 600);
    }
    function showTombLanded(lines, note) {
      dashToMiddle();
      placeTomb(lines, note);
      tomb.className = "tomb landed";
      browsy.classList.add("crushed");
    }
    function liftTomb(onDone) {
      m.dash = null;
      tomb.className = "tomb lifting";
      browsy.classList.remove("crushed");
      browsy.classList.add("booting");
      setTimeout(() => {
        tomb.className = "tomb";
        browsy.classList.remove("booting");
        onDone?.();
      }, 1100);
    }
    function removeTomb() {
      m.dash = null;
      tomb.className = "tomb";
      browsy.classList.remove("crushed");
    }
    function setPresent(present) {
      browsy.classList.toggle("absent", !present);
      frame.classList.toggle("absent", !present);
      if (!present) return hush();
      browsy.classList.add("booting");
      setTimeout(() => browsy.classList.remove("booting"), 900);
    }
    function showCrashScreen(lines, seconds) {
      if (crash.classList.contains("show")) return;
      crashStats.textContent = (lines ?? "").replaceAll("\n", " \xB7 ");
      crash.classList.add("show");
      crashSting();
      let left = seconds;
      const tickDown = () => {
        crashCount.textContent = left > 0 ? `closing your browser in ${left}\u2026` : "goodbye.";
        if (left > 0 && left <= 3) beep();
        if (left === 0) goodbye();
        left--;
      };
      tickDown();
      setInterval(tickDown, 1e3);
    }
    return {
      update,
      say: say2,
      hush,
      showCat: showCat2,
      hideCat,
      setPresent,
      dashToMiddle,
      dropTomb,
      showTombLanded,
      liftTomb,
      removeTomb,
      showCrashScreen,
      onTouch: (handler) => {
        touchHandler = handler;
      },
      flinch: () => {
        m.landAt = performance.now();
      },
      // the same squash as a hard landing
      flashFrame: (amount) => {
        m.flash = Math.max(m.flash, amount);
      },
      // the frame flares up for a moment
      isHeld: () => !!m.hold,
      withoutMe,
      ripPage,
      setHidden: (hidden) => {
        host.style.display = hidden ? "none" : "";
      },
      showHud: (show) => hud.classList.toggle("show", show),
      setHud: (text) => {
        hud.textContent = text;
      },
      remove: () => host.remove()
    };
  })();
  var brain = {
    stress: 0,
    // 0 = totally calm, 1 = completely overwhelmed
    mode: "alive",
    // 'alive' → 'dying' → 'dead' → 'crashing' (browser closes)
    //                    'dead' → 'reviving' → 'alive' (in safe mode)
    present: false,
    // is he on screen? (only with CONFIG.appearAtTabs tabs or more)
    wasHere: false,
    // was he already around in the last tab? then no "hello" again
    rebooted: false,
    // the browser crashed last time → he says something about it
    fragility: 1,
    // how easily he gets stressed right now (tabs + network)
    activity: 0,
    // how much you're doing right now (weighted sum of the senses)
    rate: 0,
    // how fast stress is changing, per second
    overloaded: [],
    // which senses are above CONFIG.overloaded right now
    deathHeld: 0,
    // ms the death conditions have been true in a row
    maxedHeld: 0,
    // ms stress has been at max in a row
    episode: freshEpisode(),
    // timers for the current stress episode (for the dev panel)
    lastMood: null,
    catUntil: 0,
    // the cat picture is showing until this time
    lastCatAt: 0,
    dizzyUntil: 0,
    pokes: 0,
    // clicks on him in a row (each less than CONFIG.pokeReset after the last)
    pokedAt: 0,
    // the last one — while you keep clicking him he can't calm down
    ripping: false,
    // he's tearing this tab in half right now
    ripMeter: 0,
    // ms of fast scrolling "stored up" — full at CONFIG.ripTime → he rips the tab
    wasStressed: false,
    wasOrange: false,
    // he's orange (or worse) right now; calming below CONFIG.orangeReset ends it
    orangeCount: 0,
    // how many times he has turned orange (every other time costs you tabs)
    peaks: freshPeaks(),
    // your worst numbers recently, carved on the tombstone
    deathLines: null,
    siteNote: { key: "", mark: 0 },
    // which "you've spent X minutes here" was said already
    settings: { debug: false, demo: false, hidden: false, badNet: false, safeDeath: false, mute: false },
    loaded: false
    // false until the shared state has been read from storage
  };
  function freshPeaks() {
    return { mouse: 0, wpm: 0, clicks: 0, scroll: 0, switches: 0 };
  }
  function freshEpisode() {
    return { total: 0, red: 0, maxed: 0, waiting: 0 };
  }
  var devLog = [];
  var eventId = 0;
  function log(kind, text) {
    devLog.push({ id: ++eventId, t: Date.now(), kind, text });
    if (devLog.length > 80) devLog.shift();
  }
  var say = (text, options) => {
    if (Body.say(text, options)) log("say", `\u201C${text.replace(/\n/g, " ")}\u201D`);
  };
  function topCauses(p) {
    const w = CONFIG.weights;
    return ["mouse", "typing", "clicks", "scroll", "switching"].map((k) => [k, p[k] * w[k]]).filter(([, v]) => v > 0.05).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => `${k} ${v.toFixed(2)}`).join(", ");
  }
  var lastSaid = {};
  function ready2(key, cooldownMs) {
    const now = Date.now();
    if (now - (lastSaid[key] ?? -Infinity) < cooldownMs) return false;
    lastSaid[key] = now;
    return true;
  }
  var holdStart = {};
  function heldFor(key, condition) {
    if (!condition) {
      holdStart[key] = 0;
      return 0;
    }
    holdStart[key] || (holdStart[key] = Date.now());
    return Date.now() - holdStart[key];
  }
  function updatePresence(st) {
    const crowded = st.tabs >= CONFIG.appearAtTabs;
    const wanted = crowded || brain.mode !== "alive";
    if (wanted && !brain.present) arrive(st);
    if (heldFor("leaving", brain.present && !wanted) > CONFIG.leaveDelay) leave();
  }
  function arrive(st) {
    brain.present = true;
    Body.setPresent(true);
    pop();
    log("arrive", `appeared \u2014 ${st.tabs} tabs open (needs ${CONFIG.appearAtTabs}+)`);
    if (brain.mode === "alive") {
      if (brain.rebooted) say("calmed down?\nwe are so back.", { priority: 2, ms: 5e3 });
      else if (!brain.wasHere) say(`${st.tabs} tabs\u2026
working hard?`, { face: "meh" });
    }
    brain.rebooted = false;
    brain.wasHere = true;
    saveShared(true);
  }
  function leave() {
    log("leave", `left \u2014 fewer than ${CONFIG.appearAtTabs} tabs`);
    brain.present = false;
    brain.wasHere = false;
    brain.catUntil = 0;
    Body.hideCat();
    Body.setPresent(false);
    saveShared(true);
  }
  function updateStress(p, dt, stillFor, now) {
    const w = CONFIG.weights;
    const activity = p.mouse * w.mouse + p.typing * w.typing + p.clicks * w.clicks + p.scroll * w.scroll + p.switching * w.switching;
    brain.fragility = 1 + p.tabs * CONFIG.tabFragility + p.network * CONFIG.netFragility;
    brain.activity = activity;
    if (activity > CONFIG.comfort && now < brain.catUntil) {
    } else if (activity > CONFIG.comfort) {
      const rise = CONFIG.riseSpeed * (brain.settings.demo ? CONFIG.demoRiseSpeed : 1);
      brain.stress += (activity - CONFIG.comfort) * rise * brain.fragility * dt;
    } else {
      let calm = CONFIG.calmSpeed;
      if (stillFor > 3e3) calm *= 2;
      if (now < brain.catUntil) calm *= 2;
      if (now - brain.pokedAt < CONFIG.pokeReset) calm = 0;
      brain.stress -= calm * dt;
    }
    const floor = p.tabs * 0.3;
    brain.stress = clamp(brain.stress, floor, 1);
  }
  function trackPeaks(st) {
    if (brain.stress < 0.2) brain.peaks = freshPeaks();
    const pk = brain.peaks;
    pk.mouse = Math.max(pk.mouse, st.mouseSpeed);
    pk.wpm = Math.max(pk.wpm, st.wpm);
    pk.clicks = Math.max(pk.clicks, st.clicks);
    pk.scroll = Math.max(pk.scroll, st.scrollSpeed);
    pk.switches = Math.max(pk.switches, st.switches);
  }
  function trackEpisode(dt) {
    if (brain.stress < 0.2) {
      brain.episode = freshEpisode();
      return;
    }
    const e = brain.episode;
    e.total += dt;
    if (brain.stress > 0.7) e.red += dt;
    if (brain.stress >= 0.98) {
      e.maxed += dt;
      if (brain.overloaded.length < CONFIG.deathFactors) e.waiting += dt;
    }
  }
  function react(p, st, now, dt) {
    const rushingFor = heldFor("rush", st.keysPerSec >= CONFIG.rushKeysPerSec);
    if (rushingFor > 1e3 && ready2("typing", 45e3)) {
      say(pick(["oh, typing violently?\nworking hard?", "whoa. typing violently?\nworking hard?"]), { face: "meh" });
    }
    if (rushingFor > CONFIG.rushTime && ready2("rush", CONFIG.rushCooldown)) {
      log("rush", `typing ${st.keysPerSec.toFixed(1)} keys/s for ${(rushingFor / 1e3).toFixed(1)} s \u2192 closing ${CONFIG.rushCloseTabs} tabs`);
      closeTabsBecauseRushing();
    }
    const fastScroll = st.scrollSpeed >= CONFIG.ripScrollSpeed;
    brain.ripMeter = Math.max(0, brain.ripMeter + (fastScroll ? 1 : -CONFIG.ripDrain) * dt * 1e3);
    if (brain.ripMeter > CONFIG.ripTime * 0.45 && ready2("ripwarn", 15e3)) {
      say("stop scrolling!\ni'm warning you.", { face: "worried", priority: 2 });
      uhOh();
    }
    if (brain.ripMeter >= CONFIG.ripTime && !brain.ripping) ripThisTab(st);
    if (heldFor("mouse", p.mouse > 0.6) > 400 && ready2("mouse", 25e3)) {
      say(pick(["whoa, where are we going?", "slow dooown", "my eyes can't keep up"]), { face: "worried" });
    }
    if (Body.isHeld() && p.mouse > 0.5 && ready2("seasick", 1e4)) {
      say("i'm getting seasick\u2026", { face: "worried", priority: 2 });
    }
    if (now < senses.rageUntil && ready2("rage", 2e4)) {
      say(pick(["ow. ow. ow.", "click click click click", "the button heard you"]), { face: "hurt" });
    }
    const tabsLeft = CONFIG.tabsDeathAt - st.tabs;
    if (tabsLeft > 0 && tabsLeft <= 3 && ready2(`tabsLeft${tabsLeft}`, 6e4)) {
      say("i can't take this.\nstop this or i'm quitting.", { face: "worried", priority: 2 });
      uhOh();
    } else if (st.tabs >= 20 && ready2("tabs", 5 * 6e4)) {
      say(`${st.tabs} tabs?!
do you want me to suffocate?`, { face: "sad" });
    }
    if (p.network > 0.6 && ready2("net", 10 * 6e4)) {
      say("i feel dizzy.\nwhat's happening to me?", { face: "worried" });
    }
    const info = senses.tabInfo;
    if (info?.host) {
      const unitMs = brain.settings.demo ? 1e3 : 6e4;
      const spent = (now - info.hostSince) / unitMs;
      const mark = CONFIG.siteMinutes.filter((m) => spent >= m).pop();
      const key = `${info.host}@${info.hostSince}`;
      if (mark && (brain.siteNote.key !== key || brain.siteNote.mark < mark)) {
        brain.siteNote = { key, mark };
        say(`oh, you've spent ${mark} minutes
on ${info.host}`, { ms: 5e3, face: "meh" });
      }
    }
    const catCooldown = brain.settings.demo ? CONFIG.catCooldownDemo : CONFIG.catCooldown;
    if (brain.stress > CONFIG.catAt && !brain.catUntil && now - brain.lastCatAt > catCooldown) showCat();
    if (brain.catUntil && now >= brain.catUntil) {
      brain.catUntil = 0;
      Body.hideCat();
    }
    if (brain.stress < CONFIG.orangeReset) brain.wasOrange = false;
    if (brain.stress >= CONFIG.orangeAt && !brain.wasOrange) {
      brain.wasOrange = true;
      if (!brain.catUntil) {
        brain.orangeCount++;
        const closes = (brain.orangeCount - 1) % CONFIG.orangeEvery === 0;
        log("mood", `turned orange (time #${brain.orangeCount}) \u2192 ${closes ? "closing tabs" : "not this time"}`);
        if (closes) closeForgottenTabs("turned orange", (closed) => say(`there. ${closed} tabs fewer.
breathe.`, { priority: 2 }));
      }
      saveShared(true);
    }
    if (st.tabs >= CONFIG.tabsDeathAt) return die(st, `${st.tabs} tabs open (the limit is ${CONFIG.tabsDeathAt})`);
    brain.overloaded = ["mouse", "typing", "clicks", "scroll", "switching", "tabs"].filter((k) => p[k] > CONFIG.overloaded);
    const maxed = brain.stress >= 0.98 && now >= brain.catUntil;
    brain.deathHeld = heldFor("death", maxed && brain.overloaded.length >= CONFIG.deathFactors);
    brain.maxedHeld = heldFor("maxed", maxed);
    if (brain.deathHeld > CONFIG.deathHold || brain.maxedHeld > CONFIG.maxedDeath) {
      die(st);
    } else if (maxed && ready2("maxed", 15e3)) {
      say("i can't\u2026 do\u2026 this\u2026", { priority: 2, face: "worried" });
      uhOh();
    }
    if (brain.stress > 0.7) brain.wasStressed = true;
    if (brain.wasStressed && brain.stress < 0.3) {
      brain.wasStressed = false;
      say(pick(["phew.", "ahh. better.", "thank you."]));
      sigh();
    }
  }
  function closeTabsBecauseRushing() {
    say("you're rushing!\nbetter watch out.", { priority: 2, face: "meh" });
    setTimeout(() => closeForgottenTabs(
      "rushing",
      (closed) => say(`there. ${closed} tabs fewer.
breathe.`, { priority: 2 }),
      CONFIG.rushCloseTabs
    ), 2e3);
  }
  function closeForgottenTabs(why, afterwards, count = CONFIG.closeTabsMin + Math.floor(Math.random() * (Math.max(CONFIG.closeTabsMin, CONFIG.closeTabsMax) - CONFIG.closeTabsMin + 1))) {
    safely(
      () => send({ type: "browsy-close-tabs", count }).then((closed) => {
        log("rush", `closed ${closed} tabs (${why})`);
        whooshes(closed);
        if (closed) afterwards?.(closed);
      }).catch(() => {
      })
    );
  }
  async function ripThisTab(st) {
    brain.ripping = true;
    log("rip", `rip meter full (scrolling ${Math.round(st.scrollSpeed)} px/s) \u2192 ripping this tab in half`);
    Body.hush();
    brain.catUntil = 0;
    Body.hideCat();
    const shot = await Body.withoutMe(async () => {
      try {
        return await send({ type: "browsy-capture" });
      } catch {
        return null;
      }
    });
    say("that's it.\nno more scrolling.", { face: "hurt", priority: 3 });
    await Body.ripPage(shot);
    safely(() => send({ type: "browsy-close-tab" }).catch(() => {
    }));
  }
  function checkDizzy() {
    const now = Date.now();
    const switches = (senses.tabInfo?.switches ?? []).filter((t) => now - t < CONFIG.switchMemory).length;
    if (!brain.present || brain.mode !== "alive" || switches < CONFIG.dizzyAt) return;
    brain.dizzyUntil = now + 2500;
    log("dizzy", `${switches} tab switches in the last ${CONFIG.switchMemory / 1e3} s`);
    if (ready2("dizzy", 2e4)) {
      say(pick(["everything is spinning\u2026", "which tab are we even in?", "wheee\u2026 no. not whee."]), { face: "worried" });
      wobble();
      Body.flashFrame(0.4);
    }
  }
  var POKE_LINES = {
    3: ["ow. stop poking me.", "hey! i'm not a button."],
    5: ["stop it. please."],
    7: ["i said stop."]
  };
  Body.onTouch((touch) => {
    if (brain.mode !== "alive" || !brain.present) return;
    const now = Date.now();
    if (touch.kind === "boop") {
      brain.pokes = now - brain.pokedAt < CONFIG.pokeReset ? brain.pokes + 1 : 1;
      brain.pokedAt = now;
      const n = brain.pokes;
      brain.stress = Math.min(1, brain.stress + n * CONFIG.pokeStress);
      if (n <= 2) {
        boing();
        if (ready2("boop", 1200)) {
          log("touch", "booped");
          if (brain.stress < 0.35) say(pick(["boop.", "hi!", "hehe."]), { face: "happy" });
          else say(pick(["not now\u2026", `${senses.tabInfo?.count ?? 0} tabs\u2026
i'm trying my best.`]), { face: "meh" });
        }
      } else {
        Body.flinch();
        eep(n);
        Body.flashFrame(0.15 + n * 0.05);
        log("touch", `clicked ${n}\xD7 in a row \u2192 stress ${brain.stress.toFixed(2)}`);
        if (POKE_LINES[n]) say(pick(POKE_LINES[n]), { face: "hurt", priority: 2 });
      }
    }
    if (touch.kind === "pickup") {
      log("touch", "picked up");
      say("whoa\u2014\nput me down!", { face: "worried", priority: 2 });
    }
    if (touch.kind === "drop") {
      log("touch", touch.outside ? "dropped outside his corner" : "put down");
      if (touch.outside) say(pick(["hey! be careful.", "slow dooown!"]), { face: "worried", priority: 2 });
      else Body.hush();
    }
  });
  function showCat() {
    const now = Date.now();
    brain.lastCatAt = now;
    brain.catUntil = now + CONFIG.catDuration;
    log("cat", `cat shown at stress ${brain.stress.toFixed(2)}`);
    Body.showCat(chrome.runtime.getURL(pick(CONFIG.catImages)), `https://cataas.com/cat?width=700&r=${now}`);
    catChime();
    say("woah! slow down.\nbreathe in. breathe out.", { priority: 3, ms: CONFIG.catDuration - 2500 });
    saveShared(true);
    setTimeout(() => closeForgottenTabs("showing the cat"), 1500);
  }
  function epitaph(st) {
    const pk = brain.peaks;
    const net = st.downlink != null ? `${st.downlink} Mbps` : st.rtt != null ? `${Math.round(st.rtt)} ms ping` : "no internet";
    return [
      `Internet: ${net}`,
      pk.mouse > CONFIG.mouseCalm && `Mouse speed: ${(pk.mouse / 1e3).toFixed(1)} px/ms`,
      pk.wpm > CONFIG.typingCalm * 12 && `Typing speed: ${Math.round(pk.wpm)} wpm`,
      // (wpm = keys per second × 12)
      pk.clicks > CONFIG.clicksCalm && `Clicks: ${pk.clicks} in 3s`,
      pk.scroll > CONFIG.scrollCalm && `Scroll speed: ${(pk.scroll / 1e3).toFixed(1)} px/ms`,
      pk.switches > CONFIG.switchesCalm && `Tab switches: ${pk.switches} in ${CONFIG.switchMemory / 1e3}s`,
      `Tabs: ${st.tabs}`
    ].filter(Boolean).join("\n");
  }
  var tombNote = () => brain.settings.safeDeath ? "" : "There will be consequences\n\u2013 Browsy";
  function die(st, reason) {
    const e = brain.episode;
    const why = reason ?? (brain.deathHeld > CONFIG.deathHold ? `overloaded: ${brain.overloaded.join(" + ")}` : brain.maxedHeld > CONFIG.maxedDeath ? `at max stress for ${CONFIG.maxedDeath / 1e3} s` : "killed from the popup");
    log("death", `DIED (${why}). This episode lasted ${e.total.toFixed(1)} s \u2014 red ${e.red.toFixed(1)} s, at max ${e.maxed.toFixed(1)} s, of which ${e.waiting.toFixed(1)} s stuck waiting for ${CONFIG.deathFactors} overloaded senses`);
    brain.mode = "dying";
    brain.stress = 1;
    brain.catUntil = 0;
    Body.hideCat();
    Body.hush();
    brain.deathLines = epitaph(st);
    saveShared(true);
    Body.dashToMiddle();
    dunDunDunn();
    Body.flashFrame(0.9);
    const crash = !brain.settings.safeDeath;
    if (crash) {
      const delay = 1400 + 600 + CONFIG.crashDelay;
      log("crash", `closing every tab in ${(delay / 1e3).toFixed(1)} s, then the browser`);
      safely(() => send({ type: "browsy-crash", lines: brain.deathLines, delay }).catch(() => {
      }));
    }
    setTimeout(() => {
      Body.dropTomb(brain.deathLines, tombNote(), () => {
        brain.mode = crash ? "crashing" : "dead";
        senses.lastActive = Date.now();
      });
    }, 1400);
  }
  function revive() {
    log("revive", "revived");
    brain.mode = "reviving";
    saveShared(true);
    sparkle();
    Body.liftTomb(() => {
      brain.mode = "alive";
      brain.stress = 0.15;
      brain.peaks = freshPeaks();
      brain.lastCatAt = Date.now();
      say("calmed down?\nwe are so back.", { priority: 2 });
      saveShared(true);
    });
  }
  function moodNow(now) {
    if (brain.mode === "reviving") return "calm";
    if (brain.mode !== "alive") return "dead";
    if (now < brain.catUntil) return "chill";
    if (brain.stress > 0.7) return "stressed";
    if (brain.stress > 0.35) return "uneasy";
    return "calm";
  }
  var isVisible = () => document.visibilityState === "visible";
  var lastSave = 0;
  function saveShared(force, leaving = false) {
    const now = Date.now();
    if (!brain.loaded || !isVisible() && !leaving || brain.mode === "crashing") return;
    if (!force && now - lastSave < 1e3) return;
    lastSave = now;
    const mode = brain.mode === "alive" || brain.mode === "reviving" ? "alive" : "dead";
    safely(() => save({
      browsyState: {
        stress: brain.stress,
        mode,
        present: brain.present,
        rebooted: brain.rebooted,
        deathLines: brain.deathLines,
        lastCatAt: brain.lastCatAt,
        siteNote: brain.siteNote,
        savedAt: now,
        maxedFor: brain.maxedHeld,
        orangeCount: brain.orangeCount,
        wasOrange: brain.wasOrange
      }
    }));
  }
  async function loadShared() {
    const data = await load(["browsyState", "tabInfo", "net", "browsySettings", "browsyDevPing"]);
    senses.tabInfo = data.tabInfo ?? null;
    senses.net = data.net ?? null;
    devPing = data.browsyDevPing ?? 0;
    applySettings(data.browsySettings);
    const saved = data.browsyState;
    if (saved) {
      const awaySeconds = (Date.now() - saved.savedAt) / 1e3;
      brain.stress = Math.max(0, saved.stress - CONFIG.calmSpeed * awaySeconds);
      brain.lastCatAt = saved.lastCatAt ?? 0;
      brain.siteNote = saved.siteNote ?? brain.siteNote;
      brain.wasHere = !!saved.present;
      brain.rebooted = !!saved.rebooted;
      brain.orangeCount = saved.orangeCount ?? 0;
      brain.wasOrange = saved.wasOrange ?? brain.stress >= CONFIG.orangeAt;
      if (saved.maxedFor && brain.stress >= 0.98) holdStart.maxed = Date.now() - saved.maxedFor;
      if (saved.mode === "dead" && brain.mode === "alive") {
        brain.mode = "dead";
        brain.deathLines = saved.deathLines ?? null;
        Body.showTombLanded(brain.deathLines, tombNote());
        senses.lastActive = Date.now();
      } else if (saved.mode === "alive" && brain.mode === "dead") {
        brain.mode = "alive";
        Body.removeTomb();
      }
    }
    brain.loaded = true;
  }
  function applySettings(settings) {
    Object.assign(brain.settings, settings);
    Body.setHidden(brain.settings.hidden);
    Body.showHud(brain.settings.debug);
    setMuted(brain.settings.mute || brain.settings.hidden);
  }
  function runCommand(type) {
    if (type === "cat" && brain.mode === "alive" && brain.present) showCat();
    if (type === "kill" && brain.mode === "alive") die(readSenses(0.016, brain.settings).stats);
    if (type === "revive" && (brain.mode === "dead" || brain.mode === "crashing")) revive();
  }
  var stopped = false;
  function safely(fn) {
    try {
      if (!chrome.runtime?.id) throw new Error("extension reloaded");
      return fn();
    } catch {
      stopped = true;
      Body.remove();
      setRumble(0);
    }
  }
  var devPing = 0;
  var lastTelemetry = 0;
  var lastSentEvent = 0;
  safely(() => chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.tabInfo) {
      senses.tabInfo = changes.tabInfo.newValue;
      if (isVisible()) checkDizzy();
    }
    if (changes.net) senses.net = changes.net.newValue;
    if (changes.browsySettings) applySettings(changes.browsySettings.newValue);
    if (changes.browsyCommand && isVisible()) runCommand(changes.browsyCommand.newValue?.type);
    if (changes.browsyDevPing) {
      if (Date.now() - devPing > 8e3) lastSentEvent = 0;
      devPing = changes.browsyDevPing.newValue;
    }
  }));
  function sendTelemetry(p, st, stillFor, mood) {
    const now = Date.now();
    if (now - devPing > 8e3 || now - lastTelemetry < 100 || !isVisible()) return;
    lastTelemetry = now;
    const events = devLog.filter((e) => e.id > lastSentEvent);
    if (events.length) lastSentEvent = events.at(-1).id;
    safely(() => send({
      type: "browsy-telemetry",
      page: /^https?:$/.test(location.protocol) ? location.hostname.replace(/^www\./, "") : "New Tab page",
      t: now,
      mode: brain.mode,
      present: brain.present,
      mood,
      stress: brain.stress,
      rate: brain.rate,
      activity: brain.activity,
      fragility: brain.fragility,
      overloaded: brain.overloaded,
      deathHeld: brain.deathHeld,
      maxedHeld: brain.maxedHeld,
      episode: brain.episode,
      pressure: p,
      stats: st,
      stillFor,
      events
    }).catch(() => {
    }));
  }
  safely(() => chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "browsy-final") Body.showCrashScreen(msg.lines, CONFIG.crashCountdown);
  }));
  document.addEventListener("visibilitychange", () => {
    if (stopped) return;
    if (!isVisible()) {
      saveShared(true, true);
      setRumble(0);
      return;
    }
    senses.lastActive = Date.now();
    brain.loaded = false;
    setTimeout(() => safely(() => loadShared().catch(() => {
    }).finally(() => {
      brain.loaded = true;
      switchedHere();
    })), 80);
  });
  function switchedHere() {
    if (brain.mode !== "alive" || !brain.wasHere) return;
    brain.stress = Math.min(1, brain.stress + CONFIG.switchStress);
  }
  function bar(v) {
    const n = Math.round(clamp(v, 0, 1) * 10);
    return "[" + "#".repeat(n) + "-".repeat(10 - n) + "]";
  }
  function hudText(p, st, stillFor) {
    return [
      `BROWSY  ${brain.mode}  ${brain.present ? "here" : `away (needs ${CONFIG.appearAtTabs}+ tabs)`}`,
      `stress    ${bar(brain.stress)} ${brain.stress.toFixed(2)}`,
      `fragility \xD7${brain.fragility.toFixed(2)}`,
      "",
      `mouse     ${bar(p.mouse)} ${Math.round(st.mouseSpeed)} px/s`,
      `typing    ${bar(p.typing)} ${Math.round(st.wpm)} wpm (${st.keysPerSec.toFixed(1)}/s)`,
      `clicks    ${bar(p.clicks)} ${st.clicks} in 3s`,
      `scroll    ${bar(p.scroll)} ${Math.round(st.scrollSpeed)} px/s`,
      `rip meter ${bar(brain.ripMeter / CONFIG.ripTime)} (full = he rips the tab)`,
      `switching ${bar(p.switching)} ${st.switches} in ${CONFIG.switchMemory / 1e3} s`,
      `tabs      ${bar(p.tabs)} ${st.tabs}`,
      `network   ${bar(p.network)} ${st.rtt == null ? "\u2014" : Math.round(st.rtt) + " ms"} \xB7 ${st.downlink ?? "?"} Mbps`,
      "",
      `still for ${(stillFor / 1e3).toFixed(1)} s`
    ].join("\n");
  }
  var lastFrame = performance.now();
  function tick(frameTime) {
    if (stopped || !chrome.runtime?.id) {
      stopped = true;
      Body.remove();
      setRumble(0);
      return;
    }
    const dt = clamp((frameTime - lastFrame) / 1e3, 1e-3, 0.1);
    lastFrame = frameTime;
    const now = Date.now();
    const { pressure: p, stats, stillFor } = readSenses(dt, brain.settings);
    const stressBefore = brain.stress;
    if (brain.loaded) {
      updatePresence(stats);
      if (brain.mode === "alive" && brain.present && brain.ripping) {
      } else if (brain.mode === "alive" && brain.present) {
        updateStress(p, dt, stillFor, now);
        trackPeaks(stats);
        react(p, stats, now, dt);
        trackEpisode(dt);
      } else if (brain.mode === "alive") {
        brain.activity = 0;
        brain.stress = Math.max(0, brain.stress - CONFIG.calmSpeed * dt);
      } else if (brain.mode === "dead" && brain.settings.safeDeath) {
        if (stillFor >= CONFIG.stillToRevive && stats.tabs < CONFIG.tabsDeathAt) revive();
      }
    }
    brain.rate += ((brain.stress - stressBefore) / dt - brain.rate) * (1 - Math.exp(-dt / 0.5));
    const mood = moodNow(now);
    if (mood !== brain.lastMood) {
      if (brain.lastMood) log("mood", `${brain.lastMood} \u2192 ${mood}  (${topCauses(p) || "nothing much \u2014 calming down"})`);
      brain.lastMood = mood;
    }
    Body.update(dt, frameTime, {
      stress: brain.stress,
      mood,
      dizzy: now < brain.dizzyUntil,
      crowd: p.tabs,
      pointer: senses.pointer,
      touchable: brain.mode === "alive" && brain.present && now >= brain.catUntil && !brain.ripping
      // not while holding the cat
    });
    const shaking = brain.present && brain.mode === "alive" && mood !== "chill" && !brain.ripping;
    setRumble(shaking ? clamp((brain.stress - 0.45) / 0.55, 0, 1) ** 1.5 : 0);
    if (brain.settings.debug) Body.setHud(hudText(p, stats, stillFor));
    saveShared(false);
    sendTelemetry(p, stats, stillFor, mood);
    requestAnimationFrame(tick);
  }
  safely(() => loadShared().catch(() => {
  }).finally(() => {
    brain.loaded = true;
    requestAnimationFrame(tick);
  }));
  Object.assign(globalThis, { brain, Body, devLog });
  console.log("hello");
})();
