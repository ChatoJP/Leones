import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useI18n } from "../../lib/i18n";

const C = {
  en: { title: "Join the Pride ✦", sub: "Create your account — orders, roars and early drops.", name: "Name", namePh: "Your name", email: "Email", pw: "Password", pwPh: "At least 8 characters", pwErr: "At least 8 characters, please.", btn: "Create my account", have: "Already have one?", enter: "Sign in" },
  pt: { title: "Junta-te à Alcateia ✦", sub: "Cria a tua conta — encomendas, rugidos e drops antecipados.", name: "Nome", namePh: "O teu nome", email: "Email", pw: "Palavra-passe", pwPh: "Pelo menos 8 caracteres", pwErr: "Pelo menos 8 caracteres, por favor.", btn: "Criar a minha conta", have: "Já tens conta?", enter: "Entrar" },
} as const;
import { Card, ErrorNote, Field, PrimaryButton, ShopShell } from "../../components/shop/Ui";

export default function Register() {
  const { lang } = useI18n();
  const c = C[lang];
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErr, setFieldErr] = useState<{ password?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setFieldErr({});
    if (password.length < 8) {
      setFieldErr({ password: c.pwErr });
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/account", { replace: true });
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
          <Field label={c.name} autoComplete="name" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} placeholder={c.namePh} />
          <Field label={c.email} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <Field label={c.pw} type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={c.pwPh} error={fieldErr.password} />
          <PrimaryButton type="submit" loading={loading}>{c.btn}</PrimaryButton>
        </form>
        <p className="mt-5 text-center text-sm font-bold text-ink/60">
          {c.have}{" "}
          <Link to="/login" className="text-amber hover:underline">{c.enter}</Link>
        </p>
      </Card>
    </ShopShell>
  );
}
