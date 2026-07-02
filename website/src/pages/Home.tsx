import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AmbientHero from "../components/AmbientHero";
import Boop from "../components/Boop";
import CollectionAlbum from "../components/CollectionAlbum";
import MoodWall from "../components/MoodWall";
import PlushieWorld from "../components/PlushieWorld";
import Sticker from "../components/Sticker";
import ForYou from "../components/ForYou";
import HeartButton from "../components/HeartButton";
import FloatingParticles from "../components/FloatingParticles";
import GlossQuiz from "../components/GlossQuiz";
import LeonesTvChannel from "../components/LeonesTvChannel";
import { useCart } from "../context/CartContext";
import { confettiFromEvent } from "../lib/confetti";
import { useI18n } from "../lib/i18n";
import { bundles, products, type Product } from "../data/products";

const HOME_COPY = {
  en: {
    heroLine1: "YOUR PINK",
    heroLine2: "exists.",
    heroSub: "Goes on clear. Designed to bloom into a pink that feels like yours.",
    heroGet: "Get pH Gloss —",
    heroWatch: "watch it turn pink ↓",
    stickerHero: "cute enough to chase",
    heroMicro: "Cute, giftable and made to feel special.",
    scrollTitle1: "Made for the",
    scrollTitle2: "scroll",
    bagSad: "Boop looked everywhere. The bag is empty.",
    bagCute: "Your bag is getting cuter ✦",
    successBoop: "Boop found your gloss!",
    chip1: "✦ Gloss Collection 01",
    chip2: "💗 clear-to-pink inspired",
    marquee: ["clear to pink", "ph magic", "10-piece drop", "gift-ready packaging", "early concept drop"],
    addToBag: "Add to Bag",
    inTheBag: "In the Bag ✓",
    plusBag: "+ Bag",
    tpEyebrow: "the party trick",
    tpTitle1: "Watch it",
    tpTitle2: "turn pink.",
    tpBody: "Drag the slider. Clear from the tube, blooming pink on the other side — the finish the collection is designed around.",
    tpLeft: "in the tube",
    tpRight: "on you 💗",
    dropEyebrow: "ten pieces · one drop",
    dropTitle1: "The",
    dropTitle2: "Drop",
    dropSub: "Every piece hides one real moment of magic. Collect your favorites — or all ten.",
    bundleTag: "GIFT-READY 🎁",
    bundleNote: "pH Gloss + Jelly Mask + Glitter Gloss",
    bundleAdd: "Add the Trio",
    unbEyebrow: "the unboxing",
    unbTitle1: "Every order is",
    unbTitle2: "a gift.",
    unbBody: "Pink box. Satin ribbon. A note written for you. Collectible stickers and a golden lioness charm hiding inside. Filming it is basically mandatory.",
    unbB1: "✦ Collectible sticker sheet in every box",
    unbB2: "✦ Golden lioness charm — new design each drop",
    unbB3: "✦ Holographic crinkle, zero boring packaging",
    unbGet: "Get yours —",
    parEyebrow: "for parents",
    parTitle: "The boring section.",
    parTitle2: "On purpose.",
    parBody: "Magic is for them. Honesty is for you: everything below will be verified and published before anything is publicly sold.",
    parPoints: [
      ["Dermatologist testing", "Pending verification before public launch."],
      ["Age guidance", "Pending verification before public launch."],
      ["Ingredients", "Full INCI list will be published before launch."],
      ["Regulatory status", "To be confirmed with the responsible person (EU)."],
    ],
    chEyebrow: "the challenge",
    chTitle1: "Boop it. Film it.",
    chTitle2: "Send it.",
    chBody: "#JellyBoop is taking over. Duet us, tag @leones — best boops get featured (and a surprise box).",
    chHooks: ["do NOT trust the jelly", "team blue or team pink?", "main character energy"],
    tvEyebrow: "leones tv",
    tvTitle1: "Watch the",
    tvTitle2: "gloss",
    tvTitle3: "live its life.",
    tvSub: "Nine little films starring the pH Gloss. Sound on — it squeaks.",
    tvDrop: "The whole Drop, in motion",
    tvTitles: ["The Collection Film", "The Wake-Up", "The Photo Shoot", "The Runway", "The Handbag", "The Magic Button", "The Cloud Cap", "The Mirror", "The Gift Box", "The Original"],
    famEyebrow: "the family portrait",
    famTitle: "All ten. One shelf.",
    famCta: "Start collecting",
    revTitle1: "Early concept",
    revTitle2: "drop",
    revNone: "No reviews yet.",
    revBody: "This is the first LeoNes collection. Reviews open with the first public drop — no fake stars here, ever.",
    ctaTitle1: "Find",
    ctaTitle2: "your",
    ctaTitle3: "pink.",
    ctaSub: "Gloss Collection 01. Ten pieces. One is already yours.",
    ctaBtn: "Shop the Drop",
    stickySub: "· early concept drop",
    badges: { "LN-LIP-001": "THE ICON", "LN-LIP-003": "CAMERA FAVE", "LN-LIP-004": "💙 vs 💗", "LN-LIP-005": "GIFT PICK", "LN-LIP-008": "#JELLYBOOP", "LN-LIP-009": "BESTIE PICK" } as Record<string, string>,
    yourMatch: "YOUR MATCH ✦",
  },
  pt: {
    heroLine1: "O TEU ROSA",
    heroLine2: "existe.",
    heroSub: "Sai transparente. Desenhado para florescer num rosa que parece teu.",
    heroGet: "Levar o pH Gloss —",
    heroWatch: "vê-lo ficar rosa ↓",
    stickerHero: "fofo demais para não perseguir",
    heroMicro: "Fofo, para oferecer e feito para ser especial.",
    scrollTitle1: "Feito para o",
    scrollTitle2: "scroll",
    bagSad: "O Boop procurou em todo o lado. A mala está vazia.",
    bagCute: "A tua mala está a ficar mais fofa ✦",
    successBoop: "O Boop encontrou o teu gloss!",
    chip1: "✦ Gloss Collection 01",
    chip2: "💗 inspirado em transparente-para-rosa",
    marquee: ["transparente para rosa", "magia ph", "drop de 10 peças", "embalagem de presente", "drop de conceito"],
    addToBag: "Adicionar à Mala",
    inTheBag: "Na Mala ✓",
    plusBag: "+ Mala",
    tpEyebrow: "o truque de festa",
    tpTitle1: "Vê-o ficar",
    tpTitle2: "rosa.",
    tpBody: "Arrasta o slider. Transparente no tubo, a florescer rosa do outro lado — o acabamento à volta do qual a coleção foi desenhada.",
    tpLeft: "no tubo",
    tpRight: "em ti 💗",
    dropEyebrow: "dez peças · um drop",
    dropTitle1: "O",
    dropTitle2: "Drop",
    dropSub: "Cada peça esconde um momento de magia. Coleciona as tuas favoritas — ou as dez.",
    bundleTag: "PRONTO A OFERECER 🎁",
    bundleNote: "pH Gloss + Jelly Mask + Glitter Gloss",
    bundleAdd: "Levar o Trio",
    unbEyebrow: "o unboxing",
    unbTitle1: "Cada encomenda é",
    unbTitle2: "um presente.",
    unbBody: "Caixa rosa. Fita de cetim. Um cartão escrito para ti. Autocolantes colecionáveis e um amuleto de leoa dourado escondido lá dentro. Filmar é praticamente obrigatório.",
    unbB1: "✦ Folha de autocolantes em cada caixa",
    unbB2: "✦ Amuleto de leoa dourado — design novo em cada drop",
    unbB3: "✦ Papel holográfico, zero embalagens aborrecidas",
    unbGet: "Leva o teu —",
    parEyebrow: "para os pais",
    parTitle: "A secção aborrecida.",
    parTitle2: "De propósito.",
    parBody: "A magia é para elas. A honestidade é para vocês: tudo abaixo será verificado e publicado antes de qualquer venda pública.",
    parPoints: [
      ["Testes dermatológicos", "Verificação pendente antes do lançamento público."],
      ["Idade recomendada", "Verificação pendente antes do lançamento público."],
      ["Ingredientes", "A lista INCI completa será publicada antes do lançamento."],
      ["Estado regulatório", "A confirmar com a pessoa responsável (UE)."],
    ],
    chEyebrow: "o desafio",
    chTitle1: "Boop. Filma.",
    chTitle2: "Envia.",
    chBody: "O #JellyBoop está a conquistar tudo. Faz duet, marca @leones — os melhores boops são destacados (e recebem uma caixa surpresa).",
    chHooks: ["NÃO confies na gelatina", "team azul ou team rosa?", "energia de protagonista"],
    tvEyebrow: "leones tv",
    tvTitle1: "Vê o",
    tvTitle2: "gloss",
    tvTitle3: "a viver a vida dele.",
    tvSub: "Nove pequenos filmes com o pH Gloss. Liga o som — ele chia.",
    tvDrop: "O Drop inteiro, em movimento",
    tvTitles: ["O Filme da Coleção", "O Acordar", "A Sessão Fotográfica", "A Passerelle", "A Mala", "O Botão Mágico", "A Tampa-Nuvem", "O Espelho", "A Caixa de Presente", "O Original"],
    famEyebrow: "o retrato de família",
    famTitle: "As dez. Uma prateleira.",
    famCta: "Começar a colecionar",
    revTitle1: "Drop de",
    revTitle2: "conceito",
    revNone: "Ainda sem reviews.",
    revBody: "Esta é a primeira coleção LeoNes. As reviews abrem com o primeiro drop público — aqui nunca há estrelas falsas.",
    ctaTitle1: "Encontra",
    ctaTitle2: "o teu",
    ctaTitle3: "rosa.",
    ctaSub: "Gloss Collection 01. Dez peças. Uma já é tua.",
    ctaBtn: "Ver o Drop",
    stickySub: "· drop de conceito",
    badges: { "LN-LIP-001": "O ÍCONE", "LN-LIP-003": "QUERIDO DA CÂMARA", "LN-LIP-004": "💙 vs 💗", "LN-LIP-005": "PRENDA TOP", "LN-LIP-008": "#JELLYBOOP", "LN-LIP-009": "ESCOLHA DA BESTIE" } as Record<string, string>,
    yourMatch: "O TEU MATCH ✦",
  },
} as const;

function AddToBag({ label, big = false, items = [products[0]] }: {
  label?: string;
  big?: boolean;
  items?: Product[];
}) {
  const { add } = useCart();
  const { lang } = useI18n();
  const hc = HOME_COPY[lang];
  const [popped, setPopped] = useState(false);
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        confettiFromEvent(e);
        items.forEach((p) => add(p));
        setPopped(true);
        setTimeout(() => setPopped(false), 900);
      }}
      className={`rounded-full bg-ink font-bold text-cloud shadow-lg shadow-ink/15 transition hover:scale-105 ${
        big ? "px-10 py-4 text-base" : "px-6 py-3 text-sm"
      }`}
    >
      {popped ? hc.inTheBag : (label ?? hc.addToBag)}
    </motion.button>
  );
}

function GradientBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="blob absolute -top-32 -left-32 h-[34rem] w-[34rem] rounded-full bg-sky/60 blur-3xl" />
      <div className="blob absolute top-32 -right-40 h-[38rem] w-[38rem] rounded-full bg-pink/60 blur-3xl" style={{ animationDelay: "-6s" }} />
      <div className="blob absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-gold/20 blur-3xl" style={{ animationDelay: "-11s" }} />
    </div>
  );
}

/* ================= 0 · THE CHASE (hero background) ================= */

function ChaseLoop() {
  // The LeoNes mascot forever chasing the pH Gloss across the middle of the hero.
  const LOOP = 14;
  return (
    <div
      className="chase-layer pointer-events-none absolute inset-x-0 top-1/2 z-0 h-32 -translate-y-1/2 sm:h-44"
      aria-hidden="true"
    >
      {/* the gloss, escaping */}
      <motion.img
        src="/products/LN-LIP-001.webp"
        alt=""
        initial={{ x: "-20vw" }}
        animate={{ x: "115vw" }}
        transition={{ duration: LOOP, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-8 h-20 w-auto opacity-90 sm:h-32"
        style={{ rotate: "14deg" }}
      />
      {/* sparkle trail between them */}
      <motion.span
        initial={{ x: "-28vw" }}
        animate={{ x: "107vw" }}
        transition={{ duration: LOOP, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-20 text-xl text-gold opacity-70"
      >
        ✦ ✧ ✦
      </motion.span>
      {/* the mascot, in hot pursuit */}
      <motion.div
        initial={{ x: "-36vw" }}
        animate={{ x: "99vw" }}
        transition={{ duration: LOOP, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0"
      >
        <motion.img
          src="/brand/mascot-run.webp"
          alt=""
          animate={{ y: [0, -12, 0], rotate: [-3, 3, -3] }}
          transition={{ duration: 0.45, repeat: Infinity, ease: "easeInOut" }}
          className="h-28 w-auto sm:h-36"
        />
      </motion.div>
    </div>
  );
}

/* ================= 1 · CAMPAIGN HERO ================= */

function Hero() {
  const hero = products[0];
  const { lang } = useI18n();
  const hc = HOME_COPY[lang];
  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <GradientBackdrop />
      <AmbientHero />
      <FloatingParticles count={16} />
      <ChaseLoop />

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-6 pb-8 pt-6 text-center">
        {/* giant editorial type, product punches through it */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-display pointer-events-none relative z-0 select-none text-[19vw] font-semibold leading-[0.82] tracking-tight text-ink sm:text-[13vw]"
        >
          {hc.heroLine1}
          <br />
          <em className="text-pink-deep">{hc.heroLine2}</em>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.25 }}
          className="relative z-10 -mt-[16vw] sm:-mt-[9vw]"
        >
          <motion.img
            src={hero.image}
            alt={hero.name}
            animate={{ y: [0, -16, 0], rotate: [0, 1.2, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="mx-auto w-[68vw] max-w-[26rem] sm:w-[30vw]"
          />
          {/* floating proof chips */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            className="absolute -left-10 top-1/4 hidden rounded-2xl bg-white/80 px-4 py-2 text-xs font-extrabold text-ink shadow-xl backdrop-blur sm:block"
          >
            {hc.chip1}
          </motion.div>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
            className="absolute -right-12 bottom-1/4 hidden rounded-2xl bg-white/80 px-4 py-2 text-xs font-extrabold text-ink shadow-xl backdrop-blur sm:block"
          >
            {hc.chip2}
          </motion.div>
          {/* Boop cameo — boopable! */}
          <div className="absolute -bottom-6 -left-14 sm:-left-24">
            <Boop imgClassName="h-24 w-auto sm:h-36" />
          </div>
          <div className="absolute -bottom-2 right-2 sm:-right-10">
            <Sticker tone="pink" rotate={6} wiggle>{hc.stickerHero}</Sticker>
          </div>
          {/* rotating sticker */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute -top-6 right-0 flex h-24 w-24 items-center justify-center sm:-right-8"
          >
            <svg viewBox="0 0 100 100" className="h-full w-full">
              <defs>
                <path id="circ" d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
              </defs>
              <text className="fill-ink text-[11px] font-extrabold uppercase tracking-[0.2em]">
                <textPath href="#circ">gloss collection 01 · out now ·</textPath>
              </text>
            </svg>
            <span className="absolute text-2xl">✦</span>
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="relative z-10 mt-6 max-w-md text-lg font-bold text-ink/60"
        >
          {hc.heroSub}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          className="relative z-10 mt-7 flex flex-wrap items-center justify-center gap-4"
        >
          <AddToBag big label={`${hc.heroGet} €${hero.price}`} />
          <a
            href="#turnpink"
            className="rounded-full bg-white/80 px-8 py-4 font-bold text-ink shadow-md backdrop-blur transition hover:scale-105"
          >
            {hc.heroWatch}
          </a>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="relative z-10 mt-4 text-xs font-bold text-ink/60"
        >
          {hc.heroMicro}
        </motion.p>
      </div>

      <div className="relative border-y border-ink/10 bg-white/50 py-3 backdrop-blur">
        <div className="marquee-track flex w-max gap-8 whitespace-nowrap text-sm font-extrabold uppercase tracking-[0.25em] text-ink/60">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="flex gap-8">
              {hc.marquee.map((m) => (
                <span key={m} className="flex gap-8">
                  <span>{m}</span><span className="text-gold">✦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= 2 · WATCH IT TURN PINK (interactive) ================= */

function TurnPink() {
  const { lang } = useI18n();
  const hc = HOME_COPY[lang];
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const update = (clientX: number) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    setPos(Math.min(96, Math.max(4, ((clientX - box.left) / box.width) * 100)));
  };

  useEffect(() => {
    const move = (e: PointerEvent) => dragging.current && update(e.clientX);
    const up = () => (dragging.current = false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  return (
    <section id="turnpink" className="relative overflow-hidden py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-amber">
            {hc.tpEyebrow}
          </p>
          <h2 className="font-display mt-3 text-5xl font-semibold leading-tight text-ink sm:text-6xl">
            {hc.tpTitle1}
            <br />
            <em className="text-pink-deep">{hc.tpTitle2}</em>
          </h2>
          <p className="mt-5 max-w-md text-lg font-semibold text-ink/60">
            {hc.tpBody}
          </p>
          <div className="mt-8 flex items-center gap-5">
            <span className="font-display text-3xl font-semibold text-ink">€14</span>
            <AddToBag />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <div
            ref={ref}
            onPointerDown={(e) => {
              dragging.current = true;
              update(e.clientX);
            }}
            className="relative aspect-square cursor-ew-resize touch-none select-none overflow-hidden rounded-[2.5rem] shadow-2xl ring-8 ring-white/70"
          >
            <img src="/swatches/LN-LIP-002.webp" alt="clear gloss swatch" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
            <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
              <img src="/swatches/LN-LIP-001.webp" alt="pink gloss swatch" className="h-full w-full object-cover" draggable={false} />
            </div>
            <div className="absolute inset-y-0 z-10 w-1 bg-white shadow-lg" style={{ left: `${pos}%` }}>
              <span className="absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-sm font-black text-ink shadow-xl">
                ⇄
              </span>
            </div>
            <span className="absolute left-5 top-5 rounded-full bg-white/80 px-3 py-1 text-xs font-extrabold text-ink backdrop-blur">
              {hc.tpLeft}
            </span>
            <span className="absolute right-5 top-5 rounded-full bg-pink px-3 py-1 text-xs font-extrabold text-ink">
              {hc.tpRight}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ================= 3 · THE DROP (mini landing pages) ================= */

function DropCard({ p, index }: { p: Product; index: number }) {
  const { lang, lp } = useI18n();
  const hc = HOME_COPY[lang];
  const d = lp(p);
  const tint = p.tint === "sky" ? "from-sky/50 via-sky/20" : "from-pink/50 via-pink/20";
  const badge = localStorage.getItem("leones-quiz-match") === p.sku ? hc.yourMatch : hc.badges[p.sku];
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: (index % 2) * 0.1 }}
    >
      <Link
        to={`/products/${p.slug}`}
        className={`group relative flex h-full flex-col overflow-hidden rounded-[2.5rem] bg-gradient-to-b ${tint} to-white/80 shadow-md ring-1 ring-white/70 backdrop-blur transition duration-300 hover:-translate-y-2 hover:shadow-2xl`}
      >
        {badge && (
          <motion.span
            animate={{ rotate: [-3, 3, -3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-6 top-6 z-10 rounded-full bg-ink px-4 py-1.5 text-[11px] font-extrabold tracking-wider text-cloud shadow-lg"
          >
            {badge}
          </motion.span>
        )}
        <HeartButton sku={p.sku} className="absolute left-6 top-6 z-10" />

        {/* hook */}
        <p className="px-8 pt-8 text-sm font-extrabold uppercase tracking-wider text-ink/60">
          "{d.hook}"
        </p>

        {/* oversized product */}
        <div className="relative -my-2 flex items-center justify-center px-6">
          <img
            src={p.image}
            alt={p.name}
            loading="lazy"
            className="w-full max-w-[22rem] transition duration-500 group-hover:scale-105 group-hover:rotate-1"
          />
          {/* texture swatch peeking */}
          <img
            src={p.swatch}
            alt=""
            loading="lazy"
            className="absolute bottom-2 left-6 h-20 w-20 rounded-full object-cover shadow-xl ring-4 ring-white transition duration-500 group-hover:scale-110 group-hover:-rotate-6"
          />
        </div>

        {/* info */}
        <div className="mt-auto p-8 pt-2">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-2xl font-semibold text-ink">{p.name}</h3>
            <span className="font-display text-2xl font-semibold text-amber">€{p.price}</span>
          </div>
          <p className="mt-1 text-sm font-bold text-ink/60">{d.magic}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {d.chips.map((c) => (
              <span key={c} className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-extrabold text-ink/70 shadow-sm">
                {c}
              </span>
            ))}
            <div className="ml-auto">
              <AddToBag label={hc.plusBag} items={[p]} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function Drop() {
  const { lang } = useI18n();
  const hc = HOME_COPY[lang];
  return (
    <section id="drop" className="relative overflow-hidden py-24">
      <GradientBackdrop />
      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-amber">
            {hc.dropEyebrow}
          </p>
          <h2 className="font-display mt-3 text-5xl font-semibold text-ink sm:text-7xl">
            {hc.dropTitle1} <em className="text-pink-deep">{hc.dropTitle2}</em>
          </h2>
          <p className="mx-auto mt-4 max-w-sm font-semibold text-ink/60">
            {hc.dropSub}
          </p>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-2">
          {products.map((p, i) => (
            <DropCard key={p.slug} p={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= 4 · BUNDLE ================= */

function Bundle() {
  const { lang, lp } = useI18n();
  const hc = HOME_COPY[lang];
  const trio = [products[0], products[7], products[2]];
  const bundle = bundles[0];
  const wasPrice = trio.reduce((sum, x) => sum + x.price, 0);
  return (
    <section className="px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
        className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 overflow-hidden rounded-[3rem] bg-gradient-to-br from-sky via-cloud to-pink p-10 shadow-2xl sm:flex-row sm:p-16"
      >
        <FloatingParticles count={8} />
        <div className="relative flex -space-x-10">
          {trio.map((p, i) => (
            <motion.img
              key={p.sku}
              src={p.image}
              alt={p.name}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
              className="h-40 w-40 rounded-3xl bg-white object-contain p-2 shadow-2xl ring-4 ring-white sm:h-52 sm:w-52"
              style={{ rotate: `${(i - 1) * 8}deg` }}
            />
          ))}
        </div>
        <div className="relative text-center sm:text-left">
          <span className="rounded-full bg-white/70 px-4 py-1.5 text-xs font-extrabold tracking-wider text-amber backdrop-blur">
            {hc.bundleTag}
          </span>
          <h2 translate="no" className="notranslate font-display mt-4 text-4xl font-semibold text-ink sm:text-5xl">
            {bundle ? bundle.name : "The Viral Trio"}
          </h2>
          <p className="mt-2 font-bold text-ink/60">
            {hc.bundleNote}
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 sm:justify-start">
            <span className="font-display text-4xl font-semibold text-ink">€{bundle ? bundle.price : 36}</span>
            <span className="text-xl font-bold text-ink/55 line-through">€{wasPrice}</span>
            {bundle && <AddToBag big label={hc.bundleAdd} items={[bundle]} />}
          </div>
          {bundle && (
            <p className="mt-2 text-xs font-bold text-ink/60">{lp(bundle).magic}</p>
          )}
        </div>
      </motion.div>
    </section>
  );
}

/* ================= 4b · THE UNBOXING ================= */

function Unboxing() {
  const { lang } = useI18n();
  const hc = HOME_COPY[lang];
  return (
    <section className="relative overflow-hidden py-24">
      <GradientBackdrop />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-amber">{hc.unbEyebrow}</p>
          <h2 className="font-display mt-3 text-5xl font-semibold leading-tight text-ink sm:text-6xl">
            {hc.unbTitle1}
            <br />
            <em className="text-pink-deep">{hc.unbTitle2}</em>
          </h2>
          <p className="mt-5 max-w-md text-lg font-semibold text-ink/60">
            {hc.unbBody}
          </p>
          <ul className="mt-6 space-y-2 text-sm font-bold text-ink/70">
            <li>{hc.unbB1}</li>
            <li>{hc.unbB2}</li>
            <li>{hc.unbB3}</li>
          </ul>
          <div className="mt-8">
            <AddToBag big label={`${hc.unbGet} €${products[0].price}`} />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="relative mx-auto flex max-w-md items-end justify-center"
        >
          <img
            src="/brand/unboxing.webp"
            alt="LeoNes unboxing: pink box with ribbon, stickers, charm and pH Gloss"
            className="w-full rounded-[2.5rem] shadow-2xl ring-8 ring-white/70"
          />
          <video
            src="/videos/unboxing.mp4"
            poster="/posters/unboxing.jpg"
            controls
            muted
            loop
            playsInline
            preload="none"
            className="absolute -bottom-8 -right-4 w-40 rounded-3xl shadow-2xl ring-4 ring-white sm:-right-10 sm:w-48"
          />
        </motion.div>
      </div>
    </section>
  );
}

/* ================= 5 · PARENTS ================= */

function Parents() {
  const { lang } = useI18n();
  const hc = HOME_COPY[lang];
  const points = hc.parPoints;
  return (
    <section id="parents" className="bg-white/70 py-24">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-amber">{hc.parEyebrow}</p>
        <h2 className="font-display mt-3 text-4xl font-semibold text-ink sm:text-5xl">
          {hc.parTitle} <em className="text-pink-deep">{hc.parTitle2}</em>
        </h2>
        <p className="mx-auto mt-4 max-w-lg font-semibold text-ink/60">
          {hc.parBody}
        </p>
        <div className="mt-12 grid gap-4 text-left sm:grid-cols-2">
          {points.map(([title, body]) => (
            <div key={title} className="flex gap-4 rounded-3xl bg-cloud p-6">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky text-sm font-black text-ink">✓</span>
              <div>
                <p className="font-bold text-ink">{title}</p>
                <p className="mt-1 text-sm font-semibold text-ink/60">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= 6 · CHALLENGE ================= */

function Challenge() {
  const { lang } = useI18n();
  const hc = HOME_COPY[lang];
  const clips = [
    { src: "/videos/LN-LIP-008.mp4", hook: hc.chHooks[0], tag: "#JellyBoop" },
    { src: "/videos/LN-LIP-004.mp4", hook: hc.chHooks[1], tag: "#TeamBlueTeamPink" },
    { src: "/videos/LN-LIP-003.mp4", hook: hc.chHooks[2], tag: "#GlitterFreeze" },
  ];
  return (
    <section id="challenge" className="relative overflow-hidden bg-gradient-to-b from-pink/30 via-cloud to-sky/30 py-24">
      <FloatingParticles count={10} />
      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-amber">{hc.chEyebrow}</p>
        <h2 className="font-display mt-3 text-4xl font-semibold text-ink sm:text-6xl">
          {hc.chTitle1} <em className="text-pink-deep">{hc.chTitle2}</em>
        </h2>
        <p className="mx-auto mt-4 max-w-md font-semibold text-ink/60">
          {hc.chBody}
        </p>
        <div className="mt-14 flex flex-wrap items-end justify-center gap-6">
          {clips.map((c, i) => (
            <motion.div
              key={c.tag}
              initial={{ opacity: 0, y: 40, rotate: (i - 1) * 4 }}
              whileInView={{ opacity: 1, y: 0, rotate: (i - 1) * 3 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className={`relative w-56 overflow-hidden rounded-[2rem] shadow-2xl ring-4 ring-white/80 ${i === 1 ? "z-10 sm:w-64" : ""}`}
            >
              <LazyAutoVideo src={c.src} />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-4 text-left">
                <p className="text-sm font-extrabold text-white">{c.hook}</p>
                <p className="mt-1 text-xs font-bold text-white/70">{c.tag}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= 6c · THE FAMILY ================= */

function Family() {
  const { lang } = useI18n();
  const hc = HOME_COPY[lang];
  return (
    <section className="px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[3rem] shadow-2xl"
      >
        <img
          src="/brand/family.webp"
          alt="The complete LeoNes Gloss Collection 01 arranged like a family portrait"
          loading="lazy"
          decoding="async"
          className="w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 bg-gradient-to-t from-ink/60 to-transparent p-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-gold">{hc.famEyebrow}</p>
            <h2 className="font-display mt-1 text-3xl font-semibold text-white sm:text-5xl">
              {hc.famTitle}
            </h2>
          </div>
          <a
            href="#drop"
            className="rounded-full bg-white px-7 py-3 font-bold text-ink shadow-lg transition hover:scale-105"
          >
            {hc.famCta}
          </a>
        </div>
      </motion.div>
    </section>
  );
}

/** Autoplaying video that only loads + plays when scrolled into view. */
function LazyAutoVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      src={src}
      poster={src.replace("/videos/", "/posters/").replace(".mp4", ".jpg")}
      muted
      loop
      playsInline
      preload="none"
      className="aspect-[9/16] w-full object-cover"
    />
  );
}

/* ================= 7 · REVIEWS ================= */

function Reviews() {
  const { lang } = useI18n();
  const hc = HOME_COPY[lang];
  return (
    <section className="py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="font-display text-4xl font-semibold text-ink sm:text-5xl">
          {hc.revTitle1} <em className="text-pink-deep">{hc.revTitle2}</em>
        </h2>
        <div className="mt-10 rounded-[2rem] bg-white/70 p-10 shadow-sm ring-1 ring-white/60 backdrop-blur">
          <p className="text-3xl">✦</p>
          <p className="font-display mt-3 text-2xl font-semibold text-ink">{hc.revNone}</p>
          <p className="mx-auto mt-2 max-w-sm text-sm font-semibold text-ink/60">
            {hc.revBody}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ================= 8 · FINAL CTA ================= */

function FinalCta() {
  const { lang } = useI18n();
  const hc = HOME_COPY[lang];
  return (
    <section className="px-6 pb-28">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[3rem] bg-gradient-to-br from-sky via-cloud to-pink px-8 py-24 text-center shadow-2xl"
      >
        <FloatingParticles count={10} />
        <h2 className="font-display relative text-6xl font-semibold text-ink sm:text-8xl">
          {hc.ctaTitle1} <em className="text-pink-deep">{hc.ctaTitle2}</em> {hc.ctaTitle3}
        </h2>
        <p className="relative mx-auto mt-5 max-w-sm font-bold text-ink/60">
          {hc.ctaSub}
        </p>
        <div className="relative mt-10 flex justify-center">
          <a href="#drop" className="rounded-full bg-ink px-12 py-5 text-lg font-bold text-cloud shadow-xl transition hover:scale-105">
            {hc.ctaBtn}
          </a>
        </div>
      </motion.div>
    </section>
  );
}

/* ================= 9 · STICKY ADD-TO-BAG ================= */

function StickyBar() {
  const { lang } = useI18n();
  const hc = HOME_COPY[lang];
  const [show, setShow] = useState(false);
  const hero = products[0];
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 900);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-x-0 bottom-4 z-50 px-4"
        >
          <div className="mx-auto flex max-w-xl items-center gap-4 rounded-full bg-white/80 p-2.5 pl-4 shadow-2xl ring-1 ring-white/70 backdrop-blur-xl">
            <img src={hero.image} alt="" className="h-11 w-11 rounded-full bg-white object-contain ring-2 ring-sky" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-ink">pH Gloss Clear</p>
              <p className="text-xs font-bold text-ink/60">€{hero.price} {hc.stickySub}</p>
            </div>
            <AddToBag />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <TurnPink />
      <Drop />
      <PlushieWorld />
      <MoodWall />
      <GlossQuiz />
      <ForYou />
      <CollectionAlbum />
      <Bundle />
      <Unboxing />
      <Parents />
      <Challenge />
      <LeonesTvChannel />
      <Family />
      <Reviews />
      <FinalCta />
      <StickyBar />
    </>
  );
}
