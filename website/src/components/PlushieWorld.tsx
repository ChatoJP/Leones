import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import FloatingParticles from "./FloatingParticles";
import Sticker from "./Sticker";
import { useI18n } from "../lib/i18n";

const COPY = {
  en: {
    eyebrow: "the plushie world",
    title1: "Meet the",
    title2: "plushie world",
    sub: "The pH Gloss is the star. These three live around it — and one of them just can't let it go.",
    note: "Fictional plush characters from the LeoNes universe — collectible plush versions are a planned drop.",
    waitTitle: "Want a real Boop? 🧸",
    waitSub: "Join the plush waitlist — first to know when they exist.",
    waitPh: "your@email.com",
    waitBtn: "Tell me first",
    waitDone: "You're on the plush list ✦",
    cast: [
      { img: "/mascots/boop.webp", name: "Boop", role: "always chasing the gloss", personality: "dramatic · fast · obsessed · funny", sticker: "cute enough to chase" },
      { img: "/mascots/cloudie.webp", name: "Cloudie", role: "soft cloud-cap energy", personality: "dreamy · sleepy · sweet", sticker: "cloud-soft energy" },
      { img: "/mascots/jelly.webp", name: "Jelly", role: "sparkle mood keeper", personality: "chaotic · glittery · cute", sticker: "tiny gloss, big mood" },
    ],
  },
  pt: {
    eyebrow: "o mundo plushie",
    title1: "Conhece o",
    title2: "mundo plushie",
    sub: "O pH Gloss é a estrela. Estes três vivem à volta dele — e um deles não consegue largá-lo.",
    note: "Personagens de peluche fictícias do universo LeoNes — versões colecionáveis em peluche são um drop planeado.",
    waitTitle: "Queres um Boop a sério? 🧸",
    waitSub: "Entra na lista de espera dos peluches — és a primeira a saber.",
    waitPh: "teu@email.com",
    waitBtn: "Avisa-me primeiro",
    waitDone: "Estás na lista dos peluches ✦",
    cast: [
      { img: "/mascots/boop.webp", name: "Boop", role: "sempre a perseguir o gloss", personality: "dramático · rápido · obcecado · engraçado", sticker: "fofo demais para não perseguir" },
      { img: "/mascots/cloudie.webp", name: "Cloudie", role: "energia de tampa-nuvem", personality: "sonhadora · dorminhoca · doce", sticker: "energia nuvem-macia" },
      { img: "/mascots/jelly.webp", name: "Jelly", role: "guardiã do mood brilhante", personality: "caótica · glitterosa · fofa", sticker: "gloss pequeno, mood grande" },
    ],
  },
} as const;

function PlushWaitlist({ copy }: { copy: { waitTitle: string; waitSub: string; waitPh: string; waitBtn: string; waitDone: string } }) {
  const { lang } = useI18n();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy || done) return;
    setBusy(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lang, interest: "plush" }),
      });
      if (res.ok) setDone(true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="mx-auto mt-8 max-w-md rounded-[2rem] bg-white/80 p-6 text-center shadow-md ring-1 ring-white/70">
      <p className="font-display text-xl font-semibold text-ink">{copy.waitTitle}</p>
      <p className="mt-1 text-sm font-semibold text-ink/60">{copy.waitSub}</p>
      {done ? (
        <p className="mt-4 rounded-full bg-pink/40 px-5 py-2.5 text-sm font-extrabold text-ink">{copy.waitDone}</p>
      ) : (
        <form onSubmit={submit} className="mt-4 flex items-center gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={copy.waitPh}
            aria-label={copy.waitPh}
            className="w-full rounded-full bg-cloud px-5 py-3 text-sm font-bold text-ink shadow-inner outline-none placeholder:text-ink/55 focus:ring-2 focus:ring-pink-deep"
          />
          <button disabled={busy} className="whitespace-nowrap rounded-full bg-ink px-5 py-3 text-sm font-bold text-cloud transition hover:scale-105 disabled:opacity-50">
            {copy.waitBtn}
          </button>
        </form>
      )}
    </div>
  );
}

export default function PlushieWorld() {
  const { lang } = useI18n();
  const c = COPY[lang];
  return (
    <section id="plushies" className="relative overflow-hidden bg-gradient-to-b from-pink/25 via-cloud to-cloud py-24">
      <FloatingParticles count={10} />
      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-amber">{c.eyebrow}</p>
          <h2 className="font-display mt-3 text-4xl font-semibold text-ink sm:text-6xl">
            {c.title1} <span translate="no" className="notranslate">LeoNes</span>{" "}
            <em className="text-pink-deep">{c.title2}</em>
          </h2>
          <p className="mx-auto mt-4 max-w-lg font-semibold text-ink/60">{c.sub}</p>
        </motion.div>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {c.cast.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative rounded-[2.5rem] bg-white/70 p-8 text-center shadow-md ring-1 ring-white/70 backdrop-blur"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Sticker tone={i === 0 ? "pink" : i === 1 ? "sky" : "gold"} rotate={i % 2 ? 3 : -3} wiggle>
                  {m.sticker}
                </Sticker>
              </div>
              <motion.img
                src={m.img}
                alt={`${m.name} — LeoNes plush character`}
                loading="lazy"
                animate={{ y: [0, -8, 0], rotate: i % 2 ? [1.5, -1.5, 1.5] : [-1.5, 1.5, -1.5] }}
                transition={{ duration: 3.5 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto mt-4 h-44 w-44 object-contain drop-shadow-xl"
              />
              <h3 translate="no" className="notranslate font-display mt-4 text-2xl font-semibold text-ink">
                {m.name}
              </h3>
              <p className="mt-1 text-sm font-bold text-pink-deep">{m.role}</p>
              <p className="mt-2 text-xs font-bold text-ink/60">{m.personality}</p>
            </motion.div>
          ))}
        </div>

        <img
          src="/mascots/group.webp"
          alt="Boop, Cloudie and Jelly gathered around the pH Gloss"
          loading="lazy"
          className="mx-auto mt-12 w-full max-w-3xl rounded-[2.5rem] shadow-2xl ring-8 ring-white/70"
        />
        <p className="mt-4 text-center text-xs font-bold text-ink/55">{c.note}</p>
        <PlushWaitlist copy={c} />
      </div>
    </section>
  );
}
