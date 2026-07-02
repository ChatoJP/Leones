import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useI18n } from "../lib/i18n";
import RoarsChip from "./RoarsChip";
import SearchOverlay from "./SearchOverlay";

function useIsAdmin(): boolean {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    fetch("/api/admin/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setIsAdmin(Boolean(d?.isAdmin)))
      .catch(() => setIsAdmin(false));
  }, [user]);
  return isAdmin;
}

export default function Nav() {
  const { count } = useCart();
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const links = [
    { href: "/#drop", label: t("nav.drop") },
    { href: "/#parents", label: t("nav.parents") },
    { href: "/club", label: t("nav.club") },
    { href: "/bloop-books", label: t("nav.books"), brand: true },
    { href: "/lab", label: lang === "pt" ? "O Lab ✦" : "The Lab ✦" },
    { href: "/tv", label: "LeoNes TV", brand: true },
    { href: "/#challenge", label: "#JellyBoop", brand: true },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-white/50 bg-white/40 backdrop-blur-xl"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-4 sm:px-6" aria-label="Main">
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-ink shadow-sm ring-1 ring-ink/10 sm:hidden"
        >
          {open ? "✕" : "☰"}
        </button>

        <Link to="/" translate="no" className="shrink-0">
          <img src="/brand/leones-lockup.png" alt="LeoNes" className="h-9 w-auto sm:h-11" draggable={false} decoding="async" />
        </Link>

        <div className="hidden items-center gap-7 text-sm font-bold text-ink/60 lg:flex">
          {links.map((l) =>
            l.brand ? (
              <a key={l.href} href={l.href} translate="no" className="notranslate transition hover:text-ink">{l.label}</a>
            ) : (
              <a key={l.href} href={l.href} className="transition hover:text-ink">{l.label}</a>
            )
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {isAdmin && (
            <Link
              to="/admin/stats"
              className="hidden rounded-full bg-gold/30 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide text-amber shadow-sm ring-1 ring-gold/50 transition hover:scale-105 sm:block"
            >
              Admin
            </Link>
          )}
          <RoarsChip />
          <button
            onClick={() => setSearchOpen(true)}
            aria-label={t("nav.search")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-ink shadow-sm ring-1 ring-ink/10 transition hover:scale-105"
          >
            🔍
          </button>
          <button
            onClick={() => setLang(lang === "pt" ? "en" : "pt")}
            aria-label={lang === "pt" ? "Switch to English" : "Mudar para Português"}
            className="rounded-full bg-white/80 px-3 py-2.5 text-xs font-extrabold text-ink shadow-sm ring-1 ring-ink/10 transition hover:scale-105"
          >
            {lang === "pt" ? "PT" : "EN"}
          </button>
          {user ? (
            <Link to="/account" className="hidden rounded-full bg-white/80 px-4 py-2.5 text-sm font-bold text-ink shadow-sm ring-1 ring-ink/10 transition hover:scale-105 sm:block">
              {t("nav.account")}
            </Link>
          ) : (
            <Link to="/login" className="hidden rounded-full bg-white/80 px-4 py-2.5 text-sm font-bold text-ink shadow-sm ring-1 ring-ink/10 transition hover:scale-105 sm:block">
              {t("nav.login")}
            </Link>
          )}
          <Link to="/cart" aria-label={`${t("nav.bag")}, ${count}`} className="relative rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-cloud transition hover:scale-105 sm:px-5">
            <span className="hidden sm:inline">{t("nav.bag")}</span>
            <span className="sm:hidden">👜</span>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={count}
                initial={{ scale: 1.6, y: -4 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-pink text-xs font-extrabold text-ink"
              >
                {count}
              </motion.span>
            </AnimatePresence>
          </Link>
        </div>
      </nav>

      {/* mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-white/50 bg-white/70 backdrop-blur-xl sm:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  {...(l.brand
                    ? { translate: "no" as const, className: "notranslate rounded-2xl px-4 py-3 font-bold text-ink/70 transition hover:bg-white" }
                    : { className: "rounded-2xl px-4 py-3 font-bold text-ink/70 transition hover:bg-white" })}
                >
                  {l.label}
                </a>
              ))}
              <Link to={user ? "/account" : "/login"} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 font-bold text-ink/70 transition hover:bg-white">
                {user ? t("nav.account") : t("nav.login")}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </motion.header>
  );
}
