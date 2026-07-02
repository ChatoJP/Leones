// Kid-friendly favorites (hearts). Device-local, no account needed.

import { useEffect, useState } from "react";

const KEY = "leones-favorites-v1";
const EVENT = "leones-favorites-change";

function read(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

export function toggleFavorite(sku: string): boolean {
  const set = read();
  const nowFav = !set.has(sku);
  if (nowFav) set.add(sku);
  else set.delete(sku);
  localStorage.setItem(KEY, JSON.stringify([...set]));
  window.dispatchEvent(new CustomEvent(EVENT));
  return nowFav;
}

export function useFavorites(): Set<string> {
  const [set, setSet] = useState<Set<string>>(read);
  useEffect(() => {
    const refresh = () => setSet(read());
    window.addEventListener(EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return set;
}
