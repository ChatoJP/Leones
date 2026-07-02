import { useState, type FormEvent } from "react";
import { useI18n } from "../lib/i18n";

const C = {
  en: { title: "Track your order", sub: "Order number + the email you used.", num: "Order number", email: "Email", find: "Find my order", total: "Total" },
  pt: { title: "Segue a tua encomenda", sub: "Número da encomenda + o email que usaste.", num: "Número da encomenda", email: "Email", find: "Encontrar a encomenda", total: "Total" },
} as const;
import { Card, ErrorNote, Field, PrimaryButton, ShopShell, money } from "../components/shop/Ui";
import { statusChip } from "./account/Account";
import type { OrderDto } from "./account/Account";

export default function Track() {
  const { lang } = useI18n();
  const c = C[lang];
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setOrder(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/track?order=${encodeURIComponent(orderId.trim())}&email=${encodeURIComponent(email.trim())}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
      setOrder(json.order);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const STEPS = ["new", "processing", "shipped", "completed"];
  const stepIdx = order ? Math.max(0, STEPS.indexOf(order.orderStatus)) : 0;

  return (
    <ShopShell narrow title={c.title} subtitle={c.sub}>
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <ErrorNote>{error}</ErrorNote>
          <Field label={c.num} required value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="LN-…" />
          <Field label={c.email} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <PrimaryButton type="submit" loading={loading}>{c.find}</PrimaryButton>
        </form>
      </Card>

      {order && (
        <Card className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p translate="no" className="notranslate font-display text-lg font-semibold text-ink">{order.id}</p>
            <div className="flex gap-2">
              {statusChip(order.paymentStatus)}
              {statusChip(order.orderStatus)}
            </div>
          </div>

          {/* status timeline */}
          {order.orderStatus !== "cancelled" && (
            <div className="mt-6 flex items-center">
              {STEPS.map((s, i) => (
                <div key={s} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${
                        i <= stepIdx ? "bg-pink-deep text-white" : "bg-cloud text-ink/55"
                      }`}
                    >
                      {i <= stepIdx ? "✓" : i + 1}
                    </span>
                    <span className="mt-1 text-[10px] font-extrabold uppercase tracking-wide text-ink/60">{s}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`mx-1 mb-4 h-1 flex-1 rounded-full ${i < stepIdx ? "bg-pink-deep" : "bg-cloud"}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          <ul className="mt-6 space-y-2">
            {order.items.map((it) => (
              <li key={it.sku} className="flex items-center gap-3 text-sm font-semibold text-ink/70">
                {it.image && <img src={it.image} alt="" className="h-10 w-10 rounded-xl bg-white object-contain ring-1 ring-ink/10" />}
                <span translate="no" className="notranslate flex-1">{it.name}</span>
                <span>×{it.quantity}</span>
                <span>{money(it.price * it.quantity, order.currency)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-ink/10 pt-3 text-right font-extrabold text-ink">
            {c.total} {money(order.total, order.currency)}
          </p>
        </Card>
      )}
    </ShopShell>
  );
}
