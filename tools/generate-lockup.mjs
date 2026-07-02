// Official Boop+wordmark logo lockup, from the existing brand assets.
// Usage: KIE_API_KEY=... node tools/generate-lockup.mjs

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "assets", "brand");
mkdirSync(OUT, { recursive: true });
const KEY = process.env.KIE_API_KEY;
const HEADERS = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
const API = "https://api.kie.ai/api/v1";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const STATE = join(OUT, "lockup-state.json");
const state = existsSync(STATE) ? JSON.parse(readFileSync(STATE, "utf8")) : {};
const save = () => writeFileSync(STATE, JSON.stringify(state, null, 2));

async function upload(file, name) {
  const res = await fetch("https://kieai.redpandaai.co/api/file-base64-upload", {
    method: "POST", headers: HEADERS,
    body: JSON.stringify({
      base64Data: `data:image/png;base64,${readFileSync(file).toString("base64")}`,
      uploadPath: "leones/brand", fileName: name,
    }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(JSON.stringify(json));
  return json.data.downloadUrl ?? json.data.fileUrl;
}
async function edit(prompt, urls, size) {
  const res = await fetch(`${API}/jobs/createTask`, {
    method: "POST", headers: HEADERS,
    body: JSON.stringify({ model: "google/nano-banana-edit", input: { prompt, image_urls: urls, output_format: "png", image_size: size } }),
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
async function dl(url, file) {
  writeFileSync(file, Buffer.from(await (await fetch(url)).arrayBuffer()));
}

// refs
if (!state.wordmarkUrl) {
  state.wordmarkUrl = await upload(join(OUT, "logo-dark.png"), "wordmark.png");
  save();
}
if (!state.boopUrl) {
  // boop on white for the edit model
  state.boopUrl = await upload(join(ROOT, "assets", "plushies", "boop-happy.png"), "boop-ref.png");
  save();
}
console.log("refs ready");

const JOBS = {
  "lockup-dark": {
    urls: [state.wordmarkUrl, state.boopUrl],
    size: "16:9",
    p: "Combine these two brand assets into one official logo lockup: keep the wordmark from the first image EXACTLY as it is (same deep plum serif letters spelling \"LeoNes\", same sparkle) large and centered, and add a small simplified flat-illustration version of the plush character from the second image (round pink body, white cloud cap, cute face) peeking over the top of the letters between the N and e, with tiny paws resting on the letterforms. Clean flat vector-style logo, solid pure white background, perfectly balanced, premium and cute, no other elements, no extra text",
  },
  "lockup-light": {
    urls: [state.wordmarkUrl, state.boopUrl],
    size: "16:9",
    p: "Combine these two brand assets into one official logo lockup on a solid deep plum (#3A2E3D) background: the wordmark from the first image redrawn in pure white (same serif letterforms spelling \"LeoNes\", same sparkle), and a small simplified flat-illustration version of the plush character from the second image (round pink body, white cloud cap, cute face) peeking over the top of the letters between the N and e with tiny paws on the letterforms. Clean flat vector-style, perfectly balanced, premium and cute, no other elements, no extra text",
  },
  "icon-boop": {
    urls: [state.boopUrl],
    size: "1:1",
    p: "Turn this plush character into a premium app icon: a rounded square filled with a soft vertical gradient from pastel sky blue (#C9E4F5) to baby pink (#FBD3DE), with a simplified flat-illustration of the character's happy face and cloud cap centered (round pink face, white cloud cap, cute embroidered-style eyes and smile), one small white four-point sparkle in a corner. Flat clean vector style, crisp edges, no text",
  },
};

for (const [name, { urls, size, p }] of Object.entries(JOBS)) {
  state[name] ??= {};
  if (!state[name].url) {
    if (!state[name].taskId) {
      state[name].taskId = await edit(p, urls, size);
      save();
      console.log(name, "task", state[name].taskId);
    }
    state[name].url = await poll(state[name].taskId);
    save();
  }
  await dl(state[name].url, join(OUT, `${name}.png`));
  console.log(name, "downloaded");
}
console.log("done");
