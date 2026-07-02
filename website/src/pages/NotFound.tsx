import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useI18n } from "../lib/i18n";

const NF_COPY = {
  en: { body: "This page ran off chasing the gloss. It happens a lot around here.", home: "Back home" },
  pt: { body: "Esta página fugiu atrás do gloss. Acontece muito por aqui.", home: "Voltar ao início" },
} as const;

export default function NotFound() {
  const { lang } = useI18n();
  const c = NF_COPY[lang];
  return (
    <section className="flex min-h-[70svh] flex-col items-center justify-center px-6 py-20 text-center">
      <motion.img
        src="/brand/mascot-run.webp"
        alt="The LeoNes mascot, running"
        animate={{ x: [-30, 30, -30], rotate: [-4, 4, -4] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="h-28 w-auto"
      />
      <h1 className="font-display mt-8 text-5xl font-semibold text-ink">Oops — 404</h1>
      <p className="mt-3 max-w-sm font-semibold text-ink/60">
        {c.body}
      </p>
      <Link to="/" className="mt-8 rounded-full bg-ink px-8 py-3.5 font-bold text-cloud shadow-lg transition hover:scale-105">
        {c.home}
      </Link>
    </section>
  );
}
