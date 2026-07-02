// Plushie-world cast + stickers. White backgrounds for cutout.
// Usage: KIE_API_KEY=... node tools/generate-plushies.mjs

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "assets", "plushies");
mkdirSync(OUT, { recursive: true });
const KEY = process.env.KIE_API_KEY;
const HEADERS = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
const API = "https://api.kie.ai/api/v1";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const STATE = join(OUT, "state.json");
const state = existsSync(STATE) ? JSON.parse(readFileSync(STATE, "utf8")) : {};
const save = () => writeFileSync(STATE, JSON.stringify(state, null, 2));

const PLUSH =
  "Premium collectible plush toy product photography, soft studio light, high-end kawaii plushie with visible " +
  "soft fabric texture, embroidered face details, cute but sophisticated (not babyish), centered on a solid pure " +
  "white background, crisp edges, no text";

const JOBS = {
  "cloudie": `${PLUSH}. A soft round cloud plushie in white with the faintest blue tint, sleepy dreamy embroidered eyes (half closed), tiny sweet smile, small rosy cheeks, resting slightly tilted like it is about to nap`,
  "jelly": `${PLUSH}. A wobbly pink jelly-blob plushie with glossy sequin-sparkle fabric patches, wide excited chaotic embroidered eyes, big open happy mouth, tiny stubby arms thrown up in celebration`,
  "boop-sad": `${PLUSH}. A small round soft pink plushie with a fluffy white cloud-cap on its head, big sad embroidered puppy eyes looking up, tiny pouting mouth, drooping posture, utterly heart-melting`,
  "boop-happy": `${PLUSH}. A small round soft pink plushie with a fluffy white cloud-cap on its head, huge delighted embroidered eyes, open joyful smile, tiny arms raised in triumph, mid little happy jump`,
  "group": "Premium collectible plush toy group photography: three kawaii plushies posed together around an elegant frosted clear lip gloss tube with pastel blue cap standing in the middle — a pink round plushie with white cloud-cap reaching for the gloss, a sleepy white cloud plushie, and a sparkly pink jelly-blob plushie cheering. Soft pastel pink studio backdrop, dreamy light, soft shadows, cute but premium, wide 16:9, no text",
  "sticker-heart": "Single die-cut sticker design of a glossy 3D pink heart with a white highlight, thick white sticker border, subtle drop shadow, on a solid pure white background, kawaii but premium, no text",
  "sticker-cloud": "Single die-cut sticker design of a soft kawaii cloud with tiny sleepy face, pastel blue-white gradient, thick white sticker border, subtle drop shadow, solid pure white background, no text",
  "sticker-sparkle": "Single die-cut sticker design of a golden four-point sparkle star with tiny pink mini-sparkles, glossy 3D look, thick white sticker border, solid pure white background, no text",
};

async function job(prompt, size) {
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

for (let attempt = 1; attempt <= 3; attempt++) {
  for (const [name, prompt] of Object.entries(JOBS)) {
    state[name] ??= {};
    if (!state[name].taskId && !state[name].url) {
      state[name].taskId = await job(prompt, name === "group" ? "16:9" : "1:1");
      save();
      console.log(name, "task", state[name].taskId);
    }
  }
  let pending = 0;
  for (const name of Object.keys(JOBS)) {
    if (state[name].url) continue;
    try {
      state[name].url = await poll(state[name].taskId);
      save();
      const buf = Buffer.from(await (await fetch(state[name].url)).arrayBuffer());
      writeFileSync(join(OUT, `${name}.png`), buf);
      console.log(name, "downloaded");
    } catch (err) {
      console.error(name, "FAILED:", err.message, "- will retry");
      delete state[name].taskId;
      save();
      pending++;
    }
  }
  if (pending === 0) break;
  console.log(`attempt ${attempt}: ${pending} to retry`);
}
console.log("done");
