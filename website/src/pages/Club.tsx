import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ActivityStickers from "../components/ActivityStickers";
import AvatarPicker from "../components/AvatarPicker";
import CollectionAlbum from "../components/CollectionAlbum";
import FloatingParticles from "../components/FloatingParticles";
import MotionBackground from "../components/MotionBackground";
import { readBirthdayMonth, setBirthdayMonth } from "../components/PartyMode";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../lib/i18n";
import { useRoars } from "../lib/roars";
import { useState } from "react";

const C = {
  en: {
    eyebrow: "the club", sub1: "The", sub2: "membership for collectors, boopers and future lionesses. Free, forever.",
    join: "Join free", youreIn: "You're in,",
    roarsLabel: "your roars",
    roarsHow: "Roars come from playing: TV games, Bloop Books, the quiz, booping, finding Jelly, the Lab. Never from spending money.",
    perks: [
      { icon: "🦁", title: "Roars", body: "Points for playing — games, books, boops, the Lab. Counting right now.", status: "live" },
      { icon: "✦", title: "Early access", body: "Members see new drops before anyone else.", status: "coming soon" },
      { icon: "🎂", title: "Birthday roar", body: "Set your birthday month below — the site celebrates with you.", status: "live" },
      { icon: "📔", title: "Sticker album", body: "Collect all ten pieces of the drop. Live on this page now.", status: "live" },
    ],
    honest: "Honest note: roars are play-points — nothing is purchasable with them yet. Shop perks and early access launch with the first public drop.",
    bdayTitle: "Birthday roar",
    bdaySub: "Just the month — no dates, no year, stored only on this device.",
    bdayNone: "not set",
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    clear: "clear",
  },
  pt: {
    eyebrow: "o clube", sub1: "A", sub2: "membership para colecionadoras, boopers e futuras leoas. Grátis, para sempre.",
    join: "Juntar grátis", youreIn: "Estás dentro,",
    roarsLabel: "os teus rugidos",
    roarsHow: "Os rugidos vêm de brincar: jogos da TV, Bloop Books, o quiz, boops, encontrar a Jelly, o Lab. Nunca de gastar dinheiro.",
    perks: [
      { icon: "🦁", title: "Rugidos", body: "Pontos por brincar — jogos, livros, boops, o Lab. A contar agora mesmo.", status: "ativo" },
      { icon: "✦", title: "Acesso antecipado", body: "As membros veem os drops novos antes de toda a gente.", status: "em breve" },
      { icon: "🎂", title: "Rugido de anos", body: "Marca o mês dos teus anos em baixo — o site festeja contigo.", status: "ativo" },
      { icon: "📔", title: "Caderneta de cromos", body: "Coleciona as dez peças do drop. Já ativa nesta página.", status: "ativo" },
    ],
    honest: "Nota honesta: os rugidos são pontos de brincadeira — ainda não se compra nada com eles. As vantagens de loja chegam com o primeiro drop público.",
    bdayTitle: "Rugido de anos",
    bdaySub: "Só o mês — sem datas, sem ano, guardado só neste dispositivo.",
    bdayNone: "por marcar",
    months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
    clear: "limpar",
  },
} as const;

function BirthdayPicker() {
  const { lang } = useI18n();
  const c = C[lang];
  const [month, setMonth] = useState<number | null>(readBirthdayMonth);
  return (
    <div className="rounded-[2.5rem] bg-white/70 p-8 text-center shadow-md ring-1 ring-white/70">
      <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-amber">🎂 {c.bdayTitle}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm font-semibold text-ink/60">{c.bdaySub}</p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {c.months.map((m, i) => (
          <button
            key={m}
            onClick={() => { setBirthdayMonth(i + 1); setMonth(i + 1); }}
            aria-pressed={month === i + 1}
            className={`rounded-full px-3.5 py-2 text-xs font-extrabold transition ${
              month === i + 1 ? "bg-gold/40 text-ink ring-2 ring-gold" : "bg-cloud text-ink/60 ring-1 ring-ink/10 hover:text-ink"
            }`}
          >
            {m}
          </button>
        ))}
        {month !== null && (
          <button
            onClick={() => { setBirthdayMonth(null); setMonth(null); }}
            className="rounded-full bg-white px-3.5 py-2 text-xs font-bold text-ink/55 ring-1 ring-ink/10 hover:text-ink"
          >
            ✕ {c.clear}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Club() {
  const { lang } = useI18n();
  const c = C[lang];
  const { user } = useAuth();
  const roars = useRoars();
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-pink/30 via-cloud to-cloud py-24">
        <MotionBackground clip="bg-pajama-party" opacity={0.45} />
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

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mx-auto mt-8 inline-block rounded-[2rem] bg-white/85 px-10 py-6 shadow-xl ring-2 ring-gold/50"
          >
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-amber">{c.roarsLabel}</p>
            <p className="font-display mt-1 text-6xl font-semibold text-ink">🦁 {roars}</p>
          </motion.div>
          <p className="mx-auto mt-4 max-w-md text-xs font-bold text-ink/60">{c.roarsHow}</p>

          {!user && (
            <Link
              to="/register"
              className="mt-8 inline-block rounded-full bg-ink px-10 py-4 font-bold text-cloud shadow-xl transition hover:scale-105"
            >
              {c.join}
            </Link>
          )}
          {user && (
            <p className="mt-6 inline-block rounded-full bg-white/70 px-6 py-3 text-sm font-bold text-ink shadow-sm">
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

      <section className="mx-auto max-w-5xl space-y-10 px-6 pb-8">
        <AvatarPicker />
        <BirthdayPicker />
        <ActivityStickers />
      </section>

      <CollectionAlbum />
    </>
  );
}
