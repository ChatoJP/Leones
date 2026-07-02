import type { InputHTMLAttributes, ReactNode } from "react";

export function ShopShell({ title, subtitle, children, narrow = false }: {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  narrow?: boolean;
}) {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="blob absolute -top-24 -left-24 h-80 w-80 rounded-full bg-sky/40 blur-3xl" />
        <div className="blob absolute top-20 -right-24 h-96 w-96 rounded-full bg-pink/40 blur-3xl" style={{ animationDelay: "-7s" }} />
      </div>
      <div className={`relative mx-auto px-6 ${narrow ? "max-w-md" : "max-w-5xl"}`}>
        <h1 className="font-display text-4xl font-semibold text-ink sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-2 font-semibold text-ink/60">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[2rem] bg-white/70 p-6 shadow-sm ring-1 ring-white/60 backdrop-blur sm:p-8 ${className}`}>
      {children}
    </div>
  );
}

export function Field({ label, error, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-extrabold uppercase tracking-wider text-ink/60">{label}</span>
      <input
        {...props}
        className={`mt-1.5 w-full rounded-2xl border-0 bg-white px-4 py-3 font-semibold text-ink shadow-sm ring-1 transition placeholder:text-ink/55 focus:outline-none focus:ring-2 focus:ring-sky-deep ${
          error ? "ring-pink-deep" : "ring-ink/10"
        }`}
      />
      {error && <span className="mt-1 block text-xs font-bold text-pink-deep">{error}</span>}
    </label>
  );
}

export function PrimaryButton({ children, loading, ...props }: {
  children: ReactNode;
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className="w-full rounded-full bg-ink px-8 py-3.5 font-bold text-cloud shadow-lg shadow-ink/10 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "One moment…" : children}
    </button>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p className="rounded-2xl bg-pink/40 px-4 py-3 text-sm font-bold text-ink">
      {children}
    </p>
  );
}

export const money = (n: number, currency = "EUR") =>
  new Intl.NumberFormat(
    document.documentElement.lang === "pt-PT" ? "pt-PT" : "en-IE",
    { style: "currency", currency }
  ).format(n);
