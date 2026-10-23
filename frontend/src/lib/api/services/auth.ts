import { apiFetch, setTokens, clearTokens, getRefreshToken } from "../client";
import type { LoginResponse, RefreshResponse, AuthUser } from "../types";

/**
 * POST /api/admin/auth/login    — { email, password } → { user, accessToken, refreshToken }
 * POST /api/admin/auth/refresh  — { refreshToken }    → new pair (rotating)
 * POST /api/admin/auth/logout   — { refreshToken? }   → always 200
 * GET  /api/admin/auth/me       — BROKEN (500 without middleware) — do not rely
 * GET  /api/admin/clinic-info   — use to verify session instead
 */

export async function login(email: string, password: string): Promise<LoginResponse> {
  const data = await apiFetch<LoginResponse>(`/admin/auth/login`, {
    method: "POST",
    body: { email, password },
    skipAuth: true,
    skipRefresh: true,
  });

  if (data.accessToken && data.refreshToken) {
    setTokens(data.accessToken, data.refreshToken);
  }

  return data;
}

export async function refresh(refreshToken?: string): Promise<RefreshResponse> {
  const token = refreshToken || getRefreshToken();
  if (!token) throw new Error("No refresh token available");

  const data = await apiFetch<RefreshResponse>(`/admin/auth/refresh`, {
    method: "POST",
    body: { refreshToken: token },
    skipAuth: true,
    skipRefresh: true,
  });

  if (data.accessToken && data.refreshToken) {
    setTokens(data.accessToken, data.refreshToken);
  }

  return data;
}

export async function logout(): Promise<{ message: string }> {
  const refreshToken = getRefreshToken();
  try {
    const data = await apiFetch<{ message: string }>(`/admin/auth/logout`, {
      method: "POST",
      body: refreshToken ? { refreshToken } : {},
      skipAuth: true,
      skipRefresh: true,
    });
    return data;
  } finally {
    clearTokens();
  }
}

// Verify session without relying on broken /auth/me — use clinic-info
export async function verifySession(): Promise<boolean> {
  try {
    await apiFetch(`/admin/clinic-info`, { method: "GET" });
    return true;
  } catch {
    return false;
  }
}

// Keep for completeness (will 500 until backend fixes)
export function getMe(): Promise<{ user: AuthUser }> {
  return apiFetch<{ user: AuthUser }>(`/admin/auth/me`, { method: "GET" });
}
