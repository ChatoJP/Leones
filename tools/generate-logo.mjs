// One-off: generate the LeoNes wordmark logo set via nano-banana.
// Usage: KIE_API_KEY=... node tools/generate-logo.mjs

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "assets", "brand");
mkdirSync(OUT, { recursive: true });

const KEY = process.env.KIE_API_KEY;
const HEADERS = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
const API = "https://api.kie.ai/api/v1";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const BASE =
  'Elegant premium logotype for a beauty cosmetics brand, the word "LeoNes" written with exact spelling ' +
  "L-e-o-N-e-s with capital L and capital N, refined modern serif wordmark with soft rounded terminals, " +
  "feminine, sophisticated, minimal and memorable, subtle four-point sparkle dotting accent above the final s, " +
  "high-end beauty branding like Rhode and Glossier, perfectly centered, large, crisp vector-sharp edges, " +
  "no other text, no taglines, no product, no decorative frame, flat graphic design";

const JOBS = [
  {
    file: "logo-dark.png",
    ratio: "16:9",
    prompt: `${BASE}, deep plum color (#3A2E3D) wordmark on a solid pure white background`,
  },
  {
    file: "logo-light.png",
    ratio: "16:9",
    prompt: `${BASE}, pure white wordmark on a solid deep plum (#3A2E3D) background`,
  },
  {
    file: "icon.png",
    ratio: "1:1",
    prompt:
      'Minimal premium app icon for beauty brand "LeoNes": a rounded square filled with a soft vertical gradient ' +
      "from pastel sky blue (#C9E4F5) to baby pink (#FBD3DE), centered elegant white capital letter L in a refined " +
      "modern serif with a small four-point white sparkle beside it, flat graphic design, crisp edges, " +
      "no other text, no border, high-end cosmetic branding",
  },
];

async function createTask(job) {
  const res = await fetch(`${API}/jobs/createTask`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      model: "google/nano-banana",
      input: { prompt: job.prompt, output_format: "png", image_size: job.ratio },
    }),
  });
  const body = await res.json();
  if (body.code !== 200) throw new Error(JSON.stringify(body));
  return body.data.taskId;
}

async function poll(taskId) {
  for (let i = 0; i < 60; i++) {
    const res = await fetch(`${API}/jobs/recordInfo?taskId=${taskId}`, { headers: HEADERS });
    const body = await res.json();
    if (body.data.state === "success") return JSON.parse(body.data.resultJson).resultUrls[0];
    if (body.data.state === "fail") throw new Error(body.data.failMsg);
    await sleep(5000);
  }
  throw new Error("timeout");
}

const tasks = await Promise.all(JOBS.map(async (j) => ({ j, taskId: await createTask(j) })));
console.log("tasks:", tasks.map((t) => `${t.j.file}=${t.taskId}`).join(" "));

for (const { j, taskId } of tasks) {
  const url = await poll(taskId);
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  writeFileSync(join(OUT, j.file), buf);
  console.log(`${j.file}: downloaded`);
}
