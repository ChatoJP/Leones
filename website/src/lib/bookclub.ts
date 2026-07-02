// Bloop Book Club reading progress (device-local).

import { useEffect, useState } from "react";
import { earnAchievement } from "./achievements";

export type BookProgress = {
  page: number; // furthest page reached (0-based)
  finished: boolean;
  quizPassed: boolean;
  confirmed: boolean;
};

const KEY = "leones-bookclub-v1";
const EVENT = "leones-bookclub-change";

type Store = Record<string, BookProgress>;

function read(): Store {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function getProgress(slug: string): BookProgress {
  return read()[slug] ?? { page: 0, finished: false, quizPassed: false, confirmed: false };
}

export function setProgress(slug: string, patch: Partial<BookProgress>) {
  const store = read();
  store[slug] = { ...getProgress(slug), ...patch };
  localStorage.setItem(KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent(EVENT));
  if (store[slug].quizPassed) earnAchievement("bookworm");
}

export function useBookProgress(slug: string): BookProgress {
  const [p, setP] = useState(() => getProgress(slug));
  useEffect(() => {
    const refresh = () => setP(getProgress(slug));
    window.addEventListener(EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [slug]);
  return p;
}

export function useAllProgress(): Store {
  const [s, setS] = useState(read);
  useEffect(() => {
    const refresh = () => setS(read());
    window.addEventListener(EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return s;
}
