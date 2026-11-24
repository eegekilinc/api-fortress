import ApiModeSwitch from "@/components/mode/ApiModeSwitch";
import type { ApiMode } from "@/types";

type Props = {
  mode: ApiMode;
  onModeChange: (mode: ApiMode) => void;
  baseUrl: string;
};

export default function AuthLabPanel({ mode, onModeChange, baseUrl }: Props) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-700/70 bg-gradient-to-br from-fortress-900/90 via-fortress-950/80 to-black/40 p-6 shadow-card sm:p-8">
      <div
        className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-fortress-accent/5 blur-3xl"
        aria-hidden
      />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fortress-accent">
          Laboratuvar ortamı
        </p>
        <h2 className="mt-2 text-lg font-semibold text-white sm:text-xl">API hedefi seçimi</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
          Tüm kimlik istekleri aşağıda seçtiğiniz uç noktaya gider. Insecure ve Secure servisleri aynı
          yüzey alanı sunar; savunma farkı sunucu implementasyonundadır. Mod değişince önceki oturum
          token&apos;ı geçersiz sayılabilir.
        </p>
        <div className="mt-6 max-w-xl">
          <ApiModeSwitch mode={mode} onChange={onModeChange} baseUrl={baseUrl} />
        </div>
      </div>
    </section>
  );
}
