// Content wave 3: pure TikTok/IG entertainment volume.
// Usage: KIE_API_KEY=... node tools/generate-wave3.mjs [images|videos]

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "assets", "wave3");
mkdirSync(OUT, { recursive: true });
const KEY = process.env.KIE_API_KEY;
const HEADERS = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
const API = "https://api.kie.ai/api/v1";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const STATE = join(OUT, "state.json");
const state = existsSync(STATE) ? JSON.parse(readFileSync(STATE, "utf8")) : {};
const save = () => writeFileSync(STATE, JSON.stringify(state, null, 2));

const BOOP = "a small round soft pink plush creature with a fluffy white cloud-cap and big cute embroidered eyes";
const CLOUDIE = "a soft white cloud plushie with sleepy half-closed eyes";
const JELLY = "a wobbly pink jelly-blob plushie with sequin sparkles";
const STYLE = "Premium cute 3D animation, pastel pink and blue world, glossy, soft dreamy light, TikTok-native vertical 9:16, funny and adorable, cute but sophisticated, no humans, no readable text";
const AUDIO = "Audio: expressive toy squeaks, comedic sounds, playful music, no voices, no words";
const IMGSTYLE = "LeoNes brand: premium glossy pastel (sky blue #C9E4F5, baby pink #FBD3DE, gold sparkle), cute but sophisticated, never babyish";

const VIDEOS = {
  "comedy/boop-rainy-day": `${STYLE}. ${BOOP} discovers rain for the first time through a window: gasps, presses face to glass, then goes outside holding a tiny leaf as umbrella, gets adorably drenched, shakes off like a puppy and jumps in a pink puddle with pure joy. ${AUDIO}`,
  "comedy/cloudie-alarm": `${STYLE}. A tiny alarm clock rings next to sleeping ${CLOUDIE}. She pats it off without waking. It rings again — she rolls over it. Third time, ${BOOP} arrives with a feather and tickles her nose; she sneezes herself awake into a startled fluff-ball. ${AUDIO}`,
  "comedy/jelly-chef": `${STYLE}. ${JELLY} as a chef with a tiny chef hat attempts to flip a mini pancake: the flip goes way too high, everyone watches it fly, it lands perfectly back in the pan — Jelly acts like a master chef, bows, then slips on butter. ${AUDIO}`,
  "comedy/trio-roadtrip": `${STYLE}. The three plushies in a tiny pink toy car: ${BOOP} drives intensely, ${JELLY} bounces to music, ${CLOUDIE} sleeps against the window. They hit a tiny bump — everyone bounces, Cloudie doesn't wake, a tiny map flies onto Boop's face. ${AUDIO}`,
  "comedy/boop-mirror-scare": `${STYLE}. ${BOOP} walks past a mirror, does a double take at its own reflection, gets startled, dramatic jump backwards... then slowly approaches, boops the mirror nose-to-nose, and winks at itself with newfound confidence. ${AUDIO}`,
  "comedy/jelly-bubble": `${STYLE}. ${JELLY} blows a bubblegum bubble that grows bigger and bigger until Jelly starts floating off the ground; ${BOOP} grabs Jelly's feet, also lifts off; ${CLOUDIE} sleepily anchors them both like a paperweight. Bubble pops into pink sparkles, gentle landing. ${AUDIO}`,
  "comedy/boop-snow-day": `${STYLE}. Snow day: ${BOOP} builds a snow-Boop replica of itself, complete with cloud cap; steps back proudly; a tiny bird lands on snow-Boop's head; Boop and snow-Boop appear to exchange a look; Boop faints dramatically into the soft snow. ${AUDIO}`,
  "comedy/plush-photo": `${STYLE}. The trio tries to take a group photo with a tiny camera on timer: they run to pose, ${JELLY} wobbles into ${BOOP}, ${CLOUDIE} falls asleep mid-pose, camera clicks capturing perfect chaos — the freeze frame shows the hilarious result. ${AUDIO}`,
  "trend/pov-boop-morning": `${STYLE}. Cozy POV-style morning routine of ${BOOP}: stretches in a tiny bed, brushes its cloud cap with a mini brush, picks between two identical bows for way too long, checks itself in the mirror, winks, and bounces out the door. Warm morning light. ${AUDIO}`,
  "trend/day-of-jelly": `${STYLE}. Fast-cut day in the life of ${JELLY}: wakes up mid-bounce, breakfast (glitter cereal), dance practice, wobble fail, snack break, sunset dance on a rooftop of clouds — ends with Jelly asleep still slightly bouncing. ${AUDIO}`,
  "trend/plushie-fashion-week": `${STYLE}. Plushie fashion week: ${CLOUDIE} walks an impromptu runway (slowly, half asleep) wearing a tiny scarf; ${JELLY} follows in sunglasses doing too much; ${BOOP} closes the show in a tiny cape, trips, turns the trip into a slide pose. Camera flashes. ${AUDIO}`,
  "trend/boop-unbox-mystery": `${STYLE}. ${BOOP} unboxes a tiny mystery box with dramatic suspense: shakes it, listens, opens slowly... it's a tinier box. Opens that: even tinier box. Final box contains a single golden sparkle that lands on Boop's nose. Pure delight. ${AUDIO}`,
  "asmr/bubble-wrap": `Extreme close-up ASMR, vertical 9:16: plush paws slowly pressing pastel pink bubble wrap, one bubble at a time, deeply satisfying pops. Audio: crisp bubble pops in slow rhythm, soft paw pressure sounds, no music, no voices`,
  "asmr/sand-slice": `Extreme close-up ASMR, vertical 9:16: a butter-smooth block of shimmering pastel kinetic sand being sliced cleanly by a rose-gold blade, crumbling softly. Audio: granular slicing and crumbling sounds, deeply satisfying, no music, no voices`,
  "asmr/soap-peel": `Extreme close-up ASMR, vertical 9:16: curls peeling off a pastel pink soap bar in perfect ribbons under soft light. Audio: crisp gentle carving sounds, ribbon curls dropping softly, no music, no voices`,
  "asmr/honey-dip": `Extreme close-up ASMR, vertical 9:16: a glossy honey dipper lifting golden-pink shimmering syrup that drizzles back in slow ribbons into a glass jar. Audio: thick liquid drizzle sounds, gentle glass tones, no music, no voices`,
  "asmr/pastel-slime": `Extreme close-up ASMR, vertical 9:16: plush paws stretching and folding glossy pastel pink slime with tiny stars mixed in, slow pulls and folds. Audio: rich slime stretching, squelches and pops, no music, no voices`,
  "asmr/gloss-open-close": `Extreme close-up ASMR, vertical 9:16: a frosted gloss tube with pastel blue cap being slowly opened and closed, wand pulling out with the formula stretching glossy. Audio: soft cap clicks, gentle liquid sounds, wand slide, rhythmic and soothing, no music, no voices`,
  "games/spot-difference": `${STYLE}. Split screen game: the same cozy plushie bedroom scene shown twice side by side, but the right side has THREE subtle differences (a heart pillow color, a missing sticker, an extra sparkle). Camera holds steady, then circles highlight each difference one by one at the end. Audio: thinking music, ding sounds at reveals, no voices`,
  "games/boop-says": `${STYLE}. "Boop says" game: ${BOOP} does simple poses to copy (arms up, spin, tiny jump, freeze) with pauses between each for the viewer to copy, getting sillier each round, ending with all three plushies doing the final pose together. Audio: playful instruction chimes, drum hits per pose, no voices`,
  "games/which-melts": `${STYLE}. Guessing game: three pastel ice cubes on a warm pink plate, each hiding something inside (a sparkle, a tiny heart, a mini bow). They melt in timelapse... which melts first? The left one melts first revealing the golden sparkle. Audio: gentle melting ambience, suspense, reveal chime, no voices`,
  "games/memory-flip": `${STYLE}. Memory game: six pastel cards face down, they flip briefly showing pairs (heart, cloud, star), flip back, shuffle slightly... then one card flips: the heart. Where is its pair? After a pause the matching heart card flips — it was the bottom-right. Audio: card flips, thinking music, match chime, no voices`,
  "stories/boop-meets-jelly": `${STYLE}. Mini origin story: ${BOOP} finds a sad deflated little jelly blob in the rain, shares its umbrella-leaf, brings it home, feeds it glitter cereal — the blob plumps up into sparkling happy ${JELLY} and hugs Boop. Heartwarming and funny. ${AUDIO}`,
  "stories/cloudie-origin": `${STYLE}. Mini origin story: a tiny cloud gets tired of raining, floats down, tries several tiny beds (flower, teacup, shoe — all wrong), finally curls on a pink pillow next to ${BOOP} and becomes ${CLOUDIE}, home at last. Cozy and sweet. ${AUDIO}`,
};

const IMAGES = {
  // meme/reaction cards (space for user captions) — 12
  "memes/boop-shocked": { p: `${IMGSTYLE}. Meme reaction image: premium plush photography of a round pink cloud-cap plushie with hilariously exaggerated shocked face, mouth open, on plain pastel background with generous empty space above for caption text, square, no text`, size: "1:1" },
  "memes/boop-smug": { p: `${IMGSTYLE}. Meme reaction image: round pink cloud-cap plushie with smug half-lidded proud expression, arms crossed, plain pastel background, space above for caption, square, no text`, size: "1:1" },
  "memes/boop-crying": { p: `${IMGSTYLE}. Meme reaction image: round pink cloud-cap plushie with comically huge teary sparkling eyes and wobbly mouth, plain pastel background, space above, square, no text`, size: "1:1" },
  "memes/boop-side-eye": { p: `${IMGSTYLE}. Meme reaction image: round pink cloud-cap plushie giving dramatic suspicious side-eye, plain pastel background, space above, square, no text`, size: "1:1" },
  "memes/jelly-panic": { p: `${IMGSTYLE}. Meme reaction image: pink jelly-blob plushie mid-panic, wobbling with wide eyes and tiny arms flailing, plain pastel background, space above, square, no text`, size: "1:1" },
  "memes/jelly-vibing": { p: `${IMGSTYLE}. Meme reaction image: pink jelly-blob plushie with closed happy eyes vibing, tiny headphones on, plain pastel background, space above, square, no text`, size: "1:1" },
  "memes/cloudie-done": { p: `${IMGSTYLE}. Meme reaction image: white cloud plushie utterly exhausted, face-down flat on the floor, one eye barely open, plain pastel background, space above, square, no text`, size: "1:1" },
  "memes/cloudie-cozy": { p: `${IMGSTYLE}. Meme reaction image: white cloud plushie wrapped like a burrito in a tiny pink blanket, blissful sleeping smile, plain pastel background, space above, square, no text`, size: "1:1" },
  "memes/trio-gossip": { p: `${IMGSTYLE}. Meme reaction image: the three plushies huddled whispering to each other conspiratorially, one looking back at camera, plain pastel background, space above, square, no text`, size: "1:1" },
  "memes/trio-judging": { p: `${IMGSTYLE}. Meme reaction image: three plushies sitting in a row staring at camera with silent judgment, plain pastel background, space above, square, no text`, size: "1:1" },
  "memes/boop-monday": { p: `${IMGSTYLE}. Meme image: round pink cloud-cap plushie dragging itself out of a tiny bed, cap askew, one slipper missing, extremely relatable Monday energy, plain pastel background, space above, square, no text`, size: "1:1" },
  "memes/boop-friday": { p: `${IMGSTYLE}. Meme image: round pink cloud-cap plushie mid-air in a jump of pure joy, confetti, sunglasses slightly crooked, Friday energy, plain pastel background, space above, square, no text`, size: "1:1" },
  // IG aesthetic wallpapers/backgrounds — 6
  "wallpapers/phone-hearts": { p: `${IMGSTYLE}. Phone wallpaper 9:16: tiny glossy 3D hearts raining on soft pastel gradient, delicate, premium, no text`, size: "9:16" },
  "wallpapers/phone-clouds": { p: `${IMGSTYLE}. Phone wallpaper 9:16: dreamy pastel cloudscape at golden hour with tiny sparkles, calm and premium, no text`, size: "9:16" },
  "wallpapers/phone-boop": { p: `${IMGSTYLE}. Phone wallpaper 9:16: tiny plush pink cloud-cap character asleep in the bottom corner on a cloud, vast soft gradient sky above, minimal, no text`, size: "9:16" },
  "wallpapers/phone-glitter": { p: `${IMGSTYLE}. Phone wallpaper 9:16: fine holographic glitter gradient fading to soft pink, elegant, no text`, size: "9:16" },
  "wallpapers/phone-jelly": { p: `${IMGSTYLE}. Phone wallpaper 9:16: glossy jelly texture in pastel pink with tiny stars suspended, playful premium, no text`, size: "9:16" },
  "wallpapers/phone-sky": { p: `${IMGSTYLE}. Phone wallpaper 9:16: pastel blue sky with one perfect small cloud and a gold sparkle, minimal zen, no text`, size: "9:16" },
  // weekday sticker series — 6
  "series/monday": { p: `${IMGSTYLE}. Die-cut sticker: sleepy pink cloud-cap plushie hugging a coffee-cup-shaped cloud, thick white border, pure white background, no text`, size: "1:1" },
  "series/wednesday": { p: `${IMGSTYLE}. Die-cut sticker: pink cloud-cap plushie balancing exactly in the middle of a tiny seesaw, thick white border, pure white background, no text`, size: "1:1" },
  "series/friday": { p: `${IMGSTYLE}. Die-cut sticker: jelly-blob plushie with party blower and confetti, thick white border, pure white background, no text`, size: "1:1" },
  "series/weekend": { p: `${IMGSTYLE}. Die-cut sticker: cloud plushie sleeping in a tiny hammock between two lollipop trees, thick white border, pure white background, no text`, size: "1:1" },
  "series/study": { p: `${IMGSTYLE}. Die-cut sticker: pink cloud-cap plushie with tiny round glasses reading a big book, thick white border, pure white background, no text`, size: "1:1" },
  "series/selfcare": { p: `${IMGSTYLE}. Die-cut sticker: pink cloud-cap plushie relaxing with tiny cucumber slices over its eyes and a towel-cloud on its head, thick white border, pure white background, no text`, size: "1:1" },
};

async function createImage(p, size) {
  const res = await fetch(`${API}/jobs/createTask`, {
    method: "POST", headers: HEADERS,
    body: JSON.stringify({ model: "google/nano-banana", input: { prompt: p, output_format: "png", image_size: size } }),
  });
  const j = await res.json();
  if (j.code !== 200) throw new Error(JSON.stringify(j));
  return j.data.taskId;
}
async function pollImage(id) {
  for (let i = 0; i < 90; i++) {
    const j = await (await fetch(`${API}/jobs/recordInfo?taskId=${id}`, { headers: HEADERS })).json();
    if (j.data.state === "success") return JSON.parse(j.data.resultJson).resultUrls[0];
    if (j.data.state === "fail") throw new Error(j.data.failMsg);
    await sleep(5000);
  }
  throw new Error("timeout");
}
async function createVideo(prompt) {
  const j = await (await fetch(`${API}/veo/generate`, {
    method: "POST", headers: HEADERS,
    body: JSON.stringify({ prompt, model: "veo3_fast", aspect_ratio: "9:16" }),
  })).json();
  if (j.code !== 200) throw new Error(JSON.stringify(j));
  return j.data.taskId;
}
async function pollVideo(id) {
  for (let i = 0; i < 120; i++) {
    const j = await (await fetch(`${API}/veo/record-info?taskId=${id}`, { headers: HEADERS })).json();
    const d = j.data;
    if (d.successFlag === 1) return (d.response?.resultUrls ?? JSON.parse(d.resultUrls ?? "[]"))[0];
    if (d.successFlag === 2 || d.successFlag === 3) throw new Error(d.errorMessage ?? "failed");
    await sleep(15000);
  }
  throw new Error("timeout");
}
async function dl(url, file) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, Buffer.from(await (await fetch(url)).arrayBuffer()));
}
const credit = async () => (await (await fetch(`${API}/chat/credit`, { headers: HEADERS })).json()).data;

const mode = process.argv[2] ?? "images";
console.log("credits before:", await credit());
const SET = mode === "videos" ? VIDEOS : IMAGES;
for (let attempt = 1; attempt <= 3; attempt++) {
  let q = 0;
  for (const [key, val] of Object.entries(SET)) {
    const sk = `${mode}:${key}`;
    state[sk] ??= {};
    if (!state[sk].taskId && !state[sk].url) {
      state[sk].taskId = mode === "videos" ? await createVideo(val) : await createImage(val.p, val.size);
      save();
      q++;
      if (q % 8 === 0) await sleep(4000);
    }
  }
  let pending = 0;
  for (const key of Object.keys(SET)) {
    const sk = `${mode}:${key}`;
    if (state[sk].url) continue;
    try {
      state[sk].url = mode === "videos" ? await pollVideo(state[sk].taskId) : await pollImage(state[sk].taskId);
      save();
      await dl(state[sk].url, join(OUT, `${key}.${mode === "videos" ? "mp4" : "png"}`));
      console.log(key, "ok");
    } catch (e) {
      console.error(key, "FAILED:", e.message);
      delete state[sk].taskId;
      save();
      pending++;
    }
  }
  if (!pending) break;
  console.log("retrying", pending);
}
console.log("credits after:", await credit());
console.log("done");
