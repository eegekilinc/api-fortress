import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import ApiModeSwitch from "@/components/mode/ApiModeSwitch";
import DashboardSummaryCards from "@/components/dashboard/DashboardSummaryCards";
import CtfTaskGrid from "@/components/dashboard/CtfTaskGrid";
import CtfTaskDetailModal from "@/components/dashboard/CtfTaskDetailModal";
import { useApiMode } from "@/hooks/useApiMode";
import { fetchHealth, getInsecureApiBase, getSecureApiBase, getJson, postJson } from "@/services/http";
import {
  ROUTES,
  readAccessToken,
  clearAccessToken,
} from "@/lib/constants";
import {
  markTaskCompleted,
  mergeCompletedWithRemote,
  readCompletedTaskIds,
} from "@/lib/progress";
import type { CtfTask, HealthResponse, ProgressMeResponse, UserMeResponse } from "@/types";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { mode, setMode, baseUrl } = useApiMode();
  const [user, setUser] = useState<UserMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<CtfTask | null>(null);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const userProgressKey = user?.email || (user ? String(user.id) : null);


  const [insecureHealth, setInsecureHealth] = useState<HealthResponse | null>(null);
  const [secureHealth, setSecureHealth] = useState<HealthResponse | null>(null);
  const [insecureHealthError, setInsecureHealthError] = useState<string | null>(null);
  const [secureHealthError, setSecureHealthError] = useState<string | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);

  const handleLogout = useCallback(() => {
    clearAccessToken();
    navigate(ROUTES.auth, { replace: true });
  }, [navigate]);

  const handleTaskCompleted = useCallback(
    (taskId: string) => {
      if (!userProgressKey) return;
      const next = markTaskCompleted(userProgressKey, taskId);
      setCompletedTaskIds(next);

      const token = readAccessToken();
      if (!token) return;

      const platformApiBase = getSecureApiBase();
      postJson<ProgressMeResponse>(platformApiBase, "/progress/complete", { task_id: taskId }, { token })
        .then((data) => {
          setCompletedTaskIds(mergeCompletedWithRemote(userProgressKey, data.completed ?? []));
        })
        .catch(() => {
          /* localStorage fallback — sessiz */
        });
    },
    [userProgressKey]
  );

  useEffect(() => {
    if (!userProgressKey) {
      setCompletedTaskIds([]);
      return;
    }

    const local = readCompletedTaskIds(userProgressKey);
    setCompletedTaskIds(local);

    const token = readAccessToken();
    if (!token) return;

    const platformApiBase = getSecureApiBase();
    let cancelled = false;

    getJson<ProgressMeResponse>(platformApiBase, "/progress/me", { token })
      .then((data) => {
        if (cancelled) return;
        setCompletedTaskIds(mergeCompletedWithRemote(userProgressKey, data.completed ?? []));
      })
      .catch(() => {
        /* localStorage fallback */
      });

    return () => {
      cancelled = true;
    };
  }, [userProgressKey]);

  useEffect(() => {
    const token = readAccessToken();
    if (!token) {
      navigate(ROUTES.auth, { replace: true });
      return;
    }

    const platformApiBase = getSecureApiBase();

    let cancelled = false;
    setLoading(true);
    setError(null);

    getJson<UserMeResponse>(platformApiBase, "/users/me", { token })
      .then((data) => {
        if (!cancelled) {
          setUser({
            ...data,
            is_admin: Boolean(data.is_admin),
          });
        }
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Profil yüklenemedi.";
        if (msg.toLowerCase().includes("unauthorized")) {
          clearAccessToken();
          navigate(ROUTES.auth, { replace: true });
          return;
        }
        setError(msg);
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;
    setHealthLoading(true);
    setInsecureHealthError(null);
    setSecureHealthError(null);

    const bi = getInsecureApiBase();
    const bs = getSecureApiBase();

    Promise.allSettled([fetchHealth(bi), fetchHealth(bs)]).then((results) => {
      if (cancelled) return;

      const [r0, r1] = results;

      if (r0.status === "fulfilled") {
        setInsecureHealth(r0.value);
        setInsecureHealthError(null);
      } else {
        setInsecureHealth(null);
        setInsecureHealthError(
          r0.reason instanceof Error ? r0.reason.message : "Erişilemiyor"
        );
      }

      if (r1.status === "fulfilled") {
        setSecureHealth(r1.value);
        setSecureHealthError(null);
      } else {
        setSecureHealth(null);
        setSecureHealthError(
          r1.reason instanceof Error ? r1.reason.message : "Erişilemiyor"
        );
      }

      setHealthLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="dashboard" onLogout={handleLogout} isAdmin={Boolean(user?.is_admin)} />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6">
        <header className="border-b border-slate-800/80 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fortress-accent">
            API Fortress Lab
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Operasyon özeti
          </h2>
          <p className="mt-3 max-w-2xl text-base text-slate-400">
            Çift API mimarisi, oturumunuz ve servis sağlığı tek bakışta. Aşağıdan mod seçerek
            istekleri yönlendirebilir; görev kartlarıyla senaryolara geçebilirsiniz.
          </p>
        </header>

        <DashboardSummaryCards
          mode={mode}
          activeBaseUrl={baseUrl}
          user={user}
          userLoading={loading}
          userError={error}
          insecureHealth={insecureHealth}
          secureHealth={secureHealth}
          insecureHealthError={insecureHealthError}
          secureHealthError={secureHealthError}
          healthLoading={healthLoading}
        />

        <ApiModeSwitch mode={mode} onChange={setMode} baseUrl={baseUrl} />

        <CtfTaskGrid completedTaskIds={completedTaskIds} onSelectTask={setSelectedTask} />

        <CtfTaskDetailModal
          task={selectedTask}
          mode={mode}
          baseUrl={baseUrl}
          onClose={() => setSelectedTask(null)}
          onTaskCompleted={handleTaskCompleted}
        />
      </main>
    </div>
  );
}
