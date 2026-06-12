export function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (type === "correct") {
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.3);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.3);
      });
      [0,0.1,0.2,0.3,0.5,0.6,0.7,0.8,0.9,1.0].forEach(t => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(300 + Math.random() * 400, ctx.currentTime + t);
        osc.frequency.exponentialRampToValueAtTime(200 + Math.random() * 300, ctx.currentTime + t + 0.3);
        gain.gain.setValueAtTime(0.04, ctx.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.4);
        osc.start(ctx.currentTime + t);
        osc.stop(ctx.currentTime + t + 0.4);
      });
    }
    if (type === "wrong") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(2800, ctx.currentTime);
      filter.Q.setValueAtTime(15, ctx.currentTime);
      osc.frequency.setValueAtTime(2800, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.setValueAtTime(2600, ctx.currentTime + 0.5);
      gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.5);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc2.start(ctx.currentTime + 0.5);
      osc2.stop(ctx.currentTime + 0.8);
    }
    if (type === "gameover") {
      [311, 277, 247, 220].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.25);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.9, ctx.currentTime + i * 0.25 + 0.25);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.25);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.25 + 0.3);
        osc.start(ctx.currentTime + i * 0.25);
        osc.stop(ctx.currentTime + i * 0.25 + 0.35);
      });
    }
    if (type === "clue") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
    if (type === "start") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(3000, ctx.currentTime);
      filter.Q.setValueAtTime(20, ctx.currentTime);
      osc.frequency.setValueAtTime(3000, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    }
  } catch(e) {
    console.log("Sound error:", e);
  }
}