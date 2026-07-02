import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Card, Field, ShopShell, money } from "../../components/shop/Ui";

export function AdminNav({ active }: { active: string }) {
  const tabs = [
    ["orders", "Orders", "/admin/orders"],
    ["expeditions", "Expeditions", "/admin/expeditions"],
    ["costs", "Costs", "/admin/costs"],
    ["suppliers", "Suppliers", "/admin/suppliers"],
    ["rewards", "Rewards", "/admin/rewards"],
    ["stats", "Stats", "/admin/stats"],
  ];
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {tabs.map(([k, label, href]) => (
        <Link
          key={k}
          to={href}
          className={`rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-wide transition ${
            active === k ? "bg-ink text-cloud" : "bg-white/80 text-ink/60 ring-1 ring-ink/10 hover:text-ink"
          }`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

function useAdminGate() {
  const { user, loading } = useAuth();
  const [denied, setDenied] = useState(false);
  useEffect(() => {
    if (!user) return;
    fetch("/api/admin/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setDenied(!d.isAdmin))
      .catch(() => setDenied(true));
  }, [user]);
  return { user, loading, denied };
}

function Denied() {
  return (
    <ShopShell narrow title="Not authorized">
      <Card><p className="font-semibold text-ink/60">LeoNes team only.</p></Card>
    </ShopShell>
  );
}

/* ================= EXPEDITIONS ================= */

type FinanceOrder = {
  id: string; total: number; cogs: number; shippingCharged: number; shippingPaid: number | null;
  profit: number; status: string; carrier: string | null; tracking: string | null;
  shippedAt: string | null; createdAt: string; customer: string;
};

export function AdminExpeditions() {
  const { user, loading, denied } = useAdminGate();
  const [orders, setOrders] = useState<FinanceOrder[] | null>(null);
  const [form, setForm] = useState<Record<string, { carrier: string; tracking: string; cost: string }>>({});
  const [msg, setMsg] = useState("");

  const load = () =>
    fetch("/api/admin/finance", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setOrders(d.orders))
      .catch(() => {});
  useEffect(() => { if (user) load(); }, [user]);

  if (loading) return <ShopShell title="One moment…"><p /></ShopShell>;
  if (!user || denied) return <Denied />;

  const ship = async (id: string) => {
    const f = form[id] ?? { carrier: "", tracking: "", cost: "" };
    const res = await fetch(`/api/admin/orders/${id}/shipment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ carrier: f.carrier, tracking: f.tracking, shippingCost: f.cost }),
    });
    const json = await res.json().catch(() => ({}));
    setMsg(res.ok ? `${id} shipped ✦` : json.error ?? "Failed");
    setTimeout(() => setMsg(""), 2000);
    if (res.ok) load();
  };

  const pending = orders?.filter((o) => o.status === "new" || o.status === "processing") ?? [];
  const shipped = orders?.filter((o) => o.status === "shipped" || o.status === "completed") ?? [];

  return (
    <ShopShell title="Expeditions · Admin" subtitle="Paid orders waiting to ship, and everything on the road.">
      <AdminNav active="expeditions" />
      {msg && <p className="mb-4 rounded-2xl bg-sky/30 px-4 py-2 text-sm font-bold text-ink">{msg}</p>}

      <h2 className="font-display mb-3 text-xl font-semibold text-ink">To ship ({pending.length})</h2>
      <div className="space-y-3">
        {pending.length === 0 && <Card><p className="text-sm font-semibold text-ink/60">Nothing waiting. ✦</p></Card>}
        {pending.map((o) => {
          const f = form[o.id] ?? { carrier: "", tracking: "", cost: "" };
          const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((prev) => ({ ...prev, [o.id]: { ...f, [k]: e.target.value } }));
          return (
            <Card key={o.id} className="!p-5">
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-40">
                  <p translate="no" className="notranslate font-display font-semibold text-ink">{o.id}</p>
                  <p className="text-xs font-bold text-ink/55">{o.customer} · {money(o.total)}</p>
                </div>
                <input value={f.carrier} onChange={set("carrier")} placeholder="Carrier (CTT, DPD…)" className="w-36 rounded-full bg-white px-4 py-2 text-sm font-bold text-ink shadow-sm ring-1 ring-ink/10" />
                <input value={f.tracking} onChange={set("tracking")} placeholder="Tracking #" className="w-44 rounded-full bg-white px-4 py-2 text-sm font-bold text-ink shadow-sm ring-1 ring-ink/10" />
                <input value={f.cost} onChange={set("cost")} placeholder="Ship cost €" inputMode="decimal" className="w-28 rounded-full bg-white px-4 py-2 text-sm font-bold text-ink shadow-sm ring-1 ring-ink/10" />
                <button onClick={() => ship(o.id)} disabled={!f.carrier || !f.tracking}
                  className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-cloud transition hover:scale-105 disabled:opacity-40">
                  Mark shipped 📦
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      <h2 className="font-display mb-3 mt-8 text-xl font-semibold text-ink">On the road ({shipped.length})</h2>
      <div className="space-y-2">
        {shipped.map((o) => (
          <Card key={o.id} className="!p-4">
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-ink/70">
              <span translate="no" className="notranslate font-bold text-ink">{o.id}</span>
              <span>{o.customer}</span>
              <span className="rounded-full bg-sky/40 px-3 py-1 text-xs font-extrabold text-ink">{o.carrier} · {o.tracking}</span>
              <span className="text-xs text-ink/55">{o.shippedAt ? new Date(o.shippedAt + "Z").toLocaleString() : ""}</span>
              <span className="ml-auto font-bold text-ink">{money(o.total)}</span>
            </div>
          </Card>
        ))}
      </div>
    </ShopShell>
  );
}

/* ================= COSTS ================= */

type SkuRow = { sku: string; name: string; price: number; bundle?: boolean };

export function AdminCosts() {
  const { user, loading, denied } = useAdminGate();
  const [skus, setSkus] = useState<SkuRow[]>([]);
  const [costs, setCosts] = useState<Record<string, { unit_cost: number; supplier_id: number | null }>>({});
  const [suppliers, setSuppliers] = useState<Array<{ id: number; name: string }>>([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!user) return;
    fetch("/api/admin/costs", { credentials: "include" }).then((r) => r.json()).then((d) => { setSkus(d.skus); setCosts(d.costs); });
    fetch("/api/admin/suppliers", { credentials: "include" }).then((r) => r.json()).then((d) => setSuppliers(d.suppliers));
  }, [user]);

  if (loading) return <ShopShell title="One moment…"><p /></ShopShell>;
  if (!user || denied) return <Denied />;

  const save = async (sku: string, unitCost: number, supplierId: number | null) => {
    const res = await fetch("/api/admin/costs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ sku, unitCost, supplierId }),
    });
    setMsg(res.ok ? `${sku} saved ✦` : "Failed");
    setTimeout(() => setMsg(""), 1500);
  };

  return (
    <ShopShell title="Costs · Admin" subtitle="Unit costs feed the profit numbers. Bundles auto-sum their components.">
      <AdminNav active="costs" />
      {msg && <p className="mb-4 rounded-2xl bg-sky/30 px-4 py-2 text-sm font-bold text-ink">{msg}</p>}
      <div className="space-y-2">
        {skus.map((s) => {
          const c = costs[s.sku];
          const margin = c?.unit_cost ? Math.round(((s.price - c.unit_cost) / s.price) * 100) : null;
          return (
            <Card key={s.sku} className="!p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-48 flex-1">
                  <p translate="no" className="notranslate text-sm font-bold text-ink">{s.name} {s.bundle && <span className="text-xs text-amber">(bundle — cost = components)</span>}</p>
                  <p className="text-xs font-bold text-ink/55">{s.sku} · sells {money(s.price)}</p>
                </div>
                {!s.bundle && (
                  <>
                    <input
                      defaultValue={c?.unit_cost ?? ""}
                      placeholder="unit cost €"
                      inputMode="decimal"
                      onBlur={(e) => {
                        const v = Number(e.target.value);
                        if (Number.isFinite(v) && v >= 0) {
                          setCosts((prev) => ({ ...prev, [s.sku]: { unit_cost: v, supplier_id: c?.supplier_id ?? null } }));
                          save(s.sku, v, c?.supplier_id ?? null);
                        }
                      }}
                      className="w-32 rounded-full bg-white px-4 py-2 text-sm font-bold text-ink shadow-sm ring-1 ring-ink/10"
                    />
                    <select
                      value={c?.supplier_id ?? ""}
                      onChange={(e) => {
                        const sid = e.target.value ? Number(e.target.value) : null;
                        setCosts((prev) => ({ ...prev, [s.sku]: { unit_cost: c?.unit_cost ?? 0, supplier_id: sid } }));
                        save(s.sku, c?.unit_cost ?? 0, sid);
                      }}
                      className="rounded-full bg-white px-4 py-2 text-sm font-bold text-ink shadow-sm ring-1 ring-ink/10"
                    >
                      <option value="">no supplier</option>
                      {suppliers.map((sup) => <option key={sup.id} value={sup.id}>{sup.name}</option>)}
                    </select>
                    {margin !== null && (
                      <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${margin >= 60 ? "bg-sky/40 text-ink" : margin >= 30 ? "bg-gold/25 text-amber" : "bg-pink/50 text-ink"}`}>
                        {margin}% margin
                      </span>
                    )}
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </ShopShell>
  );
}

/* ================= SUPPLIERS ================= */

type Supplier = { id: number; name: string; contact: string | null; email: string | null; notes: string | null };

export function AdminSuppliers() {
  const { user, loading, denied } = useAdminGate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const load = () =>
    fetch("/api/admin/suppliers", { credentials: "include" }).then((r) => r.json()).then((d) => setSuppliers(d.suppliers));
  useEffect(() => { if (user) load(); }, [user]);

  if (loading) return <ShopShell title="One moment…"><p /></ShopShell>;
  if (!user || denied) return <Denied />;

  const add = async (e: FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, contact, email, notes }),
    });
    setName(""); setContact(""); setEmail(""); setNotes("");
    load();
  };

  const remove = async (id: number) => {
    await fetch(`/api/admin/suppliers/${id}`, { method: "DELETE", credentials: "include" });
    load();
  };

  return (
    <ShopShell title="Suppliers · Admin" subtitle="Who makes what, and how to reach them.">
      <AdminNav active="suppliers" />
      <Card>
        <h2 className="font-display text-lg font-semibold text-ink">Add supplier</h2>
        <form onSubmit={add} className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
          <Field label="Contact person" value={contact} onChange={(e) => setContact(e.target.value)} />
          <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Field label="Notes (MOQ, lead time…)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <button className="rounded-full bg-ink px-6 py-3 text-sm font-bold text-cloud transition hover:scale-105 sm:col-span-2">
            Add supplier
          </button>
        </form>
      </Card>
      <div className="mt-6 space-y-2">
        {suppliers.map((s) => (
          <Card key={s.id} className="!p-4">
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-ink/70">
              <span className="font-bold text-ink">{s.name}</span>
              {s.contact && <span>{s.contact}</span>}
              {s.email && <span className="text-amber">{s.email}</span>}
              {s.notes && <span className="text-xs text-ink/55">{s.notes}</span>}
              <button onClick={() => remove(s.id)} aria-label={`delete ${s.name}`} className="ml-auto text-ink/30 hover:text-pink-deep">✕</button>
            </div>
          </Card>
        ))}
        {suppliers.length === 0 && <Card><p className="text-sm font-semibold text-ink/60">No suppliers yet.</p></Card>}
      </div>
    </ShopShell>
  );
}
