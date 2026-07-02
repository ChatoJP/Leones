import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAvatar } from "../lib/avatar";
import { useI18n } from "../lib/i18n";
import { useRoars } from "../lib/roars";

/** The one points wallet, always visible once it exists. Links to the Club. */
export default function RoarsChip() {
  const roars = useRoars();
  const avatar = useAvatar();
  const { lang } = useI18n();
  const [pop, setPop] = useState(false);
  const prev = useRef(roars);

  useEffect(() => {
    if (roars > prev.current) {
      setPop(true);
      const t = setTimeout(() => setPop(false), 700);
      return () => clearTimeout(t);
    }
    prev.current = roars;
  }, [roars]);

  if (roars <= 0) return null;
  return (
    <Link
      to="/club"
      aria-label={lang === "pt" ? `${roars} rugidos — ver o Cubs Club` : `${roars} roars — view the Cubs Club`}
      className="relative hidden rounded-full bg-gold/25 px-3 py-2.5 text-xs font-extrabold text-amber shadow-sm ring-1 ring-gold/40 transition hover:scale-105 sm:block"
    >
      <motion.span key={roars} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="inline-flex items-center gap-1.5">
        {avatar ? (
          <img src={avatar.img} alt="" className="h-5 w-5 rounded-full object-cover ring-1 ring-gold/60" />
        ) : (
          <span>🦁</span>
        )}
        {roars}
      </motion.span>
      <AnimatePresence>
        {pop && (
          <motion.span
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -22 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65 }}
            className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 text-[10px] font-black text-pink-deep"
          >
            +roar ✦
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
