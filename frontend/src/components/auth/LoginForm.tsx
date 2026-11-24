import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postJson, getSecureApiBase } from "@/services/http";
import { ROUTES, STORAGE_KEYS } from "@/lib/constants";
import type { LoginRequestBody, LoginResponseBody } from "@/types";
import AuthAlert from "@/components/auth/AuthAlert";

type Props = {
  layout?: "standalone" | "tabbed";
};

export default function LoginForm({ layout = "standalone" }: Props) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const baseUrl = getSecureApiBase();
    try {
      const body: LoginRequestBody = { email: email.trim(), password };
      const data = await postJson<LoginResponseBody>(baseUrl, "/auth/login", body);
      if (!data.access_token) {
        throw new Error("Token alınamadı.");
      }
      localStorage.setItem(STORAGE_KEYS.accessToken, data.access_token);
      navigate(ROUTES.dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş başarısız.");
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
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Giriş</h3>
          <p className="mt-1 text-xs text-slate-500">
            <code className="rounded bg-fortress-950 px-1 py-0.5">POST /auth/login</code>
            <span className="block text-slate-600">Secure API (platform oturumu)</span>
          </p>
        </>
      ) : (
        <p className="text-xs text-slate-500">
          <span className="text-slate-400">Endpoint:</span>{" "}
          <code className="rounded-md bg-black/35 px-2 py-0.5 font-mono text-[11px] text-slate-300">
            POST /auth/login
          </code>
          <span className="block pt-1 text-slate-600">Secure API — platform oturumu</span>
        </p>
      )}

      {error ? (
        <AuthAlert variant="error" title="Giriş başarısız">
          {error}
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-slate-600/80 bg-fortress-950 px-3 py-2.5 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-fortress-accent/50 focus:ring-2 focus:ring-fortress-accent/30"
          placeholder="••••••••"
          required
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-fortress-accent px-4 py-3 text-sm font-semibold text-fortress-950 shadow-lg shadow-sky-900/20 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Giriş yapılıyor…" : "Giriş yap"}
      </button>
    </form>
  );
}
