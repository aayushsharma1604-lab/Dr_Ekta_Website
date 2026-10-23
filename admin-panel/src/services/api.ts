import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

/**
 * Axios instance for admin-panel.
 * baseURL = '' so all calls go through Next.js proxy (src/app/api/* -> BACKEND).
 * withCredentials:true ensures cookies are forwarded.
 */
export const api = axios.create({
  baseURL: '',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ---------------------------------------------------------------------------
// Token helpers — mirrored from src/lib/api.js for backward compat
// Tokens are persisted in localStorage so both lib/api.js and services/api.ts
// stay in sync via storage. Accessors always fall back to localStorage read.
// ---------------------------------------------------------------------------
let accessToken: string | null =
  typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
let refreshToken: string | null =
  typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

export function setTokens({ accessToken: at, refreshToken: rt }: { accessToken?: string | null; refreshToken?: string | null }) {
  accessToken = at ?? null;
  refreshToken = rt ?? null;
  if (typeof window !== 'undefined') {
    if (at) localStorage.setItem('accessToken', at);
    else localStorage.removeItem('accessToken');
    if (rt) localStorage.setItem('refreshToken', rt);
    else localStorage.removeItem('refreshToken');
  }
}

export function getAccessToken(): string | null {
  return accessToken || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);
}

export function getRefreshToken(): string | null {
  return refreshToken || (typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null);
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

// ---------------------------------------------------------------------------
// Request interceptor — inject Authorization header
// ---------------------------------------------------------------------------
api.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && cfg.headers) {
    (cfg.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return cfg;
});

// ---------------------------------------------------------------------------
// Response interceptor — handle 401 refresh + 422/429/500 toasts
// ---------------------------------------------------------------------------
let refreshing: Promise<void> | null = null;

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const orig: InternalAxiosRequestConfig & { _retry?: boolean } = err.config;
    const status: number | undefined = err.response?.status;
    const data = err.response?.data as { error?: string; message?: string; details?: Array<{ field: string; message: string }>; code?: string } | undefined;
    const msg: string = data?.error || data?.message || err.message || 'Request failed';

    // Surface validation / rate-limit / server errors via toast
    if (status === 422 && data?.details) {
      const detailMsg = data.details.map((d) => `${d.field}: ${d.message}`).join(', ');
      toast.error(detailMsg || msg);
    } else if (status === 429) {
      toast.error(data?.error || 'Too many requests. Try again later.');
    } else if (status === 500) {
      toast.error(data?.error || data?.message || 'Internal server error. Please try again later.');
    } else if (status && status >= 400 && status < 500 && !orig?._retry) {
      // Avoid toast for 401 here — handled by refresh logic below
      if (status !== 401) toast.error(msg);
    } else if (status && status > 500) {
      toast.error(msg);
    }

    // Handle 401 — try to refresh token once, then retry original request
    if (status === 401 && orig && !orig._retry && !orig.url?.includes('/api/auth')) {
      orig._retry = true;
      const rt = getRefreshToken();
      if (!rt) {
        clearTokens();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(err);
      }

      // Ensure only one refresh request is in flight
      refreshing ||= axios
        .post('/api/auth/refresh', { refreshToken: rt }, { withCredentials: true })
        .then(({ data: refreshData }: { data: { accessToken: string; refreshToken: string } }) => {
          setTokens({ accessToken: refreshData.accessToken, refreshToken: refreshData.refreshToken });
        })
        .catch(() => {
          clearTokens();
          if (typeof window !== 'undefined') window.location.href = '/login';
          throw err;
        })
        .finally(() => {
          refreshing = null;
        });

      try {
        await refreshing;
        if (orig.headers) {
          (orig.headers as Record<string, string>).Authorization = `Bearer ${getAccessToken()}`;
        }
        return api(orig);
      } catch (e) {
        return Promise.reject(e);
      }
    }

    return Promise.reject(err);
  }
);

// ---------------------------------------------------------------------------
// Generic CRUD helpers — typed wrappers around the configured instance
// ---------------------------------------------------------------------------

/**
 * GET with optional query params.
 * @example get<PagedResponse<Treatment>>('/api/treatments', { page: 1, limit: 20 })
 */
export function get<T>(url: string, params?: Record<string, unknown>): Promise<AxiosResponse<T>> {
  return api.get<T>(url, { params });
}

export function post<T>(url: string, data?: unknown): Promise<AxiosResponse<T>> {
  return api.post<T>(url, data);
}

export function put<T>(url: string, data?: unknown): Promise<AxiosResponse<T>> {
  return api.put<T>(url, data);
}

/**
 * DELETE helper — named `del` because `delete` is a reserved word.
 */
export function del<T>(url: string): Promise<AxiosResponse<T>> {
  return api.delete<T>(url);
}

export function patch<T>(url: string, data?: unknown): Promise<AxiosResponse<T>> {
  return api.patch<T>(url, data);
}

/**
 * Multipart upload helper — sends FormData without an explicit Content-Type
 * header so the browser/axios can set the correct boundary.
 * @example upload<MediaAsset>('/api/media/upload', formData)
 */
export function upload<T>(url: string, formData: FormData): Promise<AxiosResponse<T>> {
  return api.post<T>(url, formData, {
    // Remove default application/json so axios sets multipart boundary automatically
    headers: { 'Content-Type': undefined } as unknown as Record<string, string>,
  });
}

export default api;
