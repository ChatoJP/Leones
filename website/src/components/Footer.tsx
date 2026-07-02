import { useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../lib/i18n";
import { setSoundEnabled, soundEnabled } from "../lib/sound";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-ink/10 bg-white/60 py-12 text-ink/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <img src="/brand/leones-logo.png" alt="LeoNes" translate="no" className="h-6 w-auto" draggable={false} decoding="async" />
          <p className="mt-3 text-sm">Confidence, wrapped in magic.</p>
        </div>
        <div className="text-sm">
          <p className="mb-2 font-bold text-ink">{t("footer.explore")}</p>
          <ul className="space-y-1.5">
            <li><a href="/#drop" className="hover:text-ink">{t("nav.drop")}</a></li>
            <li><a href="/#quiz" className="hover:text-ink">{t("footer.quiz")}</a></li>
            <li><Link to="/club" className="hover:text-ink">{t("nav.club")}</Link></li>
            <li><Link to="/bloop-books" translate="no" className="notranslate hover:text-ink">Bloop Books</Link></li>
            <li><Link to="/chase" translate="no" className="notranslate hover:text-ink">Bloop Chase</Link></li>
            <li><Link to="/world" className="hover:text-ink">The World</Link></li>
            <li><a href="/#tv" translate="no" className="notranslate hover:text-ink">LeoNes TV</a></li>
            <li><Link to="/track" className="hover:text-ink">Track order</Link></li>
            <li><Link to="/cart" className="hover:text-ink">{t("nav.bag")}</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-2 font-bold text-ink">{t("footer.legal")}</p>
          <ul className="space-y-1.5">
            <li><Link to="/privacy" className="hover:text-ink">{t("footer.privacy")}</Link></li>
            <li><Link to="/terms" className="hover:text-ink">{t("footer.terms")}</Link></li>
            <li><Link to="/shipping-returns" className="hover:text-ink">{t("footer.shipping")}</Link></li>
            <li><Link to="/contact" className="hover:text-ink">{t("footer.contact")}</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-2 font-bold text-ink">{t("footer.parents")}</p>
          <p>{t("footer.parents.1")}</p>
          <p className="mt-1">{t("footer.parents.2")}</p>
        </div>
        <div className="text-sm">
          <p className="mb-2 font-bold text-ink">{t("footer.hi")}</p>
          <p>hello@leones.co</p>
          <SoundToggle />
          <p className="mt-1">
            © {new Date().getFullYear()} <span translate="no">LeoNes</span> Cosmética
          </p>
        </div>
      </div>
    </footer>
  );
}

function SoundToggle() {
  const [on, setOn] = useState(soundEnabled);
  return (
    <button
      onClick={() => {
        setSoundEnabled(!on);
        setOn(!on);
      }}
      aria-pressed={on}
      className="mt-3 rounded-full bg-white/80 px-4 py-2 text-xs font-extrabold text-ink/60 shadow-sm ring-1 ring-ink/10 transition hover:scale-105 hover:text-ink"
    >
      {on ? "🔔 Cute sounds: on" : "🔕 Cute sounds: off"}
    </button>
  );
}
