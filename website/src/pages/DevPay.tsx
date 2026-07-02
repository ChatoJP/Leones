import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, ShopShell } from "../components/shop/Ui";

/**
 * DEV-ONLY payment simulator. Stands in for the Stripe-hosted checkout page
 * when STRIPE_SECRET_KEY is not configured. The server rejects these calls
 * once Stripe is enabled.
 */
export default function DevPay() {
  const [params] = useSearchParams();
  const orderId = params.get("order");
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const resolve = async (outcome: "paid" | "cancelled") => {
    if (busy || !orderId) return;
    setBusy(true);
    await fetch("/api/dev/confirm-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, outcome }),
    });
    navigate(outcome === "paid" ? `/checkout/success?order=${orderId}` : `/checkout/cancel?order=${orderId}`, { replace: true });
  };

  return (
    <ShopShell narrow title="Payment simulator" subtitle="Development mode — Stripe keys not configured.">
      <Card className="text-center">
        <p className="rounded-xl bg-gold/20 px-3 py-2 text-xs font-extrabold uppercase tracking-wider text-ink/70">
          DEV ONLY — no real money involved
        </p>
        <p translate="no" className="notranslate font-display mt-5 text-2xl font-semibold text-ink">{orderId}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            disabled={busy}
            onClick={() => resolve("paid")}
            className="rounded-full bg-ink px-8 py-3.5 font-bold text-cloud shadow-lg transition hover:scale-105 disabled:opacity-50"
          >
            Simulate successful payment
          </button>
          <button
            disabled={busy}
            onClick={() => resolve("cancelled")}
            className="rounded-full bg-white px-8 py-3.5 font-bold text-ink shadow-sm ring-1 ring-ink/10 transition hover:scale-105 disabled:opacity-50"
          >
            Cancel payment
          </button>
        </div>
      </Card>
    </ShopShell>
  );
}
