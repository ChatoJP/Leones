import { useEffect, useState } from "react";
import MotionBackground from "./MotionBackground";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { earnAchievement } from "../lib/achievements";
import { confettiBurst } from "../lib/confetti";
import { useI18n } from "../lib/i18n";
import { products } from "../data/products";

const QUIZ_COPY = {
  en: {
    eyebrow: "the gloss quiz",
    title1: "Which gloss is",
    title2: "yours?",
    sub: "Three questions. Zero wrong answers. One perfect match.",
    match: "your match",
    addToBag: "Add to Bag —",
    meet: "Meet it properly",
    again: "↻ Take it again",
    questions: [
      { q: "Pick your vibe today ✦", options: ["✨ Sparkly & loud", "☁️ Soft & dreamy", "⚡ Fast & funny"] },
      { q: "Your dream Saturday?", options: ["🎬 Filming with friends", "🧁 Baking something cute", "🌊 Outside in the sun"] },
      { q: "Choose a superpower:", options: ["💗 Everything I touch turns pink", "🔮 I can freeze time", "🤝 Best-friend telepathy"] },
    ],
  },
  pt: {
    eyebrow: "o quiz do gloss",
    title1: "Qual é o",
    title2: "teu gloss?",
    sub: "Três perguntas. Zero respostas erradas. Um match perfeito.",
    match: "o teu match",
    addToBag: "Adicionar à Mala —",
    meet: "Conhecê-lo a sério",
    again: "↻ Fazer outra vez",
    questions: [
      { q: "Escolhe a tua vibe de hoje ✦", options: ["✨ Brilhante & alta", "☁️ Suave & sonhadora", "⚡ Rápida & divertida"] },
      { q: "O teu sábado de sonho?", options: ["🎬 Filmar com amigas", "🧁 Fazer algo fofo no forno", "🌊 Lá fora ao sol"] },
      { q: "Escolhe um superpoder:", options: ["💗 Tudo o que toco fica rosa", "🔮 Consigo parar o tempo", "🤝 Telepatia de melhores amigas"] },
    ],
  },
} as const;

type Q = { q: string; options: Array<{ label: string; points: Record<string, number> }> };

const QUESTIONS: Q[] = [
  {
    q: "Pick your vibe today ✦",
    options: [
      { label: "✨ Sparkly & loud", points: { "LN-LIP-003": 2, "LN-LIP-004": 1 } },
      { label: "☁️ Soft & dreamy", points: { "LN-LIP-005": 2, "LN-LIP-001": 1 } },
      { label: "⚡ Fast & funny", points: { "LN-LIP-010": 2, "LN-LIP-008": 1 } },
    ],
  },
  {
    q: "Your dream Saturday?",
    options: [
      { label: "🎬 Filming with friends", points: { "LN-LIP-003": 1, "LN-LIP-009": 2 } },
      { label: "🧁 Baking something cute", points: { "LN-LIP-007": 2, "LN-LIP-008": 1 } },
      { label: "🌊 Outside in the sun", points: { "LN-LIP-006": 2, "LN-LIP-002": 1 } },
    ],
  },
  {
    q: "Choose a superpower:",
    options: [
      { label: "💗 Everything I touch turns pink", points: { "LN-LIP-001": 2, "LN-LIP-004": 1 } },
      { label: "🔮 I can freeze time", points: { "LN-LIP-005": 1, "LN-LIP-003": 1, "LN-LIP-002": 1 } },
      { label: "🤝 Best-friend telepathy", points: { "LN-LIP-009": 2, "LN-LIP-001": 1 } },
    ],
  },
];

export default function GlossQuiz() {
  const { lang, lp } = useI18n();
  const qc = QUIZ_COPY[lang];
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const { add } = useCart();

  const done = step >= QUESTIONS.length;
  const winner = done
    ? products.reduce((best, p) => ((scores[p.sku] ?? 0) > (scores[best.sku] ?? 0) ? p : best), products[0])
    : null;

  useEffect(() => {
    if (winner) {
      localStorage.setItem("leones-quiz-match", winner.sku);
      earnAchievement("quiz-match");
    }
  }, [winner]);

  const answer = (points: Record<string, number>) => {
    setScores((prev) => {
      const next = { ...prev };
      for (const [sku, n] of Object.entries(points)) next[sku] = (next[sku] ?? 0) + n;
      return next;
    });
    setStep((s) => s + 1);
  };

  return (
    <section id="quiz" className="relative isolate overflow-hidden bg-gradient-to-b from-sky/25 via-cloud to-cloud py-24">
      <MotionBackground clip="bg-quiz-magic" opacity={0.35} behind />
      <div className="mx-auto max-w-2xl px-6 text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-amber">{qc.eyebrow}</p>
        <h2 className="font-display mt-3 text-4xl font-semibold text-ink sm:text-5xl">
          {qc.title1} <em className="text-pink-deep">{qc.title2}</em>
        </h2>
        <p className="mx-auto mt-3 max-w-sm font-semibold text-ink/60">
          {qc.sub}
        </p>

        <div className="mt-10 min-h-[16rem]">
          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="rounded-[2rem] bg-white/70 p-8 shadow-sm ring-1 ring-white/60 backdrop-blur"
              >
                <p className="text-xs font-extrabold uppercase tracking-widest text-ink/55">
                  {step + 1} / {QUESTIONS.length}
                </p>
                <h3 className="font-display mt-2 text-2xl font-semibold text-ink">{qc.questions[step].q}</h3>
                <div className="mt-6 flex flex-col gap-3">
                  {QUESTIONS[step].options.map((o, oi) => (
                    <button
                      key={o.label}
                      onClick={() => answer(o.points)}
                      className="rounded-full bg-white px-6 py-3.5 font-bold text-ink shadow-sm ring-1 ring-ink/10 transition hover:scale-[1.03] hover:ring-pink-deep"
                    >
                      {qc.questions[step].options[oi]}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45 }}
                className="rounded-[2rem] bg-white/80 p-8 shadow-lg ring-1 ring-white/70 backdrop-blur"
              >
                <p className="text-xs font-extrabold uppercase tracking-widest text-amber">{qc.match}</p>
                <img src={winner!.image} alt={winner!.name} className="mx-auto mt-4 h-40 w-40 object-contain" />
                <h3 className="font-display mt-2 text-3xl font-semibold text-ink">
                  <span translate="no" className="notranslate">{winner!.name}</span>
                </h3>
                <p className="mt-1 font-bold text-pink-deep">{lp(winner!).tagline}</p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={(e) => {
                      confettiBurst(e.clientX, e.clientY);
                      add(winner!);
                    }}
                    className="rounded-full bg-ink px-8 py-3.5 font-bold text-cloud shadow-lg transition hover:scale-105"
                  >
                    {qc.addToBag} €{winner!.price}
                  </button>
                  <Link
                    to={`/products/${winner!.slug}`}
                    className="rounded-full bg-white px-7 py-3.5 font-bold text-ink shadow-sm ring-1 ring-ink/10 transition hover:scale-105"
                  >
                    {qc.meet}
                  </Link>
                </div>
                <button
                  onClick={() => {
                    setStep(0);
                    setScores({});
                  }}
                  className="mt-4 text-sm font-bold text-ink/60 hover:text-ink"
                >
                  {qc.again}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
