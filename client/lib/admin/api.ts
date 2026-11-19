/**
 * Browser-side client for the dashboard API (NestJS). It is the only place in the admin that talks to the network:
 * every call goes to `/api/...` on this site, which next.config.ts forwards to the server, so the session cookie
 * stays first-party. The server wraps every reply as `{ success, data, meta? }` and every failure as `{ success: false, error }`.
 */

import {
  ClientInputValidationError,
  sanitizeAndValidatePayload,
  validateUploadFileBeforeSend,
} from "@/lib/security/sanitize";

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: string[];

  constructor(status: number, code: string, message: string, details: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** One readable sentence for the UI: the message plus the validation details the server listed. */
  get readable() {
    return this.details.length ? `${this.message} ${this.details.join(" · ")}` : this.message;
  }
}

const BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "").replace(/\/$/, "");

let onUnauthorized: (() => void) | null = null;
/** The console registers a callback so any expired session sends the owner back to the sign-in screen. */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

type Envelope<T> = { success: true; data: T; meta?: PaginationMeta } | { success: false; error: { code?: string; statusCode?: number; message?: string; details?: unknown } };

async function request<T>(path: string, init: RequestInit = {}): Promise<{ data: T; meta?: PaginationMeta }> {
  const headers = new Headers(init.headers);
  const isForm = typeof FormData !== "undefined" && init.body instanceof FormData;
  if (init.body && !isForm && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  let response: Response;
  try {
    response = await fetch(`${BASE}/api${path}`, { ...init, headers, credentials: "same-origin" });
  } catch {
    throw new ApiError(0, "NETWORK", "The server could not be reached. Check that the API is running.");
  }

  let body: Envelope<T> | null = null;
  try {
    body = (await response.json()) as Envelope<T>;
  } catch {
    body = null;
  }

  if (!response.ok || !body || body.success === false) {
    const error = body && body.success === false ? body.error : undefined;
    const details = Array.isArray(error?.details) ? error.details.map(String) : [];
    const failure = new ApiError(response.status, error?.code ?? "ERROR", error?.message ?? `Request failed (${response.status}).`, details);
    if (response.status === 401 && path !== "/auth/login") onUnauthorized?.();
    throw failure;
  }
  return { data: body.data, meta: body.meta };
}

async function requestJson<T>(path: string, method: string, body?: unknown): Promise<{ data: T; meta?: PaginationMeta }> {
  let serializedBody: string | undefined;
  if (body !== undefined) {
    try {
      serializedBody = JSON.stringify(sanitizeAndValidatePayload(body));
    } catch (error) {
      if (error instanceof ClientInputValidationError) {
        throw new ApiError(400, "VALIDATION_ERROR", error.message);
      }
      throw error;
    }
  }
  return request<T>(path, { method, body: serializedBody });
}

export type AdminSession = { email: string; role: string; authenticated: boolean };

export const authApi = {
  login: (email: string, password: string) => requestJson<{ user: { email: string; role: string } }>("/auth/login", "POST", { email, password }).then((r) => r.data),
  logout: () => requestJson<unknown>("/auth/logout", "POST").then((r) => r.data),
  me: () => request<AdminSession>("/auth/me").then((r) => r.data),
};

export type ApiRecord = Record<string, unknown> & { id?: string };

export const resourceApi = {
  /** Reads every page of a paginated collection (the server caps a page at 100). */
  async listAll(path: string): Promise<ApiRecord[]> {
    const items: ApiRecord[] = [];
    for (let page = 1; page <= 20; page++) {
      const { data, meta } = await request<ApiRecord[]>(`${path}${path.includes("?") ? "&" : "?"}page=${page}&limit=100`);
      items.push(...data);
      if (!meta?.hasNextPage) break;
    }
    return items;
  },
  list: (path: string) => request<ApiRecord[]>(path).then((r) => r.data),
  page: (path: string, page: number, limit: number) => request<ApiRecord[]>(`${path}${path.includes("?") ? "&" : "?"}page=${page}&limit=${limit}`),
  get: (path: string) => request<ApiRecord>(path).then((r) => r.data),
  create: (path: string, payload: unknown) => requestJson<ApiRecord>(path, "POST", payload).then((r) => r.data),
  update: (path: string, payload: unknown) => requestJson<ApiRecord>(path, "PATCH", payload).then((r) => r.data),
  remove: (path: string) => requestJson<unknown>(path, "DELETE").then((r) => r.data),
};

/* ------------------------------------------------------------------------------- platform settings & translation */

export type LangCode = "en" | "ar" | "tr";
export type SettingsTranslation = { siteName?: string; siteTagline?: string; seoTitle?: string; seoDescription?: string; maintenanceTitle?: string; maintenanceMessage?: string };

export type PlatformSettings = {
  siteName: string;
  siteTagline?: string;
  defaultLanguage: LangCode;
  logoUrl?: string;
  faviconUrl?: string;
  seo: { defaultTitle: string; defaultDescription: string; ogImageUrl?: string };
  features: { contactFormEnabled: boolean; projectsEnabled: boolean; publicationsEnabled: boolean; servicesEnabled: boolean };
  maintenance: { enabled: boolean; title: string; message: string; estimatedReturnAt?: string; allowAdminBypass: boolean };
  translations?: { ar?: SettingsTranslation; tr?: SettingsTranslation };
};

/** What the settings endpoint accepts: the same shape, with the maintenance switch handled by its own endpoint. */
export type PlatformSettingsPatch = Omit<Partial<PlatformSettings>, "maintenance"> & { maintenance?: Partial<Omit<PlatformSettings["maintenance"], "enabled">> };

export const settingsApi = {
  get: () => request<PlatformSettings>("/settings").then((r) => r.data),
  update: (payload: PlatformSettingsPatch) => requestJson<PlatformSettings>("/settings", "PATCH", payload).then((r) => r.data),
  maintenance: () => request<PlatformSettings["maintenance"]>("/settings/maintenance").then((r) => r.data),
  setMaintenance: (payload: { enabled: boolean; title?: string; message?: string; estimatedReturnAt?: string }) =>
    requestJson<PlatformSettings["maintenance"]>("/settings/maintenance", "PATCH", payload).then((r) => r.data),
};

export type TranslationLanguage = { code: string; name: string; nativeName: string; rtl: boolean; enabled: boolean };
export type TranslationProvider = "openai_compatible" | "gemini";
export type TranslationFormat = "natural" | "formal" | "technical" | "concise";

export type TranslationSettings = {
  enabled: boolean;
  provider: TranslationProvider;
  apiBaseUrl: string;
  hasApiKey: boolean;
  apiKeyMasked: string | null;
  model: string;
  outputFormat: TranslationFormat;
  systemPrompt: string;
  customInstructions: string;
  temperature: number;
  timeoutMs: number;
  supportedLanguages: TranslationLanguage[];
};

export type TranslationSettingsPatch = Partial<Omit<TranslationSettings, "hasApiKey" | "apiKeyMasked">> & { apiKey?: string };

export const translationApi = {
  settings: () => request<TranslationSettings>("/translation/settings").then((r) => r.data),
  update: (payload: TranslationSettingsPatch) => requestJson<TranslationSettings>("/translation/settings", "PATCH", payload).then((r) => r.data),
  test: (payload: { provider?: TranslationProvider; apiBaseUrl?: string; apiKey?: string; model?: string }) =>
    requestJson<{ ok: boolean; provider: TranslationProvider; model: string; latencyMs: number; message: string }>("/translation/test", "POST", payload).then((r) => r.data),
  /** Each field is `{ en: "text", ar?: "already translated" }`; the server fills only the languages that are missing. */
  translate: (payload: { fields: Record<string, Record<string, string>>; sourceLanguage?: string; targetLanguages?: string[] }) =>
    requestJson<{ fields: Record<string, Record<string, string>>; translatedLanguageCount: number }>("/translation/translate", "POST", payload).then((r) => r.data),
};

export type BackupDestinationType = "webhook" | "google_drive";

export type BackupSettings = {
  destinationType: BackupDestinationType;
  targetUrl: string;
  authHeaderName: string;
  hasSecret: boolean;
  secretMasked: string | null;
  driveFolderId: string;
  includeContactMessages: boolean;
  lastBackupAt?: string;
  lastBackupStatus?: "success" | "error";
  lastBackupMessage?: string;
  lastBackupSizeBytes?: number;
};

export type BackupSettingsPatch = Partial<
  Pick<BackupSettings, "destinationType" | "targetUrl" | "authHeaderName" | "driveFolderId" | "includeContactMessages">
> & { authSecret?: string };

export type BackupSnapshot = {
  filename: string;
  meta: {
    version: string;
    service: string;
    exportedAt: string;
    totalRecords: number;
    totalAssets: number;
    counts: Record<string, number>;
  };
  database: Record<string, unknown>;
  assets: Array<{
    storagePath: string;
    category: "images" | "videos" | "documents";
    filename: string;
    mimeType: string;
    sizeBytes: number;
    sha256: string;
  }>;
};

export type BackupRunResult = {
  ok: boolean;
  filename: string;
  destinationType: BackupDestinationType;
  sizeBytes: number;
  uploadedAt: string;
  uploadedAssetsCount: number;
  message: string;
  remoteId?: string;
};

export const backupApi = {
  settings: () => request<BackupSettings>("/backup/settings").then((r) => r.data),
  update: (payload: BackupSettingsPatch) => requestJson<BackupSettings>("/backup/settings", "PATCH", payload).then((r) => r.data),
  exportSnapshot: () => request<BackupSnapshot>("/backup/export").then((r) => r.data),
  runRemote: () => requestJson<BackupRunResult>("/backup/run", "POST").then((r) => r.data),
};

export type UploadedFile = {
  filename: string;
  originalName: string;
  category: "images" | "videos" | "documents";
  mimeType: string;
  size: number;
  url: string;
};

/**
 * Sends one file with real progress (fetch cannot report upload progress, XMLHttpRequest can) and cancellation.
 * It has the shape the form components expect from an `upload` function, so it can be handed to them directly.
 */
function uploadWithProgress(file: File, controls?: { onProgress?: (percent: number) => void; signal?: AbortSignal }): Promise<UploadedFile> {
  try {
    validateUploadFileBeforeSend(file);
  } catch (error) {
    if (error instanceof ClientInputValidationError) {
      return Promise.reject(new ApiError(400, "BAD_REQUEST", error.message));
    }
    return Promise.reject(error);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE}/api/uploads`);
    xhr.withCredentials = true;
    xhr.responseType = "json";

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) controls?.onProgress?.(Math.min(99, Math.round((event.loaded / event.total) * 100)));
    };
    xhr.onerror = () => reject(new ApiError(0, "NETWORK", "The server could not be reached. Check that the API is running."));
    xhr.onabort = () => reject(new DOMException("Upload cancelled", "AbortError"));
    xhr.onload = () => {
      const body = xhr.response as Envelope<UploadedFile> | null;
      if (xhr.status >= 200 && xhr.status < 300 && body && body.success) {
        controls?.onProgress?.(100);
        resolve(body.data);
        return;
      }
      const error = body && body.success === false ? body.error : undefined;
      const details = Array.isArray(error?.details) ? error.details.map(String) : [];
      const failure = new ApiError(xhr.status, error?.code ?? "ERROR", error?.message ?? `Upload failed (${xhr.status}).`, details);
      if (xhr.status === 401) onUnauthorized?.();
      reject(failure);
    };

    controls?.signal?.addEventListener("abort", () => xhr.abort(), { once: true });
    const form = new FormData();
    form.append("file", file);
    xhr.send(form);
  });
}

export const uploadApi = {
  upload: uploadWithProgress,
  remove: (category: string, filename: string) => requestJson<unknown>(`/uploads/${category}/${filename}`, "DELETE").then((r) => r.data),
};
