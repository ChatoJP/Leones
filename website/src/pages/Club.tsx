import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import CollectionAlbum from "../components/CollectionAlbum";
import FloatingParticles from "../components/FloatingParticles";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../lib/i18n";

const C = {
  en: {
    eyebrow: "the club", sub1: "The", sub2: "membership for collectors, boopers and future lionesses. Free, forever.",
    join: "Join free", youreIn: "You're in,",
    perks: [
      { icon: "🦁", title: "Roars", body: "Points for every order. Roars unlock charms and early drops.", status: "coming soon" },
      { icon: "✦", title: "Early access", body: "Members see new drops before anyone else.", status: "coming soon" },
      { icon: "🎂", title: "Birthday gift", body: "A little something in your birthday month.", status: "coming soon" },
      { icon: "📔", title: "Sticker album", body: "Collect all ten pieces of the drop. Live on this page now.", status: "live" },
    ],
    honest: "Honest note: roars, early access and birthday gifts launch with the first public drop — no fake points here yet.",
  },
  pt: {
    eyebrow: "o clube", sub1: "A", sub2: "membership para colecionadoras, boopers e futuras leoas. Grátis, para sempre.",
    join: "Juntar grátis", youreIn: "Estás dentro,",
    perks: [
      { icon: "🦁", title: "Rugidos", body: "Pontos por cada encomenda. Rugidos desbloqueiam amuletos e drops antecipados.", status: "em breve" },
      { icon: "✦", title: "Acesso antecipado", body: "As membros veem os drops novos antes de toda a gente.", status: "em breve" },
      { icon: "🎂", title: "Presente de anos", body: "Um miminho no mês do teu aniversário.", status: "em breve" },
      { icon: "📔", title: "Caderneta de cromos", body: "Coleciona as dez peças do drop. Já ativa nesta página.", status: "ativo" },
    ],
    honest: "Nota honesta: rugidos, acesso antecipado e presentes de aniversário chegam com o primeiro drop público — aqui não há pontos falsos.",
  },
} as const;

export default function Club() {
  const { lang } = useI18n();
  const c = C[lang];
  const { user } = useAuth();
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-pink/30 via-cloud to-cloud py-24">
        <FloatingParticles count={12} />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <motion.img
            src="/brand/mascot-run.webp"
            alt="The LeoNes mascot"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="mx-auto h-28 w-auto"
          />
          <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.25em] text-amber">{c.eyebrow}</p>
          <h1 className="font-display mt-2 text-5xl font-semibold text-ink sm:text-6xl">
            Cubs Club
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg font-semibold text-ink/60">
            {c.sub1} <span translate="no" className="notranslate">LeoNes</span> {c.sub2}
          </p>
          {!user && (
            <Link
              to="/register"
              className="mt-8 inline-block rounded-full bg-ink px-10 py-4 font-bold text-cloud shadow-xl transition hover:scale-105"
            >
              {c.join}
            </Link>
          )}
          {user && (
            <p className="mt-6 rounded-full bg-white/70 px-6 py-3 text-sm font-bold text-ink shadow-sm inline-block">
              {c.youreIn} {user.name.split(" ")[0]} ✦
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {c.perks.map((perk, i) => (
            <motion.div
              key={perk.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="rounded-3xl bg-white/70 p-6 text-center shadow-sm ring-1 ring-white/60"
            >
              <span className="text-3xl">{perk.icon}</span>
              <h2 className="font-display mt-2 text-xl font-semibold text-ink">{perk.title}</h2>
              <p className="mt-2 text-sm font-semibold text-ink/60">{perk.body}</p>
              <span
                className={`mt-3 inline-block rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                  perk.status === "live" || perk.status === "ativo" ? "bg-sky/60 text-ink" : "bg-gold/20 text-amber"
                }`}
              >
                {perk.status}
              </span>
            </motion.div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs font-bold text-ink/60">
          {c.honest}
        </p>
      </section>

      <CollectionAlbum />
    </>
  );
}
