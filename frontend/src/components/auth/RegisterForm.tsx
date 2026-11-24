import { useState } from "react";
import { postJson, getSecureApiBase } from "@/services/http";
import type { RegisterRequestBody, RegisterResponseBody } from "@/types";
import AuthAlert from "@/components/auth/AuthAlert";

type Props = {
  layout?: "standalone" | "tabbed";
};

export default function RegisterForm({ layout = "standalone" }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    const baseUrl = getSecureApiBase();
    try {
      const body: RegisterRequestBody = { email: email.trim(), password };
      const data = await postJson<RegisterResponseBody>(baseUrl, "/auth/register", body);
      setSuccess(data.message || "Kayıt tamamlandı.");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt başarısız.");
    } finally {
      setLoading(false);
    }
  }

  const isTabbed = layout === "tabbed";

  return (
    <form
      onSubmit={handleSubmit}
      className={
        isTabbed
          ? "space-y-5"
          : "rounded-xl border border-slate-700/80 bg-fortress-900/60 p-6 shadow-card"
      }
    >
      {!isTabbed ? (
        <>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Kayıt</h3>
          <p className="mt-1 text-xs text-slate-500">
            <code className="rounded bg-fortress-950 px-1 py-0.5">POST /auth/register</code>
            <span className="block text-slate-600">Secure API (platform hesabı)</span>
          </p>
        </>
      ) : (
        <p className="text-xs text-slate-500">
          <span className="text-slate-400">Endpoint:</span>{" "}
          <code className="rounded-md bg-black/35 px-2 py-0.5 font-mono text-[11px] text-slate-300">
            POST /auth/register
          </code>
          <span className="block pt-1 text-slate-600">Secure API — platform hesabı</span>
        </p>
      )}

      {error ? (
        <AuthAlert variant="error" title="Kayıt başarısız">
          {error}
        </AuthAlert>
      ) : null}

      {success ? (
        <AuthAlert variant="success" title="İşlem tamam">
          {success} Giriş sekmesinden oturum açabilirsiniz.
        </AuthAlert>
      ) : null}

      <label className="block text-sm font-medium text-slate-300">
        E-posta
        <input
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-slate-600/80 bg-fortress-950 px-3 py-2.5 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-fortress-accent/50 focus:ring-2 focus:ring-fortress-accent/30"
          placeholder="ornek@universite.edu.tr"
          required
        />
      </label>

      <label className="block text-sm font-medium text-slate-300">
        Parola
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-slate-600/80 bg-fortress-950 px-3 py-2.5 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-fortress-accent/50 focus:ring-2 focus:ring-fortress-accent/30"
          placeholder="En az bir güçlü parola seçin"
          required
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl border border-slate-500/80 bg-fortress-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-fortress-800/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Kaydediliyor…" : "Hesap oluştur"}
      </button>
    </form>
  );
}
