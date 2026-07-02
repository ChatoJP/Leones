import { motion } from "framer-motion";
import { useMemo } from "react";

const GLYPHS = ["✦", "✧", "❀", "•"];

type Particle = {
  id: number;
  glyph: string;
  left: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
};

const COLORS = ["#f0c36b", "#fbd3de", "#c9e4f5", "#ffffff"];

export default function FloatingParticles({ count = 18 }: { count?: number }) {
  const particles: Particle[] = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        glyph: GLYPHS[i % GLYPHS.length],
        left: Math.random() * 100,
        size: 10 + Math.random() * 18,
        duration: 14 + Math.random() * 12,
        delay: Math.random() * -20,
        color: COLORS[i % COLORS.length],
      })),
    [count]
  );

  return (
    <div className="particles-layer pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute select-none opacity-0"
          style={{ left: `${p.left}%`, fontSize: p.size, color: p.color, bottom: "-5%" }}
          animate={{
            y: ["0vh", "-115vh"],
            opacity: [0, 0.7, 0.7, 0],
            x: [0, 20, -20, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {p.glyph}
        </motion.span>
      ))}
    </div>
  );
}
