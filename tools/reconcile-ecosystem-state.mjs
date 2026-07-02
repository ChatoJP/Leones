// Rebuild assets/ecosystem/state.json "done" entries from files on disk.
// Needed because concurrent images/videos runs clobber each other's saves;
// without this a rerun would re-pay for units already downloaded.
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, basename } from "node:path";

const ECO = "assets/ecosystem";
const state = JSON.parse(readFileSync(join(ECO, "state.json"), "utf8"));
state.units ??= {};
let fixed = 0;

function walk(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (!/\.(png|mp4)$/.test(n)) continue;
    if (p.includes(join("thumbnails", "posters"))) continue;
    const key = basename(n).replace(/\.(png|mp4)$/, "");
    if (!state.units[key]?.file) {
      state.units[key] = { ...state.units[key], file: p.replaceAll("\\", "/") };
      fixed++;
    }
  }
}
walk(ECO);
writeFileSync(join(ECO, "state.json"), JSON.stringify(state, null, 2));
console.log("reconciled entries:", fixed);
