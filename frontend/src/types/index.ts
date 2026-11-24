export type ApiMode = "insecure" | "secure";

export type CtfTaskStatus = "coming_soon" | "locked" | "open";

export type CtfDifficulty = "Kolay" | "Orta" | "İleri";

export interface CtfTask {
  id: string;
  title: string;
  description: string;
  /** Kart üzerinde kısa etiket */
  tag: string;
  /** Zafiyet sınıfı (ör. Mass Assignment) */
  vulnerabilityType: string;
  /** İlgili HTTP endpoint veya rota */
  targetEndpoint: string;
  difficulty: CtfDifficulty;
  status: CtfTaskStatus;
  /** Insecure API’de gözlenen / beklenen davranış */
  insecureExpected: string;
  /** Secure API’de gözlenen / beklenen davranış */
  secureExpected: string;
  /** Laboratuvar: görevin öğrenme hedefi */
  goal: string;
  /** Laboratuvar: adım adım veya mantıksal yönlendirme */
  procedure: string;
  /** Laboratuvar: örnek HTTP gövdesi / başlık / yol (metin) */
  exampleRequest: string;
  /** Laboratuvar: görevin tamamlanmış sayılması için ölçüt */
  successCriteria: string;
  /** Laboratuvar: secure implementasyonda savunma gerekçesi */
  whyBlockedOnSecure: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface LoginResponseBody {
  access_token: string;
  warning?: string;
}

export interface RegisterRequestBody {
  email: string;
  password: string;
}

export interface RegisterResponseBody {
  message: string;
  warning?: string;
}

export interface ApiErrorBody {
  error?: string;
}

/** GET /users/me yanıtı */
export interface UserMeResponse {
  id: number;
  email: string;
  is_admin?: boolean;
}

/** GET /health yanıtı */
export interface HealthResponse {
  status: string;
  service: string;
}

/** GET /progress/me ve POST /progress/complete yanıtı */
export interface ProgressMeResponse {
  completed: string[];
}

/** GET /admin/users-progress öğesi */
export interface AdminUserProgress {
  id: number;
  email: string;
  is_admin: boolean;
  completed_tasks: string[];
  completed_count: number;
  total_count: number;
  completed_at: Record<string, string>;
}
