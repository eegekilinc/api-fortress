import type { ApiErrorBody, HealthResponse } from "@/types";

const DEFAULT_INSECURE = "http://127.0.0.1:5001";
const DEFAULT_SECURE = "http://127.0.0.1:5002";

/**
 * Docker .env servis adları (api_insecure / api_secure) tarayıcıda çözülmez;
 * Vite dev proxy (/__api_*) üzerinden aynı origin'e yönlendirilir.
 */
function normalizeApiBase(url: string): string {
  if (typeof window === "undefined") return url;
  if (url.startsWith("/")) {
    const base = url.replace(/\/+$/, "");
    return `${window.location.origin}${base}`;
  }
  try {
    const { hostname } = new URL(url);
    if (hostname === "api_insecure") {
      return `${window.location.origin}/__api_insecure`;
    }
    if (hostname === "api_secure") {
      return `${window.location.origin}/__api_secure`;
    }
  } catch {
    /* ignore */
  }
  return url;
}

export function getInsecureApiBase(): string {
  const raw = import.meta.env.VITE_API_INSECURE_URL || DEFAULT_INSECURE;
  return normalizeApiBase(raw);
}

export function getSecureApiBase(): string {
  const raw = import.meta.env.VITE_API_SECURE_URL || DEFAULT_SECURE;
  return normalizeApiBase(raw);
}

function joinUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

function parseJsonBody(text: string): unknown {
  try {
    return text ? (JSON.parse(text) as unknown) : null;
  } catch {
    throw new Error("Sunucudan geçersiz JSON yanıtı alındı.");
  }
}

function errorFromBody(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "error" in data) {
    return String((data as ApiErrorBody).error || "") || fallback;
  }
  return fallback;
}

export type PostJsonOptions = {
  token?: string | null;
};

export async function postJson<TResponse>(
  baseUrl: string,
  path: string,
  body: unknown,
  options?: PostJsonOptions
): Promise<TResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const token = options?.token;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(joinUrl(baseUrl, path), {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const text = await res.text();
  const data = parseJsonBody(text);

  if (!res.ok) {
    throw new Error(errorFromBody(data, `İstek başarısız (${res.status})`));
  }

  return data as TResponse;
}

export type GetJsonOptions = {
  token?: string | null;
};

export async function getJson<TResponse>(
  baseUrl: string,
  path: string,
  options?: GetJsonOptions
): Promise<TResponse> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = options?.token;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(joinUrl(baseUrl, path), { method: "GET", headers });
  const text = await res.text();
  const data = parseJsonBody(text);

  if (!res.ok) {
    throw new Error(errorFromBody(data, `İstek başarısız (${res.status})`));
  }

  return data as TResponse;
}

export type DeleteJsonOptions = {
  token?: string | null;
};

export async function deleteJson<TResponse>(
  baseUrl: string,
  path: string,
  options?: DeleteJsonOptions
): Promise<TResponse> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = options?.token;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(joinUrl(baseUrl, path), { method: "DELETE", headers });
  const text = await res.text();
  const data = text ? parseJsonBody(text) : null;

  if (!res.ok) {
    throw new Error(errorFromBody(data, `İstek başarısız (${res.status})`));
  }

  return (data ?? {}) as TResponse;
}

/** Genel sağlık kontrolü — kimlik gerektirmez */
export async function fetchHealth(baseUrl: string): Promise<HealthResponse> {
  return getJson<HealthResponse>(baseUrl, "/health", {});
}
