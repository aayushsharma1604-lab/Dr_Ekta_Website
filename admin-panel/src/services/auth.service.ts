import { get, post } from './api';

// ---------------------------------------------------------------------------
// Types — per openapi.yaml Admin Auth
// ---------------------------------------------------------------------------
export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    _id?: string;
    email: string;
    name?: string;
    role?: string;
    [k: string]: unknown;
  };
  accessToken: string;
  refreshToken: string;
}

export interface RefreshPayload {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface MeResponse {
  user?: {
    _id?: string;
    email: string;
    name?: string;
    role?: string;
    [k: string]: unknown;
  };
  // some backends wrap as { data: user } or return user directly
  data?: unknown;
  [k: string]: unknown;
}

// Raw axios responses are returned — callers can access res.data
// ---------------------------------------------------------------------------
// Endpoints — via Next proxy (src/app/api/auth/* -> /api/admin/auth/*)
// ---------------------------------------------------------------------------

/**
 * POST /api/auth/login -> POST /api/admin/auth/login
 * Body: { email, password } required
 */
export function login(email: string, password: string) {
  return post<LoginResponse>('/api/auth/login', { email, password });
}

/** Overload that accepts payload object */
export function loginWithPayload(payload: LoginPayload) {
  return post<LoginResponse>('/api/auth/login', payload);
}

/**
 * POST /api/auth/refresh -> POST /api/admin/auth/refresh
 * Body: { refreshToken } required
 */
export function refresh(refreshToken: string) {
  return post<RefreshResponse>('/api/auth/refresh', { refreshToken });
}

/**
 * POST /api/auth/logout -> POST /api/admin/auth/logout
 * Body: { refreshToken? } optional — revoke server side, always 200
 */
export function logout(refreshToken?: string) {
  return post<{ message?: string }>('/api/auth/logout', refreshToken ? { refreshToken } : {});
}

/**
 * GET /api/auth/me -> GET /api/admin/auth/me (requires Bearer)
 * Returns current admin user; used for session hydration after refresh/reload
 */
export function me() {
  return get<MeResponse>('/api/auth/me');
}

// Convenience aliases for consistent naming across services
export const getMe = me;
export const loginRequest = login;
