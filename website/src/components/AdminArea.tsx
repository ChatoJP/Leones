import { useEffect, useState, type ReactNode } from "react";
import { Card, ShopShell } from "./shop/Ui";
import { useI18n } from "../lib/i18n";

// On static hosting (Netlify) there is no API: /api/* falls through to the
// SPA and returns HTML. Detect that and explain, instead of the misleading
// "Not authorized" every admin page would otherwise show.
export default function AdminArea({ children }: { children: ReactNode }) {
  const { lang } = useI18n();
  const [state, setState] = useState<"checking" | "ok" | "offline">("checking");

  useEffect(() => {
    fetch("/api/admin/me", { credentials: "include" })
      .then((r) => {
        const ct = r.headers.get("content-type") ?? "";
        setState(ct.includes("application/json") ? "ok" : "offline");
      })
      .catch(() => setState("offline"));
  }, []);

  if (state === "checking") {
    return (
      <div className="flex min-h-[40svh] items-center justify-center">
        <span className="animate-pulse font-display text-2xl font-semibold text-pink-deep">✦</span>
      </div>
    );
  }

  if (state === "offline") {
    const t = lang === "pt"
      ? {
          title: "Admin precisa do servidor",
          body: "Este site está publicado como site estático (Netlify), que serve apenas a parte pública. O painel de administração vive junto do servidor da API LeoNes — encomendas, stock, biblioteca de conteúdo — que não corre aqui.",
          how: "Para usar o admin agora: corre o projeto localmente",
          cmd: "cd website && npm run dev:all",
          then: "e abre http://localhost:5173/admin/stats. Para admin em produção, a API precisa de um alojamento próprio (ex.: Render/Fly) — é um passo de infraestrutura à parte.",
        }
      : {
          title: "Admin needs the server",
          body: "This site is published as a static site (Netlify), which serves only the public part. The admin panel lives with the LeoNes API server — orders, stock, content library — which doesn't run here.",
          how: "To use admin right now: run the project locally",
          cmd: "cd website && npm run dev:all",
          then: "and open http://localhost:5173/admin/stats. For admin in production, the API needs its own host (e.g. Render/Fly) — a separate infrastructure step.",
        };
    return (
      <ShopShell narrow title={t.title}>
        <Card>
          <p className="text-3xl">🔌</p>
          <p className="mt-3 font-semibold text-ink/70">{t.body}</p>
          <p className="mt-4 font-bold text-ink">{t.how}:</p>
          <code className="mt-2 block rounded-2xl bg-cloud px-4 py-3 text-sm font-bold text-ink">{t.cmd}</code>
          <p className="mt-3 text-sm font-semibold text-ink/60">{t.then}</p>
        </Card>
      </ShopShell>
    );
  }

  return <>{children}</>;
}
