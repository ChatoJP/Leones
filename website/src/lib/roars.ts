// Roars — the one points wallet. Every play activity on the site feeds it:
// TV games, boop milestones, the quiz, Bloop Books, finding Jelly, the Lab.
// Device-local, no account needed, play-only (nothing is purchasable with
// Roars yet — honest by design).

import { useEffect, useState } from "react";

const KEY = "leones-roars-v1";
const MIGRATED = "leones-roars-migrated";
const EVENT = "leones-roars-change";

export function readRoars(): number {
  migrateOnce();
  return Number(localStorage.getItem(KEY) ?? 0);
}

/** Seed the wallet once from the older separate counters so nobody's
 * progress resets to zero when Roars launches. */
function migrateOnce() {
  if (localStorage.getItem(MIGRATED)) return;
  const tvPoints = Number(localStorage.getItem("leones-tv-points") ?? 0);
  const boops = Number(localStorage.getItem("leones-boops") ?? 0);
  const seed = tvPoints * 5 + Math.floor(boops / 10);
  localStorage.setItem(KEY, String(seed));
  localStorage.setItem(MIGRATED, "1");
}

export function awardRoars(n: number): number {
  const total = readRoars() + n;
  localStorage.setItem(KEY, String(total));
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { gained: n } }));
  return total;
}

export function useRoars(): number {
  const [n, setN] = useState(readRoars);
  useEffect(() => {
    const refresh = () => setN(readRoars());
    window.addEventListener(EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return n;
}

export const ROARS_EVENT = EVENT;
