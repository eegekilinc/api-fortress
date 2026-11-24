import { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/layout/Header";
import AuthTabs from "@/components/auth/AuthTabs";

export default function AuthPage() {
  const [showAuthPanel, setShowAuthPanel] = useState(false);
  const authPanelRef = useRef<HTMLDivElement>(null);

  const handleOpenAuth = useCallback(() => {
    setShowAuthPanel(true);
  }, []);

  useEffect(() => {
    if (!showAuthPanel) return;

    const t = window.setTimeout(() => {
      authPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);

    return () => window.clearTimeout(t);
  }, [showAuthPanel]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="auth" onAuthOpen={handleOpenAuth} authPanelOpen={showAuthPanel} />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-10 sm:gap-12 sm:px-6 sm:py-14">
        <header className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-fortress-accent">
              API Fortress
            </h4>

            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.35rem] lg:leading-tight">
              Çift yüzlü REST API güvenlik laboratuvarı
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400">
              API Fortress, aynı rota ve sözleşme tasarımını paylaşan iki Flask servisi üzerinde çalışan
              eğitim odaklı bir lab ortamıdır.{" "}
              <span className="text-amber-200/90">Insecure</span> servisi bilinçli olarak OWASP API
              Security risklerini sergiler;{" "}
              <span className="text-sky-200/90">Secure</span> servisi aynı yüzeyi savunmacı kontrollerle
              uygular. Böylece aynı istemci akışıyla iki dünyayı yan yana karşılaştırabilirsiniz.
            </p>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400">
              Platform kimliği kayıt ve giriş işlemlerini Secure API üzerinden yönetir. JWT tek oturum
              olarak saklanır. Dashboard&apos;da seçeceğiniz mod yalnızca laboratuvar hedefini belirler;
              profil ve oturum Secure tarafta kalır.
            </p>
          </div>

          <ul className="grid gap-3 text-sm text-slate-400 sm:grid-cols-2 lg:grid-cols-1 lg:text-right">
            <li className="rounded-xl border border-slate-800/80 bg-fortress-950/40 px-4 py-3 lg:ml-auto lg:max-w-sm">
              <span className="font-medium text-slate-200">Ne öğreneceksiniz?</span>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Mass assignment, kimlik doğrulama zayıflıkları, IDOR/BOLA ve işlev düzeyinde yetki
                hataları gibi senaryoları güvenli ve zafiyetli uçlar üzerinde deneyimlersiniz.
              </p>
            </li>

            <li className="rounded-xl border border-slate-800/80 bg-fortress-950/40 px-4 py-3 lg:ml-auto lg:max-w-sm">
              <span className="font-medium text-slate-200">Nasıl başlarsınız?</span>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Önce bu sayfada laboratuvarı okuyun; ardından sağ üstteki veya aşağıdaki{" "}
                <span className="text-slate-300">Giriş / Kayıt</span> ile oturum panelini açın.
              </p>
            </li>
          </ul>
        </header>

        {!showAuthPanel ? (
          <section className="space-y-8 rounded-2xl border border-slate-800/80 bg-fortress-950/25 p-6 sm:p-10">
            <div className="mx-auto flex w-full max-w-3xl flex-col items-stretch justify-center gap-6 sm:flex-row">
              <div className="flex min-h-[11rem] min-w-0 flex-1 basis-0 flex-col rounded-xl border border-amber-500/20 bg-amber-950/10 p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-200/90">
                  Insecure API
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
                  Eğitim amaçlı zayıf uygulama. Kayıt, giriş ve kullanıcı uçlarında kasıtlı hatalar
                  bulunur; gerçek üretim sistemlerinde asla taklit edilmemelidir.
                </p>
              </div>

              <div className="flex min-h-[11rem] min-w-0 flex-1 basis-0 flex-col rounded-xl border border-sky-500/20 bg-sky-950/10 p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-sky-200/90">
                  Secure API
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
                  Referans savunma modeli: giriş doğrulama, nesne düzeyinde yetki ve veri minimizasyonu
                  gibi kontrollerle aynı rotalar daha güvenli şekilde sunulur.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 border-t border-slate-800/80 pt-8 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={handleOpenAuth}
                className="w-full max-w-sm rounded-xl bg-fortress-accent px-6 py-3.5 text-sm font-semibold text-fortress-950 shadow-lg shadow-sky-900/25 transition hover:bg-sky-300 sm:w-auto"
              >
                Giriş / Kayıt ile devam et
              </button>

              
            </div>
          </section>
        ) : null}

        {showAuthPanel ? (
          <div
            ref={authPanelRef}
            className="scroll-mt-24 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start"
          >
            <div className="order-2 lg:order-1">
              <AuthTabs />
            </div>

            <aside className="order-1 space-y-4 rounded-2xl border border-dashed border-slate-700/60 bg-fortress-950/30 p-5 text-sm text-slate-400 lg:order-2 lg:sticky lg:top-24">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Oturum adımları
              </p>
              <ol className="list-decimal space-y-2.5 pl-4 leading-relaxed">
                <li>Giriş veya Kayıt sekmesini seçin; istekler Secure API&apos;ye gider.</li>
                <li>Başarılı girişte Dashboard&apos;a yönlendirilirsiniz.</li>
                <li>Dashboard&apos;da Insecure / Secure modunu seçerek lab görevlerine devam edin.</li>
              </ol>
            </aside>
          </div>
        ) : null}
      </main>
    </div>
  );
}
