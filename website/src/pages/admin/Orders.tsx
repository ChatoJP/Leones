import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Card, ShopShell, money } from "../../components/shop/Ui";
import { statusChip } from "../account/Account";
import { AdminNav } from "./BackOffice";
import type { OrderDto } from "../account/Account";

type AdminOrder = OrderDto & {
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  notes: string | null;
};

function StatusButtons({ order, onChanged }: { order: AdminOrder; onChanged: (s: string) => void }) {
  const [busy, setBusy] = useState(false);
  const setStatus = async (status: string) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (res.ok) onChanged(status);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink/10 pt-3">
      <span className="text-xs font-extrabold uppercase tracking-wider text-ink/60">Set status:</span>
      {["processing", "shipped", "completed", "cancelled"].map((s) => (
        <button
          key={s}
          disabled={busy || order.orderStatus === s}
          onClick={() => setStatus(s)}
          className={`rounded-full px-3 py-1.5 text-xs font-extrabold transition ${
            order.orderStatus === s ? "bg-ink text-cloud" : "bg-cloud text-ink/60 hover:bg-sky/40 hover:text-ink"
          } disabled:cursor-not-allowed`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

export default function AdminOrders() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [denied, setDenied] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch("/api/admin/orders", { credentials: "include" })
      .then((r) => {
        if (r.status === 403 || r.status === 401) {
          setDenied(true);
          return { orders: [] };
        }
        return r.json();
      })
      .then((d) => setOrders(d.orders))
      .catch(() => setOrders([]));
  }, [user]);

  if (loading) return <ShopShell title="One moment…"><p /></ShopShell>;
  if (!user || denied) {
    return (
      <ShopShell narrow title="Not authorized">
        <Card>
          <p className="font-semibold text-ink/60">
            This area is for the LeoNes team only.{" "}
            {!user && <Link to="/login" state={{ from: "/admin/orders" }} className="font-bold text-amber hover:underline">Entrar →</Link>}
          </p>
        </Card>
      </ShopShell>
    );
  }

  return (
    <ShopShell title="Orders · Admin" subtitle={orders ? `${orders.length} orders` : "Loading…"}>
      <AdminNav active="orders" />
      <div className="space-y-4">
        {orders?.length === 0 && <Card><p className="font-semibold text-ink/60">No orders yet.</p></Card>}
        {orders?.map((o) => (
          <Card key={o.id} className="!p-5">
            <button onClick={() => setOpen(open === o.id ? null : o.id)} className="flex w-full flex-wrap items-center gap-3 text-left">
              <span translate="no" className="notranslate font-display font-semibold text-ink">{o.id}</span>
              <span className="text-sm font-semibold text-ink/60">{o.customerName}</span>
              <span className="text-sm font-semibold text-ink/60">{o.email}</span>
              <span className="ml-auto font-bold text-ink">{money(o.total, o.currency)}</span>
              {statusChip(o.paymentStatus)}
              {statusChip(o.orderStatus)}
              <span className="text-xs font-bold text-ink/60">{new Date(o.createdAt + "Z").toLocaleString()}</span>
            </button>
            {open === o.id && (
              <div className="mt-4 grid gap-4 border-t border-ink/10 pt-4 sm:grid-cols-2">
                <div className="text-sm font-semibold text-ink/70">
                  <p className="mb-1 text-xs font-extrabold uppercase tracking-wider text-ink/60">Ship to</p>
                  <p>{o.customerName} · {o.phone}</p>
                  <p>{o.address}</p>
                  <p>{o.postalCode} {o.city}, {o.country}</p>
                  {o.notes && <p className="mt-2 rounded-xl bg-cloud px-3 py-2">📝 {o.notes}</p>}
                </div>
                <ul className="space-y-1 text-sm font-semibold text-ink/70">
                  {o.items.map((it) => (
                    <li key={it.sku} className="flex justify-between gap-2">
                      <span translate="no" className="notranslate">{it.name} <span className="text-ink/60">· {it.sku}</span></span>
                      <span>×{it.quantity} · {money(it.price * it.quantity, o.currency)}</span>
                    </li>
                  ))}
                  <li className="flex justify-between border-t border-ink/10 pt-1 font-bold text-ink">
                    <span>Shipping {o.shipping === 0 ? "(free)" : ""}</span>
                    <span>{money(o.shipping, o.currency)}</span>
                  </li>
                </ul>
              </div>
            )}
            {open === o.id && (
              <StatusButtons order={o} onChanged={(status) => setOrders((prev) => prev!.map((x) => (x.id === o.id ? { ...x, orderStatus: status } : x)))} />
            )}
          </Card>
        ))}
      </div>
    </ShopShell>
  );
}
