import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { earnAchievement } from "../lib/achievements";
import { awardRoars } from "../lib/roars";
import { confettiBurst } from "../lib/confetti";
import { useI18n } from "../lib/i18n";
import { fanfare, kazoo, pop, sparkleChime } from "../lib/sound";

const KEY = "leones-boops";
const EVENT = "leones-boop";

export function readBoops(): number {
  return Number(localStorage.getItem(KEY) ?? 0);
}

function addBoop(): number {
  const n = readBoops() + 1;
  localStorage.setItem(KEY, String(n));
  window.dispatchEvent(new CustomEvent(EVENT));
  return n;
}

export function useBoops(): number {
  const [n, setN] = useState(readBoops);
  useEffect(() => {
    const refresh = () => setN(readBoops());
    window.addEventListener(EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return n;
}

/** A boopable plushie. Click = squish + squeak + heart + counter. */
export default function Bloop({
  src = "/mascots/boop.webp",
  className = "",
  imgClassName = "",
  showCounter = true,
  float = true,
}: {
  src?: string;
  className?: string;
  imgClassName?: string;
  showCounter?: boolean;
  float?: boolean;
}) {
  const { lang } = useI18n();
  const boops = useBoops();
  const [squish, setSquish] = useState(0);
  const [plusOne, setPlusOne] = useState<number | null>(null);

  const doBoop = (e: React.MouseEvent) => {
    const n = addBoop();
    setSquish((s) => s + 1);
    setPlusOne(n);
    setTimeout(() => setPlusOne(null), 900);
    if (n === 500) {
      kazoo(); // the ridiculous moment they earned
      confettiBurst(e.clientX, e.clientY, 60);
    } else if (n === 100) {
      fanfare();
      confettiBurst(e.clientX, e.clientY, 40);
    } else if (n % 10 === 0) {
      sparkleChime();
      confettiBurst(e.clientX, e.clientY, 24);
    } else {
      pop();
      confettiBurst(e.clientX, e.clientY, 6);
    }
    if (n % 10 === 0) awardRoars(1);
    if (n >= 50) earnAchievement("boop-fan");
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <motion.button
        onClick={doBoop}
        aria-label={lang === "pt" ? `Bloopa o Bloop (${boops} boops)` : `Bloop the Bloop (${boops} boops)`}
        animate={float ? { y: [0, -8, 0] } : undefined}
        transition={float ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : undefined}
        whileHover={{ scale: 1.06, rotate: -3 }}
        whileTap={{ scale: 0.82, rotate: 4 }}
        className="cursor-pointer select-none border-0 bg-transparent p-0"
      >
        <motion.img
          key={squish}
          src={src}
          alt=""
          draggable={false}
          initial={{ scaleY: 0.82, scaleX: 1.12 }}
          animate={{ scaleY: 1, scaleX: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 12 }}
          className={`drop-shadow-xl ${imgClassName}`}
        />
      </motion.button>
      {plusOne !== null && (
        <motion.span
          initial={{ opacity: 1, y: 0, scale: 1 }}
          animate={{ opacity: 0, y: -46, scale: 1.4 }}
          transition={{ duration: 0.85, ease: "easeOut" }}
          className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 text-sm font-black text-pink-deep"
        >
          {plusOne % 10 === 0 ? "💗×10!" : "+1 boop"}
        </motion.span>
      )}
      {showCounter && boops > 0 && (
        <span className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-extrabold text-ink shadow ring-1 ring-pink/60">
          {boops} boops
        </span>
      )}
    </div>
  );
}
