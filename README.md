# LeoNes Cosmética

Digital-first cosmetic brand for girls 8–13. Soft AND brave — confidence, wrapped in magic.

## Repo layout

- `brand/00-brand-strategy.md` — positioning, competitive gap, brand pillars, architecture (Prides, Cubs Club)
- `brand/01-visual-identity.md` — logo direction, color system, typography, shape/motion language, packaging rules
- `brand/02-voice-and-tone.md` — voice rules, do/don't copy examples, naming conventions
- `products/hero-lineup.md` — The Sparkle Pride: 5 launch SKUs with magic mechanics, pricing, bundles
- `website/` — the digital boutique (Vite + React + TypeScript + Tailwind v4 + Framer Motion)

## Run the website

```
cd website
npm install
npm run dev
```

Opens at http://localhost:5173.

## Current product art

Product visuals are CSS-rendered placeholders (`src/components/ProductArt.tsx`) standing in
for real studio photography. Replace with transparent PNG hero shots when produced —
the shot list per SKU is in `brand/01-visual-identity.md`.
