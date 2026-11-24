type Variant = "error" | "success" | "info";

type Props = {
  variant: Variant;
  title?: string;
  children: React.ReactNode;
};

const styles: Record<Variant, string> = {
  error:
    "border-red-500/35 bg-red-950/35 text-red-100 [&_.auth-alert-title]:text-red-200/95",
  success:
    "border-emerald-500/35 bg-emerald-950/25 text-emerald-100 [&_.auth-alert-title]:text-emerald-200/95",
  info: "border-slate-600/60 bg-slate-900/50 text-slate-200 [&_.auth-alert-title]:text-slate-100",
};

export default function AuthAlert({ variant, title, children }: Props) {
  return (
    <div
      className={`flex gap-3 rounded-xl border px-4 py-3 text-sm leading-relaxed shadow-sm ${styles[variant]}`}
      role={variant === "error" ? "alert" : "status"}
    >
      <span className="mt-0.5 shrink-0 font-mono text-xs opacity-80" aria-hidden>
        {variant === "error" ? "!" : variant === "success" ? "✓" : "i"}
      </span>
      <div className="min-w-0 flex-1">
        {title ? (
          <p className="auth-alert-title mb-1 text-xs font-semibold uppercase tracking-wide">{title}</p>
        ) : null}
        <div className="text-[13px]">{children}</div>
      </div>
    </div>
  );
}
