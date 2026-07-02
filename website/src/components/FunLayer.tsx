import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/** Sparkle cursor trail — desktop fine pointers only, reduced-motion aware. */
export function SparkleTrail() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let last = 0;
    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - last < 90) return;
      last = now;
      const el = document.createElement("span");
      el.textContent = Math.random() > 0.5 ? "✦" : "✧";
      el.style.cssText = `position:fixed;left:${e.clientX + 8}px;top:${e.clientY + 10}px;font-size:${8 + Math.random() * 8}px;color:${Math.random() > 0.5 ? "#f0c36b" : "#f6b7c8"};pointer-events:none;z-index:9998;`;
      document.body.appendChild(el);
      el.animate(
        [
          { transform: "translateY(0) scale(1)", opacity: 0.9 },
          { transform: "translateY(14px) scale(0.3)", opacity: 0 },
        ],
        { duration: 650, easing: "ease-out" }
      ).onfinish = () => el.remove();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return null;
}

/** The mascot peeks in from the screen edge every so often. */
export function MascotPeek() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const first = setTimeout(() => setShow(true), 12000);
    const loop = setInterval(() => setShow(true), 45000);
    return () => {
      clearTimeout(first);
      clearInterval(loop);
    };
  }, []);
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setShow(false), 3600);
    return () => clearTimeout(t);
  }, [show]);
  return (
    <AnimatePresence>
      {show && (
        <motion.img
          src="/brand/mascot-run.webp"
          alt=""
          aria-hidden="true"
          initial={{ x: 120, rotate: -8 }}
          animate={{ x: 24, rotate: [0, -4, 0] }}
          exit={{ x: 130 }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
          className="pointer-events-none fixed -right-4 bottom-24 z-40 h-20 w-auto -scale-x-100 drop-shadow-xl sm:h-24"
        />
      )}
    </AnimatePresence>
  );
}

/** Thin gradient scroll-progress bar under the nav. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      if (ref.current) ref.current.style.width = `${pct}%`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-1 bg-transparent" aria-hidden="true">
      <div ref={ref} className="h-full rounded-r-full bg-gradient-to-r from-sky-deep via-pink-deep to-gold transition-[width] duration-150" style={{ width: 0 }} />
    </div>
  );
}

/** Back-to-top sparkle button. */
export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 1400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-24 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-lg text-ink shadow-xl ring-1 ring-ink/10 backdrop-blur transition hover:scale-110 sm:left-6"
        >
          ↑
        </motion.button>
      )}
    </AnimatePresence>
  );
}
