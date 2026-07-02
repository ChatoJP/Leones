// Batch-1 assets: one playful premium scene image per SKU + a collection
// family portrait + one collection film.
// Usage: KIE_API_KEY=... node tools/generate-scenes.mjs [images|video]

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const KEY = process.env.KIE_API_KEY;
const HEADERS = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
const API = "https://api.kie.ai/api/v1";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const OUT = join(ROOT, "assets", "scenes");
mkdirSync(OUT, { recursive: true });
const STATE_FILE = join(OUT, "state.json");
const state = existsSync(STATE_FILE) ? JSON.parse(readFileSync(STATE_FILE, "utf8")) : {};
const save = () => writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

const BASE =
  "Premium playful beauty scene photography for a girls' cosmetic brand, pastel sky blue and baby pink palette, " +
  "soft dreamy studio light, glossy surfaces, cute but sophisticated, high-end commercial photography, no people, " +
  "the product packaging shows a small clean 'LeoNes' wordmark, crisp focus, vertical 3:4 composition";

const SCENES = {
  "LN-LIP-001": "a frosted clear gloss tube with pastel blue cap standing on a tiny pink podium among soft mini clouds, a little gold trophy beside it, confetti hearts frozen mid-air",
  "LN-LIP-002": "a clear glass lip oil bottle with pastel blue cap on a mirrored pastel vanity, tiny crystal prisms scattering little rainbows across the surface",
  "LN-LIP-003": "a shimmer gloss tube with pastel blue cap inside a real glass snow globe on a pink silk cloth, glitter suspended around it inside the globe",
  "LN-LIP-004": "a duochrome gloss tube with pastel blue cap between two giant soap bubbles reflecting blue on one side and pink on the other, pastel gradient backdrop",
  "LN-LIP-005": "a frosted jar with wide pastel blue lid on a fluffy white cloud bed under a crescent moon lamp, tiny stars bokeh, cozy dreamy night mood",
  "LN-LIP-006": "a white balm stick with pastel blue cap standing in miniature beach scene made of pastel sand and a tiny striped parasol, soft sunny light",
  "LN-LIP-007": "a small glass jar with pastel blue lid of pink sugar scrub styled like a patisserie dessert on a tiny cake stand with sugar crystals sprinkled around",
  "LN-LIP-008": "a clear jar with pastel blue lid of bouncy pink jelly on a pastel checkered picnic cloth beside tiny jelly desserts, playful and glossy",
  "LN-LIP-009": "a double-ended gloss tube with two pastel blue caps lying on a friendship-bracelet strewn pastel surface, two matching charm bracelets beside it",
  "LN-LIP-010": "a glass roll-on gloss bottle with pastel blue cap on a tiny pastel race podium with a checkered mini flag, playful speed theme, elegant not childish",
};

async function job(model, input) {
  const res = await fetch(`${API}/jobs/createTask`, { method: "POST", headers: HEADERS, body: JSON.stringify({ model, input }) });
  const json = await res.json();
  if (json.code !== 200) throw new Error(JSON.stringify(json));
  return json.data.taskId;
}
async function poll(taskId) {
  for (let i = 0; i < 90; i++) {
    const res = await fetch(`${API}/jobs/recordInfo?taskId=${taskId}`, { headers: HEADERS });
    const json = await res.json();
    if (json.data.state === "success") return JSON.parse(json.data.resultJson).resultUrls[0];
    if (json.data.state === "fail") throw new Error(json.data.failMsg);
    await sleep(5000);
  }
  throw new Error("timeout");
}
async function download(url, file) {
  writeFileSync(file, Buffer.from(await (await fetch(url)).arrayBuffer()));
}

const mode = process.argv[2] ?? "images";

if (mode === "images") {
  // submit all in parallel
  for (const [sku, scene] of Object.entries(SCENES)) {
    state[sku] ??= {};
    if (!state[sku].taskId && !state[sku].url) {
      state[sku].taskId = await job("google/nano-banana", {
        prompt: `${BASE}. Scene: ${scene}.`,
        output_format: "png",
        image_size: "3:4",
      });
      save();
      console.log(`${sku}: task ${state[sku].taskId}`);
    }
  }
  // family portrait
  state.family ??= {};
  if (!state.family.taskId && !state.family.url) {
    state.family.taskId = await job("google/nano-banana", {
      prompt:
        `${BASE.replace("vertical 3:4 composition", "wide 16:9 composition")}. Scene: the complete collection of ten ` +
        "LeoNes lip products (gloss tubes, jars, a balm stick, a roll-on, a double-ended tube — all frosted clear with " +
        "matching pastel blue caps and lids) arranged like a family portrait on pastel pink tiered steps, soft clouds " +
        "and sparkles behind, one hero gloss slightly in front",
      output_format: "png",
      image_size: "16:9",
    });
    save();
    console.log(`family: task ${state.family.taskId}`);
  }
  for (const key of [...Object.keys(SCENES), "family"]) {
    if (state[key].url) continue;
    state[key].url = await poll(state[key].taskId);
    save();
    await download(state[key].url, join(OUT, `${key}.png`));
    console.log(`${key}: downloaded`);
  }
} else if (mode === "video") {
  if (!state.family?.url) throw new Error("family image missing — run images first");
  if (!state.filmTaskId) {
    const res = await fetch(`${API}/veo/generate`, {
      method: "POST", headers: HEADERS,
      body: JSON.stringify({
        prompt:
          "Premium collection film for a girls' beauty brand, vertical 9:16. The camera glides slowly across the " +
          "family of pastel products on their pink tiered steps; soft clouds drift, sparkles twinkle, each product " +
          "catches a gentle light sweep as the camera passes, the hero gloss in front gets a final slow push-in with " +
          "a sparkle ping. Elegant, dreamy, luxury-cute. Audio: soft magical chimes and gentle dreamy music, " +
          "no voices, no words",
        imageUrls: [state.family.url],
        model: "veo3_fast",
        aspect_ratio: "9:16",
      }),
    });
    const json = await res.json();
    if (json.code !== 200) throw new Error(JSON.stringify(json));
    state.filmTaskId = json.data.taskId;
    save();
    console.log("film task:", state.filmTaskId);
  }
  for (let i = 0; i < 120; i++) {
    const r = await fetch(`${API}/veo/record-info?taskId=${state.filmTaskId}`, { headers: HEADERS });
    const b = await r.json();
    if (b.data.successFlag === 1) {
      const urls = b.data.response?.resultUrls ?? JSON.parse(b.data.resultUrls ?? "[]");
      state.filmUrl = urls[0];
      save();
      await download(state.filmUrl, join(OUT, "collection-film.mp4"));
      console.log("collection-film.mp4 downloaded");
      process.exit(0);
    }
    if (b.data.successFlag === 2 || b.data.successFlag === 3) throw new Error(b.data.errorMessage ?? "failed");
    await sleep(15000);
  }
}
