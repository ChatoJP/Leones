import { motion } from "framer-motion";

/** TikTok-style sticker badge — rotated, white die-cut ring, soft shadow. */
export default function Sticker({
  children,
  tone = "pink",
  rotate = -4,
  className = "",
  wiggle = false,
}: {
  children: React.ReactNode;
  tone?: "pink" | "sky" | "gold" | "ink";
  rotate?: number;
  className?: string;
  wiggle?: boolean;
}) {
  const tones = {
    pink: "bg-pink text-ink",
    sky: "bg-sky text-ink",
    gold: "bg-gold/80 text-ink",
    ink: "bg-ink text-cloud",
  };
  return (
    <motion.span
      initial={{ rotate }}
      animate={wiggle ? { rotate: [rotate - 2, rotate + 2, rotate - 2] } : { rotate }}
      transition={wiggle ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : undefined}
      className={`inline-block rounded-full px-4 py-1.5 text-xs font-extrabold lowercase tracking-wide shadow-md ring-4 ring-white ${tones[tone]} ${className}`}
    >
      {children}
    </motion.span>
  );
}
