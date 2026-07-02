import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import Sticker from "./Sticker";
import { confettiBurst } from "../lib/confetti";
import { useI18n } from "../lib/i18n";
import { sparkleChime } from "../lib/sound";
import { products } from "../data/products";

/* ---------------- TV points (gamification, device-local) ---------------- */

const PKEY = "leones-tv-points";
const GKEY = "leones-tv-games";

const readPoints = () => Number(localStorage.getItem(PKEY) ?? 0);
const readDone = (): Record<string, boolean> => {
  try { return JSON.parse(localStorage.getItem(GKEY) ?? "{}"); } catch { return {}; }
};

function award(game: string): number | null {
  const done = readDone();
  if (done[game]) return null;
  done[game] = true;
  localStorage.setItem(GKEY, JSON.stringify(done));
  const n = readPoints() + 1;
  localStorage.setItem(PKEY, String(n));
  return n;
}

/* ---------------- content ---------------- */

type Tab = "funny" | "asmr" | "games" | "drops";

const FUNNY = [
  { src: "/videos/tv/comedy-boop-cooking.mp4", en: "Boop bakes a cake", pt: "O Boop faz um bolo" },
  { src: "/videos/tv/comedy-hide-and-seek.mp4", en: "Hide & seek (Cloudie tried)", pt: "Escondidas (a Cloudie tentou)" },
  { src: "/videos/tv/comedy-boop-vs-bee.mp4", en: "Boop vs. the bee", pt: "Boop vs. a abelha" },
  { src: "/videos/tv/comedy-jelly-dance-fail.mp4", en: "Jelly's dance… attempt", pt: "A Jelly a tentar dançar" },
  { src: "/videos/tv/comedy-prank-war.mp4", en: "Prank war, round 1", pt: "Guerra de partidas, ronda 1" },
  { src: "/videos/tv/comedy-boop-gym.mp4", en: "Leg day at Boop's gym", pt: "Dia de pernas no ginásio do Boop" },
];

const ASMR = [
  { src: "/videos/tv/asmr-jelly-squish.mp4", en: "jelly squish", pt: "squish de gelatina" },
  { src: "/videos/tv/asmr-glitter-pour.mp4", en: "glitter rain", pt: "chuva de glitter" },
  { src: "/videos/tv/asmr-crinkle.mp4", en: "holographic crinkle", pt: "papel holográfico" },
  { src: "/videos/tv/asmr-taps.mp4", en: "glass cap taps", pt: "toques no vidro" },
  { src: "/videos/tv/asmr-cloud-fluff.mp4", en: "fluffing Cloudie", pt: "a fofar a Cloudie" },
];

type Game = {
  id: string;
  src: string;
  title: { en: string; pt: string };
  question: { en: string; pt: string };
  options?: { en: string[]; pt: string[] };
  answer?: number;
  participation?: boolean;
};

const GAMES: Game[] = [
  {
    id: "cup-shuffle",
    src: "/videos/tv/games-cup-shuffle.mp4",
    title: { en: "The cup shuffle", pt: "O jogo dos copos" },
    question: { en: "Where's the gloss? Guess before the reveal!", pt: "Onde está o gloss? Adivinha antes de mostrar!" },
    options: { en: ["Left cup", "Middle cup", "Right cup"], pt: ["Copo da esquerda", "Copo do meio", "Copo da direita"] },
    answer: 1,
  },
  {
    id: "guess-sound",
    src: "/videos/tv/games-guess-sound.mp4",
    title: { en: "Guess the sound", pt: "Adivinha o som" },
    question: { en: "Sound on 🔊 What is it?", pt: "Liga o som 🔊 O que é?" },
    options: { en: ["Glitter pouring", "Rain on a window", "Sugar in a bowl"], pt: ["Glitter a cair", "Chuva na janela", "Açúcar numa taça"] },
    answer: 0,
  },
  {
    id: "find-boop",
    src: "/videos/tv/games-find-boop.mp4",
    title: { en: "Find Boop", pt: "Encontra o Boop" },
    question: { en: "Spot him before the zoom ends — did you?", pt: "Encontra-o antes do zoom acabar — conseguiste?" },
    participation: true,
  },
  {
    id: "freeze-dance",
    src: "/videos/tv/games-freeze-dance.mp4",
    title: { en: "Freeze dance", pt: "Dança congelada" },
    question: { en: "Strike a pose every time they freeze!", pt: "Faz uma pose sempre que eles congelam!" },
    participation: true,
  },
];

const COPY = {
  en: {
    eyebrow: "leones tv",
    title1: "Very serious",
    title2: "television",
    sub: "Comedy, ASMR and games starring the plushies. Occasionally something is for sale. Mostly it's Boop falling over.",
    tabs: { funny: "😂 Funny", asmr: "🎧 ASMR", games: "🎮 Games", drops: "🛍️ Drops" },
    points: (n: number) => `${n} TV point${n === 1 ? "" : "s"}`,
    correct: "Correct! +1 TV point ✦",
    wrong: "Nope! Watch again 👀",
    didIt: "I did it! (+1 point)",
    already: "Point already earned ✦",
    soundOn: "sound on 🔊",
  },
  pt: {
    eyebrow: "leones tv",
    title1: "Televisão muito",
    title2: "séria",
    sub: "Comédia, ASMR e jogos com os plushies. Às vezes há coisas à venda. Na maior parte do tempo é o Boop a cair.",
    tabs: { funny: "😂 Risos", asmr: "🎧 ASMR", games: "🎮 Jogos", drops: "🛍️ Drops" },
    points: (n: number) => `${n} ponto${n === 1 ? "" : "s"} TV`,
    correct: "Certo! +1 ponto TV ✦",
    wrong: "Não! Vê outra vez 👀",
    didIt: "Consegui! (+1 ponto)",
    already: "Ponto já ganho ✦",
    soundOn: "liga o som 🔊",
  },
} as const;

function TvVideo({ src, label, badge }: { src: string; label: string; badge?: string }) {
  return (
    <figure className="w-52 shrink-0 snap-center sm:w-60">
      <div className="relative rounded-[1.9rem] bg-gradient-to-br from-pink via-white to-sky p-[3px] shadow-xl">
        <video
          src={src}
          poster={src.replace("/videos/", "/posters/").replace(".mp4", ".jpg")}
          controls
          loop
          playsInline
          preload="none"
          className="aspect-[9/16] w-full rounded-[1.75rem] bg-ink/5 object-cover"
        />
        {badge && (
          <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-extrabold text-ink shadow">
            {badge}
          </span>
        )}
      </div>
      <figcaption className="mt-2 text-center text-xs font-extrabold text-ink/60">{label}</figcaption>
    </figure>
  );
}

function GameCard({ game }: { game: Game }) {
  const { lang } = useI18n();
  const c = COPY[lang];
  const [state, setState] = useState<"idle" | "right" | "wrong" | "already">("idle");

  const resolve = (won: boolean, e: React.MouseEvent) => {
    if (!won) {
      setState("wrong");
      setTimeout(() => setState("idle"), 1600);
      return;
    }
    const pts = award(game.id);
    if (pts === null) {
      setState("already");
    } else {
      setState("right");
      sparkleChime();
      confettiBurst(e.clientX, e.clientY, 20);
      window.dispatchEvent(new CustomEvent("leones-tv-points"));
    }
  };

  return (
    <div className="w-64 shrink-0 snap-center rounded-[2rem] bg-white/70 p-4 shadow-md ring-1 ring-white/70 sm:w-72">
      <div className="rounded-[1.6rem] bg-gradient-to-br from-gold/60 via-white to-pink p-[3px]">
        <video
          src={game.src}
          poster={game.src.replace("/videos/", "/posters/").replace(".mp4", ".jpg")}
          controls
          playsInline
          preload="none"
          className="aspect-[9/16] w-full rounded-[1.45rem] bg-ink/5 object-cover"
        />
      </div>
      <p className="mt-3 text-sm font-extrabold text-ink">{game.title[lang]}</p>
      <p className="mt-1 text-xs font-bold text-ink/60">{game.question[lang]}</p>
      <AnimatePresence mode="wait">
        {state === "right" || state === "already" ? (
          <motion.p
            key="res"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-3 rounded-full bg-gold/25 px-4 py-2 text-center text-xs font-extrabold text-amber"
          >
            {state === "right" ? c.correct : c.already}
          </motion.p>
        ) : (
          <motion.div key="opts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 flex flex-col gap-1.5">
            {state === "wrong" && (
              <p className="rounded-full bg-pink/40 px-3 py-1.5 text-center text-xs font-extrabold text-ink">{c.wrong}</p>
            )}
            {game.options ? (
              game.options[lang].map((opt, i) => (
                <button
                  key={opt}
                  onClick={(e) => resolve(i === game.answer, e)}
                  className="rounded-full bg-white px-4 py-2 text-xs font-bold text-ink shadow-sm ring-1 ring-ink/10 transition hover:scale-[1.03] hover:ring-pink-deep"
                >
                  {opt}
                </button>
              ))
            ) : (
              <button
                onClick={(e) => resolve(true, e)}
                className="rounded-full bg-ink px-4 py-2 text-xs font-bold text-cloud transition hover:scale-105"
              >
                {c.didIt}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LeonesTvChannel() {
  const { lang, lp } = useI18n();
  const c = COPY[lang];
  const [tab, setTab] = useState<Tab>("funny");
  const [points, setPoints] = useState(readPoints);

  useEffect(() => {
    const refresh = () => setPoints(readPoints());
    window.addEventListener("leones-tv-points", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("leones-tv-points", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const row = (items: Array<{ src: string; en: string; pt: string }>, badge?: string) => (
    <div className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4">
      {items.map((v) => (
        <TvVideo key={v.src} src={v.src} label={v[lang]} badge={badge} />
      ))}
    </div>
  );

  return (
    <section id="tv" className="overflow-hidden py-24">
      <div className="mx-auto max-w-6xl px-6">
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

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {(Object.keys(c.tabs) as Tab[]).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              aria-pressed={tab === k}
              className={`rounded-full px-5 py-2.5 text-sm font-extrabold transition ${
                tab === k ? "bg-ink text-cloud" : "bg-white/80 text-ink/60 ring-1 ring-ink/10 hover:text-ink"
              }`}
            >
              {c.tabs[k]}
            </button>
          ))}
          {points > 0 && (
            <Sticker tone="gold" rotate={3} className="ml-2">🎮 {c.points(points)}</Sticker>
          )}
        </div>

        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.25 }}>
              {tab === "funny" && row(FUNNY)}
              {tab === "asmr" && row(ASMR, c.soundOn)}
              {tab === "games" && (
                <div className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4">
                  {GAMES.map((g) => (
                    <GameCard key={g.id} game={g} />
                  ))}
                </div>
              )}
              {tab === "drops" && (
                <div className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4">
                  <TvVideo src="/videos/collection-film.mp4" label={lang === "pt" ? "O Filme da Coleção" : "The Collection Film"} />
                  {["sleepy-cloud", "photo-shoot", "runway", "handbag", "magic-button", "cloud-cap", "mirror", "gift-box"].map((id) => (
                    <TvVideo key={id} src={`/videos/ad-${id}.mp4`} label={id.replace("-", " ")} />
                  ))}
                  {products.map((p) => (
                    <TvVideo key={p.sku} src={`/videos/${p.sku}.mp4`} label={lp(p).name} />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
