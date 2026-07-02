// Create the LeoNes chase-mascot avatar assets from the clip1-last.png reference.
// Usage: KIE_API_KEY=... node tools/generate-mascot.mjs

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const KEY = process.env.KIE_API_KEY;
const HEADERS = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
const API = "https://api.kie.ai/api/v1";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const STATE_FILE = join(ROOT, "assets", "brand", "mascot-state.json");
const state = existsSync(STATE_FILE) ? JSON.parse(readFileSync(STATE_FILE, "utf8")) : {};
const save = () => writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

const REF = join(ROOT, "assets", "campaigns", "ph-gloss", "sleepy-cloud", "clip1-last.png");

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

async function job(model, input) {
  const res = await fetch(`${API}/jobs/createTask`, {
    method: "POST", headers: HEADERS, body: JSON.stringify({ model, input }),
  });
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

const CHARACTER =
  "a fully original small kawaii 3D mascot character: a soft round pink glossy jelly-like body, big expressive " +
  "cartoon eyes, tiny stubby arms and legs, a fluffy white cloud-like cap on its head, cute but dramatic facial " +
  "expression, premium collectible toy look, feminine, glossy, lovable. It is NOT a cosmetic tube — it is a little " +
  "round creature. Original design, not based on any existing character";

if (!state.refUrl) {
  state.refUrl = await upload(REF, "mascot-ref.png");
  save();
  console.log("reference uploaded");
}

// 1. cinematic chase scene (brand asset)
if (!state.sceneUrl) {
  const taskId = state.sceneTaskId ?? (await job("google/nano-banana-edit", {
    prompt:
      `Using the uploaded image only as a style and material reference for glossiness and the cloud cap, create ${CHARACTER}. ` +
      "Scene: the mascot is sprinting with intense comic determination after the elegant LeoNes pH Gloss product " +
      "(a frosted clear tube with pastel blue cap and a soft pink swirl inside, looking premium and NOT alive), which " +
      "is slightly ahead, leaning away playfully mid-escape. Dreamy glossy pink fantasy world: pastel pink shiny floor " +
      "with beautiful reflections, glowing arches, soft cloud shapes, sparkles and tiny hearts in the air. Dynamic " +
      "action composition, motion blur on the mascot's little legs, speed lines of sparkles, funny and adorable, " +
      "high-end 3D animated commercial frame, luxury-cute art direction, cinematic soft lighting. 16:9 wide frame. " +
      "No text anywhere in the image",
    image_urls: [state.refUrl],
    output_format: "png",
    image_size: "16:9",
  }));
  state.sceneTaskId = taskId;
  save();
  console.log("scene task:", taskId);
  state.sceneUrl = await poll(taskId);
  save();
  await download(state.sceneUrl, join(ROOT, "assets", "brand", "mascot-chase-scene.png"));
  console.log("mascot-chase-scene.png downloaded");
}

// 2. mascot running sprite on white (for transparent cutout)
if (!state.spriteUrl) {
  const taskId = state.spriteTaskId ?? (await job("google/nano-banana-edit", {
    prompt:
      `Using the uploaded image only as a style and material reference, create ${CHARACTER}. ` +
      "Full body side view, running fast toward the right of the frame in a dynamic cartoon sprint pose: body leaning " +
      "forward, tiny legs mid-stride, little arms pumping, determined funny face with big eyes locked ahead, cloud cap " +
      "slightly lifted by the wind. Single character only, nothing else in the frame, centered, on a solid pure white " +
      "background, soft studio lighting, premium 3D toy render, crisp edges. No text",
    image_urls: [state.refUrl],
    output_format: "png",
    image_size: "1:1",
  }));
  state.spriteTaskId = taskId;
  save();
  console.log("sprite task:", taskId);
  state.spriteUrl = await poll(taskId);
  save();
  await download(state.spriteUrl, join(ROOT, "assets", "brand", "mascot-run.png"));
  console.log("mascot-run.png downloaded");
}

console.log("done");
