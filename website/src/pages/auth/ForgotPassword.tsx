import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, ErrorNote, Field, PrimaryButton, ShopShell } from "../../components/shop/Ui";

async function post(path: string, body: unknown) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
  return json;
}

export default function ForgotPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  return token ? <ResetForm token={token} /> : <RequestForm />;
}

function RequestForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      await post("/api/auth/forgot", { email });
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ShopShell narrow title="Forgot password" subtitle="It happens to the best of us.">
      <Card>
        {sent ? (
          <p className="font-semibold text-ink/70">
            If that email has an account, a reset link is on its way. ✦
            <span className="mt-2 block text-xs font-bold text-ink/60">
              (Email sending isn't configured yet — in development the link is printed in the API server console.)
            </span>
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <ErrorNote>{error}</ErrorNote>
            <Field label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            <PrimaryButton type="submit" loading={loading}>Send reset link</PrimaryButton>
          </form>
        )}
        <p className="mt-5 text-center text-sm font-bold text-ink/60">
          <Link to="/login" className="text-amber hover:underline">Back to sign in</Link>
        </p>
      </Card>
    </ShopShell>
  );
}

function ResetForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      await post("/api/auth/reset", { token, password });
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ShopShell narrow title="Choose a new password">
      <Card>
        {done ? (
          <p className="font-semibold text-ink/70">
            Password updated. <Link to="/login" className="font-bold text-amber hover:underline">Entrar →</Link>
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <ErrorNote>{error}</ErrorNote>
            <Field label="New password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
            <PrimaryButton type="submit" loading={loading}>Save new password</PrimaryButton>
          </form>
        )}
      </Card>
    </ShopShell>
  );
}
