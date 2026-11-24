import { useState } from "react";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";

type Tab = "login" | "register";

export default function AuthTabs() {
  const [tab, setTab] = useState<Tab>("login");

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700/70 bg-fortress-900/50 shadow-card backdrop-blur-sm">
      <div
        className="flex border-b border-slate-800/90 bg-fortress-950/80 p-1.5"
        role="tablist"
        aria-label="Oturum sekmeleri"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "login"}
          onClick={() => setTab("login")}
          className={`relative flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            tab === "login"
              ? "bg-fortress-800 text-white shadow-md ring-1 ring-slate-600/50"
              : "text-slate-400 hover:bg-fortress-900/60 hover:text-slate-200"
          }`}
        >
          Giriş yap
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "register"}
          onClick={() => setTab("register")}
          className={`relative flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            tab === "register"
              ? "bg-fortress-800 text-white shadow-md ring-1 ring-slate-600/50"
              : "text-slate-400 hover:bg-fortress-900/60 hover:text-slate-200"
          }`}
        >
          Kayıt ol
        </button>
      </div>

      <div className="p-6 sm:p-8" role="tabpanel">
        {tab === "login" ? (
          <LoginForm layout="tabbed" />
        ) : (
          <RegisterForm layout="tabbed" />
        )}
      </div>
    </div>
  );
}
