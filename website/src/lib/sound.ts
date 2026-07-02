// Tiny opt-in UI sounds (WebAudio, no assets). Default OFF — sound is a
// choice, never a surprise.

const KEY = "leones-sound";

export const soundEnabled = () => localStorage.getItem(KEY) === "1";

export function setSoundEnabled(on: boolean) {
  localStorage.setItem(KEY, on ? "1" : "0");
  if (on) pop(); // instant feedback
}

let ctx: AudioContext | null = null;

export function pop() {
  if (!soundEnabled()) return;
  try {
    ctx ??= new AudioContext();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.08);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  } catch {
    /* audio unavailable */
  }
}

/** Triumphant little fanfare — big boop milestones (100). */
export function fanfare() {
  if (!soundEnabled()) return;
  try {
    ctx ??= new AudioContext();
    const t = ctx.currentTime;
    [[523, 0], [659, 0.12], [784, 0.24], [1047, 0.38]].forEach(([f, d]) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = "triangle";
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.09, t + d);
      gain.gain.exponentialRampToValueAtTime(0.001, t + d + 0.4);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(t + d);
      osc.stop(t + d + 0.45);
    });
  } catch {
    /* audio unavailable */
  }
}

/** Ridiculous kazoo moment — reserved for the 500th boop. */
export function kazoo() {
  if (!soundEnabled()) return;
  try {
    ctx ??= new AudioContext();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(330, t);
    osc.frequency.linearRampToValueAtTime(392, t + 0.15);
    osc.frequency.linearRampToValueAtTime(330, t + 0.3);
    osc.frequency.linearRampToValueAtTime(494, t + 0.5);
    osc.frequency.linearRampToValueAtTime(523, t + 0.7);
    gain.gain.setValueAtTime(0.07, t);
    gain.gain.setValueAtTime(0.07, t + 0.85);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.05);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 1.1);
  } catch {
    /* audio unavailable */
  }
}

export function sparkleChime() {
  if (!soundEnabled()) return;
  try {
    ctx ??= new AudioContext();
    const t = ctx.currentTime;
    [880, 1174, 1568].forEach((f, i) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = "triangle";
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.06, t + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.25);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(t + i * 0.07);
      osc.stop(t + i * 0.07 + 0.3);
    });
  } catch {
    /* audio unavailable */
  }
}
