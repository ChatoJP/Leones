// LeoNes launch content ecosystem — wave 2 (images + videos).
// Usage: KIE_API_KEY=... node tools/generate-content-wave2.mjs [images|videos]

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "assets", "content-wave2");
mkdirSync(OUT, { recursive: true });
const KEY = process.env.KIE_API_KEY;
const HEADERS = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
const API = "https://api.kie.ai/api/v1";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const STATE = join(OUT, "state.json");
const state = existsSync(STATE) ? JSON.parse(readFileSync(STATE, "utf8")) : {};
const save = () => writeFileSync(STATE, JSON.stringify(state, null, 2));

const BRAND =
  "LeoNes brand style: premium glossy pastel beauty world for young teens, pastel sky blue (#C9E4F5) and baby pink " +
  "(#FBD3DE), crystal white, gold sparkle accents, soft dreamy studio light, cute but sophisticated, never babyish, " +
  "never cheap, collectible TikTok-native energy. Any visible text must spell the brand exactly \"LeoNes\"";

const GLOSS = "the LeoNes pH Gloss (frosted clear tube, pastel blue cap, soft pink swirl inside)";
const BOOP = "the LeoNes plush mascot: a small round soft pink plushie with a fluffy white cloud-cap and big cute embroidered eyes";
const PLUSHSTYLE = "premium collectible plush toy photography, soft fabric texture, cute but sophisticated";

const catalog = JSON.parse(readFileSync(join(ROOT, "website", "shared", "catalog.json"), "utf8"));

const IMAGES = {};

// --- ads/cta cards (15) ---
const CTA_STYLES = [
  ["clouds", "floating among soft 3D pastel clouds with sparkles"],
  ["silk", "on flowing pastel pink silk with one gold sparkle"],
  ["podium", `beside ${GLOSS} on a tiny pink podium`],
];
for (const [phrase, slug] of [["coming soon", "coming-soon"], ["limited drop", "limited-drop"], ["shop now", "shop-now"], ["watch it turn pink", "turn-pink"], ["tiny gloss, big mood", "big-mood"]]) {
  for (const [sname, scene] of CTA_STYLES) {
    IMAGES[`ads/cta-${slug}-${sname}`] = {
      p: `${BRAND}. Social ad creative, square: the phrase "${phrase}" in elegant deep plum serif lettering, ${scene}, balanced premium composition, only that phrase as text`,
      size: "1:1",
    };
  }
}

// --- instagram carousels (13) ---
const CAROUSELS = [
  ["carousel-how/slide1", `Cover slide: "watch it turn pink" in plum serif above ${GLOSS} on pastel gradient, square`],
  ["carousel-how/slide2", `${GLOSS} laid horizontally with the cap slightly off, macro clear gloss visible, minimal, square, no text`],
  ["carousel-how/slide3", `extreme macro of a clear gloss smear blooming into soft pink at one end on white acrylic, square, no text`],
  ["carousel-how/slide4", `soft pink gloss smear heart-shaped on pastel background with sparkles, square, no text`],
  ["carousel-how/slide5", `closing slide: "your pink exists" small in plum serif under ${GLOSS} standing in clouds, square`],
  ["carousel-plush/slide1", `Cover: ${PLUSHSTYLE}, the three LeoNes plushies lined up facing camera on pastel pink, square, no text`],
  ["carousel-plush/slide2", `${PLUSHSTYLE}, only the pink cloud-cap plushie mid-run chasing ${GLOSS} that leans away, pastel set, square, no text`],
  ["carousel-plush/slide3", `${PLUSHSTYLE}, only the white sleepy cloud plushie napping on a tiny pink pillow, square, no text`],
  ["carousel-plush/slide4", `${PLUSHSTYLE}, only the pink jelly-blob plushie surrounded by falling glitter confetti, square, no text`],
  ["carousel-unbox/slide1", `Cover: closed pink LeoNes mailer with satin ribbon on white, top-down, square`],
  ["carousel-unbox/slide2", `hands-free: ribbon untied, lid lifting, pink tissue peeking, top-down, square, no text`],
  ["carousel-unbox/slide3", `open box: tissue parted showing ${GLOSS} in holographic crinkle with sticker sheet and thank-you card, top-down, square, no text`],
  ["carousel-unbox/slide4", `${GLOSS} held above the open box by a tiny plush paw entering frame, cute, square, no text`],
];
for (const [key, p] of CAROUSELS) IMAGES[`instagram/${key}`] = { p: `${BRAND}. Instagram carousel slide: ${p}`, size: "1:1" };

// --- reels/tiktok covers (9) ---
const COVERS = ["wake-up", "photo-shoot", "runway", "handbag", "magic-button", "cloud-cap", "mirror", "gift-box", "collection"];
for (const c of COVERS) {
  IMAGES[`covers/cover-${c}`] = {
    p: `${BRAND}. Vertical video cover 9:16 for a cute product film called "${c.replace("-", " ")}": ${GLOSS} in a dreamy ${c.replace("-", " ")} themed pastel scene, bold simple composition readable at thumbnail size, space at top for a title, no text`,
    size: "9:16",
  };
}

// --- facebook ads (6) ---
const FB = [
  ["fb-product-1", `wide ad: ${GLOSS} on pink silk with "your pink exists" small in plum serif on the right side`],
  ["fb-product-2", `wide ad: three LeoNes lip products in a row with soft shadows on white, "Gloss Collection 01" small in plum serif`],
  ["fb-plush-1", `wide ad: ${PLUSHSTYLE}, pink cloud-cap plushie hugging ${GLOSS}, pastel backdrop, "cute enough to chase" in plum serif`],
  ["fb-plush-2", `wide ad: the three plushies peeking over a pink shelf edge at ${GLOSS}, playful, no text`],
  ["fb-unbox-1", `wide ad: open pink gift box glowing softly with ${GLOSS} inside, sparkles, "made to feel special" in plum serif`],
  ["fb-unbox-2", `wide ad: cascade of pink gift boxes and ribbons with empty right half for ad copy, no text`],
];
for (const [key, p] of FB) IMAGES[`facebook/${key}`] = { p: `${BRAND}. Facebook ad creative: ${p}`, size: "16:9" };

// --- reusable story templates (6) ---
const TEMPLATES = [
  ["story-frame-stickers", "vertical 9:16 template: pastel gradient with cute die-cut stickers (hearts, clouds, sparkles) framing the edges, completely empty center, no text"],
  ["story-frame-polaroid", "vertical 9:16 template: an empty white polaroid frame tilted on pastel pink silk with sparkles, space above and below, no text"],
  ["story-frame-clouds", "vertical 9:16 template: cloud shelf at the bottom (empty, for placing a product image), pastel sky above, no text"],
  ["post-frame-scallop", "square template: white scalloped-edge frame on pastel gradient, empty center, tiny sparkles in corners, no text"],
  ["post-frame-jelly", "square template: glossy pink jelly border frame, empty white center, cute but premium, no text"],
  ["banner-frame-wide", "wide 16:9 template: sticker-style hearts and sparkles on edges only, big empty center, no text"],
];
for (const [key, p] of TEMPLATES) IMAGES[`templates/${key}`] = { p: `${BRAND}. Reusable social template: ${p}`, size: p.includes("9:16") ? "9:16" : p.includes("16:9") ? "16:9" : "1:1" };

// --- per-SKU extra renders: in-bag + gift context (20) ---
const SKU_DESCR = {
  "LN-LIP-001": "frosted clear gloss tube with pastel blue cap",
  "LN-LIP-002": "clear glass lip oil bottle with pastel blue cap",
  "LN-LIP-003": "shimmer gloss tube with pastel blue cap",
  "LN-LIP-004": "pearlescent duochrome gloss tube with pastel blue cap",
  "LN-LIP-005": "frosted jar with wide pastel blue lid",
  "LN-LIP-006": "white balm stick with pastel blue cap",
  "LN-LIP-007": "small glass jar of pink sugar scrub with pastel blue lid",
  "LN-LIP-008": "clear jar of bouncy pink jelly with pastel blue lid",
  "LN-LIP-009": "double-ended gloss tube with two pastel blue caps",
  "LN-LIP-010": "glass roll-on gloss bottle with pastel blue cap",
};
for (const [sku, d] of Object.entries(SKU_DESCR)) {
  IMAGES[`products/${sku}-bag`] = {
    p: `${BRAND}. "The bag moment": a LeoNes ${d} peeking out of the open pocket of a cute pastel pink mini shoulder bag with a heart keychain, soft light, premium, vertical, no text`,
    size: "3:4",
  };
  IMAGES[`products/${sku}-gift`] = {
    p: `${BRAND}. Gift visual: a LeoNes ${d} resting on an open small gift box with satin ribbon and holographic crinkle, sparkles, premium, vertical, no text`,
    size: "3:4",
  };
}

// --- thumbnails 16:9 (6) ---
for (const [key, theme] of [["thumb-turn-pink", "clear-to-pink gloss magic"], ["thumb-chase", "plush mascot chasing the gloss"], ["thumb-unbox", "premium pink unboxing"], ["thumb-collection", "the full ten-piece lineup"], ["thumb-jelly", "bouncy jelly wobble"], ["thumb-club", "cubs club charms and stickers"]]) {
  IMAGES[`thumbnails/${key}`] = {
    p: `${BRAND}. Bold wide video thumbnail about ${theme}: high contrast focal product or plushie, simple background, readable tiny, space on right for title text, no text`,
    size: "16:9",
  };
}

// --- mascot chase scene variations (6) + plush scenes (4) ---
const CHASE_SCENES = ["a pastel supermarket aisle of cloud shelves", "a pink beach with jelly waves", "a library of tiny pastel books", "a candy-cloud park with heart balloons", "a pastel train platform with a cloud train", "a mirror maze of pink mirrors"];
CHASE_SCENES.forEach((scene, i) => {
  IMAGES[`mascots/chase-${i + 1}`] = {
    p: `${BRAND}. Cinematic 3D animation frame: ${BOOP} sprinting after ${GLOSS} which leans away playfully, through ${scene}, motion blur on tiny legs, sparkle trail, luxury-cute art direction, wide, no text`,
    size: "16:9",
  };
});
const PLUSH_SCENES = [
  ["plush-tea-party", `the three LeoNes plushies having a tiny tea party with ${GLOSS} as the guest of honor on a doll table`],
  ["plush-movie-night", "the three LeoNes plushies under a tiny blanket watching a small pink TV, popcorn bowl"],
  ["plush-sleepover", "the three LeoNes plushies asleep in a row in tiny pastel sleeping bags, night lamp glow"],
  ["plush-parade", `the three LeoNes plushies marching in a line carrying ${GLOSS} above their heads like a trophy`],
];
for (const [key, scene] of PLUSH_SCENES) {
  IMAGES[`mascots/${key}`] = { p: `${BRAND}. ${PLUSHSTYLE}: ${scene}, pastel dreamy set, wide, no text`, size: "16:9" };
}

// --- glitter/sparkle overlays on black for screen-blend (6) ---
for (const [key, d] of [["overlay-glitter-pink", "fine pink glitter particles scattered"], ["overlay-glitter-gold", "fine gold glitter particles scattered"], ["overlay-bokeh", "soft pink and gold bokeh circles"], ["overlay-sparkles", "four-point sparkle stars various sizes"], ["overlay-hearts", "tiny glossy pink hearts floating"], ["overlay-stardust", "diagonal stream of golden stardust"]]) {
  IMAGES[`overlays/${key}`] = {
    p: `${d} on a pure solid black background, high contrast, evenly distributed, for use as a screen-blend overlay, photographic quality, no text`,
    size: "9:16",
  };
}

// --- seasonal campaigns (8) ---
for (const [key, scene] of [["spring-1", "pastel cherry blossom branches"], ["spring-2", "tiny paper butterflies"], ["summer-1", "pastel pool floaties and water drops"], ["summer-2", "lemonade stand of clouds"], ["autumn-1", "pastel pink autumn leaves"], ["autumn-2", "cozy knit blanket and fairy lights"], ["winter-1", "soft snow and pastel baubles"], ["winter-2", "ice-crystal shelf with warm glow"]]) {
  IMAGES[`campaigns/${key}`] = {
    p: `${BRAND}. Seasonal campaign visual: ${GLOSS} styled with ${scene}, premium beauty editorial, vertical, no text`,
    size: "3:4",
  };
}

// ---------------- VIDEOS (veo3_fast, 9:16 unless noted) ----------------
const VIDEO_STYLE =
  "Premium cute TikTok-native brand video, pastel pink and blue, glossy, sparkles, cute but sophisticated, " +
  "no humans, no readable text. Audio: soft toy sounds, sparkle chimes and gentle bouncy music, no voices, no words";

const VIDEOS = {
  "loops/loop-turn-pink-macro": `Extreme macro: a crystal-clear gloss smear slowly blooming into soft pink from one edge like watercolor, sparkles rising, seamless loop, mesmerizing ASMR. ${VIDEO_STYLE}`,
  "loops/loop-glitter-storm": `Macro inside a gloss tube: holographic glitter swirling like a slow snow globe storm, light rays passing, seamless loop. ${VIDEO_STYLE}`,
  "loops/loop-jelly-wobble": `A glossy pink jelly dome wobbling hypnotically in perfect rhythm on a pastel podium, tiny bubbles inside shimmering, seamless loop. ${VIDEO_STYLE}`,
  "loops/loop-cloud-drift": `${GLOSS} floating slowly through soft 3D clouds, gentle rotation, sparkles drifting past, dreamy seamless loop. ${VIDEO_STYLE}`,
  "chase/chase-supermarket": `${BOOP} as a 3D plush character sprinting after ${GLOSS} down a pastel cloud supermarket aisle, gloss hops onto a shelf, plushie skids past comically, sparkle trail. ${VIDEO_STYLE}`,
  "chase/chase-beach": `${BOOP} chasing ${GLOSS} across a pastel beach with jelly waves, gloss surfs a tiny wave, plushie tumbles in the sand adorably and pops back up. ${VIDEO_STYLE}`,
  "chase/chase-mirrors": `${BOOP} chasing ${GLOSS} through a maze of pink mirrors, keeps hugging reflections by mistake, ends confused and cute. ${VIDEO_STYLE}`,
  "plush/plush-trio-react": `The three LeoNes plushies (pink cloud-cap one, sleepy white cloud one, sparkly jelly-blob one) gathered around ${GLOSS} on a pedestal: they gasp, bounce with joy, and applaud with tiny arms. ${VIDEO_STYLE}`,
  "plush/plush-cloudie-nap": `The sleepy white cloud plushie slowly drifting to sleep on a pink pillow, breathing softly, a tiny dream bubble showing ${GLOSS} appears above, seamless cozy loop. ${VIDEO_STYLE}`,
  "plush/plush-jelly-party": `The pink jelly-blob plushie dancing in falling glitter confetti, wobbling to the beat, other two plushies peek in and join, joyful ending pose. ${VIDEO_STYLE}`,
  "stings/sting-turn-pink": `Fast product sting: ${GLOSS} spins once, the swirl inside blooms from clear to pink with a sparkle burst, snap to clean hero pose, 3 second energy repeated as loop. ${VIDEO_STYLE}`,
  "stings/sting-drop": `Drop announcement sting: pink gift box drops onto pastel floor with soft bounce, lid pops, ${GLOSS} rises out glowing, confetti. ${VIDEO_STYLE}`,
  "stings/sting-logo": `Logo sting: golden sparkles swirl and converge into a glowing four-point star over pastel gradient, gentle flash to clean pastel frame, elegant, seamless loop. ${VIDEO_STYLE}`,
};

async function createImage(prompt, size) {
  const res = await fetch(`${API}/jobs/createTask`, {
    method: "POST", headers: HEADERS,
    body: JSON.stringify({ model: "google/nano-banana", input: { prompt, output_format: "png", image_size: size } }),
  });
  const json = await res.json();
  if (json.code !== 200) throw new Error(JSON.stringify(json));
  return json.data.taskId;
}
async function pollImage(id) {
  for (let i = 0; i < 90; i++) {
    const res = await fetch(`${API}/jobs/recordInfo?taskId=${id}`, { headers: HEADERS });
    const json = await res.json();
    if (json.data.state === "success") return JSON.parse(json.data.resultJson).resultUrls[0];
    if (json.data.state === "fail") throw new Error(json.data.failMsg);
    await sleep(5000);
  }
  throw new Error("timeout");
}
async function createVideo(prompt) {
  const res = await fetch(`${API}/veo/generate`, {
    method: "POST", headers: HEADERS,
    body: JSON.stringify({ prompt, model: "veo3_fast", aspect_ratio: "9:16" }),
  });
  const json = await res.json();
  if (json.code !== 200) throw new Error(JSON.stringify(json));
  return json.data.taskId;
}
async function pollVideo(id) {
  for (let i = 0; i < 120; i++) {
    const res = await fetch(`${API}/veo/record-info?taskId=${id}`, { headers: HEADERS });
    const json = await res.json();
    const d = json.data;
    if (d.successFlag === 1) return (d.response?.resultUrls ?? JSON.parse(d.resultUrls ?? "[]"))[0];
    if (d.successFlag === 2 || d.successFlag === 3) throw new Error(d.errorMessage ?? "failed");
    await sleep(15000);
  }
  throw new Error("timeout");
}
async function download(url, file) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, Buffer.from(await (await fetch(url)).arrayBuffer()));
}
const credit = async () => (await (await fetch(`${API}/chat/credit`, { headers: HEADERS })).json()).data;

const mode = process.argv[2] ?? "images";
console.log("credits before:", await credit());

if (mode === "images") {
  console.log("wave2 images:", Object.keys(IMAGES).length);
  for (let attempt = 1; attempt <= 3; attempt++) {
    let queued = 0;
    for (const [key, { p, size }] of Object.entries(IMAGES)) {
      state[key] ??= {};
      if (!state[key].taskId && !state[key].url) {
        state[key].taskId = await createImage(p, size);
        save();
        queued++;
        if (queued % 8 === 0) await sleep(4500);
      }
    }
    let pending = 0;
    for (const key of Object.keys(IMAGES)) {
      if (state[key].url) continue;
      try {
        state[key].url = await pollImage(state[key].taskId);
        save();
        await download(state[key].url, join(OUT, `${key}.png`));
        console.log(key, "ok");
      } catch (e) {
        console.error(key, "FAILED:", e.message);
        delete state[key].taskId;
        save();
        pending++;
      }
    }
    if (!pending) break;
    console.log(`retrying ${pending}`);
  }
} else if (mode === "videos") {
  console.log("wave2 videos:", Object.keys(VIDEOS).length);
  for (let attempt = 1; attempt <= 3; attempt++) {
    for (const [key, prompt] of Object.entries(VIDEOS)) {
      const sk = `video:${key}`;
      state[sk] ??= {};
      if (!state[sk].taskId && !state[sk].url) {
        state[sk].taskId = await createVideo(prompt);
        save();
        console.log(sk, "queued");
        await sleep(2000);
      }
    }
    let pending = 0;
    for (const key of Object.keys(VIDEOS)) {
      const sk = `video:${key}`;
      if (state[sk].url) continue;
      try {
        state[sk].url = await pollVideo(state[sk].taskId);
        save();
        await download(state[sk].url, join(OUT, `${key}.mp4`));
        console.log(sk, "ok");
      } catch (e) {
        console.error(sk, "FAILED:", e.message);
        delete state[sk].taskId;
        save();
        pending++;
      }
    }
    if (!pending) break;
    console.log(`retrying ${pending}`);
  }
}
console.log("credits after:", await credit());
console.log("done");
