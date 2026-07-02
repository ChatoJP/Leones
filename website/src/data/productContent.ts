import type { Lang } from "../lib/i18n";
import { localizeProduct } from "../lib/i18n";
import { products, type Product } from "./products";

export type GalleryItem = { src: string; alt: string };
export type FaqItem = { q: string; a: string };
export type DetailRow = { label: string; value: string; pending?: boolean };

export type ProductContent = {
  product: Product;
  collection: string;
  availability: "early-drop" | "coming-soon";
  whyYoullLove: string[];
  microBadges: string[];
  longDescription: string;
  story: string;
  storyCards: Array<{ title: string; body: string }>;
  howItWorks: Array<{ step: string; body: string }>;
  whyDifferent: string[];
  boxContents: Array<{ item: string; planned?: boolean }>;
  ingredients: string | null; // null = not yet available -> placeholder shown
  warnings: string[];
  details: DetailRow[];
  faq: FaqItem[];
  gallery: GalleryItem[];
  video: string;
};

const PENDING_I18N = {
  en: "Product details, ingredients, usage instructions and compliance information will be confirmed before public launch.",
  pt: "Detalhes do produto, ingredientes, instruções de utilização e informação de conformidade serão confirmados antes do lançamento público.",
};
const PENDING = PENDING_I18N.en;

export const pendingNote = (lang: Lang) => PENDING_I18N[lang];
export const PENDING_NOTE = PENDING;

// Per-product flavour copy. Everything factual defaults to pending-verification.
const flavour: Record<string, Partial<Pick<ProductContent, "longDescription" | "story" | "whyYoullLove">>> = {
  "LN-LIP-001": {
    longDescription:
      "pH Gloss Clear is the piece that started LeoNes: a clear gloss concept designed around one tiny moment of magic — a finish that looks personal, like your own pink found you. The clear-to-pink effect is designed to create a personalized-looking pink finish; final product behavior will be confirmed before launch.",
    whyYoullLove: [
      "Designed around a clear-to-pink inspired finish",
      "Glossy, collectible object design",
      "Gift-ready packaging concept",
      "Star of the LeoNes mascot world",
    ],
  },
  "LN-LIP-003": {
    longDescription:
      "Glitter Gloss is designed to feel like a snow globe for your lips: a clear pink gloss concept with a holographic-inspired sparkle effect that catches light beautifully on camera. It is made to be shaken, filmed and gifted — a tiny collectible beauty moment.",
    whyYoullLove: [
      "Holographic-inspired sparkle effect",
      "Glossy collectible finish",
      "Gift-ready packaging concept",
      "Made to look beautiful on camera",
    ],
  },
};

const storyDefault = (p: Product) =>
  `${p.name} was designed to feel like a tiny collectible beauty moment: soft, glossy, playful and giftable. It is not just about the product — it is about the feeling of opening something cute, polished and made with care.`;

const PT = {
  microBadges: ["Acabamento glossy colecionável", "Embalagem de presente", "Look inspirado em transparente-para-rosa", "Detalhes completos abaixo"],
  whyYoullLove: ["Acabamento glossy colecionável", "Design de objeto rosa premium", "Conceito de embalagem de presente", "Parte do mundo do mascote LeoNes"],
  longSuffix: "Desenhado como um objeto de beleza premium e divertido — glossy, colecionável e feito para oferecer.",
  story: (name: string) => `${name} foi desenhado para ser um pequeno momento de beleza colecionável: suave, glossy, divertido e perfeito para oferecer. Não é só o produto — é a sensação de abrir algo fofo, cuidado e feito com carinho.`,
  storyCards: [
    { title: "Glossy", body: "Um acabamento desenhado para apanhar a luz — nos lábios e na câmara." },
    { title: "Para oferecer", body: "Caixa rosa, fita e um cartão de agradecimento. Abrir é metade da diversão." },
    { title: "Colecionável", body: "Uma de dez peças da Gloss Collection 01. Ficam melhor juntas." },
  ],
  howItWorks: [
    { step: "Abre o gloss", body: "Roda a tampa. Diz olá ao aplicador." },
    { step: "Aplica uma camada leve", body: "Uma passagem fácil. Repete se quiseres mais brilho." },
    { step: "Deixa o acabamento brilhar", body: "O acabamento glossy é o espetáculo todo." },
    { step: "Leva-o na mala", body: "Para pequenos momentos rosa durante o dia." },
  ],
  whyDifferent: [
    "Identidade visual rosa premium",
    "Sensação de drop colecionável",
    "Conceito de embalagem de presente",
    "Um momento de unboxing a sério, não só um produto",
    "O mundo do mascote LeoNes à volta de cada peça",
    "Desenhado para ser fofo — nunca barato",
  ],
  boxContents: (name: string) => [
    { item: `1 × LeoNes ${name}` },
    { item: "1 × bolsa protetora do produto", planned: true },
    { item: "1 × cartão de agradecimento estilo manuscrito", planned: true },
    { item: "1 × folha de autocolantes colecionáveis LeoNes", planned: true },
    { item: "Embalagem rosa pronta a oferecer", planned: true },
  ],
  warnings: [
    "Não usar em pele irritada ou danificada.",
    "Descontinuar o uso em caso de irritação.",
    "Apenas para uso externo.",
  ],
  detailLabels: ["Nome do produto", "Marca", "Coleção", "SKU", "Acabamento", "Embalagem", "Tamanho", "Fórmula", "Ingredientes", "Idade recomendada", "País de fabrico", "Conformidade"],
  pendingValue: "Verificação pendente",
  finishValue: "Glossy — acabamento final por confirmar",
  packagingValue: "Conceito de embalagem rosa de presente",
  faq: (name: string) => [
    { q: `O que é o LeoNes ${name}?`, a: `O LeoNes ${name} é um conceito premium e divertido de produto labial, desenhado à volta de uma experiência glossy, fofa e colecionável.` },
    { q: "Muda de cor?", a: "Algumas peças da coleção são inspiradas em efeitos transparente-para-rosa. O comportamento final do produto será confirmado com o fabricante antes do lançamento." },
    { q: "É adequado para crianças?", a: "A idade recomendada será confirmada antes da venda pública. A embalagem final indicará claramente o uso recomendado e precauções." },
    { q: "Os ingredientes estão disponíveis?", a: "A lista final de ingredientes será publicada antes do lançamento público." },
    { q: "Está pronto para venda?", a: "A experiência de compra está a ser preparada, mas a conformidade, fórmula e embalagem final têm de ser confirmadas antes do lançamento público." },
    { q: "O que vem na embalagem?", a: "A experiência de unboxing planeada inclui o produto, embalagem rosa suave e um cartão de agradecimento. O conteúdo final pode ser atualizado antes do lançamento." },
    { q: "Posso comprar para oferecer?", a: "O LeoNes foi desenhado para ser oferecido, colecionado e especial." },
    { q: "Como funciona o envio?", a: "Enviamos para toda a União Europeia. Os detalhes de envio aparecem no checkout." },
    { q: "Posso devolver?", a: "A política de devoluções será publicada antes do lançamento." },
    { q: "Como contacto a LeoNes?", a: "Usa o email de contacto no rodapé." },
  ],
  galleryAlts: (name: string) => [
    `LeoNes ${name} — produto`,
    `LeoNes ${name} — cenário`,
    `LeoNes ${name} — textura`,
    "Unboxing LeoNes — caixa rosa com fita, autocolantes e amuleto",
    "O mascote LeoNes a perseguir o pH Gloss num mundo cor-de-rosa",
  ],
};

// SKUs that have an ecosystem macro detail shot in public/gallery/macro/
const MACRO_SKUS = new Set(["LN-LIP-001", "LN-LIP-003", "LN-LIP-005", "LN-LIP-008", "LN-LIP-010"]);

function macroGalleryItem(p: Product, alt: string) {
  return MACRO_SKUS.has(p.sku) ? [{ src: `/gallery/macro/${p.sku}.webp`, alt }] : [];
}

export function getProductContent(p: Product, lang: Lang = "en"): ProductContent {
  const f = flavour[p.sku] ?? {};
  const d = localizeProduct(p, lang);
  if (lang === "pt") {
    return {
      product: p,
      collection: "Gloss Collection 01",
      availability: "early-drop",
      microBadges: [...PT.microBadges],
      whyYoullLove: [...PT.whyYoullLove],
      longDescription: `${d.description} ${PT.longSuffix} ${PENDING_I18N.pt}`,
      story: PT.story(p.name),
      storyCards: PT.storyCards.map((c) => ({ ...c })),
      howItWorks: PT.howItWorks.map((c) => ({ ...c })),
      whyDifferent: [...PT.whyDifferent],
      boxContents: PT.boxContents(p.name),
      ingredients: null,
      warnings: [...PT.warnings],
      details: [
        { label: PT.detailLabels[0], value: p.name },
        { label: PT.detailLabels[1], value: "LeoNes" },
        { label: PT.detailLabels[2], value: "Gloss Collection 01" },
        { label: PT.detailLabels[3], value: p.sku },
        { label: PT.detailLabels[4], value: PT.finishValue, pending: true },
        { label: PT.detailLabels[5], value: PT.packagingValue },
        { label: PT.detailLabels[6], value: PT.pendingValue, pending: true },
        { label: PT.detailLabels[7], value: PT.pendingValue, pending: true },
        { label: PT.detailLabels[8], value: PT.pendingValue, pending: true },
        { label: PT.detailLabels[9], value: PT.pendingValue, pending: true },
        { label: PT.detailLabels[10], value: PT.pendingValue, pending: true },
        { label: PT.detailLabels[11], value: PT.pendingValue, pending: true },
      ],
      faq: PT.faq(p.name),
      gallery: [
        { src: p.image, alt: PT.galleryAlts(p.name)[0] },
        { src: `/gallery/on-pink/${p.sku}.webp`, alt: `LeoNes ${p.name} — em fundo rosa` },
        ...macroGalleryItem(p, `LeoNes ${p.name} — detalhe macro`),
        { src: `/scenes/${p.sku}.webp`, alt: PT.galleryAlts(p.name)[1] },
        { src: p.swatch, alt: PT.galleryAlts(p.name)[2] },
        { src: "/brand/unboxing.webp", alt: PT.galleryAlts(p.name)[3] },
        { src: "/brand/mascot-chase-scene.webp", alt: PT.galleryAlts(p.name)[4] },
      ],
      video: `/videos/${p.sku}.mp4`,
    };
  }
  return {
    product: p,
    collection: "Gloss Collection 01",
    availability: "early-drop",
    microBadges: [
      "Glossy collectible finish",
      "Gift-ready packaging",
      "Clear-to-pink inspired look",
      "Full product details below",
    ],
    whyYoullLove:
      f.whyYoullLove ?? [
        "Glossy collectible finish",
        "Premium pink object design",
        "Gift-ready packaging concept",
        "Part of the LeoNes mascot world",
      ],
    longDescription:
      f.longDescription ??
      `${p.description} Designed as a premium, playful beauty object — glossy, collectible and made to gift. ${PENDING}`,
    story: f.story ?? storyDefault(p),
    storyCards: [
      { title: "Glossy", body: "A finish designed to catch light — on your lips and on camera." },
      { title: "Giftable", body: "Pink box, ribbon and a thank-you card concept. Opening it is half the fun." },
      { title: "Collectible", body: "One of ten pieces in Gloss Collection 01. They look better together." },
    ],
    howItWorks: [
      { step: "Open the gloss", body: "Twist the cap. Say hi to the wand." },
      { step: "Apply a light layer", body: "One easy swipe. Build up if you like more shine." },
      { step: "Let the finish do its thing", body: "The glossy finish is the whole show." },
      { step: "Keep it in your bag", body: "For tiny pink moments during the day." },
    ],
    whyDifferent: [
      "Premium pink visual identity",
      "Small collectible drop feeling",
      "Gift-ready packaging concept",
      "A real unboxing moment, not just a product",
      "The LeoNes mascot world around every piece",
      "Designed to be cute — never cheap",
    ],
    boxContents: [
      { item: `1 × LeoNes ${p.name}` },
      { item: "1 × protective product sleeve", planned: true },
      { item: "1 × handwritten-style thank-you card", planned: true },
      { item: "1 × LeoNes collectible sticker sheet", planned: true },
      { item: "Gift-ready pink packaging", planned: true },
    ],
    ingredients: null,
    warnings: [
      "Do not use on irritated or damaged skin.",
      "Discontinue use if irritation occurs.",
      "For external use only.",
    ],
    details: [
      { label: "Product name", value: p.name },
      { label: "Brand", value: "LeoNes" },
      { label: "Collection", value: "Gloss Collection 01" },
      { label: "SKU", value: p.sku },
      { label: "Finish", value: "Glossy — final finish to be confirmed", pending: true },
      { label: "Packaging", value: "Gift-ready pink packaging concept" },
      { label: "Size", value: "Pending verification", pending: true },
      { label: "Formula", value: "Pending verification", pending: true },
      { label: "Ingredients", value: "Pending verification", pending: true },
      { label: "Recommended age", value: "Pending verification", pending: true },
      { label: "Country of manufacture", value: "Pending verification", pending: true },
      { label: "Compliance", value: "Pending verification", pending: true },
    ],
    faq: [
      {
        q: `What is LeoNes ${p.name}?`,
        a: `LeoNes ${p.name} is a playful premium lip product concept designed around a glossy, cute and collectible beauty experience.`,
      },
      {
        q: "Does it change color?",
        a: "Some pieces in the collection are inspired by clear-to-pink gloss effects. Final product behavior must be confirmed with the manufacturer before launch.",
      },
      {
        q: "Is it suitable for children?",
        a: "Age guidance must be confirmed before public sale. Final packaging and product information will clearly state the recommended use and any precautions.",
      },
      {
        q: "Are the ingredients available?",
        a: "The final ingredients list will be published before public launch.",
      },
      {
        q: "Is it ready to sell?",
        a: "The ecommerce experience is being prepared, but product compliance, formula details and final packaging information must be confirmed before public launch.",
      },
      {
        q: "What comes in the package?",
        a: "The planned LeoNes unboxing experience includes the product, soft pink packaging and a thank-you card. Final packaging contents may be updated before launch.",
      },
      {
        q: "Can I buy it as a gift?",
        a: "LeoNes is designed to feel giftable, collectible and special.",
      },
      {
        q: "How does shipping work?",
        a: "We ship within the European Union. Shipping details are shown at checkout.",
      },
      {
        q: "Can I return it?",
        a: "Return policy details will be added before production launch.",
      },
      {
        q: "How do I contact LeoNes?",
        a: "Use the contact email shown in the footer.",
      },
    ],
    gallery: [
      { src: p.image, alt: `LeoNes ${p.name} — product` },
      { src: `/gallery/on-pink/${p.sku}.webp`, alt: `LeoNes ${p.name} — on pink` },
      ...macroGalleryItem(p, `LeoNes ${p.name} — macro detail`),
      { src: `/scenes/${p.sku}.webp`, alt: `LeoNes ${p.name} — styled scene` },
      { src: p.swatch, alt: `LeoNes ${p.name} — texture swatch` },
      { src: "/brand/unboxing.webp", alt: "LeoNes unboxing — pink gift box with ribbon, stickers and charm" },
      { src: "/brand/mascot-chase-scene.webp", alt: "The LeoNes mascot chasing the pH Gloss in a pink dream world" },
    ],
    video: `/videos/${p.sku}.mp4`,
  };
}

export const relatedProducts = (sku: string) =>
  products.filter((p) => p.sku !== sku).slice(0, 4);
