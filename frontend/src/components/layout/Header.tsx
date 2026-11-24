import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "@/lib/constants";

type Props = {
  variant?: "auth" | "dashboard";
  onLogout?: () => void;
  onAuthOpen?: () => void;
  authPanelOpen?: boolean;
  isAdmin?: boolean;
};

export default function Header({
  variant = "auth",
  onLogout,
  onAuthOpen,
  authPanelOpen = false,
  isAdmin = false,
}: Props) {
  const { pathname } = useLocation();
  const isAdminPage = pathname === ROUTES.admin;

  return (
    <header className="border-b border-slate-800/80 bg-fortress-900/40 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
            API Fortress
          </h1>
          <p className="text-sm text-slate-400">Güvenlik laboratuvarı — Hacker vs Defender</p>
        </div>

        <nav className="flex shrink-0 flex-wrap items-center justify-end gap-3 text-sm">
          {variant === "dashboard" ? (
            <>
              {isAdmin ? (
                <Link
                  to={isAdminPage ? ROUTES.dashboard : ROUTES.admin}
                  className="rounded-lg border border-slate-600 px-3 py-1.5 text-slate-200 transition hover:border-slate-500 hover:bg-fortress-800"
                >
                  {isAdminPage ? "Dashboard" : "Admin"}
                </Link>
              ) : null}
              {onLogout ? (
                <button
                  type="button"
                  onClick={onLogout}
                  className="rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-1.5 text-red-100 transition hover:border-red-400/60 hover:bg-red-950/50"
                >
                  Çıkış
                </button>
              ) : (
                <Link
                  to={ROUTES.auth}
                  className="rounded-lg border border-slate-600 px-3 py-1.5 text-slate-200 transition hover:border-slate-500 hover:bg-fortress-800"
                >
                  Oturum
                </Link>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={() => onAuthOpen?.()}
              className={`rounded-lg border px-3 py-1.5 font-medium transition ${
                authPanelOpen
                  ? "border-fortress-accent/55 bg-fortress-accent/15 text-fortress-accent shadow-sm ring-1 ring-fortress-accent/35 hover:bg-fortress-accent/20"
                  : "border-slate-500 bg-fortress-800 text-slate-100 hover:border-slate-400 hover:bg-fortress-800/90"
              }`}
            >
              Giriş / Kayıt
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
