// Remix the packaging reference (assets/brand/package.png) into a more
// Instagram/TikTok, 11-year-old-facing version via nano-banana-edit,
// then optionally animate it (Veo3) into an unboxing video.
// Usage: KIE_API_KEY=... node tools/remix-package.mjs [image|video]

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const KEY = process.env.KIE_API_KEY;
const HEADERS = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
const API = "https://api.kie.ai/api/v1";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const STATE_FILE = join(ROOT, "assets", "brand", "package-remix-state.json");
const state = existsSync(STATE_FILE) ? JSON.parse(readFileSync(STATE_FILE, "utf8")) : {};
const save = () => writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

async function upload(file, name) {
  const res = await fetch("https://kieai.redpandaai.co/api/file-base64-upload", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      base64Data: `data:image/png;base64,${readFileSync(file).toString("base64")}`,
      uploadPath: "leones/brand",
      fileName: name,
    }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(JSON.stringify(json));
  return json.data.downloadUrl ?? json.data.fileUrl;
}

async function createJob(model, input) {
  const res = await fetch(`${API}/jobs/createTask`, {
    method: "POST", headers: HEADERS,
    body: JSON.stringify({ model, input }),
  });
  const json = await res.json();
  if (json.code !== 200) throw new Error(JSON.stringify(json));
  return json.data.taskId;
}

async function pollJob(taskId) {
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

const EDIT_PROMPT =
  "Keep the exact same pink LeoNes unboxing box, ribbon, thank-you card, pH Gloss product, lighting and composition, " +
  "but make the scene more Instagram-worthy and TikTok-viral for an 11-year-old girl: add a collectible pastel sticker sheet " +
  "with cute sparkle and heart stickers peeking out of the box, a small gold lioness enamel charm on a ribbon, holographic " +
  "iridescent crinkle paper mixed with the pink, a few tiny heart-shaped pastel confetti pieces on the satin fabric, and a " +
  "subtle extra glow of pastel blue light from one side. Keep it premium, clean and elegant — do not make it cluttered, " +
  "do not change the brand name LeoNes, do not change the product, keep all existing text exactly as it is";

const VIDEO_PROMPT =
  "Satisfying premium ASMR-style unboxing moment, vertical 9:16. The scene comes alive: the satin LeoNes ribbon slowly and " +
  "elegantly slides free and drifts out of frame, holographic crinkle paper gently rises and settles, tiny heart confetti " +
  "floats up catching the light, the pH Gloss bottle lifts softly out of the box and hovers, slowly rotating, glowing in " +
  "soft pastel light with sparkles. Slow smooth cinematic camera push-in. Premium, dreamy, magical, no hands, no people, " +
  "no text changes, keep the LeoNes branding exactly as it is. Audio: gentle paper rustles, soft sparkle chimes, one cute " +
  "magical pop, soft dreamy music, no voices, no words";

const mode = process.argv[2] ?? "image";

if (mode === "image") {
  if (!state.sourceUrl) {
    state.sourceUrl = await upload(join(ROOT, "assets", "brand", "package.png"), "package.png");
    save();
    console.log("source uploaded");
  }
  const taskId = state.editTaskId ?? (await createJob("google/nano-banana-edit", {
    prompt: EDIT_PROMPT,
    image_urls: [state.sourceUrl],
    output_format: "png",
    image_size: "3:4",
  }));
  state.editTaskId = taskId;
  save();
  console.log("edit task:", taskId);
  state.editUrl = await pollJob(taskId);
  save();
  await download(state.editUrl, join(ROOT, "assets", "brand", "package-v2.png"));
  console.log("package-v2.png downloaded");
} else if (mode === "video") {
  if (!state.editUrl) throw new Error("run image mode first");
  const res = await fetch(`${API}/veo/generate`, {
    method: "POST", headers: HEADERS,
    body: JSON.stringify({ prompt: VIDEO_PROMPT, imageUrls: [state.editUrl], model: "veo3_fast", aspect_ratio: "9:16" }),
  });
  const json = await res.json();
  if (json.code !== 200) throw new Error(JSON.stringify(json));
  state.videoTaskId = json.data.taskId;
  save();
  console.log("video task:", state.videoTaskId);
  for (let i = 0; i < 120; i++) {
    const r = await fetch(`${API}/veo/record-info?taskId=${state.videoTaskId}`, { headers: HEADERS });
    const b = await r.json();
    if (b.data.successFlag === 1) {
      const urls = b.data.response?.resultUrls ?? JSON.parse(b.data.resultUrls ?? "[]");
      state.videoUrl = urls[0];
      save();
      await download(state.videoUrl, join(ROOT, "assets", "brand", "unboxing.mp4"));
      console.log("unboxing.mp4 downloaded");
      process.exit(0);
    }
    if (b.data.successFlag === 2 || b.data.successFlag === 3) throw new Error(b.data.errorMessage ?? "failed");
    await sleep(15000);
  }
  throw new Error("timeout");
}
