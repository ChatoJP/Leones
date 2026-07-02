import { useState } from "react";
import { useI18n } from "../lib/i18n";

export default function AnnouncementBar() {
  const { t } = useI18n();
  const [hidden, setHidden] = useState(() => sessionStorage.getItem("leones-announce-hidden") === "1");
  if (hidden) return null;
  return (
    <div className="relative z-[55] flex items-center justify-center gap-2 bg-ink px-10 py-2 text-center text-xs font-extrabold tracking-wide text-cloud">
      <span className="text-gold">✦</span>
      <span>{t("announce")}</span>
      <span className="text-gold">✦</span>
      <button
        onClick={() => {
          sessionStorage.setItem("leones-announce-hidden", "1");
          setHidden(true);
        }}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-0.5 text-cloud/60 transition hover:text-cloud"
      >
        ✕
      </button>
    </div>
  );
}
