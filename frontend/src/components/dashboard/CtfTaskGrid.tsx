import { useCallback, useEffect, useState } from "react";
import { ctfTasks } from "@/data/ctfTasks";
import { isTaskCompleted, isTaskUnlocked } from "@/lib/progress";
import type { CtfTask } from "@/types";

type Props = {
  completedTaskIds: readonly string[];
  onSelectTask: (task: CtfTask) => void;
};

export default function CtfTaskGrid({ completedTaskIds, onSelectTask }: Props) {
  const [lockNotice, setLockNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!lockNotice) return;
    const t = window.setTimeout(() => setLockNotice(null), 4000);
    return () => window.clearTimeout(t);
  }, [lockNotice]);

  const handleCardClick = useCallback(
    (task: CtfTask) => {
      const unlocked = isTaskUnlocked(task.id, completedTaskIds);
      if (!unlocked) {
        setLockNotice("Bu görev kilitli. Önce sıradaki önceki görevi tamamlayın.");
        return;
      }
      onSelectTask(task);
    },
    [completedTaskIds, onSelectTask]
  );

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            CTF görevleri — Learning Path
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Görevler sırayla açılır; tamamladıkça sonraki kartın kilidi kalkar.
          </p>
        </div>
        <p className="text-xs text-slate-500">Açık kartlara tıklayarak detay ve lab terminaline geçin</p>
      </div>

      {lockNotice ? (
        <div
          role="status"
          className="mb-3 rounded-lg border border-amber-500/35 bg-amber-950/25 px-3 py-2 text-sm text-amber-100/95"
        >
          {lockNotice}
        </div>
      ) : null}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        {ctfTasks.map((task) => {
          const unlocked = isTaskUnlocked(task.id, completedTaskIds);
          const completed = isTaskCompleted(task.id, completedTaskIds);

          let statusLabel: string;
          let statusClass: string;
          if (completed) {
            statusLabel = "Tamamlandı";
            statusClass = "bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-500/40";
          } else if (unlocked) {
            statusLabel = "Açık";
            statusClass = "bg-slate-700/80 text-slate-200 ring-1 ring-slate-600/50";
          } else {
            statusLabel = "Kilitli";
            statusClass = "bg-slate-900/90 text-slate-500 ring-1 ring-slate-700/70";
          }

          return (
            <li key={task.id}>
              <button
                type="button"
                onClick={() => handleCardClick(task)}
                className={`flex h-full w-full flex-col rounded-xl border p-5 text-left shadow-card transition focus:outline-none focus:ring-2 focus:ring-fortress-accent/60 ${
                  unlocked
                    ? "border-slate-700/60 bg-fortress-900/60 hover:border-fortress-accent/40 hover:bg-fortress-900/90"
                    : "cursor-not-allowed border-slate-800/80 bg-fortress-950/50 opacity-75 hover:border-slate-700/70"
                }`}
                aria-disabled={!unlocked}
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="w-fit rounded-md bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300">
                    {task.tag}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${statusClass}`}
                  >
                    {statusLabel}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white">{task.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{task.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-fortress-950 px-2 py-0.5 font-mono text-[11px] text-slate-400">
                    {task.targetEndpoint}
                  </span>
                  <span className="text-xs font-medium text-slate-500">{task.difficulty}</span>
                </div>
                <span
                  className={`mt-3 text-xs font-medium uppercase tracking-wide ${
                    unlocked ? "text-fortress-accent" : "text-slate-600"
                  }`}
                >
                  {unlocked ? "Detayı aç →" : "Kilitli"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
