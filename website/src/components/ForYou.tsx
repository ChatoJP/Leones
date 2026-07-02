import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCollection, readViewed } from "../lib/collection";
import { useFavorites } from "../lib/favorites";
import { useI18n } from "../lib/i18n";
import { products } from "../data/products";

const FY_COPY = {
  en: { title1: "Picked for", title2: "you", sub: "Based on your hearts, your quiz and your wandering. All on your device — we don't track you.", match: "your match" },
  pt: { title1: "Escolhido para", title2: "ti", sub: "Com base nos teus corações, no quiz e nos teus passeios. Tudo no teu dispositivo — não te seguimos.", match: "o teu match" },
} as const;

/**
 * "Picked for you" — pure client-side signals, no tracking:
 * favorites > quiz match > recently viewed, minus what's already collected.
 */
export default function ForYou() {
  const { lang, lp } = useI18n();
  const fc = FY_COPY[lang];
  const favorites = useFavorites();
  const collected = useCollection();
  const quizMatch = localStorage.getItem("leones-quiz-match");
  const viewed = readViewed();

  const scored = products
    .filter((p) => !collected.has(p.sku))
    .map((p) => {
      let score = 0;
      if (favorites.has(p.sku)) score += 3;
      if (p.sku === quizMatch) score += 2;
      const vIdx = viewed.indexOf(p.sku);
      if (vIdx >= 0) score += Math.max(1, 2 - vIdx * 0.5);
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (scored.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-6 pb-4 pt-16" aria-label="Picked for you">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="font-display text-center text-3xl font-semibold text-ink">
          {fc.title1} <em className="text-pink-deep">{fc.title2}</em> ✦
        </h2>
        <p className="mt-2 text-center text-sm font-semibold text-ink/60">
          {fc.sub}
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {scored.map(({ p }, i) => (
            <motion.div
              key={p.sku}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link
                to={`/products/${p.slug}`}
                className="flex items-center gap-4 rounded-3xl bg-white/70 p-5 shadow-sm ring-1 ring-white/60 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <img src={p.image} alt="" loading="lazy" className="h-20 w-20 object-contain" />
                <div className="min-w-0">
                  {favorites.has(p.sku) && <span className="text-xs">💗</span>}
                  {p.sku === quizMatch && (
                    <span className="ml-1 rounded-full bg-gold/25 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber">
                      {fc.match}
                    </span>
                  )}
                  <p translate="no" className="notranslate truncate font-display font-semibold text-ink">{p.name}</p>
                  <p className="text-xs font-bold text-ink/60">{lp(p).tagline}</p>
                  <p className="mt-1 text-sm font-bold text-amber">€{p.price}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
