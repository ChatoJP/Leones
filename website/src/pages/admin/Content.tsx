import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Card, ShopShell } from "../../components/shop/Ui";
import { AdminNav } from "./BackOffice";

type FileEntry = { name: string; path: string; size: number };
type Library = Record<string, FileEntry[]>;

const NEWSLETTERS = [
  { id: "01-welcome", title: "01 · Welcome / Bem-vinda" },
  { id: "02-the-drop", title: "02 · The Drop" },
  { id: "03-meet-the-plushies", title: "03 · Meet the Plushies" },
  { id: "04-bloop-book-club", title: "04 · Bloop Book Club" },
  { id: "05-behind-the-scenes", title: "05 · Behind the Scenes" },
];

const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const isImg = (n: string) => /\.(png|jpe?g|webp|gif|svg)$/i.test(n);
const isVideo = (n: string) => /\.mp4$/i.test(n);

export default function AdminContent() {
  const { user, loading } = useAuth();
  const [denied, setDenied] = useState(false);
  const [lib, setLib] = useState<Library | null>(null);
  const [folder, setFolder] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    fetch("/api/admin/content", { credentials: "include" })
      .then((r) => {
        if (r.status === 403) { setDenied(true); return null; }
        return r.json();
      })
      .then((d) => d && setLib(d.folders))
      .catch(() => setDenied(true));
  }, [user]);

  const folders = useMemo(() => Object.keys(lib ?? {}).sort(), [lib]);
  const active = folder || folders[0] || "";
  const files = lib?.[active] ?? [];
  const totals = useMemo(() => {
    const all = Object.values(lib ?? {}).flat();
    return { files: all.length, size: all.reduce((s, f) => s + f.size, 0) };
  }, [lib]);

  if (!loading && (!user || denied)) {
    return (
      <ShopShell narrow title="Not authorized">
        <Card><p className="font-semibold text-ink/60">LeoNes team only.</p></Card>
      </ShopShell>
    );
  }

  return (
    <ShopShell title="Content Library">
      <AdminNav active="content" />

      {/* newsletters — the ready-to-send five, PT + EN */}
      <Card>
        <h2 className="font-display text-xl font-semibold text-ink">Newsletters · 5 issues, PT + EN</h2>
        <p className="mt-1 text-sm font-semibold text-ink/60">
          Email-safe HTML in <code className="rounded bg-cloud px-1.5 py-0.5 text-xs">content-library/newsletters/</code> —
          send checklist in the README there.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {NEWSLETTERS.map((n) => (
            <div key={n.id} className="rounded-2xl bg-cloud/70 p-4 ring-1 ring-ink/10">
              <p className="text-sm font-extrabold text-ink">{n.title}</p>
              <div className="mt-2 flex gap-2">
                {(["en", "pt"] as const).map((l) => (
                  <a
                    key={l}
                    href={`/content-library/newsletters/${n.id}.${l}.html`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-white px-4 py-1.5 text-xs font-extrabold uppercase text-ink shadow-sm ring-1 ring-ink/10 transition hover:scale-105"
                  >
                    {l} ↗
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* full library browser */}
      <Card>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-xl font-semibold text-ink">All assets by platform</h2>
          {lib && (
            <span className="text-xs font-bold text-ink/55">
              {totals.files} files · {kb(totals.size)}
            </span>
          )}
        </div>
        {!lib ? (
          <p className="mt-4 animate-pulse text-sm font-semibold text-ink/55">Loading library…</p>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              {folders.map((f) => (
                <button
                  key={f}
                  onClick={() => setFolder(f)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-extrabold transition ${
                    f === active ? "bg-ink text-cloud" : "bg-white text-ink/60 ring-1 ring-ink/10 hover:text-ink"
                  }`}
                >
                  {f} <span className="opacity-60">({lib[f].length})</span>
                </button>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {files.map((f) => (
                <a
                  key={f.path}
                  href={`/content-library/${f.path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group overflow-hidden rounded-2xl bg-cloud/60 ring-1 ring-ink/10 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {isImg(f.name) ? (
                    <img src={`/content-library/${f.path}`} alt={f.name} loading="lazy" className="aspect-square w-full object-cover" />
                  ) : isVideo(f.name) ? (
                    <video src={`/content-library/${f.path}`} muted playsInline preload="metadata" className="aspect-square w-full object-cover" />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center text-3xl">📄</div>
                  )}
                  <div className="p-2">
                    <p className="truncate text-[11px] font-extrabold text-ink">{f.name}</p>
                    <p className="text-[10px] font-bold text-ink/55">{kb(f.size)}</p>
                  </div>
                </a>
              ))}
            </div>
          </>
        )}
      </Card>
    </ShopShell>
  );
}
