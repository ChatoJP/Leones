import { motion } from "framer-motion";
import { ACHIEVEMENTS, useAchievements } from "../lib/achievements";
import { useI18n } from "../lib/i18n";

const COPY = {
  en: {
    eyebrow: "activity stickers",
    title1: "Earned by",
    title2: "playing",
    sub: "Every sticker comes from doing something fun — never from buying. Each one is worth +10 roars.",
    progress: (n: number, total: number) => `${n}/${total} earned`,
  },
  pt: {
    eyebrow: "cromos de atividades",
    title1: "Ganhos a",
    title2: "brincar",
    sub: "Cada cromo vem de fazer algo divertido — nunca de comprar. Cada um vale +10 rugidos.",
    progress: (n: number, total: number) => `${n}/${total} ganhos`,
  },
} as const;

/** The activity sticker book: earned via play (quiz, books, games, boops…). */
export default function ActivityStickers({ variant = "grid" }: { variant?: "grid" | "path" }) {
  const earned = useAchievements();
  const { lang } = useI18n();
  const c = COPY[lang];
  const count = ACHIEVEMENTS.filter((a) => earned[a.id]).length;

  return (
    <div className={variant === "path" ? "" : "rounded-[2.5rem] bg-white/70 p-8 shadow-md ring-1 ring-white/70"}>
      <div className="mb-6 text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-amber">{c.eyebrow}</p>
        <h3 className="font-display mt-2 text-3xl font-semibold text-ink">
          {c.title1} <em className="text-pink-deep">{c.title2}</em>
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm font-semibold text-ink/60">{c.sub}</p>
        <span className="mt-3 inline-block rounded-full bg-gold/25 px-4 py-1.5 text-xs font-extrabold text-amber">
          ✦ {c.progress(count, ACHIEVEMENTS.length)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {ACHIEVEMENTS.map((a, i) => {
          const got = Boolean(earned[a.id]);
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: (i % 5) * 0.06 }}
              className={`flex flex-col items-center rounded-3xl p-4 text-center ${
                got ? "bg-white shadow-md ring-2 ring-gold/60" : "bg-cloud/70 ring-1 ring-ink/10"
              }`}
              aria-label={`${a.name[lang]} — ${got ? (lang === "pt" ? "ganho" : "earned") : a.hint[lang]}`}
            >
              <motion.img
                src={a.img}
                alt=""
                loading="lazy"
                animate={got ? undefined : undefined}
                className={`h-16 w-16 object-contain ${got ? "" : "opacity-35 grayscale"}`}
              />
              <p className={`mt-2 text-xs font-extrabold ${got ? "text-ink" : "text-ink/55"}`}>{a.name[lang]}</p>
              <p className="mt-0.5 text-[10px] font-bold leading-tight text-ink/55">
                {got ? (earned[a.id] as string) : a.hint[lang]}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
