import { motion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * The hero's signature moment: a large gloss orb that visibly warms from
 * clear to soft pink on hover/tap, dramatizing Cloud Gloss's actual
 * mechanic instead of describing it. Ambient-cycles when idle so touch
 * users without hover still see it happen.
 */
export default function HeroSignature() {
  const [hovered, setHovered] = useState(false);
  const [ambient, setAmbient] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setAmbient((a) => !a), 2600);
    return () => clearInterval(id);
  }, []);

  const active = hovered || ambient;

  return (
    <div className="flex flex-col items-center">
      <motion.div
        className="relative flex h-64 w-64 cursor-pointer items-center justify-center rounded-full sm:h-80 sm:w-80"
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onTapStart={() => setHovered(true)}
        onTap={() => setTimeout(() => setHovered(false), 1200)}
        animate={{ scale: active ? 1.03 : 1 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* base: crystal/clear state */}
        <div
          className="absolute inset-0 rounded-full ring-1 ring-white/70"
          style={{
            background:
              "radial-gradient(circle at 32% 28%, #ffffff 0%, #eaf6ff 38%, #c9e4f5 100%)",
            boxShadow: "0 30px 60px -20px rgba(169,211,236,0.6), inset 0 0 30px rgba(255,255,255,0.8)",
          }}
        />
        {/* overlay: bloomed pink state, crossfades in */}
        <motion.div
          className="absolute inset-0 rounded-full ring-1 ring-white/70"
          style={{
            background:
              "radial-gradient(circle at 32% 28%, #ffffff 0%, #fde3ea 40%, #f6b7c8 100%)",
            boxShadow: "0 30px 60px -20px rgba(246,183,200,0.7), inset 0 0 30px rgba(255,255,255,0.8)",
          }}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        />
        {/* glossy highlight */}
        <div
          className="absolute rounded-full bg-white/80 blur-[3px]"
          style={{ width: "22%", height: "22%", top: "20%", left: "26%" }}
        />
        <motion.span
          animate={{ opacity: active ? 1 : 0.5, rotate: active ? 8 : 0 }}
          transition={{ duration: 0.6 }}
          className="absolute -top-2 right-6 text-2xl text-gold"
        >
          ✦
        </motion.span>
      </motion.div>
      <p className="mt-5 text-xs font-bold uppercase tracking-widest text-ink/60">
        tap or hover to watch it bloom
      </p>
    </div>
  );
}
