# LeoNes Launch Ecosystem — Asset Report

*July 2, 2026 · generated via kie.ai (nano-banana / nano-banana-edit / veo3_fast)*

## 1 · What was created

A complete, brand-consistent asset library under `assets/ecosystem/`, driven by two
prompt manifests (`products/ecosystem.json`, `products/ecosystem-videos.json`) and a
resumable runner (`tools/generate-ecosystem.mjs`). Everything follows the locked
brand rules: realistic Rhode-credible products, exact **LeoNes** spelling, pastel
sky/pink/gold palette, TikTok-native energy, no fake claims, no people.

## 2 · Totals

| Type | Count | Notes |
|---|---|---|
| Images | **285** | 4 credits each |
| Videos | **40** | 8s seamless loops, 9:16 (+ 5 in 16:9 ambient), 60 credits each |
| Video posters | 40 | extracted per clip, free |
| Spend | ≈ 4,100 credits | failed veo tasks are auto-refunded |
| Reserve left | ≈ 2,950 credits | |

18 planned units (16 videos, 2 images) hit transient kie.ai errors and were left
un-retried per "we have enough assets". `node tools/generate-ecosystem.mjs images`
/ `videos` resumes exactly those — money already spent is never re-spent
(after `node tools/reconcile-ecosystem-state.mjs` if batches ran concurrently).

## 3 · Platforms covered

TikTok, Instagram (feed/carousels/stories/reels), Facebook (posts/ads), paid ads
(launch/coming-soon/limited-drop/gift/feature), website (hero/banners/backgrounds/
galleries/posters), YouTube-style thumbnails, plus raw brand kit (logo treatments,
icons, stickers, overlays, patterns, UI sheets).

## 4 · Folder map (assets/ecosystem/)

- **brand/** 20 + **brand/overlays/** 9 — logo glow/gold, app icons, favicon glyphs, UI/badge/frame sheets, seamless patterns; black-bg sparkle/glitter/heart overlays (screen-blend in edits)
- **stickers/** 19 — die-cut pack: cub, cloud, gloss, heart, star, rainbow, crown, paw, lips, gift, moon, butterfly + Cloudie/Jelly/Boop sticker variants
- **products/** 48 — on-pink (all 10 SKUs, labels intact), macro (5 SKUs), gift/unboxing, bags, family lineups, packaging mockups (mailer, drawer box, tissue, shop bag, seals, pouch), lifestyle scenes
- **mascots/** 25 — Cloudie/Jelly/Boop expression sets (design-locked via image-edit), plush lioness avatars, 8 scenes
- **website/** 26 — heroes (16:9 + 9:16), 8 section banners (drop/collection/cubs/parents/gift/mascots/TV/FAQ), subtle backgrounds, social-proof frames, poster art
- **tiktok/** 17 — 11 cover plates (bottom third clean for captions), 6 text-video background plates
- **instagram/** 44 — 15 feed posts, 3 complete 5-slide carousels (meet-the-collection, watch-it-turn-pink, gift-guide), 12 story templates (countdown/poll/question/drop/restock/quiz/this-or-that…), reels covers
- **facebook/** 10 — parent-facing calm posts + ad plates
- **ads/** 19 — feature, gift-ready, launch, coming-soon, limited-drop (all with reserved headline/CTA space)
- **campaigns/** 40 — 10 themes × 4 ratios: tiny-gloss-big-mood, your-pink-exists, watch-it-turn-pink, cute-but-premium, plushie-approved, gift-ready, main-character-gloss, the-leones-world, the-drop, collectible-beauty
- **videos/** 40 — turn-pink heroes ×2, product loops, 5 mascot skits, unboxing ASMR, launch ×3, coming-soon ×2, 14 campaign clips, gift reveals, vanity hook, **8 ambient hero loops**
- **thumbnails/** 8 + **thumbnails/posters/** 40 — stylized thumbnails + per-video poster frames

## 5 · Already live on the website (verified in browser)

- Rotating ambient hero (`AmbientHero.tsx`): 5 desktop + 3 mobile loops, 8s crossfade, reduced-motion poster fallback
- PDP galleries: on-pink slot for all 10 SKUs, macro slot for the 5 hero SKUs
- Publish pipeline: `tools/publish-ecosystem.py` (webp q82 into `website/public/gallery/`)

## 6 · Best for immediate launch

1. `videos/turn-pink/` — the hero moment; pin as first TikTok + PDP video
2. `instagram/carousels/meet-the-collection/` — day-1 feed anchor
3. `ads/launch/` + `videos/launch/launch-stage-*` — announcement pair
4. `products/on-pink/` — instantly upgrades every product page & catalog feed
5. `videos/mascots/mascot-squad-dance-v2` + sticker pack — comment-bait organic content
6. `campaigns/watch-it-turn-pink/` full set — strongest theme, image+video ready

## 7 · Reusable for future drops

- Both manifests re-run against new SKUs by swapping the `refs` (ecom masters) — the whole library regenerates for Collection 02 at the same cost
- All social/ad plates are text-free templates: overlay new copy per drop, never regenerate
- Overlays, patterns, stickers, UI sheets, backgrounds and ambient loops are evergreen
- Campaign themes are drop-agnostic by design ("the drop", "collectible beauty" etc.)

## ⚠ Before publishing videos externally

Generated label text can drift on moving product shots (LeoNes→SONA in past runs).
Apply the ffmpeg logo overlay (see `build-content-library.sh` — publish `branded-*.mp4`)
to any clip where the wordmark is visible before posting.
