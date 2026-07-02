// Post-process the generated ecosystem: extract a poster frame for every
// video into assets/ecosystem/thumbnails/posters/, and print an inventory
// summary per folder.
//
// Usage: node tools/postprocess-ecosystem.mjs

import { readdirSync, statSync, mkdirSync, existsSync } from "node:fs";
import { join, relative, basename } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ECO = join(ROOT, "assets", "ecosystem");
const POSTERS = join(ECO, "thumbnails", "posters");
mkdirSync(POSTERS, { recursive: true });

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = walk(ECO).filter((f) => !f.endsWith("state.json"));
const videos = files.filter((f) => f.endsWith(".mp4"));
const images = files.filter((f) => f.endsWith(".png"));

let extracted = 0;
for (const mp4 of videos) {
  const poster = join(POSTERS, basename(mp4).replace(/\.mp4$/, ".jpg"));
  if (existsSync(poster)) continue;
  // frame at ~1s: past the hook's first flash, representative of the clip
  execFileSync("ffmpeg", ["-y", "-ss", "1", "-i", mp4, "-frames:v", "1", "-q:v", "3", poster], { stdio: "pipe" });
  extracted++;
}

const byFolder = {};
for (const f of files) {
  const folder = relative(ECO, join(f, "..")).replaceAll("\\", "/");
  byFolder[folder] = (byFolder[folder] ?? 0) + 1;
}

console.log(`images: ${images.length}, videos: ${videos.length}, posters extracted: ${extracted}`);
for (const [folder, n] of Object.entries(byFolder).sort()) console.log(`  ${folder}: ${n}`);
