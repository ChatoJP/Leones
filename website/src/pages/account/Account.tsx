import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Card, ErrorNote, Field, PrimaryButton, ShopShell, money } from "../../components/shop/Ui";

export type OrderDto = {
  id: string;
  customerName: string;
  email: string;
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  items: Array<{ sku: string; name: string; price: number; quantity: number; image: string | null }>;
};

export function useMyOrders() {
  const [orders, setOrders] = useState<OrderDto[] | null>(null);
  useEffect(() => {
    fetch("/api/account/orders", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { orders: [] }))
      .then((d) => setOrders(d.orders))
      .catch(() => setOrders([]));
  }, []);
  return orders;
}

export const statusChip = (s: string) => {
  const tone =
    s === "paid" || s === "completed" ? "bg-sky/60" : s === "pending" || s === "new" || s === "processing" ? "bg-gold/30" : "bg-pink/60";
  return <span className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-ink ${tone}`}>{s}</span>;
};

export default function Account() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const orders = useMyOrders();

  if (loading) return <ShopShell title="One moment…"><p /></ShopShell>;
  if (!user) return <Navigate to="/login" state={{ from: "/account" }} replace />;

  return (
    <ShopShell title={`Hi, ${user.name.split(" ")[0]} ✦`} subtitle="Your LeoNes account.">
      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <h2 className="font-display text-xl font-semibold text-ink">Your details</h2>
          <ProfileEditor initialName={user.name} email={user.email} />
          <div className="mt-6">
            <PrimaryButton
              onClick={async () => {
                await logout();
                navigate("/");
              }}
            >
              Log out
            </PrimaryButton>
          </div>
        </Card>
        <Card>
          <h2 className="font-display text-xl font-semibold text-ink">Recent orders</h2>
          {!orders ? (
            <p className="mt-4 text-sm font-semibold text-ink/60">Loading…</p>
          ) : orders.length === 0 ? (
            <p className="mt-4 text-sm font-semibold text-ink/60">
              No orders yet. <Link to="/#drop" className="font-bold text-amber hover:underline">Find your pink →</Link>
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {orders.slice(0, 3).map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 text-sm font-semibold text-ink/70">
                  <span translate="no" className="notranslate font-bold text-ink">{o.id}</span>
                  <span>{money(o.total, o.currency)}</span>
                  {statusChip(o.paymentStatus)}
                </li>
              ))}
            </ul>
          )}
          <Link to="/account/orders" className="mt-5 inline-block text-sm font-bold text-amber hover:underline">
            All orders →
          </Link>
        </Card>
      </div>
    </ShopShell>
  );
}


function ProfileEditor({ initialName, email }: { initialName: string; email: string }) {
  const [name, setName] = useState(initialName);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const post = async (path: string, body: unknown) => {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
  };

  const saveName = async () => {
    if (busy || name.trim() === initialName) return;
    setBusy(true); setErr(""); setMsg("");
    try {
      await post("/api/account/profile", { name });
      setMsg("Name updated ✦ (shows after refresh)");
    } catch (e) {
      setErr((e as Error).message);
    } finally { setBusy(false); }
  };

  const savePassword = async () => {
    if (busy || !current || !next) return;
    setBusy(true); setErr(""); setMsg("");
    try {
      await post("/api/account/password", { current, next });
      setMsg("Password updated ✦");
      setCurrent(""); setNext("");
    } catch (e) {
      setErr((e as Error).message);
    } finally { setBusy(false); }
  };

  return (
    <div className="mt-4 space-y-3">
      <ErrorNote>{err}</ErrorNote>
      {msg && <p className="rounded-2xl bg-sky/30 px-4 py-2.5 text-sm font-bold text-ink">{msg}</p>}
      <div className="flex items-end gap-2">
        <div className="flex-1"><Field label="Name" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <button onClick={saveName} disabled={busy || name.trim() === initialName}
          className="rounded-full bg-ink px-5 py-3 text-sm font-bold text-cloud transition hover:scale-105 disabled:opacity-40">
          Save
        </button>
      </div>
      <p className="text-sm font-semibold text-ink/60">Email: {email}</p>
      <details className="rounded-2xl bg-cloud p-4">
        <summary className="cursor-pointer text-sm font-bold text-ink/70">Change password</summary>
        <div className="mt-3 space-y-3">
          <Field label="Current password" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
          <Field label="New password (8+ chars)" type="password" value={next} onChange={(e) => setNext(e.target.value)} />
          <button onClick={savePassword} disabled={busy || !current || next.length < 8}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-cloud transition hover:scale-105 disabled:opacity-40">
            Update password
          </button>
        </div>
      </details>
    </div>
  );
}
