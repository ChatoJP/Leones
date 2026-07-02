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
