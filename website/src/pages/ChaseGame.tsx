import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { CHASE_CARDS, unlockedCards, useChase } from "../lib/chase";
import { useI18n } from "../lib/i18n";

// three.js only loads when someone actually opens the game
const BloopRun3D = lazy(() => import("../components/BloopRun3D"));

const COPY = {
  en: {
    eyebrow: "the game",
    sub: "Run after the gloss through the cloud world! Swipe or use the arrows to change lane, jump the grumpy clouds, dodge the gift boxes, and grab every sparkle ✦.",
    album: "Card album",
    albumSub: "Collect all 10 by gathering lifetime sparkles.",
    lifetime: "lifetime sparkles",
    locked: (n: number) => `unlocks at ${n} ✦`,
    lore: "Canon note: nobody ever catches the gloss. That's the whole point.",
    loading: "warming up the cloud world…",
  },
  pt: {
    eyebrow: "o jogo",
    sub: "Corre atrás do gloss pelo mundo das nuvens! Desliza ou usa as setas para mudar de faixa, salta as nuvens rabugentas, desvia das caixas e apanha todos os sparkles ✦.",
    album: "Álbum de cartas",
    albumSub: "Coleciona as 10 juntando sparkles de sempre.",
    lifetime: "sparkles de sempre",
    locked: (n: number) => `desbloqueia aos ${n} ✦`,
    lore: "Nota de cânone: ninguém apanha o gloss. É esse o segredo.",
    loading: "a aquecer o mundo das nuvens…",
  },
} as const;

export default function ChaseGame() {
  const { lang } = useI18n();
  const c = COPY[lang];
  const chase = useChase();
  const unlocked = unlockedCards(chase);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-sky/30 via-cloud to-cloud py-12">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-amber">{c.eyebrow} · 3D</p>
          <h1 translate="no" className="notranslate sr-only">Bloop Run 3D</h1>
          <img
            src="/chase/game/title-art.webp"
            alt=""
            className="mx-auto mt-3 w-64 max-w-full drop-shadow-xl sm:w-80"
            aria-hidden="true"
          />
          <p className="mx-auto mt-3 max-w-xl font-semibold text-ink/60">{c.sub}</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-6 sm:px-6">
        <Suspense
          fallback={
            <div className="mx-auto flex h-[70svh] max-h-[46rem] w-full max-w-md items-center justify-center rounded-[2rem] bg-gradient-to-b from-sky/40 to-pink/30 shadow-2xl ring-8 ring-white/70">
              <p className="animate-pulse font-display text-xl font-semibold text-ink/60">☁️ {c.loading}</p>
            </div>
          }
        >
          <BloopRun3D bestScore={chase.bestScore} />
        </Suspense>
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
