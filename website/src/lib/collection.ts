// Sticker-album collection tracker: remembers every product a visitor has
// ever added to their bag (localStorage, device-local, no account needed).

import { useEffect, useState } from "react";
import { earnAchievement } from "./achievements";

const ALBUM_SIZE = 10; // Gloss Collection 01

const KEY = "leones-collection-v1";
const EVENT = "leones-collection-change";

export function readCollection(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

export function collect(sku: string) {
  const set = readCollection();
  if (set.has(sku)) return;
  set.add(sku);
  localStorage.setItem(KEY, JSON.stringify([...set]));
  window.dispatchEvent(new CustomEvent(EVENT));
  if (set.size >= ALBUM_SIZE) earnAchievement("collector");
}

export function useCollection(): Set<string> {
  const [set, setSet] = useState<Set<string>>(readCollection);
  useEffect(() => {
    const refresh = () => setSet(readCollection());
    window.addEventListener(EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return set;
}

// ---- recently viewed (PDP) ----

const VIEWED_KEY = "leones-viewed-v1";

export function trackViewed(sku: string) {
  try {
    const list = (JSON.parse(localStorage.getItem(VIEWED_KEY) ?? "[]") as string[]).filter((s) => s !== sku);
    list.unshift(sku);
    localStorage.setItem(VIEWED_KEY, JSON.stringify(list.slice(0, 6)));
  } catch {
    /* ignore */
  }
}

export function readViewed(excludeSku?: string): string[] {
  try {
    return (JSON.parse(localStorage.getItem(VIEWED_KEY) ?? "[]") as string[]).filter((s) => s !== excludeSku);
  } catch {
    return [];
  }
}
