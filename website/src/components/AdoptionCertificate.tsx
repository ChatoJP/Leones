import { useState } from "react";
import { useI18n } from "../lib/i18n";
import { sparkleChime } from "../lib/sound";
import type { OrderDto } from "../pages/account/Account";

const load = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });

async function render(order: OrderDto, glossName: string | null, lang: "en" | "pt"): Promise<string> {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#fbd3de");
  bg.addColorStop(0.5, "#f7f5f3");
  bg.addColorStop(1, "#c9e4f5");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // scalloped-ish inner frame
  ctx.strokeStyle = "#f0c36b";
  ctx.lineWidth = 6;
  ctx.setLineDash([2, 14]);
  ctx.lineCap = "round";
  ctx.strokeRect(56, 56, W - 112, H - 112);
  ctx.setLineDash([]);

  ctx.textAlign = "center";
  ctx.fillStyle = "#3a2e3d";
  ctx.font = "700 40px Georgia, serif";
  ctx.fillText(lang === "pt" ? "✦ certificado oficial de adoção ✦" : "✦ official adoption certificate ✦", W / 2, 170);

  const first = order.items[0];
  try {
    const img = await load(first.image ?? "/products/LN-LIP-001.webp");
    ctx.drawImage(img, W / 2 - 190, 220, 380, 380);
  } catch { /* no image */ }

  ctx.fillStyle = "#f6b7c8";
  ctx.font = "700 92px Georgia, serif";
  ctx.fillText(glossName || first.name, W / 2, 700);

  ctx.fillStyle = "#3a2e3d";
  ctx.font = "600 38px Georgia, serif";
  const line1 = lang === "pt"
    ? `foi adotado com muito carinho por ${order.customerName.split(" ")[0]}`
    : `was adopted with great love by ${order.customerName.split(" ")[0]}`;
  ctx.fillText(line1, W / 2, 780);
  ctx.font = "600 32px Georgia, serif";
  ctx.fillStyle = "rgba(58,46,61,0.6)";
  ctx.fillText(new Date().toLocaleDateString(lang === "pt" ? "pt-PT" : "en-IE", { day: "numeric", month: "long", year: "numeric" }), W / 2, 840);
  ctx.fillText(`${lang === "pt" ? "pedido" : "order"} ${order.id}`, W / 2, 890);

  try {
    const boop = await load("/mascots/boop-happy.webp");
    const bw = 260;
    const bh = (boop.height / boop.width) * bw;
    ctx.drawImage(boop, W / 2 - bw / 2, 940, bw, bh);
  } catch { /* no boop */ }

  ctx.fillStyle = "#3a2e3d";
  ctx.font = "600 30px Georgia, serif";
  ctx.fillText(lang === "pt" ? "testemunhado pelo Boop 🐾" : "witnessed by Boop 🐾", W / 2, 1250);
  ctx.font = "700 34px Georgia, serif";
  ctx.fillText("LeoNes ✦ leones.co", W / 2, 1300);

  return canvas.toDataURL("image/png");
}

export default function AdoptionCertificate({ order }: { order: OrderDto }) {
  const { lang } = useI18n();
  const [busy, setBusy] = useState(false);
  const glossName = sessionStorage.getItem("leones-gloss-name");

  const download = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const url = await render(order, glossName, lang);
      sparkleChime();
      const a = document.createElement("a");
      a.href = url;
      a.download = lang === "pt" ? "certificado-de-adocao-leones.png" : "leones-adoption-certificate.png";
      a.click();
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={download}
      disabled={busy}
      className="mt-4 rounded-full bg-gradient-to-r from-pink to-sky px-7 py-3 text-sm font-extrabold text-ink shadow-lg ring-2 ring-white transition hover:scale-105 disabled:opacity-50"
    >
      {busy
        ? lang === "pt" ? "A preparar…" : "Preparing…"
        : lang === "pt" ? "🐾 Descarregar certificado de adoção" : "🐾 Download adoption certificate"}
    </button>
  );
}
