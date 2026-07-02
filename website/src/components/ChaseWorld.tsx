import { motion } from "framer-motion";
import MotionBackground from "./MotionBackground";
import { Link } from "react-router-dom";
import Sticker from "./Sticker";
import { useChase } from "../lib/chase";
import { useI18n } from "../lib/i18n";

const COPY = {
  en: {
    eyebrow: "bloop chase world",
    title1: "The chase",
    title2: "never ends.",
    sub: "A cinematic world, a mini-game, collectible cards — and one very determined plushie who will never, ever catch that gloss.",
    play: "▶ Play Bloop Chase",
    watch: "Watch the trailer with sound 🔊",
    statBest: "your best",
    statCards: "cards",
    sticker: "cute enough to chase",
  },
  pt: {
    eyebrow: "bloop chase world",
    title1: "A perseguição",
    title2: "nunca acaba.",
    sub: "Um mundo cinematográfico, um mini-jogo, cartas colecionáveis — e um peluche muito determinado que nunca, jamais, vai apanhar aquele gloss.",
    play: "▶ Jogar Bloop Chase",
    watch: "Vê o trailer com som 🔊",
    statBest: "o teu recorde",
    statCards: "cartas",
    sticker: "fofo demais para não perseguir",
  },
} as const;

export default function ChaseWorld() {
  const { lang } = useI18n();
  const c = COPY[lang];
  const chase = useChase();
  const cards = Math.min(10, [10, 25, 45, 70, 100, 140, 190, 250, 320, 400].filter((n) => n <= chase.totalSparkles).length);

  return (
    <section id="chase-world" className="relative isolate overflow-hidden bg-gradient-to-b from-cloud via-sky/20 to-cloud py-24">
      <MotionBackground clip="bg-hero-clouds-v2" opacity={0.3} behind />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
        {/* trailer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto w-64 sm:w-72"
        >
          <div className="rounded-[2rem] bg-gradient-to-br from-gold/70 via-white to-pink p-[4px] shadow-2xl">
            <video
              src="/videos/chase/trailer.mp4"
              poster="/posters/chase/trailer.jpg"
              controls
              loop
              playsInline
              preload="none"
              className="aspect-[9/16] w-full rounded-[1.8rem] bg-ink/5 object-cover"
            />
          </div>
          <div className="absolute -right-6 -top-4">
            <Sticker tone="pink" rotate={8} wiggle>{c.sticker}</Sticker>
          </div>
          <p className="mt-2 text-center text-xs font-extrabold text-ink/55">{c.watch}</p>
        </motion.div>

        {/* copy + CTA */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center lg:text-left"
        >
          <p translate="no" className="notranslate text-xs font-extrabold uppercase tracking-[0.25em] text-amber">{c.eyebrow}</p>
          <h2 className="font-display mt-3 text-5xl font-semibold leading-tight text-ink sm:text-6xl">
            {c.title1}
            <br />
            <em className="text-pink-deep">{c.title2}</em>
          </h2>
          <p className="mx-auto mt-5 max-w-md font-semibold text-ink/60 lg:mx-0">{c.sub}</p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <Link
              to="/chase"
              className="rounded-full bg-ink px-9 py-4 text-lg font-extrabold text-cloud shadow-xl transition hover:scale-105"
            >
              {c.play}
            </Link>
            {(chase.bestScore > 0 || cards > 0) && (
              <div className="flex gap-2 text-xs font-extrabold">
                <span className="rounded-full bg-white/85 px-3 py-2 text-ink shadow ring-1 ring-ink/10">✦ {c.statBest}: {chase.bestScore}</span>
                <span className="rounded-full bg-white/85 px-3 py-2 text-ink shadow ring-1 ring-ink/10">🃏 {cards}/10 {c.statCards}</span>
              </div>
            )}
          </div>

          {/* endless chase loop strip */}
          <div className="mt-10 overflow-hidden rounded-[1.6rem] shadow-lg ring-4 ring-white/70">
            <video
              src="/videos/chase/chase-cycle.mp4"
              poster="/posters/chase/chase-cycle.jpg"
              autoPlay
              muted
              loop
              playsInline
              className="h-28 w-full object-cover"
              aria-hidden="true"
            />
          </div>
        </motion.div>
      </div>

      {/* pose parade — the cast tumbles across the section */}
      <div className="mt-16 overflow-hidden" aria-hidden="true">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex w-max items-end gap-10 px-6"
        >
          {[...Array(2)].flatMap((_, half) =>
            [3, 7, 11, 15, 19, 22, 26, 30, 5, 13, 24, 28].map((n, i) => (
              <img
                key={`${half}-${n}`}
                src={`/chase/poses/pose-${String(n).padStart(2, "0")}.webp`}
                alt=""
                loading="lazy"
                className={`h-20 w-auto drop-shadow-md sm:h-24 ${i % 2 ? "-rotate-3" : "rotate-3"}`}
              />
            )),
          )}
        </motion.div>
      </div>
    </section>
  );
}
