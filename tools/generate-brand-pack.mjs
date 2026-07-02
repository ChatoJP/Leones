// LeoNes brand asset pack: high-volume, brand-consistent image generation.
// Organized into assets/brand-pack/<category>/. Resilient per-item retries.
// Usage: KIE_API_KEY=... node tools/generate-brand-pack.mjs [category...]

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "assets", "brand-pack");
mkdirSync(OUT, { recursive: true });
const KEY = process.env.KIE_API_KEY;
const HEADERS = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
const API = "https://api.kie.ai/api/v1";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const STATE = join(OUT, "state.json");
const state = existsSync(STATE) ? JSON.parse(readFileSync(STATE, "utf8")) : {};
const save = () => writeFileSync(STATE, JSON.stringify(state, null, 2));

const BRAND =
  "LeoNes brand style: premium glossy pastel beauty world for young teens, pastel sky blue (#C9E4F5) and baby " +
  "pink (#FBD3DE), crystal white, subtle gold sparkle accents, soft dreamy studio light, cute but sophisticated " +
  "(never babyish, never cheap), collectible TikTok-native energy. The brand wordmark is exactly \"LeoNes\" " +
  "(capital L, capital N) whenever text appears — never any other spelling";

const PRODUCT =
  "the LeoNes pH Gloss: an elegant frosted clear cylindrical gloss tube with pastel blue cap and a soft pink swirl inside";

// category -> { name -> { p: prompt, size } }
const PACK = {
  logos: {
    "icon-sparkle": { p: `${BRAND}. Minimal premium brand icon: a golden four-point sparkle inside a soft pink rounded square with subtle gloss, flat vector style, crisp edges, pure white background, no text`, size: "1:1" },
    "monogram-badge": { p: `${BRAND}. Premium circular badge logo with elegant serif letters "LN" in deep plum centered, thin gold sparkle ring, pastel pink fill, flat design, pure white background`, size: "1:1" },
    "wordmark-ribbon": { p: `${BRAND}. The word "LeoNes" in elegant deep plum serif lettering on a soft pink satin ribbon banner with gentle folds, small gold sparkle above the final s, pure white background`, size: "16:9" },
    "wordmark-clouds": { p: `${BRAND}. The word "LeoNes" in elegant deep plum serif lettering floating among soft 3D pastel clouds with tiny sparkles, dreamy but clean, wide composition`, size: "16:9" },
  },
  products: {
    "duo-gloss-jelly": { p: `${BRAND}. Commercial e-commerce photo of ${PRODUCT} standing beside a clear jar of bouncy pink jelly lip mask with pastel blue lid, both on white, soft contact shadows`, size: "1:1" },
    "duo-gloss-oil": { p: `${BRAND}. Commercial e-commerce photo of ${PRODUCT} beside a small clear glass lip oil bottle with pastel blue cap, on white, soft shadows`, size: "1:1" },
    "trio-lineup": { p: `${BRAND}. Three LeoNes lip products in a row on white: frosted gloss tube, jelly jar, glitter gloss tube — all with pastel blue caps, perfect e-commerce lighting`, size: "16:9" },
    "macro-cap": { p: `${BRAND}. Extreme macro of a pastel blue product cap with tiny "LeoNes" embossed, glossy highlight, shallow depth of field, white background`, size: "1:1" },
    "gloss-on-mirror": { p: `${BRAND}. ${PRODUCT} standing on a round mirror tray with soft pink reflections and a few scattered pearl beads, premium beauty editorial, pastel backdrop`, size: "3:4" },
    "gloss-in-clouds": { p: `${BRAND}. ${PRODUCT} nestled in fluffy white 3D clouds with tiny gold sparkles, dreamy premium hero shot`, size: "3:4" },
    "flatlay-vanity": { p: `${BRAND}. Top-down flat-lay: ${PRODUCT} with a pink scrunchie, heart-shaped mirror, sticker sheet and satin ribbon on pastel pink surface, styled but minimal`, size: "1:1" },
    "gloss-water": { p: `${BRAND}. ${PRODUCT} standing in shallow crystal water with soft ripples and pink reflections, fresh premium beauty shot`, size: "3:4" },
  },
  packaging: {
    "mailer-closed": { p: `${BRAND}. Product mockup of a closed soft pink mailer box with "LeoNes" printed small and centered in deep plum serif, satin ribbon, on white, studio light`, size: "1:1" },
    "shopping-bag": { p: `${BRAND}. Product mockup of a premium pastel pink paper shopping bag with rope handles and "LeoNes" wordmark in deep plum serif, on white`, size: "3:4" },
    "sticker-sheet": { p: `${BRAND}. Mockup of a die-cut sticker sheet with kawaii hearts, clouds, sparkles, a tiny gloss tube and a small cloud-cap plushie face, glossy finish, on white`, size: "3:4" },
    "pouch": { p: `${BRAND}. Product mockup of a quilted holographic pink cosmetic pouch with a small gold lioness charm on the zipper, on white, premium`, size: "1:1" },
    "gift-wrap": { p: `${BRAND}. A small gift box wrapped in pastel pink paper with tiny sparkle pattern and satin bow, "LeoNes" gift tag, on white`, size: "1:1" },
    "tissue-unbox": { p: `${BRAND}. Open mailer box showing pink tissue paper with tiny white sparkle print, a thank-you card peeking out, premium unboxing detail shot`, size: "1:1" },
  },
  heroes: {
    "bg-clouds": { p: `${BRAND}. Website hero background: soft 3D pastel clouds on a blue-to-pink gradient sky with tiny sparkles, lots of empty space in the middle for text, no products, no text`, size: "16:9" },
    "bg-glitter-bokeh": { p: `${BRAND}. Website hero background: dreamy pink glitter bokeh with soft gold light spots, gentle gradient, empty center, no text`, size: "16:9" },
    "bg-silk-wave": { p: `${BRAND}. Website hero background: flowing pastel pink silk waves with soft blue light from one side, elegant and calm, empty space, no text`, size: "16:9" },
    "bg-jelly-land": { p: `${BRAND}. Playful background: a dreamy landscape of glossy pink jelly hills and cloud trees, cute but elegant, wide, no characters, no text`, size: "16:9" },
    "bg-vertical-sparkle": { p: `${BRAND}. Vertical story background: pastel gradient with floating hearts, sparkles and soft clouds, empty middle for text, no text`, size: "9:16" },
    "bg-vertical-clouds": { p: `${BRAND}. Vertical story background: soft cloud tunnel with pink light glow at the end, dreamy, empty space, no text`, size: "9:16" },
  },
  stickers: {
    "jellyboop": { p: `${BRAND}. Single die-cut sticker: the word "JellyBoop" in bubbly glossy pink 3D letters with tiny sparkles, thick white sticker border, pure white background`, size: "1:1" },
    "boop-face": { p: `${BRAND}. Single die-cut sticker: cute face of a round pink plushie with white cloud-cap, winking, thick white border, pure white background, no text`, size: "1:1" },
    "gloss-tube": { p: `${BRAND}. Single die-cut sticker: kawaii illustration of ${PRODUCT} with a tiny smile, thick white border, pure white background, no text`, size: "1:1" },
    "rainbow": { p: `${BRAND}. Single die-cut sticker: pastel rainbow arc with a small cloud at each end and sparkles, glossy, thick white border, pure white background, no text`, size: "1:1" },
    "crown": { p: `${BRAND}. Single die-cut sticker: tiny golden crown with pink gems and sparkles, glossy 3D, thick white border, pure white background, no text`, size: "1:1" },
    "lightning-cute": { p: `${BRAND}. Single die-cut sticker: soft pink lightning bolt with kawaii sparkle eyes, glossy, thick white border, pure white background, no text`, size: "1:1" },
  },
  mascots: {
    "boop-wave": { p: `Premium collectible plush toy photography: a small round soft pink plushie with fluffy white cloud-cap, embroidered happy eyes, one tiny arm waving hello, soft fabric texture, centered on pure white background, cute but sophisticated, no text`, size: "1:1" },
    "boop-sleep": { p: `Premium collectible plush toy photography: a small round soft pink plushie with fluffy white cloud-cap sleeping curled up, closed embroidered eyes, tiny "zzz" energy without text, on pure white background, no text`, size: "1:1" },
    "trio-hug": { p: `Premium collectible plush toy photography: three kawaii plushies in a group hug — pink round one with cloud-cap, white sleepy cloud one, sparkly pink jelly-blob one — soft fabric textures, pure white background, no text`, size: "1:1" },
    "boop-with-gloss": { p: `Premium collectible plush toy photography: a small round pink plushie with white cloud-cap hugging ${PRODUCT} tightly with tiny arms, love-struck embroidered eyes, pure white background, no text`, size: "1:1" },
  },
  social: {
    "post-drop": { p: `${BRAND}. Instagram square announcement: ${PRODUCT} centered on pastel podium with clouds, the words "Gloss Collection 01" small and elegant in deep plum serif, balanced composition`, size: "1:1" },
    "post-quote": { p: `${BRAND}. Instagram square: the phrase "your pink exists" in elegant deep plum serif on soft pink silk background with one sparkle, minimal and premium`, size: "1:1" },
    "post-besties": { p: `${BRAND}. Instagram square: two LeoNes gloss tubes leaning on each other like best friends on a pastel heart-patterned background, cute, no other text`, size: "1:1" },
    "post-unboxing": { p: `${BRAND}. Instagram square: hands-free view of open pink LeoNes gift box with tissue, ribbon and gloss inside, top-down, sparkles, premium`, size: "1:1" },
    "story-drop": { p: `${BRAND}. Vertical 9:16 story visual: ${PRODUCT} floating among clouds and sparkles with empty space top and bottom for text overlays, no text`, size: "9:16" },
    "story-plush": { p: `Premium vertical 9:16 story visual: a cute round pink plushie with white cloud-cap reaching up toward ${PRODUCT} floating above it, pastel dreamy background, sparkles, no text`, size: "9:16" },
  },
  banners: {
    "banner-drop": { p: `${BRAND}. Wide website banner: the full lineup of ten pastel lip products on floating pink shelves among clouds, small "Gloss Collection 01" in plum serif, elegant`, size: "16:9" },
    "banner-club": { p: `${BRAND}. Wide website banner: cute plushies and gold charms around the words "Cubs Club" in deep plum serif, pastel, premium, playful`, size: "16:9" },
    "banner-gift": { p: `${BRAND}. Wide website banner: pink gift boxes with ribbons and sparkles cascading, empty space on the right for text, no text`, size: "16:9" },
    "banner-sale-frame": { p: `${BRAND}. Wide website banner background: pastel gradient with sticker-style hearts and sparkles around the edges, big empty center, no text`, size: "16:9" },
  },
  icons: {
    "icon-bag": { p: `${BRAND}. Single kawaii UI icon: a tiny pink shopping bag with sparkle, glossy 3D style, centered, pure white background, no text`, size: "1:1" },
    "icon-heart": { p: `${BRAND}. Single kawaii UI icon: glossy 3D pink heart with highlight, centered, pure white background, no text`, size: "1:1" },
    "icon-gift": { p: `${BRAND}. Single kawaii UI icon: tiny pink gift box with blue ribbon, glossy 3D, centered, pure white background, no text`, size: "1:1" },
    "icon-cloud": { p: `${BRAND}. Single kawaii UI icon: soft white-blue cloud, glossy 3D, centered, pure white background, no text`, size: "1:1" },
    "icon-star": { p: `${BRAND}. Single kawaii UI icon: golden four-point sparkle star, glossy 3D, centered, pure white background, no text`, size: "1:1" },
    "icon-lock": { p: `${BRAND}. Single kawaii UI icon: tiny gold padlock with pink heart keyhole (secure checkout), glossy 3D, centered, pure white background, no text`, size: "1:1" },
  },
  campaigns: {
    "camp-backtoschool": { p: `${BRAND}. Campaign visual: ${PRODUCT} peeking out of a pastel pink backpack pocket with cute keychains, soft morning light, back-to-school mood, premium`, size: "3:4" },
    "camp-birthday": { p: `${BRAND}. Campaign visual: ${PRODUCT} on a tiny birthday cake stand with pastel candles and confetti, celebratory but elegant`, size: "3:4" },
    "camp-besties": { p: `${BRAND}. Campaign visual: two gloss tubes with friendship bracelets draped around them on a pastel background with heart bokeh`, size: "3:4" },
    "camp-winter": { p: `${BRAND}. Campaign visual: ${PRODUCT} in a snowy pastel scene with tiny knitted scarf draped on it, soft snowflakes, cozy winter drop mood`, size: "3:4" },
  },
};

async function createJob(prompt, size) {
  const res = await fetch(`${API}/jobs/createTask`, {
    method: "POST", headers: HEADERS,
    body: JSON.stringify({ model: "google/nano-banana", input: { prompt, output_format: "png", image_size: size } }),
  });
  const json = await res.json();
  if (json.code !== 200) throw new Error(JSON.stringify(json));
  return json.data.taskId;
}
async function poll(id) {
  for (let i = 0; i < 90; i++) {
    const res = await fetch(`${API}/jobs/recordInfo?taskId=${id}`, { headers: HEADERS });
    const json = await res.json();
    if (json.data.state === "success") return JSON.parse(json.data.resultJson).resultUrls[0];
    if (json.data.state === "fail") throw new Error(json.data.failMsg);
    await sleep(5000);
  }
  throw new Error("timeout");
}

const only = process.argv.slice(2);
const categories = Object.entries(PACK).filter(([cat]) => !only.length || only.includes(cat));
const total = categories.reduce((n, [, jobs]) => n + Object.keys(jobs).length, 0);
console.log(`brand pack: ${total} assets across ${categories.length} categories`);

const credit = async () => (await (await fetch(`${API}/chat/credit`, { headers: HEADERS })).json()).data;
console.log("credits before:", await credit());

for (let attempt = 1; attempt <= 3; attempt++) {
  // submit in batches of 8 to respect rate limits
  let queued = 0;
  for (const [cat, jobs] of categories) {
    mkdirSync(join(OUT, cat), { recursive: true });
    for (const [name, { p, size }] of Object.entries(jobs)) {
      const key = `${cat}/${name}`;
      state[key] ??= {};
      if (!state[key].taskId && !state[key].url) {
        state[key].taskId = await createJob(p, size);
        save();
        queued++;
        if (queued % 8 === 0) await sleep(4000);
      }
    }
  }
  let pending = 0;
  for (const [cat, jobs] of categories) {
    for (const name of Object.keys(jobs)) {
      const key = `${cat}/${name}`;
      if (state[key].url) continue;
      try {
        state[key].url = await poll(state[key].taskId);
        save();
        const buf = Buffer.from(await (await fetch(state[key].url)).arrayBuffer());
        writeFileSync(join(OUT, cat, `${name}.png`), buf);
        console.log(key, "ok");
      } catch (err) {
        console.error(key, "FAILED:", err.message);
        delete state[key].taskId;
        save();
        pending++;
      }
    }
  }
  if (!pending) break;
  console.log(`attempt ${attempt}: retrying ${pending}`);
}

console.log("credits after:", await credit());
console.log("done");
