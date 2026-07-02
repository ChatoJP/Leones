import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useI18n } from "../lib/i18n";
import { Card, ErrorNote, Field, PrimaryButton, ShopShell, money } from "../components/shop/Ui";

const EU_COUNTRIES = [
  "Portugal", "Spain", "France", "Germany", "Italy", "Netherlands", "Belgium",
  "Austria", "Ireland", "Luxembourg", "Finland", "Sweden", "Denmark", "Poland",
  "Czechia", "Slovakia", "Slovenia", "Croatia", "Hungary", "Romania", "Bulgaria",
  "Greece", "Cyprus", "Malta", "Estonia", "Latvia", "Lithuania",
];

function GlossNameField() {
  const { lang } = useI18n();
  const [name, setName] = useState(() => sessionStorage.getItem("leones-gloss-name") ?? "");
  const c = lang === "pt"
    ? { label: "Dá um nome ao teu gloss ✦ (opcional)", ph: "ex.: Rosinha, Sr. Brilhos…" }
    : { label: "Name your gloss ✦ (optional)", ph: "e.g. Pinky, Sir Sparkles…" };
  return (
    <Field
      label={c.label}
      value={name}
      maxLength={24}
      onChange={(e) => {
        setName(e.target.value);
        sessionStorage.setItem("leones-gloss-name", e.target.value);
      }}
      placeholder={c.ph}
    />
  );
}

export default function Checkout() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { itemsDetailed, lines, subtotal, shipping, total, count } = useCart();
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Portugal",
    notes: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [prefilled, setPrefilled] = useState(false);

  // returning customers: prefill from their most recent order
  useEffect(() => {
    if (!user) return;
    fetch("/api/account/last-address", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.address) {
          setForm((f) => ({ ...f, ...d.address, notes: f.notes }));
          setPrefilled(true);
        }
      })
      .catch(() => {});
  }, [user]);

  if (count === 0) return <Navigate to="/cart" replace />;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          items: lines,
          customer: {
            ...form,
            notes: [
              sessionStorage.getItem("leones-gift") === "1" ? "[GIFT 🎁]" : "",
              sessionStorage.getItem("leones-gloss-name") ? `[NOME: ${sessionStorage.getItem("leones-gloss-name")}]` : "",
              form.notes,
            ].filter(Boolean).join(" ").trim(),
          },
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Checkout failed. Please try again.");
      sessionStorage.setItem("leones-pending-order", json.orderId);
      window.location.href = json.url;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  return (
    <ShopShell title={t("checkout.title")} subtitle={t("checkout.sub")}>
      <form onSubmit={submit} className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        <Card>
          <h2 className="font-display text-xl font-semibold text-ink">{t("checkout.delivery")}</h2>
          {prefilled && (
            <p className="mt-2 rounded-xl bg-sky/30 px-3 py-2 text-xs font-bold text-ink/70">
              ✦ Filled in from your last order — double-check and go.
            </p>
          )}
          {!user && (
            <p className="mt-2 rounded-xl bg-sky/30 px-3 py-2 text-xs font-bold text-ink/70">
              {t("checkout.guest")} <Link to="/register" className="text-amber hover:underline">{t("checkout.guest2")}</Link> {t("checkout.guest3")}
            </p>
          )}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label={t("checkout.name")} required minLength={2} value={form.name} onChange={set("name")} autoComplete="name" />
            <Field label={t("checkout.email")} type="email" required value={form.email} onChange={set("email")} autoComplete="email" />
            <Field label={t("checkout.phone")} required value={form.phone} onChange={set("phone")} autoComplete="tel" />
            <label className="block">
              <span className="text-xs font-extrabold uppercase tracking-wider text-ink/60">{t("checkout.country")}</span>
              <select
                required
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                autoComplete="country-name"
                className="mt-1.5 w-full rounded-2xl border-0 bg-white px-4 py-3 font-semibold text-ink shadow-sm ring-1 ring-ink/10 transition focus:outline-none focus:ring-2 focus:ring-sky-deep"
              >
                {EU_COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <div className="sm:col-span-2">
              <Field label={t("checkout.address")} required value={form.address} onChange={set("address")} autoComplete="street-address" />
            </div>
            <Field label={t("checkout.city")} required value={form.city} onChange={set("city")} autoComplete="address-level2" />
            <Field label={t("checkout.postal")} required value={form.postalCode} onChange={set("postalCode")} autoComplete="postal-code" />
            <div className="sm:col-span-2">
              <GlossNameField />
            </div>
            <div className="sm:col-span-2">
              <Field label={t("checkout.notes")} value={form.notes} onChange={set("notes")} placeholder={t("checkout.notes.ph")} />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-xl font-semibold text-ink">{t("checkout.order")}</h2>
          <ul className="mt-4 space-y-3">
            {itemsDetailed.map(({ product, qty, lineTotal }) => (
              <li key={product.sku} className="flex items-center gap-3 text-sm font-semibold text-ink/70">
                <img src={product.image} alt="" className="h-10 w-10 rounded-xl bg-white object-contain ring-1 ring-ink/10" />
                <span translate="no" className="notranslate min-w-0 flex-1 truncate">{product.name}</span>
                <span>×{qty}</span>
                <span className="w-16 text-right">{money(lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-ink/10 pt-4 text-sm font-semibold text-ink/70">
            <div className="flex justify-between"><dt>{t("cart.subtotal")}</dt><dd>{money(subtotal)}</dd></div>
            <div className="flex justify-between"><dt>{t("cart.shipping")}</dt><dd>{shipping === 0 ? t("cart.free") : money(shipping)}</dd></div>
            <div className="flex justify-between text-base font-extrabold text-ink"><dt>{t("cart.total")}</dt><dd>{money(total)}</dd></div>
          </dl>
          <div className="mt-6 space-y-3">
            <ErrorNote>{error}</ErrorNote>
            <PrimaryButton type="submit" loading={loading}>{t("checkout.pay")} {money(total)}</PrimaryButton>
            <p className="text-center text-xs font-bold text-ink/60">
              {t("checkout.secure")}
            </p>
          </div>
        </Card>
      </form>
    </ShopShell>
  );
}
