import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import FloatingParticles from "../components/FloatingParticles";
import Bloop from "../components/Bloop";
import HeartButton from "../components/HeartButton";
import Sticker from "../components/Sticker";
import { money } from "../components/shop/Ui";
import { useCart } from "../context/CartContext";
import { confettiFromEvent } from "../lib/confetti";
import { readViewed, trackViewed } from "../lib/collection";
import { getProductContent, pendingNote, relatedProducts } from "../data/productContent";
import { useI18n } from "../lib/i18n";

const PDP_COPY = {
  en: {
    home: "Home", earlyDrop: "early drop", addToBag: "Add to Bag", inBag: "In the Bag ✓",
    seeUnboxing: "See the unboxing ↓", sku: "SKU", ships: "Ships within the EU · Shipping calculated at checkout",
    share: "Share ↗", copied: "Link copied ✓", meters: "totally scientific magic meters ✦",
    pairs: "pairs perfectly with", addBoth: "Add both —", bothIn: "Both in ✓",
    storyEyebrow: "the story", storyTitle1: "The little gloss with", storyTitle2: "main-character energy",
    howEyebrow: "how it works", howTitle: "Four tiny steps",
    diffEyebrow: "the difference", diffTitle: "Why it feels different",
    diffBody1: "is built around small beauty objects that feel fun to own, beautiful to photograph and lovely to gift.",
    unbEyebrow: "the unboxing", unbTitle: "Made to feel like a tiny gift",
    unbBody: "order should feel personal: soft packaging, thoughtful details and a small handwritten-style card that makes the product feel special before it is even opened.",
    unbQuote: "Hi beautiful, thank you for your order. Made with love,",
    unbPlanned: "Planned packaging experience — final packaging contents may be updated before launch.",
    inside: "What's inside", planned: "planned",
    ingEyebrow: "transparency", ingTitle: "Ingredients",
    ingPlaceholder: "Final ingredients will be published before public launch. Cosmetic formula, usage instructions and compliance information must be verified before the product is sold publicly.",
    parEyebrow: "for parents", parTitle: "Honest, on purpose",
    parBody: "is designed as a premium, playful beauty experience. Before public launch, all product details, ingredients, safety information and regulatory requirements will be confirmed with the manufacturer or responsible person.",
    parFields: [["Dermatologist-tested", "Pending verification"], ["Age guidance", "Pending verification"], ["Ingredients", "Pending verification"], ["Regulatory status", "Pending verification"]],
    detEyebrow: "the facts", detTitle: "Product details",
    tvEyebrow: "leones tv", tvTitle1: "Watch the", tvTitle2: "world",
    faqEyebrow: "questions", faqTitle: "FAQ",
    revEyebrow: "reviews", revTitle: "Early concept drop", revNone: "No reviews yet.",
    revBody: "Be the first to try", revBody2: ". Reviews open with the first public drop.",
    trust: ["✦ Secure checkout", "✦ Gift-ready packaging", "✦ EU shipping · calculated at checkout", "✦ Returns policy coming soon", "✦ Customer support by email"],
    relEyebrow: "keep collecting", relTitle: "More from the Collection",
    viewed: "You were just looking at ✦", lost: "This one's out roaring somewhere else.", back: "Back to the Collection →",
    galleryVideo: "jump to product video",
  },
  pt: {
    home: "Início", earlyDrop: "drop de conceito", addToBag: "Adicionar à Mala", inBag: "Na Mala ✓",
    seeUnboxing: "Ver o unboxing ↓", sku: "SKU", ships: "Envios na UE · Envio calculado no checkout",
    share: "Partilhar ↗", copied: "Link copiado ✓", meters: "medidores de magia totalmente científicos ✦",
    pairs: "combina na perfeição com", addBoth: "Levar os dois —", bothIn: "Os dois na mala ✓",
    storyEyebrow: "a história", storyTitle1: "O pequeno gloss com", storyTitle2: "energia de protagonista",
    howEyebrow: "como funciona", howTitle: "Quatro passos pequeninos",
    diffEyebrow: "a diferença", diffTitle: "Porque é que parece diferente",
    diffBody1: "é feita de pequenos objetos de beleza que sabem bem ter, ficam lindos em fotografia e são perfeitos para oferecer.",
    unbEyebrow: "o unboxing", unbTitle: "Feito para parecer um pequeno presente",
    unbBody: "encomenda deve parecer pessoal: embalagem suave, detalhes com carinho e um cartão estilo manuscrito que torna o produto especial antes sequer de ser aberto.",
    unbQuote: "Olá linda, obrigada pela tua encomenda. Feito com amor,",
    unbPlanned: "Experiência de embalagem planeada — o conteúdo final pode ser atualizado antes do lançamento.",
    inside: "O que vem dentro", planned: "planeado",
    ingEyebrow: "transparência", ingTitle: "Ingredientes",
    ingPlaceholder: "Os ingredientes finais serão publicados antes do lançamento público. A fórmula cosmética, instruções de uso e informação de conformidade têm de ser verificadas antes da venda pública.",
    parEyebrow: "para os pais", parTitle: "Honesto, de propósito",
    parBody: "é uma experiência de beleza premium e divertida. Antes do lançamento público, todos os detalhes, ingredientes, informação de segurança e requisitos regulatórios serão confirmados com o fabricante ou pessoa responsável.",
    parFields: [["Testes dermatológicos", "Verificação pendente"], ["Idade recomendada", "Verificação pendente"], ["Ingredientes", "Verificação pendente"], ["Estado regulatório", "Verificação pendente"]],
    detEyebrow: "os factos", detTitle: "Detalhes do produto",
    tvEyebrow: "leones tv", tvTitle1: "Vê o mundo", tvTitle2: "",
    faqEyebrow: "perguntas", faqTitle: "FAQ",
    revEyebrow: "reviews", revTitle: "Drop de conceito", revNone: "Ainda sem reviews.",
    revBody: "Sê a primeira a experimentar a", revBody2: ". As reviews abrem com o primeiro drop público.",
    trust: ["✦ Checkout seguro", "✦ Embalagem de presente", "✦ Envios UE · calculado no checkout", "✦ Política de devoluções em breve", "✦ Apoio ao cliente por email"],
    relEyebrow: "continua a colecionar", relTitle: "Mais da Coleção",
    viewed: "Estiveste agora a ver ✦", lost: "Este fugiu a rugir para outro lado.", back: "Voltar à Coleção →",
    galleryVideo: "ir para o vídeo do produto",
  },
} as const;
import { getProduct, type Product as ProductType } from "../data/products";

const Brand = ({ children }: { children: React.ReactNode }) => (
  <span translate="no" className="notranslate">{children}</span>
);

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className="mb-8 text-center"
    >
      <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-amber">{eyebrow}</p>
      <h2 className="font-display mt-2 text-3xl font-semibold text-ink sm:text-4xl">{title}</h2>
    </motion.div>
  );
}

function AddButton({ product, qty = 1, big = false }: { product: ProductType; qty?: number; big?: boolean }) {
  const { add } = useCart();
  const { lang } = useI18n();
  const pc = PDP_COPY[lang];
  const [popped, setPopped] = useState(false);
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={(e) => {
        confettiFromEvent(e);
        add(product, qty);
        setPopped(true);
        setTimeout(() => setPopped(false), 900);
      }}
      className={`rounded-full bg-ink font-bold text-cloud shadow-lg shadow-ink/15 transition hover:scale-105 ${
        big ? "px-9 py-4" : "px-6 py-3 text-sm"
      }`}
    >
      {popped ? pc.inBag : pc.addToBag}
    </motion.button>
  );
}

function QtyPicker({ qty, setQty }: { qty: number; setQty: (n: number) => void }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white px-2 py-1.5 shadow-sm ring-1 ring-ink/10">
      <button aria-label="decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))} className="h-8 w-8 rounded-full font-black text-ink/60 transition hover:bg-cloud">−</button>
      <span className="w-7 text-center font-extrabold text-ink">{qty}</span>
      <button aria-label="increase quantity" onClick={() => setQty(Math.min(50, qty + 1))} className="h-8 w-8 rounded-full font-black text-ink/60 transition hover:bg-cloud">+</button>
    </div>
  );
}

export default function Product() {
  const { slug } = useParams();
  const { lang, lp } = useI18n();
  const pc = PDP_COPY[lang];
  const product = getProduct(slug ?? "");
  const content = useMemo(() => (product ? getProductContent(product, lang) : null), [product, lang]);
  const d = product ? lp(product) : null;
  const [qty, setQty] = useState(1);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    setGalleryIdx(0);
    setQty(1);
    window.scrollTo(0, 0);
    if (product) trackViewed(product.sku);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    document.title = `${product.name} — LeoNes · Gloss Collection 01`;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = `${product.name} by LeoNes — ${product.tagline} ${product.description}`;
    let canon = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canon) {
      canon = document.createElement("link");
      canon.rel = "canonical";
      document.head.appendChild(canon);
    }
    canon.href = `${window.location.origin}/products/${product.slug}`;
    const setOg = (prop: string, content: string) => {
      let el = document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", prop);
        document.head.appendChild(el);
      }
      el.content = content;
    };
    setOg("og:title", `LeoNes ${product.name} — ${product.tagline}`);
    setOg("og:description", product.description);
    setOg("og:image", `${window.location.origin}${product.image}`);
    setOg("og:url", `${window.location.origin}/products/${product.slug}`);
    return () => {
      document.title = "LeoNes — Confidence, wrapped in magic.";
    };
  }, [product]);

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // arrow keys flip through the gallery
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!content) return;
      if (e.key === "ArrowRight") setGalleryIdx((i) => (i + 1) % content.gallery.length);
      if (e.key === "ArrowLeft") setGalleryIdx((i) => (i - 1 + content.gallery.length) % content.gallery.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [content]);

  if (!product || !content) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <h1 className="font-display text-3xl font-semibold text-ink">{pc.lost}</h1>
        <Link to="/" className="mt-6 inline-block font-bold text-amber">{pc.back}</Link>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `LeoNes ${product.name}`,
    brand: { "@type": "Brand", name: "LeoNes" },
    sku: product.sku,
    image: `${window.location.origin}${product.image}`,
    description: content.longDescription,
    url: window.location.href,
    offers: {
      "@type": "Offer",
      price: product.price.toFixed(2),
      priceCurrency: "EUR",
      availability: "https://schema.org/PreOrder",
      url: window.location.href,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: window.location.origin },
      { "@type": "ListItem", position: 2, name: "Gloss Collection 01", item: `${window.location.origin}/#drop` },
      { "@type": "ListItem", position: 3, name: product.name },
    ],
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const related = relatedProducts(product.sku);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      {/* breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-6 pt-6 text-xs font-bold text-ink/60">
        <Link to="/" className="hover:text-ink">{pc.home}</Link>
        <span className="mx-2">›</span>
        <Link to="/#drop" className="hover:text-ink">Gloss Collection 01</Link>
        <span className="mx-2">›</span>
        <Brand>{product.name}</Brand>
      </nav>

      {/* 1 · HERO + 2 · GALLERY */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="blob absolute -top-24 -left-24 h-80 w-80 rounded-full bg-sky/40 blur-3xl" />
          <div className="blob absolute top-20 -right-24 h-96 w-96 rounded-full bg-pink/40 blur-3xl" style={{ animationDelay: "-7s" }} />
        </div>
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-2 lg:items-start">
          {/* gallery */}
          <div className="relative">
            <motion.div
              key={galleryIdx}
              initial={{ opacity: 0.4, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="overflow-hidden rounded-[2.5rem] bg-white/70 shadow-xl ring-1 ring-white/70"
            >
              <img
                src={content.gallery[galleryIdx].src}
                alt={content.gallery[galleryIdx].alt}
                className="aspect-square w-full object-cover"
              />
            </motion.div>
            <div className="absolute -right-4 -top-6 z-10 rotate-12 sm:-right-2">
              <Bloop float={false} showCounter={false} imgClassName="h-20 w-auto sm:h-24" />
            </div>
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {content.gallery.map((g, i) => (
                <button
                  key={g.src}
                  onClick={() => setGalleryIdx(i)}
                  aria-label={`show image: ${g.alt}`}
                  className={`shrink-0 overflow-hidden rounded-2xl ring-2 transition ${
                    i === galleryIdx ? "ring-amber" : "ring-white/70 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={g.src} alt="" loading="lazy" className="h-16 w-16 object-cover sm:h-20 sm:w-20" />
                </button>
              ))}
              <a
                href="#video"
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-ink text-xl text-cloud ring-2 ring-white/70 sm:h-20 sm:w-20"
                aria-label={pc.galleryVideo}
              >
                ▶
              </a>
            </div>
          </div>

          {/* buy box */}
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-amber">
              <Brand>Gloss Collection 01</Brand> · {pc.earlyDrop}
            </p>
            <div className="mt-2 flex items-start justify-between gap-3">
              <h1 className="font-display text-5xl font-semibold text-ink">
                <Brand>{product.name}</Brand>
              </h1>
              <HeartButton sku={product.sku} />
            </div>
            <p className="mt-2 text-lg font-bold text-pink-deep">{d!.tagline}</p>
            <p className="mt-4 max-w-md font-semibold text-ink/70">{content.longDescription}</p>

            <ul className="mt-5 space-y-1.5 text-sm font-bold text-ink/70">
              {content.whyYoullLove.map((w) => (
                <li key={w}>✦ {w}</li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <span className="font-display text-4xl font-semibold text-ink">{money(product.price)}</span>
              <QtyPicker qty={qty} setQty={setQty} />
              <AddButton product={product} qty={qty} big />
            </div>
            <a href="#unboxing" className="mt-3 inline-block text-sm font-bold text-amber hover:underline">
              {pc.seeUnboxing}
            </a>

            <div className="mt-6 flex flex-wrap gap-3">
              {content.microBadges.map((b, i) => (
                <Sticker key={b} tone={(["pink", "sky", "gold", "ink"] as const)[i % 4]} rotate={i % 2 ? 3 : -3}>
                  {b}
                </Sticker>
              ))}
            </div>

            <p className="mt-5 text-xs font-bold text-ink/60">
              {pc.sku} <Brand>{product.sku}</Brand> · {pc.ships}
              <ShareButton name={product.name} />
            </p>
            <StockChip sku={product.sku} />

            <MagicMeters sku={product.sku} />

            <PairsWith current={product} />
          </div>
        </div>
      </section>

      {/* 3 · STORY */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <SectionTitle eyebrow={pc.storyEyebrow} title={<>{pc.storyTitle1} <em className="text-pink-deep">{pc.storyTitle2}</em></>} />
        <p className="mx-auto max-w-2xl text-center font-semibold text-ink/60">{content.story}</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {content.storyCards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="rounded-3xl bg-white/70 p-6 text-center shadow-sm ring-1 ring-white/60 backdrop-blur"
            >
              <span className="text-2xl text-gold">✦</span>
              <h3 className="font-display mt-2 text-xl font-semibold text-ink">{c.title}</h3>
              <p className="mt-2 text-sm font-semibold text-ink/60">{c.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4 · HOW IT WORKS */}
      <section className="bg-white/60 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <SectionTitle eyebrow={pc.howEyebrow} title={pc.howTitle} />
          <div className="grid gap-5 sm:grid-cols-4">
            {content.howItWorks.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="rounded-3xl bg-cloud p-6"
              >
                <span className="font-display text-3xl font-semibold text-pink-deep/50">{i + 1}</span>
                <h3 className="mt-2 font-bold text-ink">{s.step}</h3>
                <p className="mt-1 text-sm font-semibold text-ink/60">{s.body}</p>
              </motion.div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs font-bold text-ink/60">{pendingNote(lang)}</p>
        </div>
      </section>

      {/* 5 · WHY DIFFERENT */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <SectionTitle eyebrow={pc.diffEyebrow} title={pc.diffTitle} />
        <p className="mx-auto max-w-xl text-center font-semibold text-ink/60">
          <Brand>LeoNes</Brand> {pc.diffBody1}
        </p>
        <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
          {content.whyDifferent.map((w) => (
            <div key={w} className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 text-sm font-bold text-ink/70 ring-1 ring-white/60">
              <span className="text-gold">✦</span> {w}
            </div>
          ))}
        </div>
      </section>

      {/* 6 · UNBOXING */}
      <section id="unboxing" className="relative overflow-hidden bg-gradient-to-b from-pink/25 via-cloud to-cloud py-20">
        <FloatingParticles count={8} />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 sm:grid-cols-2">
          <motion.img
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            src="/brand/unboxing.webp"
            alt="LeoNes unboxing concept: pink box, ribbon, thank-you card, stickers and charm"
            loading="lazy"
            className="w-full rounded-[2.5rem] shadow-2xl ring-8 ring-white/70"
          />
          <div>
            <SectionTitle eyebrow={pc.unbEyebrow} title={pc.unbTitle} />
            <p className="font-semibold text-ink/60">
              <Brand>LeoNes</Brand> — {pc.unbBody}
            </p>
            <blockquote className="mt-5 rounded-3xl bg-white/80 p-5 font-semibold italic text-ink/70 shadow-sm">
              "{pc.unbQuote} <Brand>LeoNes</Brand>." ♡
            </blockquote>
            <p className="mt-3 text-xs font-bold text-ink/60">
              {pc.unbPlanned}
            </p>

            {/* 7 · WHAT'S INSIDE */}
            <h3 className="font-display mt-8 text-xl font-semibold text-ink">{pc.inside}</h3>
            <ul className="mt-3 space-y-2 text-sm font-bold text-ink/70">
              {content.boxContents.map((b) => (
                <li key={b.item} className="flex items-center gap-2">
                  <span className="text-gold">✦</span>
                  <Brand>{b.item}</Brand>
                  {b.planned && (
                    <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-amber">
                      {pc.planned}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 8 · INGREDIENTS */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <SectionTitle eyebrow={pc.ingEyebrow} title={pc.ingTitle} />
        <div className="rounded-[2rem] bg-white/70 p-7 shadow-sm ring-1 ring-white/60">
          {content.ingredients ? (
            <p className="text-sm font-semibold text-ink/70">{content.ingredients}</p>
          ) : (
            <p className="text-sm font-semibold text-ink/70">
              {pc.ingPlaceholder}
            </p>
          )}
          <ul className="mt-4 space-y-1 border-t border-ink/10 pt-4 text-xs font-bold text-ink/60">
            {content.warnings.map((w) => (
              <li key={w}>• {w}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* 9 · PARENTS */}
      <section className="bg-white/60 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <SectionTitle eyebrow={pc.parEyebrow} title={pc.parTitle} />
          <p className="mx-auto max-w-2xl text-center font-semibold text-ink/60">
            <Brand>LeoNes</Brand> {pc.parBody}
          </p>
          <div className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
            {pc.parFields.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between rounded-2xl bg-cloud px-4 py-3 text-sm">
                <span className="font-bold text-ink">{k}</span>
                <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-extrabold text-amber">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10 · DETAILS TABLE */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <SectionTitle eyebrow={pc.detEyebrow} title={pc.detTitle} />
        <div className="overflow-hidden rounded-[2rem] bg-white/70 shadow-sm ring-1 ring-white/60">
          <dl>
            {content.details.map((d, i) => (
              <div
                key={d.label}
                className={`flex flex-wrap items-center justify-between gap-2 px-6 py-3.5 text-sm ${
                  i % 2 ? "bg-cloud/60" : ""
                }`}
              >
                <dt className="font-bold text-ink/60">{d.label}</dt>
                <dd className={`font-bold ${d.pending ? "text-amber" : "text-ink"}`}>
                  <Brand>{d.value}</Brand>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 17 · VIDEO */}
      <section id="video" className="mx-auto max-w-5xl px-6 py-16">
        <SectionTitle eyebrow={pc.tvEyebrow} title={<>{pc.tvTitle1} <Brand>LeoNes</Brand> {pc.tvTitle2}</>} />
        <div className="flex flex-wrap justify-center gap-6">
          <video
            src={content.video}
            controls
            muted
            loop
            playsInline
            preload="none"
            poster={`/posters/${product.sku}.jpg`}
            className="aspect-[9/16] w-56 rounded-[2rem] bg-ink/5 object-cover shadow-xl ring-4 ring-white/80 sm:w-64"
          />
          <video
            src="/videos/unboxing.mp4"
            controls
            muted
            loop
            playsInline
            preload="none"
            poster="/posters/unboxing.jpg"
            className="aspect-[9/16] w-56 rounded-[2rem] bg-ink/5 object-cover shadow-xl ring-4 ring-white/80 sm:w-64"
          />
        </div>
      </section>

      {/* 11 · FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <SectionTitle eyebrow={pc.faqEyebrow} title={pc.faqTitle} />
        <div className="space-y-3">
          {content.faq.map((f, i) => (
            <div key={f.q} className="overflow-hidden rounded-3xl bg-white/70 ring-1 ring-white/60">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left text-sm font-bold text-ink"
              >
                {f.q}
                <motion.span animate={{ rotate: openFaq === i ? 45 : 0 }} className="text-lg text-amber">+</motion.span>
              </button>
              <motion.div initial={false} animate={{ height: openFaq === i ? "auto" : 0 }} transition={{ duration: 0.25 }}>
                <p className="px-5 pb-5 text-sm font-semibold text-ink/60">{f.a}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      {/* 12 · REVIEWS (honest empty state) */}
      <section className="mx-auto max-w-3xl px-6 py-10 text-center">
        <SectionTitle eyebrow={pc.revEyebrow} title={pc.revTitle} />
        <div className="rounded-[2rem] bg-white/70 p-8 shadow-sm ring-1 ring-white/60">
          <p className="text-3xl">✦</p>
          <p className="mt-3 font-display text-xl font-semibold text-ink">{pc.revNone}</p>
          <p className="mt-2 text-sm font-semibold text-ink/60">
            {pc.revBody} <Brand>LeoNes</Brand>{pc.revBody2}
          </p>
        </div>
      </section>

      {/* 13 · TRUST STRIP */}
      <section className="border-y border-ink/10 bg-white/70 py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 text-center text-sm font-semibold text-ink/70">
          {pc.trust.map((tr) => (
            <span key={tr}>{tr}</span>
          ))}
        </div>
      </section>

      {/* 15 · RELATED */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionTitle eyebrow={pc.relEyebrow} title={pc.relTitle} />
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          {related.map((p) => (
            <div key={p.sku} className="group flex flex-col rounded-3xl bg-white/70 p-5 text-center shadow-sm ring-1 ring-white/60 transition hover:-translate-y-1 hover:shadow-lg">
              <Link to={`/products/${p.slug}`}>
                <img src={p.image} alt={`LeoNes ${p.name}`} loading="lazy" className="mx-auto h-32 w-32 object-contain transition group-hover:scale-105" />
                <p className="font-display mt-3 font-semibold text-ink"><Brand>{p.name}</Brand></p>
                <p className="mt-1 text-xs font-semibold text-ink/60">{lp(p).tagline}</p>
              </Link>
              <div className="mt-3 flex items-center justify-center gap-3">
                <span className="font-bold text-amber">{money(p.price)}</span>
                <AddButton product={p} />
              </div>
              <span className="mt-2 text-[10px] font-extrabold uppercase tracking-wider text-ink/55">{pc.earlyDrop}</span>
            </div>
          ))}
        </div>
      </section>

      <RecentlyViewed currentSku={product.sku} />

      {/* 14 · STICKY ADD TO CART */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-x-0 bottom-4 z-50 px-4"
          >
            <div className="mx-auto flex max-w-xl items-center gap-3 rounded-full bg-white/85 p-2.5 pl-4 shadow-2xl ring-1 ring-white/70 backdrop-blur-xl">
              <img src={product.image} alt="" className="h-11 w-11 rounded-full bg-white object-contain ring-2 ring-sky" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-ink"><Brand>{product.name}</Brand></p>
                <p className="text-xs font-bold text-ink/60">{money(product.price)}</p>
              </div>
              <QtyPicker qty={qty} setQty={setQty} />
              <AddButton product={product} qty={qty} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


/* ---------- batch-2 PDP extras ---------- */

function ShareButton({ name }: { name: string }) {
  const { lang } = useI18n();
  const pc = PDP_COPY[lang];
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        const data = { title: `LeoNes ${name}`, url: window.location.href };
        if (navigator.share) {
          try { await navigator.share(data); } catch { /* user cancelled */ }
        } else {
          await navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }
      }}
      className="ml-3 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-ink/60 shadow-sm ring-1 ring-ink/10 transition hover:scale-105 hover:text-ink"
    >
      {copied ? pc.copied : pc.share}
    </button>
  );
}

const METERS: Record<string, Array<[string, number]>> = {
  "LN-LIP-001": [["magic", 10], ["shine", 8], ["surprise", 9]],
  "LN-LIP-002": [["shine", 10], ["glassiness", 9], ["drama", 4]],
  "LN-LIP-003": [["sparkle", 10], ["main character", 9], ["subtlety", 2]],
  "LN-LIP-004": [["indecision", 10], ["pearl", 8], ["team spirit", 9]],
  "LN-LIP-005": [["softness", 10], ["sleepiness", 9], ["cloud", 8]],
  "LN-LIP-006": [["sunshine", 9], ["cuteness", 8], ["chill", 7]],
  "LN-LIP-007": [["dessert energy", 9], ["sparkle", 7], ["polish", 8]],
  "LN-LIP-008": [["wobble", 10], ["boop-ability", 10], ["seriousness", 1]],
  "LN-LIP-009": [["friendship", 10], ["shareability", 9], ["keeping it", 6]],
  "LN-LIP-010": [["zoomies", 10], ["glide", 9], ["cool", 8]],
};

function MagicMeters({ sku }: { sku: string }) {
  const meters = METERS[sku];
  if (!meters) return null;
  return (
    <div className="mt-6 rounded-3xl bg-white/70 p-5 ring-1 ring-white/60">
      <p className="text-xs font-extrabold uppercase tracking-widest text-ink/60">
        {PDP_COPY[useI18n().lang].meters}
      </p>
      <div className="mt-3 space-y-2.5">
        {meters.map(([label, v]) => (
          <div key={label} className="flex items-center gap-3">
            <span className="w-32 text-xs font-extrabold capitalize text-ink/60">{label}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-cloud">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${v * 10}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-sky-deep to-pink-deep"
              />
            </div>
            <span className="w-9 text-right text-xs font-extrabold text-amber">{v}/10</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const PAIRINGS: Record<string, string> = {
  "LN-LIP-001": "LN-LIP-008",
  "LN-LIP-002": "LN-LIP-005",
  "LN-LIP-003": "LN-LIP-004",
  "LN-LIP-004": "LN-LIP-003",
  "LN-LIP-005": "LN-LIP-007",
  "LN-LIP-006": "LN-LIP-010",
  "LN-LIP-007": "LN-LIP-005",
  "LN-LIP-008": "LN-LIP-001",
  "LN-LIP-009": "LN-LIP-001",
  "LN-LIP-010": "LN-LIP-006",
};

function PairsWith({ current }: { current: ProductType }) {
  const { add } = useCart();
  const { lang } = useI18n();
  const pc = PDP_COPY[lang];
  const [popped, setPopped] = useState(false);
  const partnerSku = PAIRINGS[current.sku];
  const partner = relatedProducts("").find((p) => p.sku === partnerSku);
  if (!partner) return null;
  return (
    <div className="mt-4 flex items-center gap-3 rounded-3xl bg-pink/20 p-4 ring-1 ring-white/60">
      <img src={partner.image} alt={partner.name} loading="lazy" className="h-14 w-14 rounded-2xl bg-white object-contain ring-1 ring-ink/10" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-extrabold uppercase tracking-wider text-ink/60">{pc.pairs}</p>
        <Link to={`/products/${partner.slug}`} translate="no" className="notranslate text-sm font-bold text-ink hover:underline">
          {partner.name} · {money(partner.price)}
        </Link>
      </div>
      <button
        onClick={(e) => {
          confettiFromEvent(e);
          add(current);
          add(partner);
          setPopped(true);
          setTimeout(() => setPopped(false), 1000);
        }}
        className="rounded-full bg-ink px-4 py-2.5 text-xs font-bold text-cloud transition hover:scale-105"
      >
        {popped ? pc.bothIn : `${pc.addBoth} ${money(current.price + partner.price)}`}
      </button>
    </div>
  );
}

function RecentlyViewed({ currentSku }: { currentSku: string }) {
  const { lang } = useI18n();
  const pc = PDP_COPY[lang];
  const viewed = readViewed(currentSku)
    .map((sku) => relatedProducts("").find((p) => p.sku === sku))
    .filter(Boolean)
    .slice(0, 4);
  if (viewed.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-6 pb-16">
      <h2 className="font-display mb-5 text-xl font-semibold text-ink">{pc.viewed}</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {viewed.map((p) => (
          <Link
            key={p!.sku}
            to={`/products/${p!.slug}`}
            className="flex w-40 shrink-0 flex-col items-center rounded-3xl bg-white/70 p-4 text-center shadow-sm ring-1 ring-white/60 transition hover:-translate-y-1"
          >
            <img src={p!.image} alt={p!.name} loading="lazy" className="h-24 w-24 object-contain" />
            <p translate="no" className="notranslate mt-2 text-sm font-bold text-ink">{p!.name}</p>
            <p className="text-xs font-bold text-amber">{money(p!.price)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}


function StockChip({ sku }: { sku: string }) {
  const { lang } = useI18n();
  const sc = lang === "pt"
    ? { out: "Esgotado — volta em breve ✦", low: (n: number) => `Só restam ${n} ✦`, ok: "Em stock" }
    : { out: "Sold out — back soon ✦", low: (n: number) => `Only ${n} left ✦`, ok: "In stock" };
  const [stock, setStock] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const p = d?.products?.find((x: { sku: string }) => x.sku === sku);
        if (p) setStock(p.stock);
      })
      .catch(() => {});
  }, [sku]);
  if (stock === null) return null;
  if (stock === 0) {
    return (
      <p className="mt-2 inline-block rounded-full bg-pink/50 px-3 py-1 text-xs font-extrabold text-ink">
        {sc.out}
      </p>
    );
  }
  if (stock < 20) {
    return (
      <p className="mt-2 inline-block rounded-full bg-gold/25 px-3 py-1 text-xs font-extrabold text-amber">
        {sc.low(stock)}
      </p>
    );
  }
  return (
    <p className="mt-2 inline-block rounded-full bg-sky/40 px-3 py-1 text-xs font-extrabold text-ink/60">
      {sc.ok}
    </p>
  );
}
