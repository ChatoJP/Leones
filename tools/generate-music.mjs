// LeoNes brand music via kie.ai Suno API. Three instrumentals from the
// locked brief (glossy kawaii pop, 105 BPM, no vocals). Downloads every
// returned variant to assets/music/ and website/public/music/.
//
// Usage: KIE_API_KEY=... node tools/generate-music.mjs

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "assets", "music");
const PUB = join(ROOT, "website", "public", "music");
const STATE_FILE = join(OUT, "state.json");
const API = "https://api.kie.ai/api/v1";
const KEY = process.env.KIE_API_KEY;
if (!KEY) { console.error("KIE_API_KEY required"); process.exit(1); }
const HEADERS = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

mkdirSync(OUT, { recursive: true });
mkdirSync(PUB, { recursive: true });
const state = existsSync(STATE_FILE) ? JSON.parse(readFileSync(STATE_FILE, "utf8")) : {};
const save = () => writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const BRIEF = "Glossy kawaii pop instrumental, soft pink luxury beauty brand mood, bouncy but elegant, toy-like synths, sparkle chimes, soft bass, magical plushie sounds, no vocals, no human voice, TikTok-ready, 105 BPM";

const TRACKS = [
  { id: "leones-theme", title: "LeoNes Theme", style: BRIEF },
  { id: "pajama-party", title: "Pajama Party", style: `${BRIEF}, softer dreamy sleepover lullaby energy, music box melody, cozy night mood` },
  { id: "bloop-run", title: "Bloop Run", style: `${BRIEF}, energetic playful endless-runner video game loop, driving rhythm, cheerful chase energy` },
];

// try newest model first, fall back if the API rejects it
const MODELS = ["V5_5", "V5", "V4_5PLUS", "V4_5"];

async function createTask(track) {
  for (const model of MODELS) {
    const res = await fetch(`${API}/generate`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        customMode: true,
        instrumental: true,
        model,
        title: track.title,
        style: track.style,
        callBackUrl: "https://example.com/noop", // required by API; we poll instead
      }),
    });
    const json = await res.json();
    if (json.code === 200) {
      console.log(`${track.id}: task ${json.data.taskId} (model ${model})`);
      return json.data.taskId;
    }
    console.log(`${track.id}: model ${model} rejected — ${json.msg ?? json.code}`);
  }
  throw new Error(`${track.id}: all models rejected`);
}

async function poll(taskId) {
  for (let i = 0; i < 120; i++) {
    const res = await fetch(`${API}/generate/record-info?taskId=${taskId}`, { headers: HEADERS });
    const json = await res.json();
    if (json.code !== 200) throw new Error(JSON.stringify(json));
    const d = json.data;
    if (d.status === "SUCCESS") return d.response?.sunoData ?? [];
    if (String(d.status).includes("FAILED") || d.status === "SENSITIVE_WORD_ERROR") {
      throw new Error(`task failed: ${d.status} ${d.errorMessage ?? ""}`);
    }
    await sleep(15000);
  }
  throw new Error("timeout");
}

async function download(url, file) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status}`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

for (const track of TRACKS) {
  state[track.id] ??= {};
  if (state[track.id].files?.length) { console.log(`${track.id}: already done`); continue; }
  try {
    state[track.id].taskId ??= await createTask(track);
    save();
    const songs = await poll(state[track.id].taskId);
    const files = [];
    for (let i = 0; i < songs.length; i++) {
      const name = songs.length > 1 ? `${track.id}-v${i + 1}.mp3` : `${track.id}.mp3`;
      await download(songs[i].audioUrl, join(OUT, name));
      writeFileSync(join(PUB, name), readFileSync(join(OUT, name)));
      files.push(name);
      console.log(`${track.id}: ${name} (${Math.round(songs[i].duration ?? 0)}s)`);
    }
    state[track.id].files = files;
    save();
  } catch (err) {
    console.error(`${track.id}: FAILED — ${err.message}`);
    delete state[track.id].taskId;
    save();
  }
}
console.log("music generation complete");
