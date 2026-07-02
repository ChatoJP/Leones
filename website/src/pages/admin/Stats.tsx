import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Card, ShopShell, money } from "../../components/shop/Ui";
import { AdminNav } from "./BackOffice";

type Stats = {
  pages: Array<{ path: string; views: number }>;
  days: Array<{ day: string; views: number }>;
  paidOrders: number;
  revenue: number;
  subscribers: number;
};

type Finance = { revenue: number; cogs: number; shippingPaid: number; grossProfit: number; marginPct: number };

export default function AdminStats() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [finance, setFinance] = useState<Finance | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch("/api/admin/stats", { credentials: "include" })
      .then((r) => {
        if (!r.ok) {
          setDenied(true);
          return null;
        }
        return r.json();
      })
      .then((d) => d && setStats(d))
      .catch(() => setDenied(true));
    fetch("/api/admin/finance", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setFinance(d))
      .catch(() => {});
  }, [user]);

  if (loading) return <ShopShell title="One moment…"><p /></ShopShell>;
  if (!user || denied) {
    return (
      <ShopShell narrow title="Not authorized">
        <Card><p className="font-semibold text-ink/60">LeoNes team only.</p></Card>
      </ShopShell>
    );
  }

  const maxDay = Math.max(1, ...(stats?.days.map((d) => d.views) ?? [1]));

  return (
    <ShopShell title="Stats · Admin" subtitle="First-party, cookie-less pageviews.">
      <AdminNav active="stats" />
      {finance && (
        <div className="mb-4 grid gap-4 sm:grid-cols-4">
          {[
            ["Revenue", money(finance.revenue)],
            ["COGS", money(finance.cogs)],
            ["Shipping paid", money(finance.shippingPaid)],
            ["Gross profit", `${money(finance.grossProfit)} (${finance.marginPct}%)`],
          ].map(([k, v]) => (
            <Card key={k} className="text-center !p-5">
              <p className="text-xs font-extrabold uppercase tracking-widest text-ink/60">{k}</p>
              <p className="font-display mt-1 text-2xl font-semibold text-ink">{v}</p>
            </Card>
          ))}
        </div>
      )}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Paid orders", String(stats?.paidOrders ?? "…")],
          ["Revenue", stats ? money(stats.revenue) : "…"],
          ["Newsletter", String(stats?.subscribers ?? "…")],
        ].map(([k, v]) => (
          <Card key={k} className="text-center !p-6">
            <p className="text-xs font-extrabold uppercase tracking-widest text-ink/60">{k}</p>
            <p className="font-display mt-1 text-3xl font-semibold text-ink">{v}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-lg font-semibold text-ink">Last 14 days</h2>
          <div className="mt-4 flex h-36 items-end gap-1.5">
            {[...(stats?.days ?? [])].reverse().map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1" title={`${d.day}: ${d.views}`}>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-sky-deep to-pink-deep"
                  style={{ height: `${(d.views / maxDay) * 100}%`, minHeight: 3 }}
                />
                <span className="text-[9px] font-bold text-ink/55">{d.day.slice(8)}</span>
              </div>
            ))}
            {(stats?.days.length ?? 0) === 0 && <p className="text-sm font-semibold text-ink/60">No views recorded yet.</p>}
          </div>
        </Card>
        <Card>
          <h2 className="font-display text-lg font-semibold text-ink">Top pages</h2>
          <ul className="mt-3 space-y-1.5 text-sm font-semibold text-ink/70">
            {stats?.pages.map((p) => (
              <li key={p.path} className="flex justify-between gap-3">
                <span className="truncate">{p.path}</span>
                <span className="font-extrabold text-ink">{p.views}</span>
              </li>
            ))}
            {(stats?.pages.length ?? 0) === 0 && <li className="text-ink/60">Nothing yet.</li>}
          </ul>
        </Card>
      </div>
      <p className="mt-5 text-xs font-bold text-ink/60">
        <Link to="/admin/orders" className="text-amber hover:underline">→ Orders</Link> · Counts only — no cookies, no IPs, no user tracking.
      </p>
    </ShopShell>
  );
}
