// LeoNes TV entertainment slate: comedy + ASMR + game videos (not product ads).
// Usage: KIE_API_KEY=... node tools/generate-tv.mjs

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "assets", "tv");
mkdirSync(OUT, { recursive: true });
const KEY = process.env.KEY ?? process.env.KIE_API_KEY;
const HEADERS = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
const API = "https://api.kie.ai/api/v1";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const STATE = join(OUT, "state.json");
const state = existsSync(STATE) ? JSON.parse(readFileSync(STATE, "utf8")) : {};
const save = () => writeFileSync(STATE, JSON.stringify(state, null, 2));

const BOOP = "a small round soft pink plush creature with a fluffy white cloud-cap and big cute embroidered eyes";
const CLOUDIE = "a soft white cloud plushie with sleepy half-closed embroidered eyes";
const JELLY = "a wobbly pink jelly-blob plushie with sequin sparkles and chaotic happy energy";
const STYLE = "Premium cute 3D animation, pastel pink and blue world, glossy surfaces, soft dreamy light, TikTok-native vertical 9:16, funny and adorable, cute but sophisticated, no humans, no readable text";
const FUNNY_AUDIO = "Audio: expressive toy squeaks, comedic boings and thuds, tiny giggles, playful bouncy music, no voices, no words";

const VIDEOS = {
  // ---------- COMEDY (6) ----------
  "comedy/boop-cooking": `${STYLE}. ${BOOP} tries to bake a tiny cake: cracks an egg with way too much effort, flour puffs everywhere in slow motion covering it completely, it blinks through the flour, then proudly presents a hilariously lopsided tiny cake. ${FUNNY_AUDIO}`,
  "comedy/hide-and-seek": `${STYLE}. Hide and seek: ${BOOP} counts against a wall while ${JELLY} squeezes behind a thin lamp (visibly sticking out) and ${CLOUDIE} "hides" by falling asleep in the middle of the room in plain sight. Boop walks past Cloudie twice without noticing, then does a slow comedic double-take. ${FUNNY_AUDIO}`,
  "comedy/boop-vs-bee": `${STYLE}. ${BOOP} is peacefully sitting when a tiny golden sparkle-bee circles its cloud cap. Dramatic slow-motion dodge, wild overreaction flailing, tumble roll... then the bee lands gently on Boop's nose and they become instant best friends. Boop goes cross-eyed looking at it. ${FUNNY_AUDIO}`,
  "comedy/jelly-dance-fail": `${STYLE}. ${JELLY} attempts a trending dance move: starts confident, wobbles harder and harder with each move, completely loses control, splats flat like a pancake, holds one beat, then reforms and strikes the final pose like everything was intentional. ${FUNNY_AUDIO}`,
  "comedy/prank-war": `${STYLE}. Prank: ${JELLY} sneaks up and gently sticks a tiny heart sticker on sleeping ${CLOUDIE}. Cloudie, without waking, slowly rolls over and flattens Jelly underneath like a pillow. ${BOOP} watches from the corner shaking with laughter. ${FUNNY_AUDIO}`,
  "comedy/boop-gym": `${STYLE}. ${BOOP} at a tiny gym: approaches a cotton swab like it's a massive barbell, chalk-claps its paws, strains dramatically with shaking effort to lift it, finally raises it overhead and does a victory lap while ${JELLY} holds up a score card. ${FUNNY_AUDIO}`,
  // ---------- ASMR (5) ----------
  "asmr/jelly-squish": `Extreme close-up ASMR video, vertical 9:16, premium studio light: a glossy translucent pink jelly dome being slowly pressed and released by a soft pastel spatula, deep satisfying squelch and squish sounds, tiny bubbles shifting inside, hypnotic slow rhythm, seamless loop. Audio: rich wet squish sounds, soft deep squelches, gentle ambient hum, no music, no voices`,
  "asmr/glitter-pour": `Extreme close-up ASMR video, vertical 9:16: fine holographic glitter cascading in slow motion into a crystal glass jar, light catching every particle, the pile growing softly, mesmerizing. Audio: delicate granular pouring sound like softest rain, subtle shimmer tinkles, no music, no voices`,
  "asmr/crinkle": `Extreme close-up ASMR video, vertical 9:16: pastel holographic crinkle paper being slowly scrunched and released by soft plush paws, iridescent reflections shifting. Audio: crisp detailed crinkle and rustle sounds, slow and rhythmic, deeply satisfying, no music, no voices`,
  "asmr/taps": `Extreme close-up ASMR video, vertical 9:16: soft rhythmic tapping on frosted glass gloss caps of different sizes arranged in a row, each cap a slightly different pitch, gentle camera drift. Audio: clean glassy tap sounds in a soothing rhythm, subtle room tone, no music, no voices`,
  "asmr/cloud-fluff": `Close-up ASMR video, vertical 9:16: plush paws slowly fluffing and squeezing ${CLOUDIE}, fabric compressing and rising softly, tiny sleepy squeaks. Audio: soft fabric compression sounds, faint plush squeaks, gentle breathing rhythm, deeply cozy, no music, no voices`,
  // ---------- GAMES (4) ----------
  "games/cup-shuffle": `${STYLE}. A carnival cup game on a pastel table: an elegant frosted gloss tube is shown, then covered by the MIDDLE of three pastel pink cups. The cups shuffle positions quickly several times with snappy movements, ending in a row. Brief pause on the three cups... then the MIDDLE cup lifts revealing the gloss with a sparkle burst. Audio: playful shuffle whooshes, suspense drum, victory chime, no voices`,
  "games/find-boop": `${STYLE}. A wide busy pastel toy shelf scene absolutely full of plushies, clouds and toys everywhere. ${BOOP} is hidden among them, only partly visible. The camera very slowly zooms in across the scene, building suspense... finally zooming right up to Boop who waves happily. Audio: sneaky playful music, soft suspense, happy squeak at reveal, no voices`,
  "games/guess-sound": `Mystery ASMR game video, vertical 9:16: extreme close-up macro of something blurred and unrecognizable making a distinctive sound — it is holographic glitter being poured, but shot so abstract you cannot tell at first. Sound plays over abstract shimmering visuals... then the camera racks focus and pulls back revealing the glitter pour into a jar. Audio: prominent granular pouring shimmer sound as the star, reveal chime at end, no voices`,
  "games/freeze-dance": `${STYLE}. Freeze dance: ${BOOP}, ${CLOUDIE} and ${JELLY} dance joyfully together to bouncy music, then the music STOPS abruptly and all three freeze mid-pose in hilarious positions, holding perfectly still with strained faces... music resumes and they burst back into dancing. Repeats with a funnier freeze. ${FUNNY_AUDIO}`,
};

async function createVideo(prompt) {
  const res = await fetch(`${API}/veo/generate`, {
    method: "POST", headers: HEADERS,
    body: JSON.stringify({ prompt, model: "veo3_fast", aspect_ratio: "9:16" }),
  });
  const json = await res.json();
  if (json.code !== 200) throw new Error(JSON.stringify(json));
  return json.data.taskId;
}
async function pollVideo(id) {
  for (let i = 0; i < 120; i++) {
    const res = await fetch(`${API}/veo/record-info?taskId=${id}`, { headers: HEADERS });
    const json = await res.json();
    const d = json.data;
    if (d.successFlag === 1) return (d.response?.resultUrls ?? JSON.parse(d.resultUrls ?? "[]"))[0];
    if (d.successFlag === 2 || d.successFlag === 3) throw new Error(d.errorMessage ?? "failed");
    await sleep(15000);
  }
  throw new Error("timeout");
}
const credit = async () => (await (await fetch(`${API}/chat/credit`, { headers: HEADERS })).json()).data;

console.log("credits before:", await credit());
for (let attempt = 1; attempt <= 3; attempt++) {
  for (const [key, prompt] of Object.entries(VIDEOS)) {
    state[key] ??= {};
    if (!state[key].taskId && !state[key].url) {
      state[key].taskId = await createVideo(prompt);
      save();
      console.log(key, "queued");
      await sleep(2000);
    }
  }
  let pending = 0;
  for (const key of Object.keys(VIDEOS)) {
    if (state[key].url) continue;
    try {
      state[key].url = await pollVideo(state[key].taskId);
      save();
      const buf = Buffer.from(await (await fetch(state[key].url)).arrayBuffer());
      const file = join(OUT, `${key.replace("/", "-")}.mp4`);
      writeFileSync(file, buf);
      console.log(key, "ok");
    } catch (e) {
      console.error(key, "FAILED:", e.message);
      delete state[key].taskId;
      save();
      pending++;
    }
  }
  if (!pending) break;
  console.log("retrying", pending);
}
console.log("credits after:", await credit());
console.log("done");
