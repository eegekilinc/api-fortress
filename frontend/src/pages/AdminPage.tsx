import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { DEMO_ADMIN_EMAIL, ROUTES, clearAccessToken, readAccessToken } from "@/lib/constants";
import { LEARNING_PATH_ORDER } from "@/lib/progress";
import { ctfTasks } from "@/data/ctfTasks";
import { deleteJson, getJson, getSecureApiBase } from "@/services/http";
import type { AdminUserProgress, UserMeResponse } from "@/types";

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function latestCompletedAt(completedAt: Record<string, string>): string | null {
  const values = Object.values(completedAt);
  if (values.length === 0) return null;
  return values.reduce((latest, cur) => (cur > latest ? cur : latest));
}

function canDeleteUser(current: UserMeResponse | null, target: AdminUserProgress): boolean {
  if (!current) return false;
  if (current.id === target.id) return false;
  if (target.email === DEMO_ADMIN_EMAIL) return false;
  return true;
}

type UserCardProps = {
  user: AdminUserProgress;
  taskTitleById: Map<string, string>;
  deletable: boolean;
  deleting: boolean;
  deleteError: string | null;
  onDelete: (user: AdminUserProgress) => void;
};

function UserProgressCard({
  user,
  taskTitleById,
  deletable,
  deleting,
  deleteError,
  onDelete,
}: UserCardProps) {
  const completedOrdered = LEARNING_PATH_ORDER.filter((id) => user.completed_tasks.includes(id));
  const remainingOrdered = LEARNING_PATH_ORDER.filter((id) => !user.completed_tasks.includes(id));
  const pct =
    user.total_count > 0 ? Math.round((user.completed_count / user.total_count) * 100) : 0;
  const lastAt = latestCompletedAt(user.completed_at);

  return (
    <article className="fortress-clip rounded-xl border border-slate-700/60 bg-fortress-900/60 p-5 shadow-card">
      {deleteError ? (
        <p className="mb-3 rounded-lg border border-red-500/30 bg-red-950/30 px-3 py-2 text-xs text-red-200">
          {deleteError}
        </p>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Kullanıcı #{user.id}
          </p>
          <p className="mt-1 font-medium text-slate-100">{user.email}</p>
          <span
            className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
              user.is_admin
                ? "bg-sky-500/20 text-sky-100 ring-1 ring-sky-500/35"
                : "bg-slate-700/60 text-slate-300 ring-1 ring-slate-600/40"
            }`}
          >
            {user.is_admin ? "Admin" : "User"}
          </span>
        </div>
        <p className="text-sm font-semibold text-emerald-300">
          {user.completed_count} / {user.total_count}
        </p>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>İlerleme</span>
          <span>{pct}%</span>
        </div>
        <div className="fortress-clip mt-1.5 h-2 rounded-full bg-fortress-950">
          <div
            className="h-full rounded-full bg-fortress-accent transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {lastAt ? (
        <p className="mt-3 text-xs text-slate-500">
          Son tamamlanan:{" "}
          <span className="text-slate-400">{formatDateTime(lastAt)}</span>
        </p>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-emerald-800/40 bg-emerald-950/20 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
            Tamamlanan
          </p>
          {completedOrdered.length === 0 ? (
            <p className="mt-1.5 text-xs text-slate-500">—</p>
          ) : (
            <ul className="mt-1.5 space-y-1 text-xs text-slate-200">
              {completedOrdered.map((id) => (
                <li key={id}>{taskTitleById.get(id) || id}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-lg border border-slate-700/70 bg-fortress-950/60 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Kalan</p>
          {remainingOrdered.length === 0 ? (
            <p className="mt-1.5 text-xs text-emerald-300">Tüm görevler tamam</p>
          ) : (
            <ul className="mt-1.5 space-y-1 text-xs text-slate-300">
              {remainingOrdered.map((id) => (
                <li key={id}>{taskTitleById.get(id) || id}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {deletable ? (
        <div className="mt-5 border-t border-slate-800/80 pt-4">
          <button
            type="button"
            disabled={deleting}
            onClick={() => onDelete(user)}
            className="w-full rounded-lg border border-red-500/50 bg-red-950/40 px-4 py-2 text-sm font-semibold text-red-100 transition hover:border-red-400/70 hover:bg-red-950/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? "Siliniyor..." : "Kullanıcıyı Sil"}
          </button>
        </div>
      ) : null}
    </article>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserMeResponse | null>(null);
  const [usersProgress, setUsersProgress] = useState<AdminUserProgress[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [cardDeleteErrors, setCardDeleteErrors] = useState<Record<number, string>>({});

  const handleLogout = useCallback(() => {
    clearAccessToken();
    navigate(ROUTES.auth, { replace: true });
  }, [navigate]);

  const loadUsersProgress = useCallback(() => {
    const token = readAccessToken();
    if (!token) return Promise.resolve();

    const platformApiBase = getSecureApiBase();
    setLoadingProgress(true);
    setProgressError(null);

    return getJson<AdminUserProgress[]>(platformApiBase, "/admin/users-progress", { token })
      .then((data) => {
        setUsersProgress(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "İlerleme verisi yüklenemedi.";
        if (msg.toLowerCase().includes("forbidden")) {
          navigate(ROUTES.dashboard, { replace: true });
          return;
        }
        setProgressError(msg);
        setUsersProgress([]);
      })
      .finally(() => {
        setLoadingProgress(false);
      });
  }, [navigate]);

  const handleDeleteUser = useCallback(
    async (target: AdminUserProgress) => {
      if (!canDeleteUser(user, target)) return;
      if (!window.confirm("Bu kullanıcı silinecek. Emin misiniz?")) return;

      const token = readAccessToken();
      if (!token) return;

      setDeletingUserId(target.id);
      setCardDeleteErrors((prev) => {
        const next = { ...prev };
        delete next[target.id];
        return next;
      });
      setProgressError(null);

      const platformApiBase = getSecureApiBase();

      try {
        await deleteJson<{ message?: string }>(
          platformApiBase,
          `/users/${target.id}`,
          { token }
        );
        setUsersProgress((prev) => prev.filter((u) => u.id !== target.id));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Kullanıcı silinemedi.";
        setCardDeleteErrors((prev) => ({ ...prev, [target.id]: msg }));
      } finally {
        setDeletingUserId(null);
      }
    },
    [user]
  );

  useEffect(() => {
    const token = readAccessToken();
    if (!token) {
      navigate(ROUTES.auth, { replace: true });
      return;
    }

    const platformApiBase = getSecureApiBase();
    let cancelled = false;
    setLoadingUser(true);
    setUserError(null);

    getJson<UserMeResponse>(platformApiBase, "/users/me", { token })
      .then((data) => {
        if (cancelled) return;
        setUser({
          ...data,
          is_admin: Boolean(data.is_admin),
        });
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Profil yüklenemedi.";
        if (msg.toLowerCase().includes("unauthorized")) {
          clearAccessToken();
          navigate(ROUTES.auth, { replace: true });
          return;
        }
        setUserError(msg);
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingUser(false);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    if (loadingUser) return;
    if (user && !user.is_admin) {
      navigate(ROUTES.dashboard, { replace: true });
    }
  }, [loadingUser, user, navigate]);

  useEffect(() => {
    if (loadingUser || !user?.is_admin) return;
    loadUsersProgress();
  }, [loadingUser, user, loadUsersProgress]);

  const taskTitleById = useMemo(
    () => new Map(ctfTasks.map((task) => [task.id, task.title])),
    []
  );

  const summary = useMemo(() => {
    const totalUsers = usersProgress.length;
    const adminCount = usersProgress.filter((u) => u.is_admin).length;
    const totalCompletions = usersProgress.reduce((sum, u) => sum + u.completed_count, 0);
    const avgPct =
      totalUsers > 0
        ? Math.round(
            usersProgress.reduce((sum, u) => {
              const pct = u.total_count > 0 ? (u.completed_count / u.total_count) * 100 : 0;
              return sum + pct;
            }, 0) / totalUsers
          )
        : 0;
    return { totalUsers, adminCount, totalCompletions, avgPct };
  }, [usersProgress]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="dashboard" onLogout={handleLogout} isAdmin={Boolean(user?.is_admin)} />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
        <header className="border-b border-slate-800/80 pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fortress-accent">
            Admin Panel
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Kullanıcı izleme
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Tüm kayıtlı kullanıcıların CTF / Learning Path ilerlemesi (Secure API).
          </p>
        </header>

        {userError ? (
          <p className="rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
            {userError}
          </p>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-xl border border-slate-700/60 bg-fortress-900/60 p-4 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Toplam kullanıcı
            </p>
            <p className="mt-2 text-2xl font-bold text-white">
              {loadingProgress ? "…" : summary.totalUsers}
            </p>
          </article>
          <article className="rounded-xl border border-slate-700/60 bg-fortress-900/60 p-4 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Admin kullanıcı
            </p>
            <p className="mt-2 text-2xl font-bold text-sky-200">
              {loadingProgress ? "…" : summary.adminCount}
            </p>
          </article>
          <article className="rounded-xl border border-slate-700/60 bg-fortress-900/60 p-4 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Toplam tamamlanan görev
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-300">
              {loadingProgress ? "…" : summary.totalCompletions}
            </p>
          </article>
          <article className="rounded-xl border border-slate-700/60 bg-fortress-900/60 p-4 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Ortalama ilerleme
            </p>
            <p className="mt-2 text-2xl font-bold text-fortress-accent">
              {loadingProgress ? "…" : `${summary.avgPct}%`}
            </p>
          </article>
        </section>

        {progressError ? (
          <p className="rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
            {progressError}
          </p>
        ) : null}

        {loadingUser || loadingProgress ? (
          <p className="text-sm text-slate-400">Kullanıcı verileri yükleniyor…</p>
        ) : usersProgress.length === 0 ? (
          <p className="text-sm text-slate-400">Henüz kayıtlı kullanıcı yok.</p>
        ) : (
          <section className="grid gap-4 md:grid-cols-2">
            {usersProgress.map((u) => (
              <UserProgressCard
                key={u.id}
                user={u}
                taskTitleById={taskTitleById}
                deletable={canDeleteUser(user, u)}
                deleting={deletingUserId === u.id}
                deleteError={cardDeleteErrors[u.id] ?? null}
                onDelete={handleDeleteUser}
              />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
