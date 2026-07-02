// LeoNes asset pipeline: generates product images (nano-banana) and
// videos (Veo3 fast) via kie.ai for a collection manifest.
//
// Usage:
//   KIE_API_KEY=... node tools/generate-assets.mjs images [sku...]
//   KIE_API_KEY=... node tools/generate-assets.mjs videos [sku...]
//   KIE_API_KEY=... node tools/generate-assets.mjs status
//
// State (task ids, result urls) is kept in assets/collection-01-lips/state.json
// so reruns resume instead of re-paying for finished generations.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = JSON.parse(readFileSync(join(ROOT, "products", "collection-01-lips.json"), "utf8"));
const OUT_DIR = join(ROOT, "assets", "collection-01-lips");
const STATE_FILE = join(OUT_DIR, "state.json");
const API = "https://api.kie.ai/api/v1";
const KEY = process.env.KIE_API_KEY;
if (!KEY) { console.error("KIE_API_KEY env var required"); process.exit(1); }

const HEADERS = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

mkdirSync(OUT_DIR, { recursive: true });
const state = existsSync(STATE_FILE) ? JSON.parse(readFileSync(STATE_FILE, "utf8")) : {};
const saveState = () => writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(path, opts = {}) {
  const res = await fetch(`${API}${path}`, { headers: HEADERS, ...opts });
  const body = await res.json();
  if (body.code !== 200) throw new Error(`${path} -> ${JSON.stringify(body)}`);
  return body.data;
}

async function credits() {
  return api("/chat/credit");
}

async function download(url, file) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${url}: ${res.status}`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

// ---------- images (jobs API, google/nano-banana) ----------

function imagePrompt(p, ratio) {
  const framing = ratio === "9:16"
    ? "Vertical composition with generous space above and below the product."
    : "Centered square hero composition.";
  return `${MANIFEST.brandStyle}. Product: ${p.subject}. ${framing}`;
}

async function createImageTask(p, ratio) {
  const data = await api("/jobs/createTask", {
    method: "POST",
    body: JSON.stringify({
      model: "google/nano-banana",
      input: {
        prompt: imagePrompt(p, ratio),
        output_format: "png",
        image_size: ratio,
      },
    }),
  });
  return data.taskId;
}

async function pollImageTask(taskId) {
  for (let i = 0; i < 60; i++) {
    const data = await api(`/jobs/recordInfo?taskId=${taskId}`);
    if (data.state === "success") {
      const result = JSON.parse(data.resultJson);
      return result.resultUrls[0];
    }
    if (data.state === "fail") throw new Error(`image task ${taskId} failed: ${data.failMsg}`);
    await sleep(5000);
  }
  throw new Error(`image task ${taskId} timed out`);
}

async function runImages(skus) {
  const targets = MANIFEST.products.filter((p) => !skus.length || skus.includes(p.sku));
  // submit everything first (parallel), then poll
  for (const p of targets) {
    state[p.sku] ??= {};
    for (const ratio of ["1:1", "9:16"]) {
      const slot = ratio === "1:1" ? "hero" : "portrait";
      if (state[p.sku][`${slot}Url`]) { console.log(`${p.sku} ${slot}: already done`); continue; }
      if (!state[p.sku][`${slot}TaskId`]) {
        state[p.sku][`${slot}TaskId`] = await createImageTask(p, ratio);
        saveState();
        console.log(`${p.sku} ${slot}: task ${state[p.sku][`${slot}TaskId`]}`);
      }
    }
  }
  for (const p of targets) {
    for (const slot of ["hero", "portrait"]) {
      if (state[p.sku][`${slot}Url`]) continue;
      const url = await pollImageTask(state[p.sku][`${slot}TaskId`]);
      state[p.sku][`${slot}Url`] = url;
      saveState();
      const dir = join(OUT_DIR, p.sku);
      mkdirSync(dir, { recursive: true });
      await download(url, join(dir, `${slot}.png`));
      console.log(`${p.sku} ${slot}: downloaded`);
    }
  }
}

// ---------- realistic e-commerce hero images ----------

function ecomPrompt(p) {
  return `${MANIFEST.ecomStyle} Product: ${p.ecom} ${MANIFEST.ecomNegative}.`;
}

async function runEcom(skus) {
  const targets = MANIFEST.products.filter((p) => !skus.length || skus.includes(p.sku));
  for (const p of targets) {
    state[p.sku] ??= {};
    if (state[p.sku].ecomUrl) { console.log(`${p.sku} ecom: already done`); continue; }
    if (!state[p.sku].ecomTaskId) {
      const data = await api("/jobs/createTask", {
        method: "POST",
        body: JSON.stringify({
          model: "google/nano-banana",
          input: { prompt: ecomPrompt(p), output_format: "png", image_size: "1:1" },
        }),
      });
      state[p.sku].ecomTaskId = data.taskId;
      saveState();
      console.log(`${p.sku} ecom: task ${state[p.sku].ecomTaskId}`);
    }
  }
  for (const p of targets) {
    if (state[p.sku].ecomUrl) continue;
    const url = await pollImageTask(state[p.sku].ecomTaskId);
    state[p.sku].ecomUrl = url;
    saveState();
    const dir = join(OUT_DIR, p.sku);
    mkdirSync(dir, { recursive: true });
    await download(url, join(dir, "ecom.png"));
    console.log(`${p.sku} ecom: downloaded`);
  }
}

// ---------- macro texture swatches ----------

async function runSwatches(skus) {
  const targets = MANIFEST.products.filter((p) => !skus.length || skus.includes(p.sku));
  for (const p of targets) {
    state[p.sku] ??= {};
    if (state[p.sku].swatchUrl) { console.log(`${p.sku} swatch: already done`); continue; }
    if (!state[p.sku].swatchTaskId) {
      const data = await api("/jobs/createTask", {
        method: "POST",
        body: JSON.stringify({
          model: "google/nano-banana",
          input: { prompt: `${MANIFEST.swatchStyle}. Texture: ${p.swatch}.`, output_format: "png", image_size: "1:1" },
        }),
      });
      state[p.sku].swatchTaskId = data.taskId;
      saveState();
      console.log(`${p.sku} swatch: task ${state[p.sku].swatchTaskId}`);
    }
  }
  for (const p of targets) {
    if (state[p.sku].swatchUrl) continue;
    const url = await pollImageTask(state[p.sku].swatchTaskId);
    state[p.sku].swatchUrl = url;
    saveState();
    const dir = join(OUT_DIR, p.sku);
    mkdirSync(dir, { recursive: true });
    await download(url, join(dir, "swatch.png"));
    console.log(`${p.sku} swatch: downloaded`);
  }
}

// ---------- videos (veo API, image-to-video from portrait image) ----------

function videoPrompt(p) {
  return `${MANIFEST.videoStyle}. ${p.motion}.`;
}

async function createVideoTask(p) {
  const res = await fetch(`${API}/veo/generate`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      prompt: videoPrompt(p),
      imageUrls: [state[p.sku].portraitUrl],
      model: "veo3_fast",
      aspect_ratio: "9:16",
    }),
  });
  const body = await res.json();
  if (body.code !== 200) throw new Error(`veo/generate ${p.sku} -> ${JSON.stringify(body)}`);
  return body.data.taskId;
}

async function pollVideoTask(taskId) {
  for (let i = 0; i < 120; i++) {
    const res = await fetch(`${API}/veo/record-info?taskId=${taskId}`, { headers: HEADERS });
    const body = await res.json();
    if (body.code !== 200) throw new Error(`record-info -> ${JSON.stringify(body)}`);
    const d = body.data;
    if (d.successFlag === 1) {
      const urls = d.response?.resultUrls ?? JSON.parse(d.resultUrls ?? "[]");
      return urls[0];
    }
    if (d.successFlag === 2 || d.successFlag === 3) {
      throw new Error(`video task ${taskId} failed: ${d.errorMessage ?? JSON.stringify(d)}`);
    }
    await sleep(15000);
  }
  throw new Error(`video task ${taskId} timed out`);
}

async function runVideos(skus) {
  const targets = MANIFEST.products.filter((p) => !skus.length || skus.includes(p.sku));
  for (const p of targets) {
    state[p.sku] ??= {};
    if (state[p.sku].videoUrl) { console.log(`${p.sku} video: already done`); continue; }
    if (!state[p.sku].portraitUrl) { console.log(`${p.sku}: no portrait image yet, skipping`); continue; }
    if (!state[p.sku].videoTaskId) {
      state[p.sku].videoTaskId = await createVideoTask(p);
      saveState();
      console.log(`${p.sku} video: task ${state[p.sku].videoTaskId}`);
    }
  }
  for (const p of targets) {
    if (state[p.sku].videoUrl || !state[p.sku].videoTaskId) continue;
    const url = await pollVideoTask(state[p.sku].videoTaskId);
    state[p.sku].videoUrl = url;
    saveState();
    const dir = join(OUT_DIR, p.sku);
    mkdirSync(dir, { recursive: true });
    await download(url, join(dir, "video.mp4"));
    console.log(`${p.sku} video: downloaded`);
  }
}

// ---------- videos via Kling (jobs API, kling-2.6/image-to-video) ----------

async function createKlingTask(p) {
  const data = await api("/jobs/createTask", {
    method: "POST",
    body: JSON.stringify({
      model: "kling-2.6/image-to-video",
      input: {
        prompt: videoPrompt(p),
        image_urls: [state[p.sku].portraitUrl],
        duration: "5",
        sound: false,
      },
    }),
  });
  return data.taskId;
}

async function pollKlingTask(taskId) {
  for (let i = 0; i < 120; i++) {
    const data = await api(`/jobs/recordInfo?taskId=${taskId}`);
    if (data.state === "success") {
      const result = JSON.parse(data.resultJson);
      return result.resultUrls[0];
    }
    if (data.state === "fail") throw new Error(`kling task ${taskId} failed: ${data.failMsg}`);
    await sleep(15000);
  }
  throw new Error(`kling task ${taskId} timed out`);
}

async function runKlingVideos(skus) {
  const targets = MANIFEST.products.filter((p) => !skus.length || skus.includes(p.sku));
  for (const p of targets) {
    state[p.sku] ??= {};
    if (state[p.sku].klingUrl) { console.log(`${p.sku} kling: already done`); continue; }
    if (!state[p.sku].portraitUrl) { console.log(`${p.sku}: no portrait image yet, skipping`); continue; }
    if (!state[p.sku].klingTaskId) {
      state[p.sku].klingTaskId = await createKlingTask(p);
      saveState();
      console.log(`${p.sku} kling: task ${state[p.sku].klingTaskId}`);
    }
  }
  for (const p of targets) {
    if (state[p.sku].klingUrl || !state[p.sku].klingTaskId) continue;
    const url = await pollKlingTask(state[p.sku].klingTaskId);
    state[p.sku].klingUrl = url;
    saveState();
    const dir = join(OUT_DIR, p.sku);
    mkdirSync(dir, { recursive: true });
    await download(url, join(dir, "video-kling.mp4"));
    console.log(`${p.sku} kling: downloaded`);
  }
}

// ---------- mascot ads: 3 chained clips, frame-to-frame continuity ----------

import { execFileSync } from "node:child_process";
import { readFileSync as readBin } from "node:fs";

async function uploadFrame(file, name) {
  const body = JSON.stringify({
    base64Data: `data:image/png;base64,${readBin(file).toString("base64")}`,
    uploadPath: "leones/frames",
    fileName: name,
  });
  const res = await fetch("https://kieai.redpandaai.co/api/file-base64-upload", {
    method: "POST",
    headers: HEADERS,
    body,
  });
  const json = await res.json();
  if (!json.success) throw new Error(`upload failed: ${JSON.stringify(json)}`);
  return json.data.downloadUrl ?? json.data.fileUrl;
}

function lastFrame(mp4, png) {
  execFileSync("ffmpeg", ["-y", "-sseof", "-0.15", "-i", mp4, "-frames:v", "1", "-q:v", "2", png], { stdio: "pipe" });
}

async function createVeoClip(prompt, imageUrl) {
  const res = await fetch(`${API}/veo/generate`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ prompt, imageUrls: [imageUrl], model: "veo3_fast", aspect_ratio: "9:16" }),
  });
  const body = await res.json();
  if (body.code !== 200) throw new Error(`veo/generate -> ${JSON.stringify(body)}`);
  return body.data.taskId;
}

async function runMascot(skus) {
  const targets = MANIFEST.products.filter((p) => !skus.length || skus.includes(p.sku));
  for (const p of targets) {
    state[p.sku] ??= {};
    const dir = join(OUT_DIR, p.sku);
    mkdirSync(dir, { recursive: true });
    let startImage = state[p.sku].portraitUrl;
    if (!startImage) { console.log(`${p.sku}: no portrait image, skipping`); continue; }

    for (let i = 0; i < 3; i++) {
      const key = `mascot${i + 1}`;
      const clipFile = join(dir, `${key}.mp4`);
      if (state[p.sku][`${key}Url`]) {
        console.log(`${p.sku} ${key}: already done`);
      } else {
        const prompt = `${MANIFEST.mascotStyle}. Character: ${p.subject}. ${MANIFEST.mascotClips[i]}.`;
        const taskId = state[p.sku][`${key}TaskId`] ?? (await createVeoClip(prompt, startImage));
        state[p.sku][`${key}TaskId`] = taskId;
        saveState();
        console.log(`${p.sku} ${key}: task ${taskId}`);
        const url = await pollVideoTask(taskId);
        state[p.sku][`${key}Url`] = url;
        saveState();
        await download(url, clipFile);
        console.log(`${p.sku} ${key}: downloaded`);
      }
      if (i < 2) {
        const framePng = join(dir, `${key}-last.png`);
        lastFrame(clipFile, framePng);
        startImage = await uploadFrame(framePng, `${p.sku}-${key}.png`);
        console.log(`${p.sku} ${key}: frame chained`);
      }
    }

    // concat the 3 clips into the final ad
    const listFile = join(dir, "concat.txt");
    writeFileSync(listFile, [1, 2, 3].map((n) => `file 'mascot${n}.mp4'`).join("\n"));
    execFileSync("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", listFile, "-c", "copy", join(dir, "mascot-ad.mp4")], { stdio: "pipe" });
    console.log(`${p.sku}: mascot-ad.mp4 assembled`);
  }
}

// ---------- pH Gloss ad campaigns: 8 concepts x 3 chained clips ----------

async function runCampaigns(ids) {
  const spec = JSON.parse(readFileSync(join(ROOT, "products", "ph-gloss-campaigns.json"), "utf8"));
  const CAMP_DIR = join(ROOT, "assets", "campaigns", "ph-gloss");
  mkdirSync(CAMP_DIR, { recursive: true });
  const stateFile = join(CAMP_DIR, "state.json");
  const cstate = existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, "utf8")) : {};
  const save = () => writeFileSync(stateFile, JSON.stringify(cstate, null, 2));

  const startImage = state[spec.product]?.portraitUrl;
  if (!startImage) throw new Error(`no portrait image for ${spec.product}`);

  const targets = spec.concepts.filter((c) => !ids.length || ids.includes(c.id));

  await Promise.all(targets.map(async (concept) => {
    cstate[concept.id] ??= {};
    const dir = join(CAMP_DIR, concept.id);
    mkdirSync(dir, { recursive: true });
    let img = startImage;
    try {
      for (let i = 0; i < concept.clips.length; i++) {
        const key = `clip${i + 1}`;
        const clipFile = join(dir, `${key}.mp4`);
        if (!cstate[concept.id][`${key}Url`]) {
          const prompt = `${spec.styleBase}. ${concept.clips[i]}. ${spec.audioBase}.`;
          const taskId = cstate[concept.id][`${key}TaskId`] ?? (await createVeoClip(prompt, img));
          cstate[concept.id][`${key}TaskId`] = taskId;
          save();
          console.log(`${concept.id} ${key}: task ${taskId}`);
          const url = await pollVideoTask(taskId);
          cstate[concept.id][`${key}Url`] = url;
          save();
          await download(url, clipFile);
          console.log(`${concept.id} ${key}: downloaded`);
        }
        if (i < concept.clips.length - 1) {
          const framePng = join(dir, `${key}-last.png`);
          lastFrame(clipFile, framePng);
          img = await uploadFrame(framePng, `ph-${concept.id}-${key}.png`);
          console.log(`${concept.id} ${key}: frame chained`);
        }
      }
      const listFile = join(dir, "concat.txt");
      writeFileSync(listFile, concept.clips.map((_, n) => `file 'clip${n + 1}.mp4'`).join("\n"));
      execFileSync("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", listFile, "-c", "copy", join(dir, `${concept.id}-ad.mp4`)], { stdio: "pipe" });
      console.log(`${concept.id}: ${concept.id}-ad.mp4 assembled`);
    } catch (err) {
      console.error(`${concept.id}: FAILED — ${err.message}`);
    }
  }));
}

// ---------- main ----------

const [cmd, ...skus] = process.argv.slice(2);
const before = await credits();
console.log(`credits before: ${before}`);

if (cmd === "images") await runImages(skus);
else if (cmd === "ecom") await runEcom(skus);
else if (cmd === "swatches") await runSwatches(skus);
else if (cmd === "videos") await runVideos(skus);
else if (cmd === "videos-kling") await runKlingVideos(skus);
else if (cmd === "mascot") await runMascot(skus);
else if (cmd === "campaigns") await runCampaigns(skus);
else if (cmd === "status") console.log(JSON.stringify(state, null, 2));
else { console.error("usage: generate-assets.mjs images|videos|videos-kling|status [sku...]"); process.exit(1); }

const after = await credits();
console.log(`credits after: ${after} (used ${(before - after).toFixed(2)})`);
