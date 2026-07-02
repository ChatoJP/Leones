// Bloop Chase World asset pack: poses, stickers, cards, game sprites,
// packaging, thumbnails + hero trailer, run loops, TikTok clips.
// Usage: KIE_API_KEY=... node tools/generate-chase-world.mjs [images|videos]

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "assets", "chase-world");
mkdirSync(OUT, { recursive: true });
const KEY = process.env.KIE_API_KEY;
const HEADERS = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
const API = "https://api.kie.ai/api/v1";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const STATE = join(OUT, "state.json");
const state = existsSync(STATE) ? JSON.parse(readFileSync(STATE, "utf8")) : {};
const save = () => writeFileSync(STATE, JSON.stringify(state, null, 2));

const BLOOP = "a small round soft pink plush creature named Bloop with a fluffy white cloud-cap and big cute embroidered eyes, fully original character";
const GLOSS = "an elegant frosted clear gloss tube with pastel blue cap and soft pink swirl inside";
const PLUSH = `Premium collectible plush toy photography of ${BLOOP}, soft fabric texture, cute but sophisticated, centered on a solid pure white background, crisp edges, no text`;
const FLAT = `Clean flat kawaii vector illustration of ${BLOOP}, premium sticker-book style, crisp edges, solid pure white background, no text`;
const BRAND = "LeoNes brand style: premium glossy pastel (sky blue #C9E4F5, baby pink #FBD3DE, gold sparkle), cute but sophisticated, never babyish. Brand wordmark, when present, spelled exactly \"LeoNes\"";

const IMAGES = {};

// ---- 30 poses/expressions (plush photo style, cutout-ready) ----
const POSES = [
  "running at full sprint, leaning forward", "jumping mid-air with joy, arms up", "sliding to a stop, off balance",
  "sitting and waving hello", "sleeping curled in a ball", "laughing so hard it leans back",
  "shocked with wide eyes and open mouth", "crying comically with huge teary eyes", "angry pout with puffed cheeks",
  "heart eyes, in love", "confused with head tilted", "proud arms-crossed smug pose",
  "shy, hiding half its face behind its paws", "cheering with tiny pompoms", "thinking hard, paw on chin",
  "dizzy with swirly eyes", "blowing a kiss", "giving a thumbs-up equivalent with tiny paw",
  "peeking from behind an edge, only half visible", "dancing with one arm up disco style", "yawning hugely",
  "starstruck, sparkles in eyes", "sneaky tip-toe walk", "faceplanted flat on the ground, legs up",
  "meditating cross-legged and serene", "holding a tiny golden trophy", "wearing tiny round glasses reading",
  "wrapped in a tiny scarf, cozy", "carrying a tiny backpack, ready for adventure", "final hero pose, chest out, cape fluttering",
];
POSES.forEach((pose, i) => {
  IMAGES[`poses/pose-${String(i + 1).padStart(2, "0")}`] = { p: `${PLUSH}. Pose: ${pose}`, size: "1:1" };
});

// ---- 50 stickers (die-cut) ----
const STICKER = "Single die-cut sticker, thick white sticker border, subtle drop shadow, solid pure white background, kawaii but premium, no text";
const STICKERS = [
  `${BLOOP} winking`, `${BLOOP} laughing`, `${BLOOP} crying dramatic tears`, `${BLOOP} with heart eyes`,
  `${BLOOP} sleeping on a tiny cloud`, `${BLOOP} running with motion lines`, `${BLOOP} eating a tiny strawberry`,
  `${BLOOP} as an angel with tiny halo`, `${BLOOP} with sunglasses`, `${BLOOP} holding a tiny flower`,
  `${BLOOP} in a party hat`, `${BLOOP} doing a peace sign with tiny paw`,
  "a sleepy white cloud plushie yawning", "a pink jelly-blob plushie sparkling", "the cloud plushie and jelly plushie hugging",
  `${GLOSS} with a tiny crown`, `${GLOSS} leaning playfully`, `${GLOSS} with sparkle trail`,
  "a glossy pink heart with wings", "a rainbow with cloud ends", "a golden four-point sparkle cluster",
  "a pink bubble tea cup with kawaii face", "a pastel butterfly with sparkles", "a tiny pink envelope with heart seal",
  "a cloud raining tiny hearts", "a crescent moon with sleeping face", "a smiling pastel sun",
  "a pink gift box with ribbon exploding confetti", "a strawberry with sparkle", "a pastel ice cream cone melting cutely",
  "a tiny pink phone with heart notification", "a pastel camera with flash sparkle", "a pink headphones set",
  "a magic wand with star tip", "a pastel lock and heart key", "a tiny pink crown",
  "a pastel blue bow", "a pair of cherries with faces", "a pink lightning bolt",
  "a mirror with sparkle reflection", "a pastel shooting star", "a tiny milk carton with kawaii face",
  "a pink paw print made of hearts", "a pastel donut with sprinkles", "a happy pink mushroom with dots",
  "a music note trio in pink", "a tiny pastel book with heart bookmark", "a soft pink cloud with closed content eyes",
  "a golden bell with sparkle", "a pastel planet with ring and tiny hearts orbiting",
];
STICKERS.forEach((d, i) => {
  IMAGES[`stickers/sticker-${String(i + 1).padStart(2, "0")}`] = { p: `${STICKER}: ${d}`, size: "1:1" };
});

// ---- 20 product/packaging visuals ----
const PACK = [
  `${GLOSS} standing beside a tiny plush ${BLOOP} who hugs it, studio white`,
  `${GLOSS} on a pastel pink podium with confetti frozen mid-air`,
  `${GLOSS} inside a crystal display dome on velvet cushion`,
  "a pink mailer box with LeoNes wordmark, tiny cloud pattern debossed, on white",
  "a premium gift bag in gradient blue-pink with rope handles and LeoNes wordmark",
  "a collectible tin box in pastel pink with embossed cloud-cap plushie face, on white",
  `flat-lay: ${GLOSS} with sticker sheet, collectible card and thank-you note on pastel silk`,
  "a blind-box style cube package with question mark made of sparkles, LeoNes wordmark, on white",
  `${GLOSS} emerging from holographic crinkle in an open pink box, macro`,
  "three gloss tubes in a pastel gradient trio pack with window box, LeoNes wordmark",
  `${GLOSS} with a tiny knitted cloud-cap beanie on its cap, adorable, white bg`,
  "a pink drawstring organza pouch with gold lioness charm, product silhouette visible inside",
  `${GLOSS} on a mini conveyor belt of clouds, factory-of-dreams concept`,
  "a pastel vending machine mockup dispensing gloss tubes, front view, LeoNes wordmark",
  `${GLOSS} standing on a stack of collectible cards, soft shadows, white bg`,
  "a seasonal winter edition box: pastel pink with silver snowflakes and ribbon, on white",
  "a birthday edition box: pastel with tiny golden candles pattern and bow, on white",
  `${GLOSS} reflected on a pink mirror floor with sparkle bokeh behind`,
  "an advent-style calendar mockup with 10 numbered pastel doors and cloud shapes, LeoNes wordmark",
  `${GLOSS} held up by three tiny plush paws from below, white bg`,
];
PACK.forEach((d, i) => {
  IMAGES[`packaging/pack-${String(i + 1).padStart(2, "0")}`] = { p: `${BRAND}. Commercial product/packaging photography: ${d}. Premium, crisp, no extra text`, size: "1:1" };
});

// ---- 10 collectible card designs ----
const CARDS = [
  ["bloop-classic", `${BLOOP} in a heroic running pose, sparkle trail`],
  ["bloop-golden", `${BLOOP} in shimmering GOLDEN fabric version, legendary aura, gold sparkles`],
  ["bloop-sleepy", `${BLOOP} asleep on a crescent moon`],
  ["cloudie", "a sleepy white cloud plushie on a pink pillow, dream bubbles"],
  ["jelly", "a pink jelly-blob plushie mid-dance with glitter storm"],
  ["the-gloss", `${GLOSS} on a pedestal with god rays, the legendary prize`],
  ["the-chase", `${BLOOP} chasing ${GLOSS} across clouds, dynamic action`],
  ["trio", "three plushies (pink cloud-cap, white cloud, pink jelly) in a team pose"],
  ["first-roar", "a golden lioness charm on satin ribbon, macro, precious"],
  ["snow-bloop", `${BLOOP} made of snow with real ${BLOOP} beside it, winter scene`],
];
CARDS.forEach(([key, scene]) => {
  IMAGES[`cards/card-${key}`] = {
    p: `${BRAND}. Collectible trading card design, portrait 3:4: ornate pastel frame with gold filigree corners and tiny sparkle gems, inner artwork panel showing ${scene}, soft holographic sheen across the card, premium toy-collectible energy, a small empty banner at the bottom of the frame (no text anywhere)`,
    size: "3:4",
  };
});

// ---- 8 thumbnails/posters ----
const THUMBS = [
  ["thumb-chase-world", `${BLOOP} sprinting after ${GLOSS} through a candy-cloud canyon, epic but cute, wide`],
  ["thumb-game", `${BLOOP} mid-jump collecting golden sparkles in a side-scrolling dream world, wide`],
  ["thumb-cards", "a fan of pastel collectible cards with golden card glowing in center, wide"],
  ["thumb-stickers", "an explosion of kawaii die-cut stickers flying toward camera, wide"],
  ["thumb-trailer", `cinematic still: ${BLOOP} silhouette on a cloud cliff watching ${GLOSS} glow on a distant peak, sunset pastels, wide`],
  ["poster-chase-vertical", `movie-poster style: ${BLOOP} running toward camera, ${GLOSS} escaping above, sparkle trail, dramatic pastel lighting, vertical, no text`],
  ["poster-game-vertical", `${BLOOP} jumping between clouds collecting sparkles, arcade energy, vertical, no text`],
  ["poster-cards-vertical", "golden collectible card floating with light rays, pastel shrine mood, vertical, no text"],
];
THUMBS.forEach(([key, d]) => {
  IMAGES[`thumbnails/${key}`] = { p: `${BRAND}. ${d}`, size: key.includes("vertical") ? "9:16" : "16:9" };
});

// ---- game sprites & layers ----
const GAME = {
  "game/bg-far": { p: `${BRAND}. Seamless side-scrolling game background layer, far distance: soft pastel gradient sky with faint dreamy clouds and tiny stars, very low detail, horizontal 16:9, no text, no characters`, size: "16:9" },
  "game/bg-mid": { p: `${BRAND}. Side-scrolling game background layer, middle distance: fluffy pastel cloud shapes floating at different heights on transparent-feel pale sky, horizontal 16:9, no text, no characters`, size: "16:9" },
  "game/ground": { p: `${BRAND}. Side-scrolling game ground strip: a soft path of glossy pink cloud-ground with subtle sparkle specks, horizontal 16:9, view of just the ground band at bottom, pale sky above, no text`, size: "16:9" },
  "game/sprite-bloop-run": { p: `${FLAT}. Full body side view running fast to the right, dynamic sprint, motion-ready game sprite`, size: "1:1" },
  "game/sprite-bloop-jump": { p: `${FLAT}. Full body side view mid-jump arcing to the right, arms forward, game sprite`, size: "1:1" },
  "game/sprite-gloss-run": { p: `Clean flat kawaii vector illustration of ${GLOSS} tilted forward as if fleeing to the right with tiny motion lines, cheeky small face on the tube, crisp edges, solid pure white background, no text`, size: "1:1" },
  "game/sprite-sparkle": { p: "Clean flat kawaii vector illustration: a golden four-point sparkle with soft glow, game collectible sprite, solid pure white background, no text", size: "1:1" },
  "game/sprite-heart": { p: "Clean flat kawaii vector illustration: a glossy pink heart with white highlight, game collectible sprite, solid pure white background, no text", size: "1:1" },
  "game/sprite-raincloud": { p: "Clean flat kawaii vector illustration: a small grumpy grey-lavender rain cloud with tiny rain drops, cute obstacle sprite, solid pure white background, no text", size: "1:1" },
  "game/title-art": { p: `${BRAND}. Game title artwork: the words "Bloop Chase" in bubbly glossy pink 3D letters with a tiny cloud-cap on the B, sparkles around, on solid pure white background, only those two words`, size: "16:9" },
};
Object.assign(IMAGES, GAME);

// ---- unboxing stills (6) ----
for (let i = 1; i <= 6; i++) {
  const scenes = [
    "closed pink mailer with satin ribbon, top-down on white sheepskin",
    "ribbon half-untied, lid lifting a crack with glow inside",
    "lid open: pink tissue with sparkle print, sticker sheet corner visible",
    `tissue parted: ${GLOSS} nested in holographic crinkle with collectible card beside`,
    `tiny plush paw of ${BLOOP} entering frame lifting the gloss out`,
    `aftermath flat-lay: box, tissue, card, stickers and ${GLOSS} arranged beautifully`,
  ];
  IMAGES[`unboxing/unbox-${i}`] = { p: `${BRAND}. Premium unboxing photography, step ${i}: ${scenes[i - 1]}. Hands-free, soft light, vertical`, size: "3:4" };
}

// ---------------- VIDEOS ----------------
const VSTYLE = "Premium cute 3D animation, pastel pink and blue dream world, glossy, sparkles, cute but sophisticated, TikTok-native vertical 9:16, no humans, no readable text";
const VAUDIO = "Audio: toy squeaks, sparkle chimes, playful adventurous music, no voices, no words";

const VIDEOS = {
  "trailer/act1": `${VSTYLE}. Cinematic trailer act 1: sweeping shot over a vast pastel cloud kingdom at golden hour; ${GLOSS} glints on a distant crystal peak; cut to ${BLOOP} on a cloud cliff, cape fluttering, eyes locking on with determination; it crouches to sprint. Epic but adorable. ${VAUDIO}`,
  "trailer/act2": `${VSTYLE}. Cinematic trailer act 2: continuing the same scene, ${BLOOP} sprints through candy-cloud canyons leaping gaps, sliding under rainbow arches, sparkle trail blazing; ${GLOSS} always one leap ahead, glancing back playfully; final shot both silhouetted on a peak, Bloop reaching, gloss winking — freeze with sparkle burst and clean sky above for a logo. ${VAUDIO}`,
  "loops/run-cycle": `${VSTYLE}. Perfect seamless loop: side view of ${BLOOP} running left-to-right in place against scrolling pastel clouds, tiny legs blurring, cloud-cap bouncing, sparkle trail behind, hypnotic and adorable, designed to loop with no visible cut. ${VAUDIO}`,
  "loops/chase-cycle": `${VSTYLE}. Perfect seamless loop: side view of ${GLOSS} fleeing left-to-right with ${BLOOP} chasing exactly one body-length behind, both bobbing rhythmically against scrolling dreamy clouds, endless loop with no visible cut. ${VAUDIO}`,
  "tiktok/chase-fails": `${VSTYLE}. Comedy compilation: three quick fails of ${BLOOP} chasing ${GLOSS} — slips on a soap bubble, runs into a pillow wall with a poof, grabs a decoy gloss that's actually a marker; ends with Bloop face-down, gloss patting its head consolingly. ${VAUDIO}`,
  "tiktok/gloss-pov": `${VSTYLE}. POV of ${GLOSS} escaping: camera IS the gloss, swerving through a pastel bedroom obstacle course while ${BLOOP} bounds after in pursuit, getting adorably closer until a playful dodge; ends with Bloop's squished face pressed to the lens. ${VAUDIO}`,
  "tiktok/card-pack-asmr": `Extreme close-up ASMR, vertical 9:16: tiny plush paws slowly open a holographic foil card pack, crinkle sounds, sliding out pastel collectible cards one by one, final GOLDEN card revealed with a shimmer flare. Audio: crisp foil crinkles, card slides, golden reveal chime, no voices`,
  "tiktok/sticker-magic": `${VSTYLE}. ${BLOOP} peels a glowing sticker from a giant sticker sheet and slaps it onto the air — it becomes real: a rainbow appears; slaps a heart sticker — real floating heart; final sticker is a tiny gloss… which immediately runs away; Bloop sighs and gives chase. ${VAUDIO}`,
  "tiktok/bloop-vs-vacuum": `${VSTYLE}. ${BLOOP} versus a tiny round pastel robot vacuum: the vacuum bumps its foot; polite standoff; Bloop rides it like a tiny bull as it spins; ends with both parked, Bloop proudly sitting on top like a throne. ${VAUDIO}`,
  "tiktok/cloudie-drives": `${VSTYLE}. The sleepy white cloud plushie behind the wheel of a tiny toy car in slow motion at walking pace, fully asleep; ${BLOOP} jogs alongside pointing at the road urgently; the car gently boops a wall of pillows; everyone is fine; Cloudie keeps sleeping. ${VAUDIO}`,
};

async function createImage(p, size) {
  const j = await (await fetch(`${API}/jobs/createTask`, {
    method: "POST", headers: HEADERS,
    body: JSON.stringify({ model: "google/nano-banana", input: { prompt: p, output_format: "png", image_size: size } }),
  })).json();
  if (j.code !== 200) throw new Error(JSON.stringify(j));
  return j.data.taskId;
}
async function pollImage(id) {
  for (let i = 0; i < 90; i++) {
    const j = await (await fetch(`${API}/jobs/recordInfo?taskId=${id}`, { headers: HEADERS })).json();
    if (j.data.state === "success") return JSON.parse(j.data.resultJson).resultUrls[0];
    if (j.data.state === "fail") throw new Error(j.data.failMsg);
    await sleep(5000);
  }
  throw new Error("timeout");
}
async function createVideo(prompt) {
  const j = await (await fetch(`${API}/veo/generate`, {
    method: "POST", headers: HEADERS,
    body: JSON.stringify({ prompt, model: "veo3_fast", aspect_ratio: "9:16" }),
  })).json();
  if (j.code !== 200) throw new Error(JSON.stringify(j));
  return j.data.taskId;
}
async function pollVideo(id) {
  for (let i = 0; i < 120; i++) {
    const j = await (await fetch(`${API}/veo/record-info?taskId=${id}`, { headers: HEADERS })).json();
    const d = j.data;
    if (d.successFlag === 1) return (d.response?.resultUrls ?? JSON.parse(d.resultUrls ?? "[]"))[0];
    if (d.successFlag === 2 || d.successFlag === 3) throw new Error(d.errorMessage ?? "failed");
    await sleep(15000);
  }
  throw new Error("timeout");
}
async function dl(url, file) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, Buffer.from(await (await fetch(url)).arrayBuffer()));
}
const credit = async () => (await (await fetch(`${API}/chat/credit`, { headers: HEADERS })).json()).data;

const mode = process.argv[2] ?? "images";
console.log("credits before:", await credit());
const SET = mode === "videos" ? VIDEOS : IMAGES;
console.log(mode, "count:", Object.keys(SET).length);
for (let attempt = 1; attempt <= 3; attempt++) {
  let q = 0;
  for (const [key, val] of Object.entries(SET)) {
    const sk = `${mode}:${key}`;
    state[sk] ??= {};
    if (!state[sk].taskId && !state[sk].url) {
      state[sk].taskId = mode === "videos" ? await createVideo(val) : await createImage(val.p, val.size);
      save();
      q++;
      if (q % 8 === 0) await sleep(4500);
    }
  }
  let pending = 0;
  for (const key of Object.keys(SET)) {
    const sk = `${mode}:${key}`;
    if (state[sk].url) continue;
    try {
      state[sk].url = mode === "videos" ? await pollVideo(state[sk].taskId) : await pollImage(state[sk].taskId);
      save();
      await dl(state[sk].url, join(OUT, `${key}.${mode === "videos" ? "mp4" : "png"}`));
      console.log(key, "ok");
    } catch (e) {
      console.error(key, "FAILED:", e.message);
      delete state[sk].taskId;
      save();
      pending++;
    }
  }
  if (!pending) break;
  console.log("retrying", pending);
}
console.log("credits after:", await credit());
console.log("done");
