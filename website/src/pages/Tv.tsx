import { useEffect } from "react";
import { motion } from "framer-motion";
import LeonesTvChannel from "../components/LeonesTvChannel";
import MotionBackground from "../components/MotionBackground";
import { useI18n } from "../lib/i18n";

const COPY = {
  en: {
    eyebrow: "the channel",
    sub: "Comedy, ASMR, games with real points, and secret episodes to unlock. Grab a snack.",
    hint: "🎮 win games → earn roars → unlock secret episodes",
  },
  pt: {
    eyebrow: "o canal",
    sub: "Comédia, ASMR, jogos com pontos a sério e episódios secretos para desbloquear. Traz um snack.",
    hint: "🎮 ganha jogos → ganha rugidos → desbloqueia episódios secretos",
  },
} as const;

export default function Tv() {
  const { lang } = useI18n();
  const c = COPY[lang];

  useEffect(() => {
    document.title = "LeoNes TV — very serious television";
    return () => { document.title = "LeoNes — Confidence, wrapped in magic."; };
  }, []);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-sky/30 via-cloud to-cloud py-20 text-center">
        <MotionBackground clip="bg-stars-night" opacity={0.35} />
        <div className="relative mx-auto max-w-3xl px-6">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-extrabold uppercase tracking-[0.25em] text-amber"
          >
            {c.eyebrow}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            translate="no"
            className="notranslate font-display mt-3 text-6xl font-semibold text-ink sm:text-7xl"
          >
            LeoNes <em className="text-pink-deep">TV</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.16 }}
            className="mx-auto mt-4 max-w-md text-lg font-semibold text-ink/60"
          >
            {c.sub}
          </motion.p>
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.24 }}
            className="mt-5 inline-block rounded-full bg-white/80 px-5 py-2 text-xs font-extrabold text-ink shadow-sm ring-1 ring-gold/40"
          >
            {c.hint}
          </motion.span>
        </div>
      </section>
      <LeonesTvChannel />
    </>
  );
}
