import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Sticker from "../components/Sticker";
import { awardRoars } from "../lib/roars";
import { CHASE_CARDS, recordRun, unlockedCards, useChase, type ChaseCard } from "../lib/chase";
import { confettiBurst } from "../lib/confetti";
import { useI18n } from "../lib/i18n";
import { pop, sparkleChime } from "../lib/sound";

const COPY = {
  en: {
    eyebrow: "the mini-game",
    title1: "Bloop",
    title2: "Chase",
    sub: "Help Bloop chase the gloss! Tap or press space to jump. Collect sparkles ✦ and hearts 💗 — dodge the grumpy rain clouds.",
    start: "▶ Start the chase",
    again: "↻ Chase again",
    time: "time",
    score: "score",
    best: "best",
    over1: "The gloss escaped…",
    over2: "again. But look what you collected!",
    sparkles: "sparkles this run",
    lifetime: "lifetime sparkles",
    roars: (n: number) => `+${n} Roars earned 🦁`,
    newCard: "NEW CARD UNLOCKED!",
    album: "Card album",
    albumSub: "Collect all 10 by gathering lifetime sparkles.",
    locked: (n: number) => `unlocks at ${n} ✦`,
    tapHint: "tap / space = jump",
    lore: "Canon note: nobody ever catches the gloss. That's the whole point.",
  },
  pt: {
    eyebrow: "o mini-jogo",
    title1: "Bloop",
    title2: "Chase",
    sub: "Ajuda o Bloop a perseguir o gloss! Toca ou carrega no espaço para saltar. Apanha sparkles ✦ e corações 💗 — desvia das nuvens rabugentas.",
    start: "▶ Começar a perseguição",
    again: "↻ Perseguir outra vez",
    time: "tempo",
    score: "pontos",
    best: "recorde",
    over1: "O gloss fugiu…",
    over2: "outra vez. Mas olha o que apanhaste!",
    sparkles: "sparkles nesta corrida",
    lifetime: "sparkles de sempre",
    roars: (n: number) => `+${n} Rugidos ganhos 🦁`,
    newCard: "CARTA NOVA DESBLOQUEADA!",
    album: "Álbum de cartas",
    albumSub: "Coleciona as 10 juntando sparkles de sempre.",
    locked: (n: number) => `desbloqueia aos ${n} ✦`,
    tapHint: "toque / espaço = saltar",
    lore: "Nota de cânone: ninguém apanha o gloss. É esse o segredo.",
  },
} as const;

type Item = { id: number; kind: "sparkle" | "heart" | "cloud"; x: number; y: number };

const GAME_LEN = 45; // seconds
const GROUND = 0; // baseline (bottom offset in px within stage)
const JUMP_V = 640; // px/s
const GRAVITY = 1700; // px/s^2

export default function ChaseGame() {
  const { lang } = useI18n();
  const c = COPY[lang];
  const chase = useChase();

  const [phase, setPhase] = useState<"idle" | "playing" | "over">("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_LEN);
  const [items, setItems] = useState<Item[]>([]);
  const [bloopY, setBloopY] = useState(0);
  const [stumble, setStumble] = useState(false);
  const [newCards, setNewCards] = useState<ChaseCard[]>([]);
  const [roarsEarned, setRoarsEarned] = useState(0);

  const stageRef = useRef<HTMLDivElement>(null);
  const state = useRef({ y: 0, vy: 0, items: [] as Item[], score: 0, t: GAME_LEN, nextSpawn: 0, id: 0, playing: false, speed: 240 });
  const raf = useRef(0);

  const jump = () => {
    const s = state.current;
    if (!s.playing) return;
    if (s.y <= 2) {
      s.vy = JUMP_V;
      pop();
    }
  };

  const start = () => {
    const s = state.current;
    s.y = 0; s.vy = 0; s.items = []; s.score = 0; s.t = GAME_LEN; s.nextSpawn = 0; s.id = 0; s.playing = true; s.speed = 240;
    setScore(0); setTimeLeft(GAME_LEN); setItems([]); setNewCards([]); setRoarsEarned(0);
    setPhase("playing");
  };

  useEffect(() => {
    if (phase !== "playing") return;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = state.current;
      const stage = stageRef.current;
      const W = stage?.clientWidth ?? 800;

      // physics
      s.vy -= GRAVITY * dt;
      s.y = Math.max(GROUND, s.y + s.vy * dt);
      if (s.y === GROUND && s.vy < 0) s.vy = 0;

      // timer
      s.t -= dt;
      s.speed += dt * 6; // gentle ramp

      // spawn
      s.nextSpawn -= dt;
      if (s.nextSpawn <= 0) {
        const r = Math.random();
        const kind = r < 0.62 ? "sparkle" : r < 0.82 ? "heart" : "cloud";
        const y = kind === "cloud" ? 10 : Math.random() < 0.5 ? 16 : 120;
        s.items.push({ id: s.id++, kind, x: W + 40, y });
        s.nextSpawn = 0.55 + Math.random() * 0.5;
      }

      // move + collide (Bloop occupies x 70..150, y s.y..s.y+90)
      const keep: Item[] = [];
      for (const it of s.items) {
        it.x -= s.speed * dt;
        const hit = it.x < 150 && it.x > 40 && it.y < s.y + 92 && it.y + 56 > s.y;
        if (hit) {
          if (it.kind === "sparkle") { s.score += 1; pop(); }
          else if (it.kind === "heart") { s.score += 5; sparkleChime(); }
          else { s.score = Math.max(0, s.score - 2); setStumble(true); setTimeout(() => setStumble(false), 500); }
          continue;
        }
        if (it.x > -60) keep.push(it);
      }
      s.items = keep;

      setScore(s.score);
      setTimeLeft(Math.max(0, s.t));
      setItems([...s.items]);
      setBloopY(s.y);

      if (s.t <= 0) {
        s.playing = false;
        const unlocked = recordRun(s.score);
        const roars = Math.floor(s.score / 10);
        if (roars > 0) awardRoars(roars);
        setRoarsEarned(roars);
        setNewCards(unlocked);
        if (unlocked.length > 0) {
          sparkleChime();
          confettiBurst(window.innerWidth / 2, 300, 30);
        }
        setPhase("over");
        return;
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); jump(); }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const unlocked = unlockedCards(chase);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-sky/30 via-cloud to-cloud py-14">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-amber">{c.eyebrow}</p>
          <h1 translate="no" className="notranslate sr-only">
            {c.title1} {c.title2}
          </h1>
          <img
            src="/chase/game/title-art.webp"
            alt=""
            className="mx-auto mt-3 w-72 max-w-full drop-shadow-xl sm:w-96"
            aria-hidden="true"
          />
          <p className="mx-auto mt-3 max-w-xl font-semibold text-ink/60">{c.sub}</p>
        </div>
      </section>

      {/* stage */}
      <section className="mx-auto max-w-4xl px-4 pb-6 sm:px-6">
        <div
          ref={stageRef}
          onPointerDown={jump}
          className="relative h-72 w-full cursor-pointer touch-none select-none overflow-hidden rounded-[2rem] shadow-2xl ring-8 ring-white/70 sm:h-80"
          style={{
            background: "linear-gradient(180deg,#c9e4f5 0%,#f7e9f0 70%,#fbd3de 100%)",
          }}
          aria-label="Bloop Chase game stage"
          role="application"
        >
          {/* drifting bg clouds */}
          {[12, 38, 64].map((top, i) => (
            <motion.span
              key={i}
              animate={{ x: ["100%", "-30%"] }}
              transition={{ duration: 18 + i * 7, repeat: Infinity, ease: "linear", delay: -i * 6 }}
              className="absolute text-4xl opacity-50"
              style={{ top: `${top}%` }}
              aria-hidden="true"
            >
              ☁️
            </motion.span>
          ))}

          {/* HUD */}
          <div className="absolute left-3 top-3 z-10 flex gap-2 text-xs font-extrabold">
            <span className="rounded-full bg-white/85 px-3 py-1.5 text-ink shadow">✦ {score}</span>
            <span className="rounded-full bg-white/85 px-3 py-1.5 text-ink shadow">⏱ {Math.ceil(timeLeft)}s</span>
            <span className="rounded-full bg-white/85 px-3 py-1.5 text-ink/60 shadow">{c.best}: {chase.bestScore}</span>
          </div>

          {/* the fleeing gloss (decorative, always ahead) */}
          {phase === "playing" && (
            <motion.img
              src="/chase/game/sprite-gloss-run.webp"
              alt=""
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 0.45, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-6 bottom-6 h-20 w-auto"
              aria-hidden="true"
            />
          )}

          {/* items */}
          {phase === "playing" &&
            items.map((it) => (
              <img
                key={it.id}
                src={
                  it.kind === "sparkle"
                    ? "/chase/game/sprite-sparkle.webp"
                    : it.kind === "heart"
                      ? "/chase/game/sprite-heart.webp"
                      : "/chase/game/sprite-raincloud.webp"
                }
                alt=""
                className="absolute h-12 w-12 object-contain drop-shadow"
                style={{ left: it.x, bottom: it.y + 8 }}
                aria-hidden="true"
              />
            ))}

          {/* Bloop */}
          {phase !== "idle" && (
            <motion.img
              src={bloopY > 4 ? "/chase/game/sprite-bloop-jump.webp" : "/chase/game/sprite-bloop-run.webp"}
              alt="Bloop"
              animate={stumble ? { rotate: [0, -18, 0] } : { rotate: 0 }}
              className="absolute left-16 h-24 w-auto drop-shadow-lg"
              style={{ bottom: bloopY + 6 }}
            />
          )}

          {/* idle overlay */}
          {phase === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/30 backdrop-blur-[2px]">
              <img src="/chase/game/sprite-bloop-run.webp" alt="" className="h-28 w-auto drop-shadow-xl" />
              <button
                onClick={start}
                className="rounded-full bg-ink px-9 py-4 text-lg font-extrabold text-cloud shadow-xl transition hover:scale-105"
              >
                {c.start}
              </button>
              <p className="text-xs font-extrabold uppercase tracking-wider text-ink/60">{c.tapHint}</p>
            </div>
          )}

          {/* game over overlay */}
          <AnimatePresence>
            {phase === "over" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/60 p-4 text-center backdrop-blur-sm"
              >
                <p className="font-display text-2xl font-semibold text-ink">{c.over1}</p>
                <p className="text-sm font-bold text-ink/60">{c.over2}</p>
                <p className="font-display text-5xl font-semibold text-pink-deep">✦ {score}</p>
                {roarsEarned > 0 && <Sticker tone="gold" rotate={-3}>{c.roars(roarsEarned)}</Sticker>}
                {newCards.map((card) => (
                  <div key={card.id} className="mt-1 flex items-center gap-2 rounded-2xl bg-white/90 px-4 py-2 shadow-lg ring-2 ring-gold">
                    <span className="text-xs font-black uppercase tracking-wider text-amber">{c.newCard}</span>
                    <span className="text-sm font-bold text-ink">{card.name[lang]}</span>
                  </div>
                ))}
                <button
                  onClick={start}
                  className="mt-2 rounded-full bg-ink px-8 py-3.5 font-extrabold text-cloud shadow-xl transition hover:scale-105"
                >
                  {c.again}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="mt-3 text-center text-xs font-bold text-ink/55">{c.lore}</p>
      </section>

      {/* card album */}
      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="text-center">
          <h2 className="font-display text-3xl font-semibold text-ink">{c.album} ✦</h2>
          <p className="mt-2 text-sm font-semibold text-ink/60">
            {c.albumSub} · {c.lifetime}: <strong className="text-pink-deep">{chase.totalSparkles} ✦</strong>
          </p>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {CHASE_CARDS.map((card) => {
            const owned = unlocked.some((u) => u.id === card.id);
            return (
              <div key={card.id} className="text-center">
                <div
                  className={`overflow-hidden rounded-2xl shadow-md transition ${
                    owned
                      ? card.rarity === "legendary"
                        ? "ring-4 ring-gold"
                        : card.rarity === "rare"
                          ? "ring-2 ring-sky-deep"
                          : "ring-2 ring-white"
                      : "opacity-40 grayscale ring-2 ring-ink/10"
                  }`}
                >
                  <img src={card.img} alt={owned ? card.name[lang] : "?"} loading="lazy" className="aspect-[3/4] w-full object-cover" />
                </div>
                <p className="mt-1.5 text-xs font-extrabold text-ink">
                  {owned ? card.name[lang] : c.locked(card.unlockAt)}
                </p>
              </div>
            );
          })}
        </div>
        <p className="mt-8 text-center">
          <Link to="/" className="text-sm font-bold text-amber hover:underline">← LeoNes</Link>
        </p>
      </section>
    </>
  );
}
