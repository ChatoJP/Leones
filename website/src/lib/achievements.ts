// Activity stickers — earned by playing, not by buying. Each earn also
// grants +10 Roars. Device-local. No streaks, no expiry, no shame.

import { useEffect, useState } from "react";
import { awardRoars } from "./roars";

const KEY = "leones-achievements-v1";
const EVENT = "leones-achievements-change";

export type AchievementId =
  | "explorer"      // visited the World page
  | "quiz-match"    // finished the Gloss Quiz
  | "bookworm"      // finished a Bloop Book
  | "game-winner"   // won 3 TV games
  | "boop-fan"      // 50 boops
  | "jelly-finder"  // found Jelly hiding
  | "lab-mixer"     // mixed a pink in the Gloss Lab
  | "collector"     // full product sticker album
  | "birthday"      // visited during their birthday month
  | "butterfly";    // shared a card (album / lab creation)

export type AchievementDef = {
  id: AchievementId;
  img: string;
  name: { en: string; pt: string };
  hint: { en: string; pt: string };
};

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "explorer", img: "/stickers/achievements/rainbow.webp",
    name: { en: "Explorer", pt: "Exploradora" },
    hint: { en: "Visit the LeoNes World", pt: "Visita o Mundo LeoNes" } },
  { id: "quiz-match", img: "/stickers/achievements/crown.webp",
    name: { en: "Perfect match", pt: "Match perfeito" },
    hint: { en: "Take the Gloss Quiz", pt: "Faz o Quiz do Gloss" } },
  { id: "bookworm", img: "/stickers/achievements/moon.webp",
    name: { en: "Bookworm", pt: "Leitora" },
    hint: { en: "Finish a Bloop Book", pt: "Acaba um Bloop Book" } },
  { id: "game-winner", img: "/stickers/achievements/star.webp",
    name: { en: "Game champ", pt: "Campeã dos jogos" },
    hint: { en: "Win 3 TV games", pt: "Ganha 3 jogos na TV" } },
  { id: "boop-fan", img: "/stickers/achievements/paw.webp",
    name: { en: "Bloop fan", pt: "Fã do Bloop" },
    hint: { en: "Bloop 50 times", pt: "Boopa 50 vezes" } },
  { id: "jelly-finder", img: "/stickers/achievements/jelly.webp",
    name: { en: "Jelly finder", pt: "Detetive da Jelly" },
    hint: { en: "Find Jelly hiding somewhere…", pt: "Encontra a Jelly escondida…" } },
  { id: "lab-mixer", img: "/stickers/achievements/lips.webp",
    name: { en: "Pink scientist", pt: "Cientista do rosa" },
    hint: { en: "Mix your pink in the Lab", pt: "Mistura o teu rosa no Lab" } },
  { id: "collector", img: "/stickers/achievements/gift.webp",
    name: { en: "Collector", pt: "Colecionadora" },
    hint: { en: "Fill the sticker album", pt: "Enche a caderneta" } },
  { id: "birthday", img: "/stickers/achievements/cub.webp",
    name: { en: "Birthday roar", pt: "Rugido de anos" },
    hint: { en: "Visit in your birthday month", pt: "Visita no mês dos teus anos" } },
  { id: "butterfly", img: "/stickers/achievements/butterfly.webp",
    name: { en: "Social butterfly", pt: "Borboleta social" },
    hint: { en: "Share a card you made", pt: "Partilha um cartão teu" } },
];

function read(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function hasAchievement(id: AchievementId): boolean {
  return Boolean(read()[id]);
}

/** Earn once; returns true only the first time. Grants +10 Roars. */
export function earnAchievement(id: AchievementId): boolean {
  const earned = read();
  if (earned[id]) return false;
  earned[id] = new Date().toISOString().slice(0, 10);
  localStorage.setItem(KEY, JSON.stringify(earned));
  awardRoars(10);
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { id } }));
  return true;
}

export function useAchievements(): Record<string, string> {
  const [earned, setEarned] = useState<Record<string, string>>(read);
  useEffect(() => {
    const refresh = () => setEarned(read());
    window.addEventListener(EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return earned;
}

export const ACHIEVEMENTS_EVENT = EVENT;
