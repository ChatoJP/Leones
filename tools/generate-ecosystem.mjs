// LeoNes launch ecosystem generator: bulk images (nano-banana / nano-banana-edit)
// and videos (veo3_fast) from the ecosystem manifests, with resume + retry.
//
// Usage:
//   KIE_API_KEY=... node tools/generate-ecosystem.mjs plan
//   KIE_API_KEY=... node tools/generate-ecosystem.mjs images [id...]
//   KIE_API_KEY=... node tools/generate-ecosystem.mjs videos [id...]
//   KIE_API_KEY=... node tools/generate-ecosystem.mjs status
//
// State lives in assets/ecosystem/state.json; delete a unit key (or its taskId)
// to regenerate it. Units that failed 3 times are skipped until reset.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const IMG_MANIFEST = JSON.parse(readFileSync(join(ROOT, "products", "ecosystem.json"), "utf8"));
const VID_MANIFEST = JSON.parse(readFileSync(join(ROOT, "products", "ecosystem-videos.json"), "utf8"));
const OUT_DIR = join(ROOT, "assets", "ecosystem");
const STATE_FILE = join(OUT_DIR, "state.json");
const API = "https://api.kie.ai/api/v1";
const KEY = process.env.KIE_API_KEY;
if (!KEY) { console.error("KIE_API_KEY env var required"); process.exit(1); }
const HEADERS = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

const IMG_CONCURRENCY = 10;
const VID_CONCURRENCY = 6;
const MAX_FAILS = 3;

mkdirSync(OUT_DIR, { recursive: true });
const state = existsSync(STATE_FILE) ? JSON.parse(readFileSync(STATE_FILE, "utf8")) : { refs: {}, units: {} };
state.refs ??= {}; state.units ??= {};
const saveState = () => writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(path, opts = {}) {
  const res = await fetch(`${API}${path}`, { headers: HEADERS, ...opts });
  const body = await res.json();
  if (body.code !== 200) throw new Error(`${path} -> ${JSON.stringify(body)}`);
  return body.data;
}

const credits = () => api("/chat/credit");

async function download(url, file) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${url}: ${res.status}`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

async function uploadRef(name, relPath) {
  if (state.refs[name]) return state.refs[name];
  const file = join(ROOT, relPath);
  const res = await fetch("https://kieai.redpandaai.co/api/file-base64-upload", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      base64Data: `data:image/png;base64,${readFileSync(file).toString("base64")}`,
      uploadPath: "leones/ecosystem-refs",
      fileName: `${name}.png`,
    }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(`upload ${name} failed: ${JSON.stringify(json)}`);
  state.refs[name] = json.data.downloadUrl ?? json.data.fileUrl;
  saveState();
  console.log(`ref ${name}: uploaded`);
  return state.refs[name];
}

// Expand manifest items into flat units: {key, folder, ratio, prompt, refs, kind}
function expandImages(ids) {
  const units = [];
  for (const item of IMG_MANIFEST.items) {
    if (ids.length && !ids.includes(item.id)) continue;
    const count = item.count ?? 1;
    const style = item.style ? IMG_MANIFEST.styles[item.style] : null;
    const prompt = style ? `${style}. ${item.prompt}` : item.prompt;
    for (let v = 1; v <= count; v++) {
      units.push({
        key: count > 1 ? `${item.id}-v${v}` : item.id,
        folder: item.folder, ratio: item.ratio, prompt,
        refs: item.refs ?? [], kind: "image",
      });
    }
  }
  return units;
}

function expandVideos(ids) {
  const units = [];
  for (const item of VID_MANIFEST.items) {
    if (ids.length && !ids.includes(item.id)) continue;
    const count = item.count ?? 1;
    const prompt = item.base === "ambient"
      ? `${VID_MANIFEST.ambientBase}. ${item.prompt}`
      : `${VID_MANIFEST.styleBase}. ${item.prompt}. ${VID_MANIFEST.audioBase}`;
    for (let v = 1; v <= count; v++) {
      units.push({
        key: count > 1 ? `${item.id}-v${v}` : item.id,
        folder: item.folder, prompt, ref: item.ref ?? null, kind: "video",
        ratio: item.ratio ?? "9:16",
      });
    }
  }
  return units;
}

// ---------- per-unit lifecycle ----------

async function createImageTask(unit) {
  if (unit.refs.length) {
    const urls = [];
    for (const r of unit.refs) urls.push(await uploadRef(r, IMG_MANIFEST.refs[r]));
    const data = await api("/jobs/createTask", {
      method: "POST",
      body: JSON.stringify({
        model: "google/nano-banana-edit",
        input: { prompt: unit.prompt, image_urls: urls, output_format: "png", image_size: unit.ratio },
      }),
    });
    return data.taskId;
  }
  const data = await api("/jobs/createTask", {
    method: "POST",
    body: JSON.stringify({
      model: "google/nano-banana",
      input: { prompt: unit.prompt, output_format: "png", image_size: unit.ratio },
    }),
  });
  return data.taskId;
}

async function pollImageTask(taskId) {
  for (let i = 0; i < 90; i++) {
    const data = await api(`/jobs/recordInfo?taskId=${taskId}`);
    if (data.state === "success") return JSON.parse(data.resultJson).resultUrls[0];
    if (data.state === "fail") throw new Error(`fail: ${data.failMsg}`);
    await sleep(6000);
  }
  throw new Error("timeout");
}

async function createVideoTask(unit) {
  const body = { prompt: unit.prompt, model: "veo3_fast", aspect_ratio: unit.ratio };
  if (unit.ref) body.imageUrls = [await uploadRef(unit.ref, VID_MANIFEST.refs[unit.ref])];
  const res = await fetch(`${API}/veo/generate`, { method: "POST", headers: HEADERS, body: JSON.stringify(body) });
  const json = await res.json();
  if (json.code !== 200) throw new Error(`veo/generate -> ${JSON.stringify(json)}`);
  return json.data.taskId;
}

async function pollVideoTask(taskId) {
  for (let i = 0; i < 160; i++) {
    const res = await fetch(`${API}/veo/record-info?taskId=${taskId}`, { headers: HEADERS });
    const body = await res.json();
    if (body.code !== 200) throw new Error(`record-info -> ${JSON.stringify(body)}`);
    const d = body.data;
    if (d.successFlag === 1) return (d.response?.resultUrls ?? JSON.parse(d.resultUrls ?? "[]"))[0];
    if (d.successFlag === 2 || d.successFlag === 3) throw new Error(`fail: ${d.errorMessage ?? JSON.stringify(d)}`);
    await sleep(15000);
  }
  throw new Error("timeout");
}

async function runUnit(unit) {
  const s = (state.units[unit.key] ??= {});
  if (s.file) { console.log(`${unit.key}: already done`); return "done"; }
  if ((s.fails ?? 0) >= MAX_FAILS) { console.log(`${unit.key}: skipped (${s.fails} fails)`); return "skipped"; }
  try {
    if (!s.taskId) {
      s.taskId = unit.kind === "image" ? await createImageTask(unit) : await createVideoTask(unit);
      saveState();
      console.log(`${unit.key}: task ${s.taskId}`);
    }
    const url = unit.kind === "image" ? await pollImageTask(s.taskId) : await pollVideoTask(s.taskId);
    const dir = join(OUT_DIR, unit.folder);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, `${unit.key}.${unit.kind === "image" ? "png" : "mp4"}`);
    await download(url, file);
    s.url = url; s.file = file.replace(ROOT + "\\", "").replaceAll("\\", "/");
    saveState();
    console.log(`${unit.key}: downloaded -> ${s.file}`);
    return "done";
  } catch (err) {
    s.fails = (s.fails ?? 0) + 1;
    delete s.taskId; // transient errors are retryable with a fresh task
    saveState();
    console.error(`${unit.key}: FAILED (${s.fails}/${MAX_FAILS}) — ${err.message}`);
    return "failed";
  }
}

async function runPool(units, concurrency) {
  const queue = [...units];
  const tally = { done: 0, failed: 0, skipped: 0 };
  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length) {
      const unit = queue.shift();
      const result = await runUnit(unit);
      tally[result === "done" ? "done" : result === "failed" ? "failed" : "skipped"]++;
    }
  });
  await Promise.all(workers);
  return tally;
}

// ---------- commands ----------

const [cmd, ...ids] = process.argv.slice(2);

if (cmd === "plan") {
  const imgs = expandImages([]);
  const vids = expandVideos([]);
  const imgDone = imgs.filter((u) => state.units[u.key]?.file).length;
  const vidDone = vids.filter((u) => state.units[u.key]?.file).length;
  console.log(`images: ${imgs.length} total (${imgDone} done) — ~${(imgs.length - imgDone) * 4} credits remaining`);
  console.log(`videos: ${vids.length} total (${vidDone} done) — ~${(vids.length - vidDone) * 60} credits remaining`);
  console.log(`estimated total remaining: ~${(imgs.length - imgDone) * 4 + (vids.length - vidDone) * 60} credits`);
  const folders = new Set([...imgs, ...vids].map((u) => u.folder));
  console.log(`folders: ${[...folders].sort().join(", ")}`);
  process.exit(0);
}

if (cmd === "status") {
  const all = [...expandImages([]), ...expandVideos([])];
  const done = all.filter((u) => state.units[u.key]?.file);
  const failed = all.filter((u) => (state.units[u.key]?.fails ?? 0) >= MAX_FAILS);
  const pending = all.filter((u) => !state.units[u.key]?.file && (state.units[u.key]?.fails ?? 0) < MAX_FAILS);
  console.log(`done: ${done.length}/${all.length}, exhausted-failed: ${failed.length}, pending: ${pending.length}`);
  if (failed.length) console.log(`failed units: ${failed.map((u) => u.key).join(", ")}`);
  process.exit(0);
}

const before = await credits();
console.log(`credits before: ${before}`);

let tally;
if (cmd === "images") tally = await runPool(expandImages(ids), IMG_CONCURRENCY);
else if (cmd === "videos") tally = await runPool(expandVideos(ids), VID_CONCURRENCY);
else { console.error("usage: generate-ecosystem.mjs plan|images|videos|status [id...]"); process.exit(1); }

const after = await credits();
console.log(`\nresult: ${JSON.stringify(tally)}`);
console.log(`credits after: ${after} (used ${(before - after).toFixed(2)})`);
