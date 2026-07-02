import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useI18n } from "../../lib/i18n";

const C = {
  en: { title: "Welcome back ✦", sub: "Sign in to see your orders and roars.", email: "Email", pw: "Password", btn: "Sign in", forgot: "Forgot password?", create: "Create account" },
  pt: { title: "Bem-vinda de volta ✦", sub: "Entra para veres as tuas encomendas e rugidos.", email: "Email", pw: "Palavra-passe", btn: "Entrar", forgot: "Esqueceste a palavra-passe?", create: "Criar conta" },
} as const;
import { Card, ErrorNote, Field, PrimaryButton, ShopShell } from "../../components/shop/Ui";

export default function Login() {
  const { lang } = useI18n();
  const c = C[lang];
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? "/account";

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ShopShell narrow title={c.title} subtitle={c.sub}>
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <ErrorNote>{error}</ErrorNote>
          <Field label={c.email} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <Field label={c.pw} type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          <PrimaryButton type="submit" loading={loading}>{c.btn}</PrimaryButton>
        </form>
        <div className="mt-5 flex items-center justify-between text-sm font-bold">
          <Link to="/forgot-password" className="text-ink/60 hover:text-ink">{c.forgot}</Link>
          <Link to="/register" className="text-amber hover:underline">{c.create}</Link>
        </div>
      </Card>
    </ShopShell>
  );
}
