import type { ApiMode, HealthResponse, UserMeResponse } from "@/types";
import { getInsecureApiBase, getSecureApiBase } from "@/services/http";

type Props = {
  mode: ApiMode;
  activeBaseUrl: string;
  user: UserMeResponse | null;
  userLoading: boolean;
  userError: string | null;
  insecureHealth: HealthResponse | null;
  secureHealth: HealthResponse | null;
  insecureHealthError: string | null;
  secureHealthError: string | null;
  healthLoading: boolean;
};

function StatusDot({ ok, pending }: { ok: boolean | null; pending: boolean }) {
  if (pending) {
    return (
      <span
        className="inline-block size-2.5 animate-pulse rounded-full bg-slate-500"
        aria-hidden
      />
    );
  }
  if (ok === true) {
    return <span className="inline-block size-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />;
  }
  return <span className="inline-block size-2.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]" />;
}

export default function DashboardSummaryCards({
  mode,
  activeBaseUrl,
  user,
  userLoading,
  userError,
  insecureHealth,
  secureHealth,
  insecureHealthError,
  secureHealthError,
  healthLoading,
}: Props) {
  const insecureBase = getInsecureApiBase();
  const secureBase = getSecureApiBase();
  const modeInsecure = mode === "insecure";

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Aktif mod */}
      <div
        className={`relative overflow-hidden rounded-2xl border p-5 shadow-card ${
          modeInsecure
            ? "border-amber-500/25 bg-gradient-to-br from-amber-950/40 to-fortress-900/80"
            : "border-sky-500/25 bg-gradient-to-br from-sky-950/40 to-fortress-900/80"
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Aktif API</p>
        <p className="mt-2 text-2xl font-bold tracking-tight text-white">
          {modeInsecure ? "Insecure" : "Secure"}
        </p>
        <p className="mt-2 truncate font-mono text-xs text-slate-400" title={activeBaseUrl}>
          {activeBaseUrl}
        </p>
        <p className="mt-3 text-xs text-slate-500">
          İstekler bu uç noktaya yönlendirilir; mod değişince token sıfırlanabilir.
        </p>
      </div>

      {/* Kullanıcı */}
      <div className="rounded-2xl border border-slate-700/70 bg-fortress-900/70 p-5 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Oturum</p>
        {userLoading ? (
          <p className="mt-4 text-sm text-slate-400">Profil yükleniyor…</p>
        ) : userError ? (
          <p className="mt-3 text-sm text-red-300">{userError}</p>
        ) : user ? (
          <div className="mt-3 space-y-2">
            <p className="font-mono text-xl font-semibold text-white">{user.id}</p>
            <p className="truncate text-sm text-slate-300" title={user.email}>
              {user.email}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">—</p>
        )}
      </div>

      {/* Insecure health */}
      <div className="rounded-2xl border border-slate-700/70 bg-fortress-900/70 p-5 shadow-card">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Insecure API
          </p>
          <StatusDot
            pending={healthLoading}
            ok={healthLoading ? null : insecureHealth !== null}
          />
        </div>
        <p className="mt-2 truncate font-mono text-[11px] text-slate-500" title={insecureBase}>
          {insecureBase}
        </p>
        {healthLoading ? (
          <p className="mt-3 text-sm text-slate-400">Durum kontrolü…</p>
        ) : insecureHealthError ? (
          <p className="mt-3 text-sm text-red-300">{insecureHealthError}</p>
        ) : insecureHealth ? (
          <div className="mt-3 space-y-1">
            <p className="text-lg font-semibold capitalize text-emerald-300">{insecureHealth.status}</p>
            <p className="text-xs text-slate-400">{insecureHealth.service}</p>
          </div>
        ) : null}
      </div>

      {/* Secure health */}
      <div className="rounded-2xl border border-slate-700/70 bg-fortress-900/70 p-5 shadow-card">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Secure API</p>
          <StatusDot pending={healthLoading} ok={healthLoading ? null : secureHealth !== null} />
        </div>
        <p className="mt-2 truncate font-mono text-[11px] text-slate-500" title={secureBase}>
          {secureBase}
        </p>
        {healthLoading ? (
          <p className="mt-3 text-sm text-slate-400">Durum kontrolü…</p>
        ) : secureHealthError ? (
          <p className="mt-3 text-sm text-red-300">{secureHealthError}</p>
        ) : secureHealth ? (
          <div className="mt-3 space-y-1">
            <p className="text-lg font-semibold capitalize text-emerald-300">{secureHealth.status}</p>
            <p className="text-xs text-slate-400">{secureHealth.service}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
