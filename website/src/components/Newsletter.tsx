import { useState, type FormEvent } from "react";
import { useI18n } from "../lib/i18n";

const COPY = {
  en: {
    title: "Little letters ✦",
    sub: "Drops, mascot news and nothing boring. With a parent's OK.",
    placeholder: "your@email.com",
    button: "Join",
    done: "You're on the list ✦",
    note: "Double opt-in email confirmation launches before we ever send anything.",
  },
  pt: {
    title: "Cartinhas ✦",
    sub: "Drops, novidades do mascote e zero coisas aborrecidas. Com o OK dos pais.",
    placeholder: "teu@email.com",
    button: "Entrar",
    done: "Estás na lista ✦",
    note: "A confirmação por email (double opt-in) chega antes de enviarmos o que quer que seja.",
  },
};

export default function Newsletter() {
  const { lang } = useI18n();
  const c = COPY[lang];
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading || done) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lang }),
      });
      if (res.ok) setDone(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 pb-2 pt-10">
      <div className="flex flex-col items-center gap-4 rounded-[2rem] bg-gradient-to-r from-sky/30 via-white/60 to-pink/30 p-7 text-center shadow-sm ring-1 ring-white/60 sm:flex-row sm:text-left">
        <div className="flex-1">
          <p className="font-display text-xl font-semibold text-ink">{c.title}</p>
          <p className="mt-1 text-sm font-semibold text-ink/60">{c.sub}</p>
        </div>
        {done ? (
          <p className="rounded-full bg-white px-6 py-3 text-sm font-extrabold text-pink-deep shadow-sm">{c.done}</p>
        ) : (
          <form onSubmit={submit} className="flex w-full max-w-sm items-center gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={c.placeholder}
              aria-label={c.placeholder}
              className="w-full rounded-full bg-white px-5 py-3 text-sm font-bold text-ink shadow-sm ring-1 ring-ink/10 outline-none placeholder:text-ink/55 focus:ring-2 focus:ring-sky-deep"
            />
            <button
              disabled={loading}
              className="rounded-full bg-ink px-6 py-3 text-sm font-bold text-cloud transition hover:scale-105 disabled:opacity-50"
            >
              {c.button}
            </button>
          </form>
        )}
      </div>
      <p className="mt-2 text-center text-[10px] font-bold text-ink/55">{c.note}</p>
    </div>
  );
}
