import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useI18n } from "../lib/i18n";
import { products } from "../data/products";

export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setTimeout(() => inputRef.current?.focus(), 80);
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
        // keep Tab focus inside the dialog
        if (e.key === "Tab") {
          const dialog = document.querySelector('[role="dialog"]');
          if (!dialog) return;
          const focusables = dialog.querySelectorAll<HTMLElement>('button, a, input, [tabindex]:not([tabindex="-1"])');
          if (focusables.length === 0) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };
      window.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
      return () => {
        window.removeEventListener("keydown", onKey);
        document.body.style.overflow = "";
      };
    }
  }, [open, onClose]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return products;
    return products.filter((p) =>
      [p.name, p.tagline, p.hook, p.sku, ...p.chips].join(" ").toLowerCase().includes(needle)
    );
  }, [q]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-ink/30 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Product search"
        >
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="mx-auto mt-16 w-[92vw] max-w-2xl rounded-[2rem] bg-cloud p-5 shadow-2xl sm:p-7"
          >
            <div className="flex items-center gap-3 rounded-full bg-white px-5 py-3 shadow-sm ring-1 ring-ink/10">
              <span className="text-lg">🔍</span>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("search.placeholder")}
                className="w-full bg-transparent font-bold text-ink outline-none placeholder:text-ink/55"
                aria-label={t("nav.search")}
              />
              <button onClick={onClose} aria-label="Close search" className="text-ink/60 hover:text-ink">✕</button>
            </div>
            <div className="mt-4 grid max-h-[55vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
              {results.map((p) => (
                <Link
                  key={p.sku}
                  to={`/products/${p.slug}`}
                  onClick={onClose}
                  className="flex flex-col items-center rounded-3xl bg-white/80 p-4 text-center shadow-sm ring-1 ring-white transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <img src={p.image} alt="" loading="lazy" className="h-20 w-20 object-contain" />
                  <p translate="no" className="notranslate mt-1 text-sm font-bold text-ink">{p.name}</p>
                  <p className="text-xs font-bold text-amber">€{p.price}</p>
                </Link>
              ))}
              {results.length === 0 && (
                <p className="col-span-full py-10 text-center text-sm font-bold text-ink/60">{t("search.empty")}</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
