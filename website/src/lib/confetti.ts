// Tiny dependency-free confetti burst for add-to-bag moments.
// Respects prefers-reduced-motion.

import { pop } from "./sound";

const GLYPHS = ["💗", "✦", "💖", "✧", "🩵", "⭐"];

export function confettiBurst(x: number, y: number, count = 14) {
  pop();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.textContent = GLYPHS[i % GLYPHS.length];
    el.style.cssText = `position:fixed;left:${x}px;top:${y}px;font-size:${12 + Math.random() * 12}px;pointer-events:none;z-index:9999;will-change:transform,opacity;`;
    document.body.appendChild(el);
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.6;
    const dist = 60 + Math.random() * 90;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - 40;
    el.animate(
      [
        { transform: "translate(-50%,-50%) scale(1) rotate(0deg)", opacity: 1 },
        { transform: `translate(${dx - 50}%, ${dy}px) scale(${0.4 + Math.random() * 0.4}) rotate(${(Math.random() - 0.5) * 260}deg)`, opacity: 0 },
      ],
      { duration: 700 + Math.random() * 500, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
    ).onfinish = () => el.remove();
  }
}

export function confettiFromEvent(e: { clientX?: number; clientY?: number; currentTarget?: EventTarget | null }) {
  const target = e.currentTarget as HTMLElement | null;
  const rect = target?.getBoundingClientRect();
  const x = e.clientX ?? (rect ? rect.left + rect.width / 2 : window.innerWidth / 2);
  const y = e.clientY ?? (rect ? rect.top : window.innerHeight / 2);
  confettiBurst(x, y);
}
