import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCollection } from "../lib/collection";
import { useI18n } from "../lib/i18n";
import { sparkleChime } from "../lib/sound";
import { products } from "../data/products";

const ALBUM_COPY = {
  en: {
    eyebrow: "sticker album",
    title1: "My",
    title2: "collection",
    empty: "Add a gloss to your bag to earn its sticker. Collect all ten.",
    some: (n: number) => `${n} to go. The album is filling up ✦`,
    full: "FULL ALBUM! You collected the whole drop 👑",
    share: "Share my album ↓",
    sharing: "Making it cute…",
  },
  pt: {
    eyebrow: "caderneta de cromos",
    title1: "A minha coleção",
    title2: "",
    empty: "Adiciona um gloss à mala para ganhares o cromo. Coleciona os dez.",
    some: (n: number) => `Faltam ${n}. A caderneta está a encher ✦`,
    full: "CADERNETA COMPLETA! Colecionaste o drop inteiro 👑",
    share: "Partilhar a caderneta ↓",
    sharing: "A ficar fofo…",
  },
} as const;

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

/** Render the album as a shareable 1080×1350 PNG (client-side, no upload). */
async function renderShareCard(collected: Set<string>): Promise<string> {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#c9e4f5");
  bg.addColorStop(0.5, "#f7f5f3");
  bg.addColorStop(1, "#fbd3de");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#3a2e3d";
  ctx.textAlign = "center";
  ctx.font = "700 74px Georgia, serif";
  ctx.fillText("My LeoNes collection", W / 2, 150);
  const count = products.filter((p) => collected.has(p.sku)).length;
  ctx.font = "700 54px Georgia, serif";
  ctx.fillStyle = "#f6b7c8";
  ctx.fillText(`${count} / 10 ✦`, W / 2, 235);

  const cols = 3;
  const cell = 280;
  const gap = 36;
  const gridW = cols * cell + (cols - 1) * gap;
  const startX = (W - gridW) / 2;
  const startY = 320;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const x = startX + (i % cols) * (cell + gap);
    const y = startY + Math.floor(i / cols) * (cell + gap);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, cell, cell, 40);
    ctx.fillStyle = collected.has(p.sku) ? "#ffffff" : "rgba(255,255,255,0.4)";
    ctx.fill();
    if (collected.has(p.sku)) {
      ctx.strokeStyle = "#f0c36b";
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.clip();
      try {
        const img = await loadImage(p.image);
        ctx.drawImage(img, x + 24, y + 24, cell - 48, cell - 48);
      } catch {
        /* leave empty */
      }
    } else {
      ctx.fillStyle = "rgba(58,46,61,0.2)";
      ctx.font = "700 90px Georgia, serif";
      ctx.fillText("?", x + cell / 2, y + cell / 2 + 32);
    }
    ctx.restore();
  }

  ctx.fillStyle = "#3a2e3d";
  ctx.font = "700 40px Georgia, serif";
  ctx.fillText("LeoNes ✦ leones.co", W / 2, H - 70);

  return canvas.toDataURL("image/png");
}

/** Sticker-album strip: which of the ten pieces has this visitor collected? */
export default function CollectionAlbum({ compact = false }: { compact?: boolean }) {
  const { lang } = useI18n();
  const ac = ALBUM_COPY[lang];
  const collected = useCollection();
  const count = products.filter((p) => collected.has(p.sku)).length;
  const [sharing, setSharing] = useState(false);

  const shareAlbum = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const dataUrl = await renderShareCard(collected);
      sparkleChime();
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "my-leones-collection.png";
      a.click();
    } finally {
      setSharing(false);
    }
  };

  return (
    <section className={compact ? "" : "mx-auto max-w-5xl px-6 py-20"}>
      <div className="rounded-[2.5rem] bg-white/70 p-8 shadow-sm ring-1 ring-white/60 backdrop-blur sm:p-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-amber">{ac.eyebrow}</p>
            <h2 className="font-display mt-1 text-3xl font-semibold text-ink">
              {ac.title1} <span translate="no" className="notranslate">LeoNes</span> {ac.title2}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {count > 0 && (
              <button
                onClick={shareAlbum}
                disabled={sharing}
                className="rounded-full bg-ink px-4 py-2 text-xs font-bold text-cloud transition hover:scale-105 disabled:opacity-50"
              >
                {sharing ? ac.sharing : ac.share}
              </button>
            )}
            <p className="font-display text-2xl font-semibold text-pink-deep">
              {count}<span className="text-ink/55">/10</span>
            </p>
          </div>
        </div>
        <p className="mt-2 text-sm font-semibold text-ink/60">
          {count === 0 && ac.empty}
          {count > 0 && count < 10 && ac.some(10 - count)}
          {count === 10 && ac.full}
        </p>
        <div className="mt-6 grid grid-cols-5 gap-3 sm:gap-4">
          {products.map((p) => {
            const owned = collected.has(p.sku);
            return (
              <Link key={p.sku} to={`/products/${p.slug}`} aria-label={`${p.name}${owned ? " — collected" : " — not collected yet"}`}>
                <motion.div
                  initial={false}
                  animate={owned ? { rotate: [0, -6, 4, 0], scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.5 }}
                  className={`flex aspect-square items-center justify-center rounded-2xl transition ${
                    owned
                      ? "bg-white shadow-md ring-2 ring-gold"
                      : "border-2 border-dashed border-ink/15 bg-cloud/60 opacity-60 hover:opacity-100"
                  }`}
                >
                  {owned ? (
                    <img src={p.image} alt="" className="h-4/5 w-4/5 object-contain" loading="lazy" />
                  ) : (
                    <span className="text-xl text-ink/20">?</span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
