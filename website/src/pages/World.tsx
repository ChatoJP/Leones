import { motion } from "framer-motion";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import ActivityStickers from "../components/ActivityStickers";
import FloatingParticles from "../components/FloatingParticles";
import { earnAchievement } from "../lib/achievements";
import { useI18n } from "../lib/i18n";
import { products } from "../data/products";

const W = {
  en: {
    eyebrow: "the world of leones", h1a: "The little one", h1b: "and the gloss.",
    chapters: [
      { title: "Once upon a shelf", body: "Somewhere in a pastel world of clouds and glossy floors lives a tiny pink creature with a cotton-cloud cap. Nobody knows its name yet. Everybody knows what it wants." },
      { title: "The chase", body: "It saw the pH Gloss once — just once — glinting on a podium. It has been running after it ever since. Across runways, through handbags, past gift boxes. It never quite catches it. It never stops trying." },
      { title: "Why we love it", body: "Because wanting something with your whole heart is the most LeoNes thing there is. The chase is the story. The gloss is the dream. You get to own the dream." },
    ],
    films: "Watch the films ▶", castTitle1: "Meet the", castTitle2: "cast",
    castSub: "Ten pieces, each living its own tiny life in the world.",
    fanTitle: "Draw the little one",
    fanBody1: "Fan art wall coming soon. Send your drawing of the mascot to",
    fanBody2: "(with a parent's help) and it might live here forever.",
    fanNote: "Honest note: no submissions yet — this wall starts empty and real.",
  },
  pt: {
    eyebrow: "o mundo leones", h1a: "O pequenino", h1b: "e o gloss.",
    chapters: [
      { title: "Era uma vez numa prateleira", body: "Algures num mundo pastel de nuvens e chãos brilhantes vive uma criaturinha rosa com uma tampa de nuvem de algodão. Ninguém sabe o nome dela. Toda a gente sabe o que ela quer." },
      { title: "A perseguição", body: "Viu o pH Gloss uma vez — só uma — a brilhar num pódio. Anda a correr atrás dele desde então. Por passerelles, dentro de malas, entre caixas de presente. Nunca o apanha. Nunca desiste." },
      { title: "Porque a adoramos", body: "Porque querer algo com o coração todo é a coisa mais LeoNes que existe. A perseguição é a história. O gloss é o sonho. E o sonho pode ser teu." },
    ],
    films: "Ver os filmes ▶", castTitle1: "Conhece o", castTitle2: "elenco",
    castSub: "Dez peças, cada uma a viver a sua vidinha no mundo.",
    fanTitle: "Desenha o pequenino",
    fanBody1: "Mural de fan art em breve. Envia o teu desenho do mascote para",
    fanBody2: "(com ajuda de um adulto) e ele pode ficar aqui para sempre.",
    fanNote: "Nota honesta: ainda sem submissões — este mural começa vazio e verdadeiro.",
  },
} as const;

export default function World() {
  const { lang, lp } = useI18n();
  const w = W[lang];
  // stepping into the World earns the first sticker — everyone starts somewhere
  useEffect(() => { earnAchievement("explorer"); }, []);
  return (
    <>
      {/* hero: the chase scene */}
      <section className="relative overflow-hidden">
        <img
          src="/brand/mascot-chase-scene.webp"
          alt="The LeoNes mascot chasing the pH Gloss through a pink dream world"
          className="h-[60svh] w-full object-cover"
        />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/60 via-transparent to-transparent p-8 sm:p-14">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-gold">{w.eyebrow}</p>
            <h1 className="font-display mt-2 text-4xl font-semibold text-white sm:text-6xl">
              {w.h1a}<br />{w.h1b}
            </h1>
          </div>
        </div>
      </section>

      {/* story chapters */}
      <section className="mx-auto max-w-2xl px-6 py-20">
        {w.chapters.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <span className="font-display text-4xl font-semibold text-pink-deep/30">{i + 1}</span>
            <h2 className="font-display mt-2 text-3xl font-semibold text-ink">{c.title}</h2>
            <p className="mt-3 text-lg font-semibold leading-relaxed text-ink/60">{c.body}</p>
          </motion.div>
        ))}
        <div className="text-center">
          <a
            href="/tv"
            className="rounded-full bg-ink px-8 py-3.5 font-bold text-cloud shadow-lg transition hover:scale-105"
          >
            {w.films}
          </a>
        </div>
      </section>

      {/* the cast: products in their scenes */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky/20 via-cloud to-cloud py-20">
        <FloatingParticles count={8} />
        <div className="relative mx-auto max-w-6xl px-6">
          <h2 className="font-display text-center text-4xl font-semibold text-ink">
            {w.castTitle1} <em className="text-pink-deep">{w.castTitle2}</em>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-center font-semibold text-ink/60">
            {w.castSub}
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {products.map((p, i) => (
              <motion.div
                key={p.sku}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: (i % 5) * 0.06 }}
              >
                <Link to={`/products/${p.slug}`} className="group block overflow-hidden rounded-3xl shadow-md ring-1 ring-white/70">
                  <div className="relative">
                    <img
                      src={`/scenes/${p.sku}.webp`}
                      alt={`${p.name} in its scene`}
                      loading="lazy"
                      className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/60 to-transparent p-3">
                      <p translate="no" className="notranslate text-sm font-extrabold text-white">{p.name}</p>
                      <p className="text-xs font-bold text-white/70">{lp(p).hook}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* fan art invite — honest empty state */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-4xl">🎨</p>
        <h2 className="font-display mt-3 text-3xl font-semibold text-ink">{w.fanTitle}</h2>
        <p className="mx-auto mt-3 max-w-md font-semibold text-ink/60">
          {w.fanBody1}{" "}
          <a href="mailto:hello@leones.co?subject=Fan%20art%20%E2%9C%A6" className="font-bold text-amber hover:underline">
            hello@leones.co
          </a>{" "}
          {w.fanBody2}
        </p>
        <p className="mt-4 text-xs font-bold text-ink/60">
          {w.fanNote}
        </p>
      </section>

      {/* the journey: every play checkpoint, mapped onto the LeoNes world */}
      <section className="relative overflow-hidden py-20">
        <img
          src="/scenes/world-map.webp"
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cloud via-cloud/60 to-cloud" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="mb-8 text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-amber">
              {lang === "pt" ? "a tua viagem" : "your journey"}
            </p>
            <h2 className="font-display mt-2 text-4xl font-semibold text-ink sm:text-5xl">
              {lang === "pt" ? <>O teu caminho pelo <em className="text-pink-deep">mundo</em></> : <>Your path through the <em className="text-pink-deep">world</em></>}
            </h2>
          </div>
          <ActivityStickers variant="path" />
        </div>
      </section>
    </>
  );
}
