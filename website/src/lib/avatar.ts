// Pick-your-plush profile avatar. Device-local identity, no data collected.

import { useEffect, useState } from "react";

const KEY = "leones-avatar";
const EVENT = "leones-avatar-change";

export type AvatarDef = { id: string; img: string; name: { en: string; pt: string } };

export const AVATARS: AvatarDef[] = [
  { id: "leona", img: "/mascots/avatars/avatar-leona-v1.webp", name: { en: "Leona", pt: "Leona" } },
  { id: "leona-star", img: "/mascots/avatars/avatar-leona-v2.webp", name: { en: "Leona Star", pt: "Leona Estrela" } },
  { id: "gloss-keeper", img: "/mascots/avatars/avatar-leona-poses-v1.webp", name: { en: "Gloss Keeper", pt: "Guardiã do Gloss" } },
  { id: "treasure", img: "/mascots/avatars/avatar-leona-poses-v2.webp", name: { en: "Treasure Cub", pt: "Cria do Tesouro" } },
  { id: "squad", img: "/mascots/avatars/avatar-group-v1.webp", name: { en: "The Squad", pt: "A Equipa" } },
  { id: "besties", img: "/mascots/avatars/avatar-group-v2.webp", name: { en: "Besties", pt: "Besties" } },
];

export function readAvatar(): AvatarDef | null {
  const id = localStorage.getItem(KEY);
  return AVATARS.find((a) => a.id === id) ?? null;
}

export function setAvatar(id: string) {
  localStorage.setItem(KEY, id);
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function useAvatar(): AvatarDef | null {
  const [a, setA] = useState<AvatarDef | null>(readAvatar);
  useEffect(() => {
    const refresh = () => setA(readAvatar());
    window.addEventListener(EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return a;
}
