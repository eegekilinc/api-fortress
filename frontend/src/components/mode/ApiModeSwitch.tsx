import type { ApiMode } from "@/types";

type Props = {
  mode: ApiMode;
  onChange: (mode: ApiMode) => void;
  baseUrl: string;
};

export default function ApiModeSwitch({ mode, onChange, baseUrl }: Props) {
  return (
    <div className="rounded-xl border border-slate-700/80 bg-fortress-900/80 p-4 shadow-card backdrop-blur-sm">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">
        API hedefi
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange("insecure")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            mode === "insecure"
              ? "bg-fortress-warn/20 text-fortress-warn ring-1 ring-fortress-warn/40"
              : "bg-fortress-800 text-slate-300 hover:bg-fortress-800/80"
          }`}
        >
          Insecure
        </button>
        <button
          type="button"
          onClick={() => onChange("secure")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            mode === "secure"
              ? "bg-fortress-accent/15 text-fortress-accent ring-1 ring-fortress-accent/35"
              : "bg-fortress-800 text-slate-300 hover:bg-fortress-800/80"
          }`}
        >
          Secure
        </button>
      </div>
      <p className="mt-3 truncate font-mono text-xs text-slate-500" title={baseUrl}>
        {baseUrl}
      </p>
    </div>
  );
}
