// Bloop Chase mini-game state + collectible cards (device-local).

import { useEffect, useState } from "react";

const KEY = "leones-chase-v1";
const EVENT = "leones-chase-change";

export type ChaseState = {
  bestScore: number;
  totalSparkles: number; // lifetime — unlocks cards
  runs: number;
};

export type ChaseCard = {
  id: string;
  img: string;
  unlockAt: number; // lifetime sparkles required
  name: { en: string; pt: string };
  rarity: "common" | "rare" | "legendary";
};

export const CHASE_CARDS: ChaseCard[] = [
  { id: "bloop-classic", img: "/chase/cards/card-bloop-classic.webp", unlockAt: 10, rarity: "common", name: { en: "Bloop, the Chaser", pt: "Bloop, o Perseguidor" } },
  { id: "the-gloss", img: "/chase/cards/card-the-gloss.webp", unlockAt: 25, rarity: "common", name: { en: "The Gloss", pt: "O Gloss" } },
  { id: "cloudie", img: "/chase/cards/card-cloudie.webp", unlockAt: 45, rarity: "common", name: { en: "Cloudie", pt: "Cloudie" } },
  { id: "jelly", img: "/chase/cards/card-jelly.webp", unlockAt: 70, rarity: "common", name: { en: "Jelly", pt: "Jelly" } },
  { id: "bloop-sleepy", img: "/chase/cards/card-bloop-sleepy.webp", unlockAt: 100, rarity: "rare", name: { en: "Sleepy Bloop", pt: "Bloop Dorminhoco" } },
  { id: "the-chase", img: "/chase/cards/card-the-chase.webp", unlockAt: 140, rarity: "rare", name: { en: "The Chase", pt: "A Perseguição" } },
  { id: "trio", img: "/chase/cards/card-trio.webp", unlockAt: 190, rarity: "rare", name: { en: "The Trio", pt: "O Trio" } },
  { id: "snow-bloop", img: "/chase/cards/card-snow-bloop.webp", unlockAt: 250, rarity: "rare", name: { en: "Snow-Bloop", pt: "Bloop de Neve" } },
  { id: "first-roar", img: "/chase/cards/card-first-roar.webp", unlockAt: 320, rarity: "legendary", name: { en: "First Roar", pt: "Primeiro Rugido" } },
  { id: "bloop-golden", img: "/chase/cards/card-bloop-golden.webp", unlockAt: 400, rarity: "legendary", name: { en: "Golden Bloop", pt: "Bloop Dourado" } },
];

export function readChase(): ChaseState {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    return { bestScore: s.bestScore ?? 0, totalSparkles: s.totalSparkles ?? 0, runs: s.runs ?? 0 };
  } catch {
    return { bestScore: 0, totalSparkles: 0, runs: 0 };
  }
}

/** Record a finished run; returns cards newly unlocked by it. */
export function recordRun(score: number): ChaseCard[] {
  const prev = readChase();
  const next: ChaseState = {
    bestScore: Math.max(prev.bestScore, score),
    totalSparkles: prev.totalSparkles + score,
    runs: prev.runs + 1,
  };
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(EVENT));
  return CHASE_CARDS.filter((c) => c.unlockAt > prev.totalSparkles && c.unlockAt <= next.totalSparkles);
}

export const unlockedCards = (state: ChaseState) =>
  CHASE_CARDS.filter((c) => c.unlockAt <= state.totalSparkles);

export function useChase(): ChaseState {
  const [s, setS] = useState(readChase);
  useEffect(() => {
    const refresh = () => setS(readChase());
    window.addEventListener(EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return s;
}
