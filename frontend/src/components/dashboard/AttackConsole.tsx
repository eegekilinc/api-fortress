import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ApiMode, CtfTask } from "@/types";
import { readAccessToken } from "@/lib/constants";

type Props = {
  task: CtfTask;
  mode: ApiMode;
  baseUrl: string;
  onTaskCompleted?: (taskId: string) => void;
};

const PROMPT = "api-fortress@lab:~$";

const JSON_BODY_ERROR =
  "JSON gövdesi okunamadı. BODY sonrası geçerli JSON yazmalısınız.";

type ParsedHttpCommand = {
  method: "GET" | "POST" | "DELETE";
  path: string;
  headers: Record<string, string>;
  bodyJson?: string;
};

function parseMethodAndPath(targetEndpoint: string): { method: string; path: string } {
  const t = targetEndpoint.trim();
  const parts = t.split(/\s+/);
  if (parts.length >= 2 && /^[A-Z]+$/i.test(parts[0] ?? "")) {
    const method = (parts[0] ?? "GET").toUpperCase();
    const path = parts.slice(1).join(" ").replace("<id>", "1").replace("<token>", "<access_token>");
    return { method, path: path.startsWith("/") ? path : `/${path}` };
  }
  return { method: "—", path: t };
}

function joinUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

const USERS_ID_PATH = /^\/users\/\d+$/;

function taskHintLines(taskId: string): string[] {
  switch (taskId) {
    case "mass-assignment":
      return [
        "Bu saldırı mevcut hesabı sonradan admin yapmaz.",
        "Yeni kullanıcı kayıt olurken is_admin:true gönderilirse Insecure API bunu kabul eder.",
        "Aynı email zaten kayıtlıysa farklı bir email deneyin.",
        "",
        "Hedef: Kayıt sırasında ekstra yetki alanı göndermeyi dene.",
        "Format: POST /auth/register BODY {json}",
        "İpucu: is_admin alanını istemci gövdesinde göndermeyi dene.",
      ];
    case "auth-bypass":
      return [
        "Hedef: Gizli header ile parola kontrolünü atlamayı dene.",
        "Format: POST /auth/login HEADER X-Magic-World=... BODY {json}",
        "İpucu: Doğru sihirli kelime abracadabra olabilir.",
      ];
    case "login-logic-flaw":
      return [
        "Hedef: Parola alanı olmadan giriş yapmayı dene.",
        "Format: POST /auth/login BODY {json}",
        "İpucu: JSON içinde sadece email göndermeyi dene.",
      ];
    case "idor-bola":
      return [
        "Hedef: Başka bir kullanıcı id’sini okumayı dene.",
        "Format: GET /users/{id}",
        "İpucu: /users/1 gibi farklı id deneyebilirsin.",
      ];
    case "bfla":
      return [
        "Hedef: Yetkin olmadan kritik silme işlemini dene.",
        "Format: DELETE /users/{id}",
        "İpucu: Normal kullanıcı token’ı ile /users/1 silmeyi dene.",
      ];
    default:
      return ["Bu görev için ek ipucu tanımlı değil. Görev açıklamasını okuyun."];
  }
}

function buildBootstrapHistory(
  task: CtfTask,
  baseUrl: string,
  method: string,
  path: string
): string[] {
  return [
    "API Fortress lab terminali — HTTP komut modu.",
    `Görev: ${task.title}`,
    `Görev hedefi (referans): ${task.targetEndpoint}`,
    `HTTP (referans): ${method} ${path}`,
    `baseUrl: ${baseUrl}`,
    "",
    "--- Bu görev için ipuçları ---",
    ...taskHintLines(task.id),
    "",
    "--- Desteklenen komut formatları ---",
    "GET /users/1",
    "DELETE /users/1",
    task.id === "mass-assignment"
      ? 'POST /auth/register BODY {"email":"mass_lab@test.com","password":"123456","is_admin":true}'
      : 'POST /auth/register BODY {"email":"lab@test.com","password":"123456","is_admin":true}',
    'POST /auth/login HEADER X-Magic-World=abracadabra BODY {"email":"admin@fortress.com","password":"wrong-password"}',
    'POST /auth/login BODY {"email":"admin@fortress.com"}',
    "",
    "GET ve DELETE /users/... isteklerinde Bearer token otomatik eklenir (giriş gerekir).",
    "Gerçek shell yok; yalnızca yukarıdaki HTTP satırı biçimi parse edilir. Komutu yazıp Enter’a basın.",
  ];
}

function parseLabHttpLine(line: string): { ok: true; cmd: ParsedHttpCommand } | { ok: false; message: string } {
  const trimmed = line.trim();
  const first = trimmed.match(/^(GET|POST|DELETE)\s+(\S+)([\s\S]*)$/i);
  if (!first) {
    return {
      ok: false,
      message:
        "Satır bir HTTP metodu ile başlamalıdır: GET, POST veya DELETE. Örnek: GET /users/1 veya POST /auth/login BODY {...}",
    };
  }

  const method = first[1].toUpperCase() as "GET" | "POST" | "DELETE";
  const rawPath = first[2] ?? "";
  const tail = (first[3] ?? "").trim();

  if (!rawPath.startsWith("/")) {
    return {
      ok: false,
      message: "Yol '/' ile başlamalıdır. Örnek: /auth/login veya /users/1",
    };
  }

  if (method === "GET" || method === "DELETE") {
    if (tail.length > 0) {
      return {
        ok: false,
        message: `${method} istekleri yalnızca yol içerir; HEADER veya BODY eklenemez. Örnek: ${method} /users/1`,
      };
    }
    return { ok: true, cmd: { method, path: rawPath, headers: {} } };
  }

  const bodyKw = /(^|\s)BODY\s+/i.exec(tail);
  if (!bodyKw) {
    return {
      ok: false,
      message:
        "POST için BODY anahtar kelimesinden sonra geçerli bir JSON gövdesi gerekir. Örnek: POST /auth/register BODY {\"email\":\"a@b.com\",\"password\":\"123456\"}",
    };
  }

  const headerPart = tail.slice(0, bodyKw.index).trim();
  const jsonPart = tail.slice(bodyKw.index + bodyKw[0].length).trim();

  if (!jsonPart) {
    return { ok: false, message: JSON_BODY_ERROR };
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(jsonPart) as unknown;
  } catch {
    return { ok: false, message: JSON_BODY_ERROR };
  }

  const headers: Record<string, string> = {};
  let hs = headerPart;

  while (hs.length > 0) {
    const hm = hs.match(/^\s*HEADER\s+(\S+?)=(\S+)/i);
    if (!hm) {
      return {
        ok: false,
        message:
          "HEADER bölümü okunamadı. Biçim: HEADER Ad=değer (BODY öncesi, tekrarlanabilir). Örnek: HEADER X-Magic-World=abracadabra",
      };
    }
    headers[hm[1]] = hm[2];
    hs = hs.slice(hm[0].length).trim();
  }

  return {
    ok: true,
    cmd: {
      method,
      path: rawPath,
      headers,
      bodyJson: JSON.stringify(parsedBody),
    },
  };
}

function validateForTask(
  taskId: string,
  cmd: ParsedHttpCommand
): { ok: true } | { ok: false; message: string } {
  const { method, path } = cmd;

  switch (taskId) {
    case "mass-assignment":
      if (method !== "POST" || path !== "/auth/register") {
        return {
          ok: false,
          message:
            "Bu görevde yalnızca POST /auth/register desteklenir. Kayıt uç noktasına BODY ile JSON gönderin (ör. is_admin alanı).",
        };
      }
      return { ok: true };
    case "auth-bypass":
    case "login-logic-flaw":
      if (method !== "POST" || path !== "/auth/login") {
        return {
          ok: false,
          message:
            "Bu görevde yalnızca POST /auth/login desteklenir. İpucundaki header veya gövde farkını kullanın.",
        };
      }
      return { ok: true };
    case "idor-bola":
      if (method !== "GET" || !USERS_ID_PATH.test(path)) {
        return {
          ok: false,
          message:
            "Bu görevde yalnızca GET /users/{sayısal_id} desteklenir. Örnek: GET /users/1",
        };
      }
      return { ok: true };
    case "bfla":
      if (method !== "DELETE" || !USERS_ID_PATH.test(path)) {
        return {
          ok: false,
          message:
            "Bu görevde yalnızca DELETE /users/{sayısal_id} desteklenir. Örnek: DELETE /users/1",
        };
      }
      return { ok: true };
    default:
      return {
        ok: false,
        message:
          "Bu görev kimliği için lab doğrulaması tanımlı değil. Bilinen CTF görevlerinden birini seçin.",
      };
  }
}

function gradeLab(taskId: string, mode: ApiMode, status: number, json: unknown): string {
  const insecure = mode === "insecure";
  const defenseCodes = [400, 401, 403];

  if (insecure) {
    switch (taskId) {
      case "mass-assignment":
        if (status >= 200 && status < 300) {
          return "✅ Exploit başarılı: Insecure API zafiyeti tetiklendi.";
        }
        break;
      case "auth-bypass":
      case "login-logic-flaw":
        if (
          status === 200 &&
          json &&
          typeof json === "object" &&
          "access_token" in json &&
          typeof (json as { access_token?: unknown }).access_token === "string"
        ) {
          return "✅ Exploit başarılı: Insecure API zafiyeti tetiklendi.";
        }
        break;
      case "idor-bola":
        if (status === 200) {
          return "✅ Exploit başarılı: Insecure API zafiyeti tetiklendi.";
        }
        break;
      case "bfla":
        if (status >= 200 && status < 300) {
          return "✅ Exploit başarılı: Insecure API zafiyeti tetiklendi.";
        }
        break;
    }
  } else if (defenseCodes.includes(status)) {
    return "🛡️ Savunma başarılı: Secure API saldırıyı engelledi.";
  }

  return "⚠️ Beklenen sonuç alınamadı.";
}

function needsUsersBearer(path: string): boolean {
  return USERS_ID_PATH.test(path);
}

async function executeParsedCommand(
  cmd: ParsedHttpCommand,
  baseUrl: string,
  taskId: string,
  mode: ApiMode,
  onTaskCompleted?: (taskId: string) => void
): Promise<string[]> {
  const out: string[] = [];
  const { method, path } = cmd;

  if (needsUsersBearer(path)) {
    const token = readAccessToken();
    if (!token) {
      out.push("Token bulunamadı. Önce giriş yapmalısınız.");
      return out;
    }
  }

  const headers: Record<string, string> = { Accept: "application/json", ...cmd.headers };
  let body: string | undefined;

  if (method === "POST") {
    headers["Content-Type"] = "application/json";
    body = cmd.bodyJson;
  }

  if (needsUsersBearer(path)) {
    const token = readAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const url = joinUrl(baseUrl, path);
  out.push(`→ Request gönderiliyor: ${method} ${url}`);

  try {
    const res = await fetch(url, {
      method,
      headers,
      body,
    });

    const text = await res.text();
    out.push(`→ HTTP ${res.status}`);

    let parsed: unknown = null;
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("application/json") && text) {
      try {
        parsed = JSON.parse(text) as unknown;
        out.push(JSON.stringify(parsed, null, 2));
      } catch {
        out.push(text.length > 4000 ? `${text.slice(0, 4000)}…` : text);
      }
    } else if (text) {
      out.push(text.length > 4000 ? `${text.slice(0, 4000)}…` : text);
    }

    const gradeLine = gradeLab(taskId, mode, res.status, parsed);
    out.push(gradeLine);
    if (
      gradeLine.startsWith("✅") ||
      gradeLine.startsWith("🛡️")
    ) {
      onTaskCompleted?.(taskId);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    out.push(`→ İstek hatası: ${msg}`);
    out.push("⚠️ Beklenen sonuç alınamadı.");
  }

  return out;
}

export default function AttackConsole({ task, mode, baseUrl, onTaskCompleted }: Props) {
  const { method, path } = useMemo(() => parseMethodAndPath(task.targetEndpoint), [task.targetEndpoint]);

  const [history, setHistory] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentInput("");
    setHistory(buildBootstrapHistory(task, baseUrl, method, path));
  }, [task.id, task.title, task.targetEndpoint, baseUrl, method, path]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [history]);

  const handleSubmit = useCallback(() => {
    const trimmed = currentInput.trim();
    if (!trimmed) {
      setHistory((h) => [...h, "Komut girilmedi. Aşağıdaki biçimlerden birinde HTTP satırı yazıp Enter’a basın."]);
      return;
    }

    const cmdLine = `${PROMPT} ${trimmed}`;
    setHistory((h) => [...h, cmdLine]);
    setCurrentInput("");

    const parsed = parseLabHttpLine(trimmed);
    if (!parsed.ok) {
      setHistory((h) => [...h, `→ ${parsed.message}`]);
      return;
    }

    const allowed = validateForTask(task.id, parsed.cmd);
    if (!allowed.ok) {
      setHistory((h) => [...h, `→ ${allowed.message}`]);
      return;
    }

    void (async () => {
      const lines = await executeParsedCommand(parsed.cmd, baseUrl, task.id, mode, onTaskCompleted);
      setHistory((h) => [...h, ...lines]);
    })();
  }, [currentInput, mode, baseUrl, task.id, onTaskCompleted]);

  const handleClear = useCallback(() => {
    setHistory([]);
    setCurrentInput("");
  }, []);

  const modeInsecure = mode === "insecure";

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-emerald-900/40 bg-black shadow-inner ring-1 ring-emerald-950/50">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/90 bg-slate-950/90 px-4 py-3">
        <h3 className="text-sm font-semibold tracking-tight text-emerald-100/95">
          Saldırı Simülasyonu Terminali
        </h3>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
            modeInsecure
              ? "bg-amber-500/20 text-amber-200 ring-1 ring-amber-500/35"
              : "bg-sky-500/20 text-sky-100 ring-1 ring-sky-500/35"
          }`}
        >
          {modeInsecure ? "Insecure" : "Secure"}
        </span>
      </div>

      <div className="space-y-2 border-b border-slate-800/80 bg-slate-950/60 px-4 py-3 font-mono text-[11px] text-slate-400">
        <p className="break-all">
          <span className="font-medium text-slate-500">Hedef (görev):</span>{" "}
          <span className="text-emerald-300/90">{task.targetEndpoint}</span>
        </p>
        <p className="break-all">
          <span className="font-medium text-slate-500">HTTP:</span>{" "}
          <span className="text-cyan-300/85">{method}</span>{" "}
          <span className="text-emerald-300/85">{path}</span>
        </p>
        <p className="break-all">
          <span className="font-medium text-slate-500">baseUrl:</span>{" "}
          <span className="text-sky-300/85">{baseUrl}</span>
        </p>
      </div>

      <div
        ref={scrollRef}
        className="max-h-52 overflow-y-auto bg-black px-3 py-3 font-mono text-[11px] leading-relaxed text-emerald-400/95"
        aria-live="polite"
      >
        {history.map((line, i) => {
          const isPromptLine = line.startsWith(PROMPT);
          const isArrow = line.startsWith("→");
          const isGrade =
            line.startsWith("✅") || line.startsWith("🛡️") || line.startsWith("⚠️");
          return (
            <div
              key={i}
              className={`whitespace-pre-wrap break-words py-0.5 ${
                isPromptLine
                  ? "text-cyan-300/90"
                  : isArrow || isGrade
                    ? "text-emerald-300/85"
                    : "text-emerald-500/80"
              }`}
            >
              {line}
            </div>
          );
        })}
      </div>

      <div className="border-t border-slate-800/90 bg-black px-3 py-2">
        <label className="sr-only" htmlFor="attack-console-input">
          Terminal komutu
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded border border-emerald-900/50 bg-black/90 px-2 py-1.5 font-mono text-[11px]">
            <span className="shrink-0 text-cyan-300/90">{PROMPT}</span>
            <input
              id="attack-console-input"
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              className="min-w-0 flex-1 border-0 bg-transparent py-0.5 text-emerald-200 outline-none ring-0"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 rounded border border-slate-600 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
          >
            Temizle
          </button>
        </div>
        <p className="mt-2 text-[10px] text-slate-600">
          Lab HTTP satırı (GET/DELETE yol veya POST … BODY JSON); Enter ile gönderilir. Shell yoktur.
        </p>
      </div>
    </div>
  );
}
