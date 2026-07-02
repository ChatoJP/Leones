import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Bloop from "../components/Bloop";
import FloatingParticles from "../components/FloatingParticles";
import Sticker from "../components/Sticker";
import { useI18n } from "../lib/i18n";
import { useAllProgress } from "../lib/bookclub";
import { bloopBooks } from "../data/bloopBooks";

const COPY = {
  en: {
    eyebrow: "the bloop book club",
    title1: "Read 1 book.",
    title2: "Unlock 1 surprise.",
    sub: "Short illustrated Bloop stories. Finish one, pass the tiny quiz, and unlock what Bloop prepared. (Sincere question: did you really read it? Bloop may ask your parents 😄)",
    why: "\"Bloop\" is the sound Bloop makes when it falls asleep on a book. It happens a lot.",
    read: "Read",
    continue: "Continue",
    done: "Finished ✦",
    pages: "pages",
  },
  pt: {
    eyebrow: "o bloop book club",
    title1: "Lê 1 livro.",
    title2: "Desbloqueia 1 surpresa.",
    sub: "Histórias curtas e ilustradas do Bloop. Acaba uma, passa o mini-quiz, e desbloqueia o que o Bloop preparou. (Pergunta sincera: leste mesmo? O Bloop é capaz de perguntar aos teus pais 😄)",
    why: "\"Bloop\" é o som que o Bloop faz quando adormece em cima de um livro. Acontece muitas vezes.",
    read: "Ler",
    continue: "Continuar",
    done: "Terminado ✦",
    pages: "páginas",
  },
} as const;

export default function BloopBooks() {
  const { lang } = useI18n();
  const c = COPY[lang];
  const progress = useAllProgress();

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-sky/30 via-cloud to-cloud py-20">
        <FloatingParticles count={10} />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <div className="inline-block">
            <Bloop imgClassName="h-28 w-auto" />
          </div>
          <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.25em] text-amber">{c.eyebrow}</p>
          <h1 className="font-display mt-2 text-4xl font-semibold text-ink sm:text-6xl">
            {c.title1} <em className="text-pink-deep">{c.title2}</em>
          </h1>
          <p className="mx-auto mt-4 max-w-xl font-semibold text-ink/60">{c.sub}</p>
          <p className="mx-auto mt-3 max-w-md text-xs font-bold text-ink/55">{c.why}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bloopBooks.map((b, i) => {
            const p = progress[b.slug];
            const status = p?.quizPassed ? "done" : p && p.page > 0 ? "reading" : "new";
            return (
              <motion.div
                key={b.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
              >
                <Link
                  to={`/bloop-books/${b.slug}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-white/70 shadow-md ring-1 ring-white/70 transition hover:-translate-y-1.5 hover:shadow-xl"
                >
                  {status === "done" && (
                    <div className="absolute right-4 top-4 z-10">
                      <Sticker tone="gold" rotate={6}>{c.done}</Sticker>
                    </div>
                  )}
                  <div className="relative overflow-hidden">
                    <img
                      src={b.cover}
                      alt=""
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute bottom-3 left-3 text-3xl drop-shadow">{b.emoji}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="font-display text-xl font-semibold leading-snug text-ink">{b.title[lang]}</h2>
                    <p className="mt-2 flex-1 text-sm font-semibold text-ink/60">{b.blurb[lang]}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-bold text-ink/55">{b.pages.length} {c.pages}</span>
                      <span className="rounded-full bg-ink px-5 py-2 text-sm font-bold text-cloud transition group-hover:scale-105">
                        {status === "reading" ? c.continue : status === "done" ? "↻" : `${c.read} →`}
                      </span>
                    </div>
                    {p && p.page > 0 && !p.quizPassed && (
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-cloud">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sky-deep to-pink-deep"
                          style={{ width: `${Math.min(100, ((p.page + 1) / b.pages.length) * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </>
  );
}
