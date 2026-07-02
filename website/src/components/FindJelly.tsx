import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { earnAchievement } from "../lib/achievements";
import { awardRoars } from "../lib/roars";
import { confettiBurst } from "../lib/confetti";
import { useI18n } from "../lib/i18n";
import { sparkleChime } from "../lib/sound";

// Daily hide-and-seek: Jelly hides on one page per day (deterministic from
// the date — no server). Finding her = +5 Roars. Missing her = nothing bad.
const PAGES = ["/", "/club", "/world", "/bloop-books", "/lab"];
const SPOTS = [
  { left: "-18px", top: "58%", rotate: 35 },
  { right: "-18px", top: "32%", rotate: -35 },
  { left: "-18px", top: "78%", rotate: 30 },
  { right: "-18px", top: "66%", rotate: -30 },
];
const FOUND_KEY = "leones-jelly-found";

function todaySeed(): number {
  const d = new Date();
  return d.getFullYear() * 372 + (d.getMonth() + 1) * 31 + d.getDate();
}
const todayStr = () => new Date().toISOString().slice(0, 10);

export default function FindJelly() {
  const { pathname } = useLocation();
  const { lang } = useI18n();
  const [found, setFound] = useState(() => localStorage.getItem(FOUND_KEY) === todayStr());
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    setFound(localStorage.getItem(FOUND_KEY) === todayStr());
  }, [pathname]);

  const seed = todaySeed();
  const hidingPage = PAGES[seed % PAGES.length];
  const spot = SPOTS[seed % SPOTS.length];
  if (found || pathname !== hidingPage) return null;

  const onFind = (e: React.MouseEvent) => {
    localStorage.setItem(FOUND_KEY, todayStr());
    awardRoars(5);
    earnAchievement("jelly-finder");
    sparkleChime();
    confettiBurst(e.clientX, e.clientY, 28);
    setCelebrating(true);
    setTimeout(() => {
      setCelebrating(false);
      setFound(true);
    }, 1800);
  };

  return (
    <div className="pointer-events-none fixed inset-y-0 left-0 right-0 z-40" aria-hidden={celebrating}>
      <AnimatePresence>
        {!celebrating ? (
          <motion.button
            key="jelly"
            onClick={onFind}
            aria-label={lang === "pt" ? "Encontraste a Jelly! Toca-lhe!" : "You found Jelly! Tap her!"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, rotate: [spot.rotate, spot.rotate + 6, spot.rotate] }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ rotate: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } }}
            className="pointer-events-auto absolute h-14 w-14 cursor-pointer border-0 bg-transparent p-0 sm:h-16 sm:w-16"
            style={{ left: spot.left, right: spot.right, top: spot.top }}
          >
            <img src="/mascots/jelly.webp" alt="" draggable={false} className="h-full w-full object-contain drop-shadow-lg" />
          </motion.button>
        ) : (
          <motion.div
            key="cheer"
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="pointer-events-none fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-white/95 px-5 py-3 text-sm font-extrabold text-ink shadow-2xl ring-2 ring-pink"
          >
            {lang === "pt" ? "Encontraste a Jelly! +5 rugidos ✦" : "You found Jelly! +5 roars ✦"}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
