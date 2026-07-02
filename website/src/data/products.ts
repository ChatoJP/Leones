import catalog from "../../shared/catalog.json";

export type Product = {
  slug: string;
  sku: string;
  name: string;
  tagline: string;
  price: number;
  description: string;
  magic: string;
  image: string;
  swatch: string;
  hook: string;
  chips: [string, string];
  tint: "sky" | "pink";
};

// Gloss Collection 01 — Lips. Hero images generated via the asset
// pipeline (tools/generate-assets.mjs) and copied to public/products/.
export const products: Product[] = [
  {
    slug: "ph-gloss-clear",
    sku: "LN-LIP-001",
    name: "pH Gloss Clear",
    tagline: "Watch it pick your pink.",
    price: 14,
    description:
      "Crystal clear in the tube. One swipe and it warms into your own soft pink. No two are the same.",
    magic: "Clear-to-pink inspired finish.",
    image: "/products/LN-LIP-001.webp",
    swatch: "/swatches/LN-LIP-001.webp",
    hook: "wait for it to pick a color 👀",
    chips: ["clear → pink", "non-sticky"],
    tint: "sky",
  },
  {
    slug: "crystal-lip-oil",
    sku: "LN-LIP-002",
    name: "Crystal Lip Oil",
    tagline: "Shine like a prism.",
    price: 16,
    description:
      "A featherlight oil in a crystal bottle. Light bends through it. So does everyone's attention.",
    magic: "Prism-cut bottle catches rainbows.",
    image: "/products/LN-LIP-002.webp",
    swatch: "/swatches/LN-LIP-002.webp",
    hook: "shine so glassy it reflects your mood",
    chips: ["glass shine", "nourishing"],
    tint: "pink",
  },
  {
    slug: "glitter-gloss",
    sku: "LN-LIP-003",
    name: "Glitter Gloss",
    tagline: "A snow globe for your lips.",
    price: 15,
    description:
      "A snow globe for your lips: clear pink gloss with a holographic-inspired sparkle effect. Made to be shaken and filmed.",
    magic: "Holographic-inspired sparkle effect.",
    image: "/products/LN-LIP-003.webp",
    swatch: "/swatches/LN-LIP-003.webp",
    hook: "main character energy, bottled",
    chips: ["holo shimmer", "zero grit"],
    tint: "sky",
  },
  {
    slug: "color-shift-gloss",
    sku: "LN-LIP-004",
    name: "Color Shift Gloss",
    tagline: "Team blue AND team pink.",
    price: 16,
    description:
      "Tilt it blue. Tilt it pink. A gloss that can't decide — and doesn't have to.",
    magic: "Duochrome shifts color as you move.",
    image: "/products/LN-LIP-004.webp",
    swatch: "/swatches/LN-LIP-004.webp",
    hook: "team blue or team pink? both.",
    chips: ["duochrome", "pearl finish"],
    tint: "pink",
  },
  {
    slug: "lip-sleeping-mask",
    sku: "LN-LIP-005",
    name: "Lip Sleeping Mask",
    tagline: "Softness, overnight.",
    price: 18,
    description:
      "A whipped cloud you wear to bed. Wake up with the softest lips in the room.",
    magic: "Cloud-whipped texture melts on contact.",
    image: "/products/LN-LIP-005.webp",
    swatch: "/swatches/LN-LIP-005.webp",
    hook: "does the beauty sleep FOR you",
    chips: ["overnight", "vanilla cloud"],
    tint: "sky",
  },
  {
    slug: "lip-balm-spf",
    sku: "LN-LIP-006",
    name: "Lip Balm SPF",
    tagline: "Sunshine-proof.",
    price: 12,
    description:
      "A sunny-day balm concept. Smooth on, run out, stay soft. SPF level pending verification.",
    magic: "Sunny-day balm — SPF pending verification.",
    image: "/products/LN-LIP-006.webp",
    swatch: "/swatches/LN-LIP-006.webp",
    hook: "golden hour, but make it cute",
    chips: ["sun-day balm", "featherlight"],
    tint: "pink",
  },
  {
    slug: "lip-scrub",
    sku: "LN-LIP-007",
    name: "Lip Scrub",
    tagline: "Sugar, but make it skincare.",
    price: 13,
    description:
      "Sparkling sugar crystals that buff lips soft, then melt away. Smells like dessert. Isn't one.",
    magic: "Sugar crystals melt as they polish.",
    image: "/products/LN-LIP-007.webp",
    swatch: "/swatches/LN-LIP-007.webp",
    hook: "it's giving dessert (don't eat it)",
    chips: ["sugar polish", "melts away"],
    tint: "sky",
  },
  {
    slug: "jelly-lip-mask",
    sku: "LN-LIP-008",
    name: "Jelly Lip Mask",
    tagline: "Bloop-approved.",
    price: 15,
    description:
      "A bouncy pink jelly that hugs your lips for ten minutes and leaves them glowing. Yes, it wobbles.",
    magic: "Genuinely bouncy jelly texture.",
    image: "/products/LN-LIP-008.webp",
    swatch: "/swatches/LN-LIP-008.webp",
    hook: "do NOT trust the jelly",
    chips: ["10-min glow", "actually bouncy"],
    tint: "pink",
  },
  {
    slug: "duo-gloss",
    sku: "LN-LIP-009",
    name: "Duo Gloss",
    tagline: "One for you. One for you.",
    price: 17,
    description:
      "Two glosses, one tube: soft pink on one end, pearl blue on the other. Built for sharing. Or not.",
    magic: "Double-ended — two shades, one tube.",
    image: "/products/LN-LIP-009.webp",
    swatch: "/swatches/LN-LIP-009.webp",
    hook: "one for you. one for your bestie.",
    chips: ["2 shades", "built to share"],
    tint: "sky",
  },
  {
    slug: "roller-gloss",
    sku: "LN-LIP-010",
    name: "Roller Gloss",
    tagline: "Glides like a dream.",
    price: 14,
    description:
      "A cool glass rollerball that glides gloss on smooth. Half lip gloss, half tiny massage.",
    magic: "Pearl rollerball applicator.",
    image: "/products/LN-LIP-010.webp",
    swatch: "/swatches/LN-LIP-010.webp",
    hook: "it has the zoomies",
    chips: ["cooling ball", "glide-on"],
    tint: "pink",
  },
];

// Prices/names/images are display copies of shared/catalog.json — the server
// re-validates every order against the catalog, never against these values.
// Sync display fields from the catalog so the two can't drift.
for (const p of products) {
  const c = catalog.products.find((x) => x.sku === p.sku);
  if (c) {
    p.price = c.price;
    p.name = c.name;
    p.image = c.image;
  }
}

// Purchasable bundles (server-validated pricing; components decrement on paid).
export const bundles: Product[] = (catalog as { bundles?: Array<{ sku: string; slug: string; name: string; price: number; image: string }> }).bundles?.map((b) => ({
  slug: b.slug,
  sku: b.sku,
  name: b.name,
  tagline: "Three icons. One better price.",
  price: b.price,
  description: "pH Gloss + Jelly Mask + Glitter Gloss together — the trio everyone films.",
  magic: "Save €8 vs buying separately.",
  image: b.image,
  swatch: "/swatches/LN-LIP-001.webp",
  hook: "the viral trio",
  chips: ["3 pieces", "save €8"],
  tint: "pink",
})) ?? [];

export const findBySku = (sku: string) =>
  products.find((p) => p.sku === sku) ?? bundles.find((b) => b.sku === sku);

export const getProduct = (slug: string) =>
  products.find((p) => p.slug === slug);
