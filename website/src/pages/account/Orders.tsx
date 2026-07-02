import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Card, ShopShell, money } from "../../components/shop/Ui";
import { statusChip, useMyOrders } from "./Account";

export default function AccountOrders() {
  const { user, loading } = useAuth();
  const orders = useMyOrders();

  if (loading) return <ShopShell title="One moment…"><p /></ShopShell>;
  if (!user) return <Navigate to="/login" state={{ from: "/account/orders" }} replace />;

  return (
    <ShopShell title="Your orders" subtitle="Everything you've roared for.">
      {!orders ? (
        <p className="font-semibold text-ink/60">Loading…</p>
      ) : orders.length === 0 ? (
        <Card><p className="font-semibold text-ink/60">Nothing here yet. Your first drop awaits. ✦</p></Card>
      ) : (
        <div className="space-y-5">
          {orders.map((o) => (
            <Card key={o.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p translate="no" className="notranslate font-display text-lg font-semibold text-ink">{o.id}</p>
                  <p className="text-xs font-bold text-ink/60">{new Date(o.createdAt + "Z").toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {statusChip(o.paymentStatus)}
                  {statusChip(o.orderStatus)}
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {o.items.map((it) => (
                  <li key={it.sku} className="flex items-center gap-3 text-sm font-semibold text-ink/70">
                    {it.image && <img src={it.image} alt="" className="h-10 w-10 rounded-xl bg-white object-contain ring-1 ring-ink/10" />}
                    <span translate="no" className="notranslate flex-1">{it.name} <span className="text-ink/60">· {it.sku}</span></span>
                    <span>×{it.quantity}</span>
                    <span className="w-20 text-right">{money(it.price * it.quantity, o.currency)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-end gap-6 border-t border-ink/10 pt-3 text-sm font-bold text-ink/70">
                <span>Shipping {o.shipping === 0 ? "free ✦" : money(o.shipping, o.currency)}</span>
                <span className="text-ink">Total {money(o.total, o.currency)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </ShopShell>
  );
}
