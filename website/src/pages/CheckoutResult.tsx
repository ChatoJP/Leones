import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AdoptionCertificate from "../components/AdoptionCertificate";
import CollectionAlbum from "../components/CollectionAlbum";
import FloatingParticles from "../components/FloatingParticles";
import { useCart } from "../context/CartContext";
import { useI18n } from "../lib/i18n";

const CR = {
  en: {
    thanks: "Obrigada! ✦", wait: "One moment…", confirmed: "Payment confirmed.", confirming: "Confirming your payment…",
    looking: "Looking for your order…",
    msg1: "Thank you for your purchase. Your", msg2: "order is being prepared with care.",
    boop: "Bloop found your gloss!",
    sentTo: "Confirmation sent to", still: "Payment still confirming — this page updates automatically.",
    total: "Total", keep: "Keep exploring", create: "Create an account",
    cTitle: "No worries ✦", cSub: "Your payment was cancelled.",
    cBody1: "Nothing was charged", cBody2: "for order", cBody3: ". Your bag is exactly as you left it.",
    retry: "Try again", back: "Back to bag",
  },
  pt: {
    thanks: "Obrigada! ✦", wait: "Um momento…", confirmed: "Pagamento confirmado.", confirming: "A confirmar o teu pagamento…",
    looking: "À procura da tua encomenda…",
    msg1: "Obrigada pela tua compra. O teu pedido", msg2: "está a ser preparado com carinho.",
    boop: "O Bloop encontrou o teu gloss!",
    sentTo: "Confirmação enviada para", still: "Pagamento ainda a confirmar — esta página atualiza sozinha.",
    total: "Total", keep: "Continuar a explorar", create: "Criar conta",
    cTitle: "Sem stress ✦", cSub: "O teu pagamento foi cancelado.",
    cBody1: "Nada foi cobrado", cBody2: "pela encomenda", cBody3: ". A tua mala está exatamente como a deixaste.",
    retry: "Tentar de novo", back: "Voltar à mala",
  },
} as const;
import { Card, ShopShell, money } from "../components/shop/Ui";
import type { OrderDto } from "./account/Account";

function useOrder(orderId: string | null) {
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [tries, setTries] = useState(0);
  useEffect(() => {
    if (!orderId) return;
    let alive = true;
    fetch(`/api/orders/${orderId}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && d && setOrder(d.order))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [orderId, tries]);
  // payment confirmation is asynchronous (webhook) — poll briefly until paid
  useEffect(() => {
    if (order && order.paymentStatus === "pending" && tries < 10) {
      const t = setTimeout(() => setTries((n) => n + 1), 1500);
      return () => clearTimeout(t);
    }
  }, [order, tries]);
  return order;
}

export function CheckoutSuccess() {
  const { lang } = useI18n();
  const c = CR[lang];
  const [params] = useSearchParams();
  const orderId = params.get("order");
  const order = useOrder(orderId);
  const { clear } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    // clear the cart only once we know this order really exists and is paid
    if (order && order.paymentStatus === "paid" && !cleared.current) {
      cleared.current = true;
      clear();
      sessionStorage.removeItem("leones-pending-order");
    }
  }, [order, clear]);

  return (
    <section className="relative overflow-hidden">
      <FloatingParticles count={14} />
      <ShopShell
        narrow
        title={order?.paymentStatus === "paid" ? c.thanks : c.wait}
        subtitle={order?.paymentStatus === "paid" ? c.confirmed : c.confirming}
      >
        <Card className="text-center">
          <img
            src="/mascots/boop-happy.webp"
            alt=""
            aria-hidden="true"
            className="mx-auto -mt-2 h-28 w-auto drop-shadow-lg"
          />
          <p className="text-sm font-extrabold text-pink-deep">{c.boop}</p>
          {!order ? (
            <p className="mt-3 font-semibold text-ink/60">{c.looking}</p>
          ) : (
            <>
              <p className="font-semibold text-ink/80">
                {c.msg1} <span translate="no" className="notranslate font-bold">LeoNes</span> {c.msg2}
              </p>
              <p translate="no" className="notranslate font-display mt-4 text-2xl font-semibold text-ink">{order.id}</p>
              <p className="mt-1 text-sm font-bold text-ink/60">{c.sentTo} {order.email}</p>
              {order.paymentStatus !== "paid" && (
                <p className="mt-3 rounded-xl bg-gold/20 px-3 py-2 text-xs font-bold text-ink/70">
                  {c.still}
                </p>
              )}
              <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left">
                {order.items.map((it) => (
                  <li key={it.sku} className="flex items-center gap-3 text-sm font-semibold text-ink/70">
                    {it.image && <img src={it.image} alt="" className="h-10 w-10 rounded-xl bg-white object-contain ring-1 ring-ink/10" />}
                    <span translate="no" className="notranslate flex-1">{it.name}</span>
                    <span>×{it.quantity}</span>
                    <span>{money(it.price * it.quantity, order.currency)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-ink/10 pt-3 font-extrabold text-ink">
                {c.total} {money(order.total, order.currency)}
              </p>
              {order.paymentStatus === "paid" && <AdoptionCertificate order={order} />}
            </>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/#drop" className="rounded-full bg-ink px-7 py-3 font-bold text-cloud shadow-lg transition hover:scale-105">
              {c.keep}
            </Link>
            <Link to="/register" className="rounded-full bg-white px-7 py-3 font-bold text-ink shadow-sm ring-1 ring-ink/10 transition hover:scale-105">
              {c.create}
            </Link>
          </div>
        </Card>
        <div className="mt-8">
          <CollectionAlbum compact />
        </div>
      </ShopShell>
    </section>
  );
}

export function CheckoutCancel() {
  const { lang } = useI18n();
  const c = CR[lang];
  const [params] = useSearchParams();
  const orderId = params.get("order");
  return (
    <ShopShell narrow title={c.cTitle} subtitle={c.cSub}>
      <Card className="text-center">
        <p className="font-semibold text-ink/60">
          {c.cBody1}{orderId ? <> {c.cBody2} <span translate="no" className="notranslate font-bold">{orderId}</span></> : null}{c.cBody3}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/checkout" className="rounded-full bg-ink px-7 py-3 font-bold text-cloud shadow-lg transition hover:scale-105">
            {c.retry}
          </Link>
          <Link to="/cart" className="rounded-full bg-white px-7 py-3 font-bold text-ink shadow-sm ring-1 ring-ink/10 transition hover:scale-105">
            {c.back}
          </Link>
        </div>
      </Card>
    </ShopShell>
  );
}
