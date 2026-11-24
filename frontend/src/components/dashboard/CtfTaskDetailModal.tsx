import { useEffect, useRef, useState } from "react";
import type { ApiMode, CtfTask } from "@/types";
import AttackConsole from "@/components/dashboard/AttackConsole";

type Props = {
  task: CtfTask | null;
  mode: ApiMode;
  baseUrl: string;
  onClose: () => void;
  onTaskCompleted?: (taskId: string) => void;
};

function LabSection({
  title,
  children,
  accent = "slate",
}: {
  title: string;
  children: React.ReactNode;
  accent?: "slate" | "sky" | "amber";
}) {
  const border =
    accent === "amber"
      ? "border-amber-500/20"
      : accent === "sky"
        ? "border-sky-500/20"
        : "border-slate-700/60";
  const label =
    accent === "amber"
      ? "text-amber-200/90"
      : accent === "sky"
        ? "text-sky-200/90"
        : "text-slate-400";

  return (
    <section className={`rounded-xl border ${border} bg-fortress-950/40 p-4`}>
      <h3 className={`text-xs font-semibold uppercase tracking-wider ${label}`}>{title}</h3>
      <div className="mt-2 text-sm leading-relaxed text-slate-300">{children}</div>
    </section>
  );
}

export default function CtfTaskDetailModal({ task, mode, baseUrl, onClose, onTaskCompleted }: Props) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [showAttackConsole, setShowAttackConsole] = useState(false);

  useEffect(() => {
    if (!task) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    closeBtnRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [task, onClose]);

  useEffect(() => {
    setShowAttackConsole(false);
  }, [task?.id]);

  if (!task) return null;

  const modeInsecure = mode === "insecure";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ctf-detail-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Detayı kapat"
        onClick={onClose}
      />

      <div
        className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-700/80 bg-fortress-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4 ${
            modeInsecure
              ? "border-amber-500/20 bg-amber-950/20"
              : "border-sky-500/20 bg-sky-950/20"
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                modeInsecure
                  ? "bg-amber-500/20 text-amber-200 ring-1 ring-amber-500/40"
                  : "bg-sky-500/20 text-sky-100 ring-1 ring-sky-500/40"
              }`}
            >
              Aktif API: {modeInsecure ? "Insecure" : "Secure"}
            </span>
            <span className="rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300">
              {task.difficulty}
            </span>
            <span className="rounded-md bg-slate-800/80 px-2 py-1 text-xs text-slate-400">{task.tag}</span>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-fortress-800"
          >
            Kapat
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <header className="border-b border-slate-800/80 pb-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Laboratuvar görevi
            </p>
            <h2 id="ctf-detail-title" className="mt-1 text-2xl font-semibold text-white">
              {task.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{task.description}</p>
          </header>

          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-700/60 bg-fortress-950/50 p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Zafiyet tipi
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-100">{task.vulnerabilityType}</dd>
            </div>
            <div className="rounded-xl border border-slate-700/60 bg-fortress-950/50 p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Hedef endpoint
              </dt>
              <dd className="mt-1 font-mono text-sm text-fortress-accent">{task.targetEndpoint}</dd>
            </div>
          </dl>

          <div className="space-y-3">
            <LabSection title="Görev amacı" accent="sky">
              <p>{task.goal}</p>
            </LabSection>
            <LabSection title="Yapılacak işlem mantığı" accent="slate">
              <p className="whitespace-pre-line">{task.procedure}</p>
            </LabSection>
            <LabSection title="Örnek istek yapısı" accent="slate">
              <pre className="mt-1 max-h-56 overflow-auto rounded-lg border border-slate-800 bg-black/40 p-3 font-mono text-xs leading-relaxed text-slate-300">
                {task.exampleRequest}
              </pre>
            </LabSection>
            <LabSection title="Başarı kriteri" accent="amber">
              <p>{task.successCriteria}</p>
            </LabSection>
            <LabSection title="Secure tarafta neden engellenir?" accent="sky">
              <p>{task.whyBlockedOnSecure}</p>
            </LabSection>
          </div>

          <div className="border-t border-slate-800/80 pt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Mod karşılaştırması
            </p>
            <div className="grid gap-4 lg:grid-cols-2">
              <div
                className={`rounded-xl border p-4 ${
                  modeInsecure
                    ? "border-amber-500/30 bg-amber-950/15"
                    : "border-slate-700/60 bg-fortress-950/40 opacity-80"
                }`}
              >
                <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-200/90">
                  Insecure — beklenen davranış
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{task.insecureExpected}</p>
              </div>
              <div
                className={`rounded-xl border p-4 ${
                  !modeInsecure
                    ? "border-sky-500/30 bg-sky-950/15"
                    : "border-slate-700/60 bg-fortress-950/40 opacity-80"
                }`}
              >
                <h3 className="text-xs font-semibold uppercase tracking-wide text-sky-200/90">
                  Secure — beklenen davranış
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{task.secureExpected}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-5">
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setShowAttackConsole((v) => !v)}
                className="w-full rounded-xl bg-fortress-accent px-4 py-3 text-sm font-semibold text-fortress-950 shadow-md transition hover:bg-sky-300 sm:w-auto"
              >
                {showAttackConsole ? "Konsolu gizle" : "Hadi Başlayalım"}
              </button>
              <p className="text-center text-xs text-slate-500 sm:text-right">
                Bu görev eğitim amaçlıdır; üretim sistemlerinde denenmemelidir.
              </p>
            </div>

            {showAttackConsole ? (
              <AttackConsole task={task} mode={mode} baseUrl={baseUrl} onTaskCompleted={onTaskCompleted} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
