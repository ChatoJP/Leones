import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import FloatingParticles from "../components/FloatingParticles";
import MotionBackground from "../components/MotionBackground";
import { earnAchievement } from "../lib/achievements";
import { awardRoars } from "../lib/roars";
import { confettiFromEvent } from "../lib/confetti";
import { useI18n } from "../lib/i18n";
import { sparkleChime } from "../lib/sound";

const COPY = {
  en: {
    eyebrow: "the gloss lab",
    title1: "Mix",
    title2: "your pink.",
    sub: "Every pink in the world already exists — this one is yours. Slide, name it, keep the card.",
    depth: "how pink?",
    depthEnds: ["whisper", "full bloom"] as const,
    soft: "how soft?",
    softEnds: ["cloud", "glass"] as const,
    sparkle: "how sparkly?",
    sparkleEnds: ["calm", "party"] as const,
    nameLabel: "name your pink",
    namePlaceholder: "e.g. Cloud Crush",
    create: "Create my pink ✦",
    created: "It's yours! +roars ✦",
    download: "Download the card ↓",
    honest: "Made for fun on this device — your mix never leaves it unless you share the card.",
    cardFooter: "made in the LeoNes Lab",
  },
  pt: {
    eyebrow: "o laboratório do gloss",
    title1: "Mistura o",
    title2: "teu rosa.",
    sub: "Todos os rosas do mundo já existem — este é teu. Desliza, dá-lhe um nome, guarda o cartão.",
    depth: "quão rosa?",
    depthEnds: ["sussurro", "florescer total"] as const,
    soft: "quão suave?",
    softEnds: ["nuvem", "vidro"] as const,
    sparkle: "quanto brilho?",
    sparkleEnds: ["calmo", "festa"] as const,
    nameLabel: "dá um nome ao teu rosa",
    namePlaceholder: "ex: Rosa Nuvem",
    create: "Criar o meu rosa ✦",
    created: "É teu! +rugidos ✦",
    download: "Descarregar o cartão ↓",
    honest: "Feito para brincar neste dispositivo — a tua mistura nunca sai daqui a não ser que partilhes o cartão.",
    cardFooter: "feito no LeoNes Lab",
  },
} as const;

function mixColor(depth: number, soft: number): string {
  const sat = Math.round(35 + depth * 0.55); // 35–90%
  const light = Math.round(88 - depth * 0.22 - (100 - soft) * 0.1); // ~56–88%
  return `hsl(338, ${sat}%, ${light}%)`;
}

export default function GlossLab() {
  const { lang } = useI18n();
  const c = COPY[lang];
  const [depth, setDepth] = useState(55);
  const [soft, setSoft] = useState(60);
  const [sparkle, setSparkle] = useState(40);
  const [name, setName] = useState("");
  const [made, setMade] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    document.title = lang === "pt" ? "O Gloss Lab — LeoNes" : "The Gloss Lab — LeoNes";
    return () => { document.title = "LeoNes — Confidence, wrapped in magic."; };
  }, [lang]);

  const color = mixColor(depth, soft);
  const sparkles = useMemo(
    () => Array.from({ length: Math.round(sparkle / 8) }, (_, i) => ({
      left: `${(i * 37 + 13) % 90 + 5}%`,
      top: `${(i * 53 + 7) % 85 + 5}%`,
      s: 0.5 + ((i * 29) % 10) / 10,
    })),
    [sparkle]
  );

  const create = (e: React.MouseEvent) => {
    const first = earnAchievement("lab-mixer");
    if (!first) awardRoars(1);
    setMade(true);
    sparkleChime();
    confettiFromEvent(e);
  };

  const download = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const W = 1080, H = 1350;
    cv.width = W; cv.height = H;
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#C9E4F5");
    bg.addColorStop(1, "#FBD3DE");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    // white card
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.beginPath();
    ctx.roundRect(70, 90, W - 140, H - 180, 60);
    ctx.fill();
    // swatch
    const cx = W / 2, cy = 560, r = 300;
    const grad = ctx.createRadialGradient(cx - 80, cy - 100, 40, cx, cy, r);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.25, color);
    grad.addColorStop(1, color);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    // sparkles on the swatch
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    for (let i = 0; i < Math.round(sparkle / 4); i++) {
      const a = (i * 137.5 * Math.PI) / 180;
      const rr = 40 + ((i * 83) % (r - 70));
      const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
      const s = 4 + ((i * 29) % 10);
      ctx.beginPath();
      ctx.moveTo(x, y - s); ctx.lineTo(x + s * 0.35, y - s * 0.35); ctx.lineTo(x + s, y);
      ctx.lineTo(x + s * 0.35, y + s * 0.35); ctx.lineTo(x, y + s);
      ctx.lineTo(x - s * 0.35, y + s * 0.35); ctx.lineTo(x - s, y);
      ctx.lineTo(x - s * 0.35, y - s * 0.35);
      ctx.closePath(); ctx.fill();
    }
    // text
    ctx.fillStyle = "#3A2E3D";
    ctx.textAlign = "center";
    ctx.font = "800 84px Fraunces, Georgia, serif";
    ctx.fillText(name.trim() || (lang === "pt" ? "O meu rosa" : "My pink"), cx, 1010);
    ctx.font = "700 40px Nunito, Arial, sans-serif";
    ctx.fillStyle = "rgba(58,46,61,0.65)";
    ctx.fillText(`✦ ${c.cardFooter} ✦`, cx, 1090);
    ctx.font = "800 34px Nunito, Arial, sans-serif";
    ctx.fillStyle = "#F0C36B";
    ctx.fillText("LeoNes", cx, 1180);

    const a = document.createElement("a");
    a.download = `${(name.trim() || "my-pink").toLowerCase().replaceAll(/\s+/g, "-")}-leones-lab.png`;
    a.href = cv.toDataURL("image/png");
    a.click();
    earnAchievement("butterfly");
  };

  const slider = (label: string, ends: readonly [string, string], value: number, set: (n: number) => void) => (
    <label className="block">
      <span className="text-sm font-extrabold text-ink">{label}</span>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => { setMade(false); set(Number(e.target.value)); }}
        className="mt-2 w-full accent-pink-deep"
      />
      <span className="mt-1 flex justify-between text-[11px] font-bold text-ink/55">
        <span>{ends[0]}</span><span>{ends[1]}</span>
      </span>
    </label>
  );

  return (
    <section className="relative overflow-hidden py-20">
      <MotionBackground clip="bg-lab-bubbles" opacity={0.4} />
      <FloatingParticles count={10} />
      <div className="relative mx-auto grid max-w-5xl items-center gap-12 px-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-amber">{c.eyebrow}</p>
          <h1 className="font-display mt-3 text-5xl font-semibold leading-tight text-ink sm:text-6xl">
            {c.title1} <em className="text-pink-deep">{c.title2}</em>
          </h1>
          <p className="mt-4 max-w-md text-lg font-semibold text-ink/60">{c.sub}</p>

          <div className="mt-8 space-y-6 rounded-[2rem] bg-white/70 p-7 shadow-md ring-1 ring-white/70">
            {slider(c.depth, c.depthEnds, depth, setDepth)}
            {slider(c.soft, c.softEnds, soft, setSoft)}
            {slider(c.sparkle, c.sparkleEnds, sparkle, setSparkle)}
            <label className="block">
              <span className="text-sm font-extrabold text-ink">{c.nameLabel}</span>
              <input
                value={name}
                maxLength={20}
                onChange={(e) => setName(e.target.value)}
                placeholder={c.namePlaceholder}
                className="mt-2 w-full rounded-full bg-cloud px-5 py-3 font-bold text-ink outline-none ring-1 ring-ink/10 focus:ring-pink-deep"
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={create}
                className="rounded-full bg-ink px-7 py-3.5 font-bold text-cloud shadow-lg transition hover:scale-105"
              >
                {made ? c.created : c.create}
              </button>
              {made && (
                <button
                  onClick={download}
                  className="rounded-full bg-white px-7 py-3.5 font-bold text-ink shadow-md ring-1 ring-ink/10 transition hover:scale-105"
                >
                  {c.download}
                </button>
              )}
            </div>
            <p className="text-[11px] font-bold text-ink/55">{c.honest}</p>
          </div>
        </div>

        {/* live preview: a gloss tube wearing the mix */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto flex h-[26rem] w-64 items-end justify-center"
        >
          <div className="absolute inset-x-8 top-0 h-24 rounded-3xl bg-sky shadow-inner" />
          <div
            className="relative h-80 w-40 overflow-hidden rounded-[2.5rem] shadow-2xl ring-8 ring-white/70 transition-colors duration-300"
            style={{ background: `linear-gradient(to bottom, #ffffff 0%, ${color} 55%, ${color} 100%)` }}
          >
            {sparkles.map((s, i) => (
              <motion.span
                key={i}
                animate={{ opacity: [0.2, 1, 0.2], scale: [s.s, s.s * 1.3, s.s] }}
                transition={{ duration: 2 + (i % 3), repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                className="absolute text-white"
                style={{ left: s.left, top: s.top }}
              >
                ✦
              </motion.span>
            ))}
            <span translate="no" className="notranslate absolute inset-x-0 bottom-8 text-center font-display text-xl font-semibold text-white drop-shadow">
              {name.trim() || "?"}
            </span>
          </div>
        </motion.div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </section>
  );
}
