import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Card, ShopShell } from "../../components/shop/Ui";
import { bloopBooks } from "../../data/bloopBooks";
import { AdminNav } from "./BackOffice";

type Rule = { book: string; reward_type: string; reward_value: string | null; active: number };

const TYPES = ["surprise", "sticker", "card", "discount", "gift", "gloss"];

export default function AdminRewards() {
  const { user, loading } = useAuth();
  const [rules, setRules] = useState<Record<string, Rule>>({});
  const [confirmations, setConfirmations] = useState<Record<string, number>>({});
  const [denied, setDenied] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    if (!user) return;
    fetch("/api/admin/rewards", { credentials: "include" })
      .then((r) => {
        if (!r.ok) { setDenied(true); return null; }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        const map: Record<string, Rule> = {};
        for (const r of d.rules) map[r.book] = r;
        setRules(map);
        const cm: Record<string, number> = {};
        for (const c of d.confirmations) cm[c.book] = c.n;
        setConfirmations(cm);
      })
      .catch(() => setDenied(true));
  }, [user]);

  const save = async (book: string, patch: Partial<Rule>) => {
    const current = rules[book] ?? { book, reward_type: "surprise", reward_value: "", active: 0 };
    const next = { ...current, ...patch };
    setRules((r) => ({ ...r, [book]: next }));
    const res = await fetch("/api/admin/rewards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ book, rewardType: next.reward_type, rewardValue: next.reward_value ?? "", active: !!next.active }),
    });
    if (res.ok) {
      setSavedMsg(`${book} saved ✦`);
      setTimeout(() => setSavedMsg(""), 1500);
    }
  };

  if (loading) return <ShopShell title="One moment…"><p /></ShopShell>;
  if (!user || denied) {
    return (
      <ShopShell narrow title="Not authorized">
        <Card><p className="font-semibold text-ink/60">LeoNes team only.</p></Card>
      </ShopShell>
    );
  }

  return (
    <ShopShell title="Book Club Rewards · Admin" subtitle="Nothing is promised to readers until you activate it here.">
      <AdminNav active="rewards" />
      {savedMsg && <p className="mb-4 text-sm font-bold text-pink-deep">{savedMsg}</p>}
      <div className="space-y-4">
        {bloopBooks.map((b) => {
          const r = rules[b.slug] ?? { book: b.slug, reward_type: "surprise", reward_value: "", active: 0 };
          return (
            <Card key={b.slug} className="!p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-2xl">{b.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-display font-semibold text-ink">{b.title.en}</p>
                  <p className="text-xs font-bold text-ink/55">
                    {b.slug} · {confirmations[b.slug] ?? 0} parent confirmations
                  </p>
                </div>
                <select
                  value={r.reward_type}
                  onChange={(e) => save(b.slug, { reward_type: e.target.value })}
                  className="rounded-full bg-white px-4 py-2 text-sm font-bold text-ink shadow-sm ring-1 ring-ink/10"
                >
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <input
                  value={r.reward_value ?? ""}
                  onChange={(e) => setRules((prev) => ({ ...prev, [b.slug]: { ...r, reward_value: e.target.value } }))}
                  onBlur={(e) => save(b.slug, { reward_value: e.target.value })}
                  placeholder="detail (e.g. code READER10)"
                  className="w-48 rounded-full bg-white px-4 py-2 text-sm font-bold text-ink shadow-sm ring-1 ring-ink/10"
                />
                <button
                  onClick={() => save(b.slug, { active: r.active ? 0 : 1 })}
                  className={`rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-wide transition ${
                    r.active ? "bg-sky/60 text-ink" : "bg-cloud text-ink/60 hover:bg-gold/20"
                  }`}
                >
                  {r.active ? "active" : "inactive"}
                </button>
              </div>
            </Card>
          );
        })}
      </div>
      <p className="mt-5 text-xs font-bold text-ink/60">
        Inactive = readers see "Boop is still preparing this surprise" (honest). Active = the reward text is shown on unlock.
      </p>
    </ShopShell>
  );
}
