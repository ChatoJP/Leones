import { motion } from "framer-motion";
import MotionBackground from "./MotionBackground";
import { Link } from "react-router-dom";
import Sticker from "./Sticker";
import { useI18n } from "../lib/i18n";
import { findBySku } from "../data/products";

const MOODS = [
  { key: "soft", sku: "LN-LIP-001", emoji: "💗", tint: "from-pink/50 to-white" },
  { key: "glitter", sku: "LN-LIP-003", emoji: "✨", tint: "from-gold/30 to-white" },
  { key: "cloud", sku: "LN-LIP-005", emoji: "☁️", tint: "from-sky/50 to-white" },
  { key: "main", sku: "LN-LIP-004", emoji: "🎬", tint: "from-pink/40 to-sky/30" },
  { key: "gift", sku: "LN-SET-001", emoji: "🎁", tint: "from-gold/25 to-pink/30" },
  { key: "jelly", sku: "LN-LIP-008", emoji: "🍮", tint: "from-pink/60 to-white" },
] as const;

const COPY = {
  en: {
    eyebrow: "the mood wall",
    title1: "Choose your",
    title2: "mood",
    sub: "Six moods. Each one has a piece of the drop that matches it.",
    moods: {
      soft: { name: "Soft Pink Mood", line: "quiet, glossy, yours" },
      glitter: { name: "Glitter Mood", line: "sparkle first, questions later" },
      cloud: { name: "Cloud Mood", line: "sleepy, dreamy, cozy" },
      main: { name: "Main Character Mood", line: "the camera finds you" },
      gift: { name: "Gift Mood", line: "for someone who deserves cute" },
      jelly: { name: "JellyBoop Mood", line: "wobble responsibly" },
    } as Record<string, { name: string; line: string }>,
  },
  pt: {
    eyebrow: "o mural de moods",
    title1: "Escolhe o teu",
    title2: "mood",
    sub: "Seis moods. Cada um tem uma peça do drop que combina.",
    moods: {
      soft: { name: "Mood Rosa Suave", line: "calmo, glossy, teu" },
      glitter: { name: "Mood Glitter", line: "primeiro brilho, perguntas depois" },
      cloud: { name: "Mood Nuvem", line: "sonolento, sonhador, quentinho" },
      main: { name: "Mood Protagonista", line: "a câmara encontra-te" },
      gift: { name: "Mood Presente", line: "para alguém que merece fofura" },
      jelly: { name: "Mood JellyBoop", line: "abana com responsabilidade" },
    } as Record<string, { name: string; line: string }>,
  },
} as const;

export default function MoodWall() {
  const { lang } = useI18n();
  const c = COPY[lang];
  return (
    <section id="moods" className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-[3rem] px-6 py-24">
      <MotionBackground clip="bg-mood-wall" opacity={0.35} behind />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-amber">{c.eyebrow}</p>
        <h2 className="font-display mt-3 text-4xl font-semibold text-ink sm:text-6xl">
          {c.title1} <em className="text-pink-deep">{c.title2}</em>
        </h2>
        <p className="mx-auto mt-4 max-w-md font-semibold text-ink/60">{c.sub}</p>
      </motion.div>

      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {MOODS.map((m, i) => {
          const product = findBySku(m.sku);
          const mood = c.moods[m.key];
          if (!product) return null;
          const slugPath = product.sku === "LN-SET-001" ? "/cart" : `/products/${product.slug}`;
          return (
            <motion.div
              key={m.key}
              initial={{ opacity: 0, y: 24, rotate: i % 2 ? 1.5 : -1.5 }}
              whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 1 : -1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
            >
              <Link
                to={slugPath}
                className={`group relative flex h-full flex-col items-center overflow-hidden rounded-[2rem] bg-gradient-to-b ${m.tint} p-6 text-center shadow-md ring-1 ring-white/70 transition hover:-translate-y-1.5 hover:rotate-0 hover:shadow-xl`}
              >
                <span className="text-3xl">{m.emoji}</span>
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  className="mt-2 h-24 w-24 object-contain transition duration-500 group-hover:scale-110 sm:h-28 sm:w-28"
                />
                <p className="font-display mt-3 text-lg font-semibold leading-tight text-ink">
                  <span translate="no" className="notranslate">{mood.name}</span>
                </p>
                <p className="mt-1 text-xs font-bold text-ink/60">{mood.line}</p>
                <div className="mt-3">
                  <Sticker tone={i % 3 === 0 ? "pink" : i % 3 === 1 ? "sky" : "gold"} rotate={i % 2 ? 4 : -4}>
                    €{product.price}
                  </Sticker>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
