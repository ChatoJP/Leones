import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { earnAchievement } from "../lib/achievements";
import { confettiBurst } from "../lib/confetti";
import { useI18n } from "../lib/i18n";
import { sparkleChime } from "../lib/sound";

// Birthday roar: if the visitor set a birthday month (month only — no dates,
// no year, stored on-device) and it's that month, one celebration per day.
export const BIRTHDAY_KEY = "leones-birthday-month";
const CELEBRATED_KEY = "leones-birthday-celebrated";

export function readBirthdayMonth(): number | null {
  const n = Number(localStorage.getItem(BIRTHDAY_KEY));
  return n >= 1 && n <= 12 ? n : null;
}

export function setBirthdayMonth(m: number | null) {
  if (m === null) localStorage.removeItem(BIRTHDAY_KEY);
  else localStorage.setItem(BIRTHDAY_KEY, String(m));
  window.dispatchEvent(new CustomEvent("leones-birthday-change"));
}

export default function PartyMode() {
  const { lang } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const check = () => {
      const month = readBirthdayMonth();
      const today = new Date().toISOString().slice(0, 10);
      if (month === null || new Date().getMonth() + 1 !== month) return;
      if (localStorage.getItem(CELEBRATED_KEY) === today) return;
      localStorage.setItem(CELEBRATED_KEY, today);
      earnAchievement("birthday");
      setShow(true);
      sparkleChime();
      const w = window.innerWidth, h = window.innerHeight;
      [0.25, 0.5, 0.75].forEach((x, i) =>
        setTimeout(() => confettiBurst(w * x, h * 0.3, 24), i * 350)
      );
      setTimeout(() => setShow(false), 5200);
    };
    check();
    window.addEventListener("leones-birthday-change", check);
    return () => window.removeEventListener("leones-birthday-change", check);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="fixed inset-x-0 top-20 z-[60] mx-auto w-fit rounded-full bg-white/95 px-6 py-3.5 text-center shadow-2xl ring-2 ring-gold"
        >
          <span className="text-sm font-extrabold text-ink">
            🎂 {lang === "pt" ? "É o teu mês! Rugido de parabéns ✦" : "It's your month! Birthday roar ✦"} 🦁
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
