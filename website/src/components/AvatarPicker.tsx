import { motion } from "framer-motion";
import { AVATARS, setAvatar, useAvatar } from "../lib/avatar";
import { confettiFromEvent } from "../lib/confetti";
import { useI18n } from "../lib/i18n";
import { pop } from "../lib/sound";

const COPY = {
  en: {
    eyebrow: "your plush",
    title1: "Pick your",
    title2: "sidekick",
    sub: "Your plush shows up next to your roars. Stored only on this device.",
    picked: "That's you ✦",
  },
  pt: {
    eyebrow: "o teu plush",
    title1: "Escolhe a tua",
    title2: "companheira",
    sub: "O teu plush aparece ao lado dos teus rugidos. Guardado só neste dispositivo.",
    picked: "És tu ✦",
  },
} as const;

export default function AvatarPicker() {
  const current = useAvatar();
  const { lang } = useI18n();
  const c = COPY[lang];

  return (
    <div className="rounded-[2.5rem] bg-white/70 p-8 shadow-md ring-1 ring-white/70">
      <div className="mb-6 text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-amber">{c.eyebrow}</p>
        <h3 className="font-display mt-2 text-3xl font-semibold text-ink">
          {c.title1} <em className="text-pink-deep">{c.title2}</em>
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm font-semibold text-ink/60">{c.sub}</p>
      </div>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
        {AVATARS.map((a) => {
          const selected = current?.id === a.id;
          return (
            <motion.button
              key={a.id}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                setAvatar(a.id);
                pop();
                confettiFromEvent(e);
              }}
              aria-pressed={selected}
              aria-label={a.name[lang]}
              className={`flex flex-col items-center rounded-3xl p-3 transition ${
                selected ? "bg-pink/30 ring-2 ring-pink-deep" : "bg-cloud/70 ring-1 ring-ink/10 hover:ring-pink"
              }`}
            >
              <img src={a.img} alt="" loading="lazy" className="h-16 w-16 rounded-2xl object-cover" />
              <span className="mt-2 text-[11px] font-extrabold text-ink">{a.name[lang]}</span>
              {selected && <span className="mt-0.5 text-[10px] font-black text-pink-deep">{c.picked}</span>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
