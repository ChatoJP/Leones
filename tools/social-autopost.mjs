// LeoNes social auto-poster — free + automated ("option 2").
//
// Posts one queued video per platform per run via the platforms' official
// free APIs. Designed to run on a GitHub Actions cron (free) — see
// .github/workflows/social-autopost.yml and docs/social-autoposting.md.
//
// Usage:
//   node tools/social-autopost.mjs plan          # (re)build the queue from content-library
//   node tools/social-autopost.mjs status        # what's queued / posted / due
//   node tools/social-autopost.mjs post          # post the next due item per platform
//   DRY_RUN=1 node tools/social-autopost.mjs post
//
// Credentials (env / GitHub secrets) — each platform activates when set:
//   META_PAGE_TOKEN + FB_PAGE_ID                 -> Facebook page video posts
//   META_PAGE_TOKEN + IG_USER_ID + MEDIA_BASE    -> Instagram Reels (needs public URL)
//   TIKTOK_ACCESS_TOKEN                          -> TikTok (direct upload)
// Missing credentials = that platform is skipped with a clear log, never an error.

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, createReadStream } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LIB = join(ROOT, "content-library");
const QUEUE_FILE = join(LIB, "posting-queue.json");
const DRY = process.env.DRY_RUN === "1";

// Public base URL for media (Instagram requires a public video URL).
// Default: raw GitHub (repo must be public), overridable via MEDIA_BASE.
const MEDIA_BASE = process.env.MEDIA_BASE
  ?? "https://raw.githubusercontent.com/ChatoJP/Leones/main/content-library";

/* ---------------- queue building ---------------- */

// Only brand-locked videos go out (branded-*.mp4 have the real logo overlaid,
// which fixes the label-drift issue) plus platform-organized clips.
const SOURCES = [
  { dir: "tiktok/ads", platforms: ["tiktok", "instagram", "facebook"] },
  { dir: "tiktok", platforms: ["tiktok"] },
  { dir: "instagram", platforms: ["instagram"] },
  { dir: "facebook", platforms: ["facebook"] },
];

const HASHTAGS = {
  tiktok: "#LeoNes #glossy #cutefinds #JellyBoop #kidsbeauty #satisfying #fyp",
  instagram: "#LeoNes #glossy #collectiblebeauty #JellyBoop #cutebeauty #reels",
  facebook: "#LeoNes #giftideas #kidsbeauty",
};

const CAPTIONS = [
  "watch it turn pink 💗✦",
  "tiny gloss, big mood ✦",
  "plushie-approved. obviously. 🧸",
  "your pink exists.",
  "cute but premium ✦",
  "the drop is coming 👀",
  "main character gloss energy",
  "POV: your bag just got cuter ✦",
];

function findVideos(dir) {
  const abs = join(LIB, dir);
  if (!existsSync(abs)) return [];
  const out = [];
  const walk = (d) => {
    for (const n of readdirSync(d)) {
      const p = join(d, n);
      if (statSync(p).isDirectory()) walk(p);
      else if (n.endsWith(".mp4")) out.push(p.slice(LIB.length + 1).replaceAll("\\", "/"));
    }
  };
  walk(abs);
  return out;
}

function buildQueue() {
  const existing = existsSync(QUEUE_FILE) ? JSON.parse(readFileSync(QUEUE_FILE, "utf8")) : { items: [] };
  const known = new Set(existing.items.map((i) => `${i.platform}:${i.file}`));
  let added = 0;
  for (const src of SOURCES) {
    for (const file of findVideos(src.dir)) {
      // prefer branded files when a raw twin exists
      if (!file.includes("branded-") && findVideos(src.dir).includes(file.replace(/([^/]+)$/, "branded-$1"))) continue;
      for (const platform of src.platforms) {
        const key = `${platform}:${file}`;
        if (known.has(key)) continue;
        known.add(key);
        existing.items.push({
          platform,
          file,
          caption: `${CAPTIONS[existing.items.length % CAPTIONS.length]}\n\n${HASHTAGS[platform]}`,
          status: "queued",
        });
        added++;
      }
    }
  }
  writeFileSync(QUEUE_FILE, JSON.stringify(existing, null, 2));
  return { added, total: existing.items.length };
}

/* ---------------- platform posters ---------------- */

async function postFacebook(item) {
  const token = process.env.META_PAGE_TOKEN, page = process.env.FB_PAGE_ID;
  if (!token || !page) return "skipped: META_PAGE_TOKEN / FB_PAGE_ID not set";
  if (DRY) return "dry-run: would upload to Facebook";
  const url = `https://graph.facebook.com/v21.0/${page}/videos`;
  const form = new FormData();
  form.append("description", item.caption);
  form.append("access_token", token);
  form.append("source", new Blob([readFileSync(join(LIB, item.file))]), basename(item.file));
  const res = await fetch(url, { method: "POST", body: form });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return `posted: fb video ${json.id}`;
}

async function postInstagram(item) {
  const token = process.env.META_PAGE_TOKEN, ig = process.env.IG_USER_ID;
  if (!token || !ig) return "skipped: META_PAGE_TOKEN / IG_USER_ID not set";
  if (DRY) return "dry-run: would publish Reel";
  const videoUrl = `${MEDIA_BASE}/${item.file}`;
  const create = await fetch(`https://graph.facebook.com/v21.0/${ig}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ media_type: "REELS", video_url: videoUrl, caption: item.caption, access_token: token }),
  }).then((r) => r.json());
  if (create.error) throw new Error(create.error.message);
  // poll container until ready, then publish
  for (let i = 0; i < 30; i++) {
    const st = await fetch(`https://graph.facebook.com/v21.0/${create.id}?fields=status_code&access_token=${token}`).then((r) => r.json());
    if (st.status_code === "FINISHED") break;
    if (st.status_code === "ERROR") throw new Error("IG container processing failed");
    await new Promise((r) => setTimeout(r, 10000));
  }
  const pub = await fetch(`https://graph.facebook.com/v21.0/${ig}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creation_id: create.id, access_token: token }),
  }).then((r) => r.json());
  if (pub.error) throw new Error(pub.error.message);
  return `posted: ig reel ${pub.id}`;
}

async function postTikTok(item) {
  const token = process.env.TIKTOK_ACCESS_TOKEN;
  if (!token) return "skipped: TIKTOK_ACCESS_TOKEN not set";
  if (DRY) return "dry-run: would upload to TikTok";
  const file = join(LIB, item.file);
  const size = statSync(file).size;
  const init = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      post_info: { title: item.caption.split("\n")[0], privacy_level: "SELF_ONLY" }, // SELF_ONLY until app is audited; switch to PUBLIC_TO_EVERYONE after
      source_info: { source: "FILE_UPLOAD", video_size: size, chunk_size: size, total_chunk_count: 1 },
    }),
  }).then((r) => r.json());
  if (init.error?.code !== "ok") throw new Error(JSON.stringify(init.error));
  const put = await fetch(init.data.upload_url, {
    method: "PUT",
    headers: { "Content-Range": `bytes 0-${size - 1}/${size}`, "Content-Type": "video/mp4" },
    body: createReadStream(file),
    duplex: "half",
  });
  if (!put.ok) throw new Error(`tiktok upload ${put.status}`);
  return `posted: tiktok publish_id ${init.data.publish_id}`;
}

const POSTERS = { facebook: postFacebook, instagram: postInstagram, tiktok: postTikTok };

/* ---------------- commands ---------------- */

const cmd = process.argv[2] ?? "status";

if (cmd === "plan") {
  const { added, total } = buildQueue();
  console.log(`queue: +${added} new, ${total} total -> ${QUEUE_FILE}`);
  process.exit(0);
}

if (!existsSync(QUEUE_FILE)) buildQueue();
const queue = JSON.parse(readFileSync(QUEUE_FILE, "utf8"));

if (cmd === "status") {
  for (const platform of Object.keys(POSTERS)) {
    const items = queue.items.filter((i) => i.platform === platform);
    const done = items.filter((i) => i.status === "posted").length;
    console.log(`${platform}: ${done}/${items.length} posted, next: ${items.find((i) => i.status === "queued")?.file ?? "—"}`);
  }
  process.exit(0);
}

if (cmd === "post") {
  for (const [platform, poster] of Object.entries(POSTERS)) {
    const item = queue.items.find((i) => i.platform === platform && i.status === "queued");
    if (!item) { console.log(`${platform}: queue empty`); continue; }
    try {
      const result = await poster(item);
      console.log(`${platform}: ${item.file} -> ${result}`);
      if (result.startsWith("posted:")) {
        item.status = "posted";
        item.postedAt = new Date().toISOString();
        item.result = result;
      }
    } catch (err) {
      item.lastError = err.message;
      console.error(`${platform}: ${item.file} FAILED — ${err.message}`);
    }
  }
  writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
  process.exit(0);
}

console.error("usage: social-autopost.mjs plan|status|post");
process.exit(1);
