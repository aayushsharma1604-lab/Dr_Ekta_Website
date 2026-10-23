/**
 * API Client — unified fetch wrapper for Dr. Ekta Dental Care backend
 * Spec: OpenAPI 3.0.3 + docs/BACKEND_DOCUMENTATION.md §9-§10
 *
 * Conventions:
 * - Base URL via NEXT_PUBLIC_API_BASE (default http://localhost:4000/api)
 * - Errors shape: { error, code, details? } — surfaced as ApiError
 * - Pagination: { page, limit, total, pages }
 * - Auth: Authorization: Bearer <accessToken> (memory + localStorage for refresh)
 * - Refresh: POST /api/admin/auth/refresh with { refreshToken } on 401, retry once
 * - 429, 422 handled with details; 500 on known buggy routes treated as NOT_FOUND
 */

import { API_BASE } from "@/lib/config";
import type { ApiError } from "./types";

// ─── Token storage (client-only helpers) ──────────────────────────

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

let inMemoryAccessToken: string | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getAccessToken(): string | null {
  if (inMemoryAccessToken) return inMemoryAccessToken;
  if (isBrowser()) return localStorage.getItem(ACCESS_TOKEN_KEY);
  return null;
}

export function getRefreshToken(): string | null {
  if (isBrowser()) return localStorage.getItem(REFRESH_TOKEN_KEY);
  return null;
}

export function setTokens(accessToken: string, refreshToken: string): void {
  inMemoryAccessToken = accessToken;
  if (isBrowser()) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function setAccessToken(token: string): void {
  inMemoryAccessToken = token;
  if (isBrowser()) localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearTokens(): void {
  inMemoryAccessToken = null;
  if (isBrowser()) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

// Hydrate in-memory token from storage on client init
if (isBrowser()) {
  const stored = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (stored) inMemoryAccessToken = stored;
}

// ─── Error class ──────────────────────────────────────────────────

export class ApiClientError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// ─── Core fetch ───────────────────────────────────────────────────

type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  params?: Record<string, unknown>;
  /** Skip auth header even if token exists */
  skipAuth?: boolean;
  /** Do not attempt refresh on 401 */
  skipRefresh?: boolean;
  /** Raw response (for CSV/XML) */
  raw?: boolean;
};

function buildUrl(path: string, params?: FetchOptions["params"]): string {
  // path may be absolute (http://...) or relative (/api/...)
  const url = path.startsWith("http") ? new URL(path) : new URL(`${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      if (Array.isArray(value)) {
        value.forEach((v) => url.searchParams.append(key, String(v)));
      } else {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  // deduplicate concurrent refreshes
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        clearTokens();
        return false;
      }

      const data = (await res.json()) as {
        accessToken: string;
        refreshToken: string;
      };

      if (data.accessToken && data.refreshToken) {
        setTokens(data.accessToken, data.refreshToken);
        return true;
      }

      return false;
    } catch {
      clearTokens();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, skipAuth, skipRefresh, raw, headers: customHeaders, body, ...rest } = options;

  const url = buildUrl(path, params);

  const headers: Record<string, string> = {
    ...(customHeaders as Record<string, string>),
  };

  // JSON body handling
  let fetchBody: BodyInit | undefined;
  if (body !== undefined && body !== null) {
    if (body instanceof FormData || typeof body === "string") {
      fetchBody = body as BodyInit;
    } else {
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
      fetchBody = JSON.stringify(body);
    }
  } else if (!headers["Content-Type"] && rest.method && rest.method !== "GET") {
    // ensure JSON header for POST/PUT with empty body if needed
  }

  // Auth header
  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const doFetch = async (): Promise<Response> =>
    fetch(url, {
      ...rest,
      headers,
      body: fetchBody,
      credentials: "include",
    });

  let response = await doFetch();

  // 401 → try refresh once (admin routes)
  if (response.status === 401 && !skipAuth && !skipRefresh) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      const newToken = getAccessToken();
      if (newToken) headers["Authorization"] = `Bearer ${newToken}`;
      response = await doFetch();
    }
  }

  // raw passthrough for CSV/XML
  if (raw) {
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new ApiClientError(
        text || `Request failed with status ${response.status}`,
        response.status
      );
    }
    return (await response.text()) as unknown as T;
  }

  // No-content
  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const errData = data as ApiError | null;
    const message =
      (errData && (errData.error || (errData as unknown as { message: string }).message)) ||
      `Request failed with status ${response.status}`;
    const code = errData?.code;
    const details = (errData as ApiError)?.details;
    throw new ApiClientError(message, response.status, code, details);
  }

  return data as T;
}

// ─── Convenience wrappers ─────────────────────────────────────────

export const api = {
  get: <T>(path: string, options?: FetchOptions) =>
    apiFetch<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(path, { ...options, method: "POST", body }),

  put: <T>(path: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(path, { ...options, method: "PUT", body }),

  delete: <T>(path: string, options?: FetchOptions) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),

  patch: <T>(path: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(path, { ...options, method: "PATCH", body }),
};

// ─── Public / Admin helpers (prefix-aware) ────────────────────────

export const publicApi = {
  get: <T>(path: string, options?: FetchOptions) =>
    apiFetch<T>(`/public${path.startsWith("/") ? "" : "/"}${path}`, {
      ...options,
      method: "GET",
      skipAuth: true,
    }),
  post: <T>(path: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(`/public${path.startsWith("/") ? "" : "/"}${path}`, {
      ...options,
      method: "POST",
      body,
      skipAuth: true,
    }),
};

export const adminApi = {
  get: <T>(path: string, options?: FetchOptions) =>
    apiFetch<T>(`/admin${path.startsWith("/") ? "" : "/"}${path}`, {
      ...options,
      method: "GET",
    }),
  post: <T>(path: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(`/admin${path.startsWith("/") ? "" : "/"}${path}`, {
      ...options,
      method: "POST",
      body,
    }),
  put: <T>(path: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(`/admin${path.startsWith("/") ? "" : "/"}${path}`, {
      ...options,
      method: "PUT",
      body,
    }),
  delete: <T>(path: string, options?: FetchOptions) =>
    apiFetch<T>(`/admin${path.startsWith("/") ? "" : "/"}${path}`, {
      ...options,
      method: "DELETE",
    }),
};

// ─── Next.js fetch helper for Server Components (no auth, cached) ─
// Use for public data in server components with revalidation

export async function serverFetch<T>(
  path: string,
  options: {
    params?: FetchOptions["params"];
    revalidate?: number | false;
    tags?: string[];
  } = {}
): Promise<T> {
  const url = buildUrl(path, options.params);
  const res = await fetch(url, {
    next: {
      revalidate: options.revalidate ?? 300,
      tags: options.tags,
    },
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    const errData = data as ApiError | null;
    const message =
      (errData && errData.error) || `Request failed with status ${res.status}`;
    throw new ApiClientError(message, res.status, errData?.code, (errData as ApiError)?.details);
  }

  return (await res.json()) as T;
}
