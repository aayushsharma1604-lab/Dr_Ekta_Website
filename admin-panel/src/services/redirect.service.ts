import { get, post, put, del } from './api';

// ---------------------------------------------------------------------------
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
export interface PagedResponse<T> {
  items: T[];
  pagination: Pagination;
}

// ---------------------------------------------------------------------------
// Redirect — per openapi.yaml
// ---------------------------------------------------------------------------
export interface Redirect {
  _id: string;
  fromPath: string; // unique, immutable after create (409 on duplicate)
  toPath: string;
  statusCode: 301 | 302;
  createdAt?: string;
  updatedAt?: string;
}

export interface RedirectListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateRedirectPayload {
  fromPath: string; // required, unique
  toPath: string; // required
  statusCode?: 301 | 302; // default 301
}

export interface UpdateRedirectPayload {
  toPath?: string;
  statusCode?: 301 | 302;
  // fromPath is immutable — do NOT send on update
}

// ---------------------------------------------------------------------------
// Endpoints — via Next proxy: /api/redirects/* -> /api/admin/redirects/*
// ---------------------------------------------------------------------------

/** GET /api/redirects?page&limit&search */
export function getRedirects(params?: RedirectListParams) {
  return get<PagedResponse<Redirect>>('/api/redirects', params as Record<string, unknown>);
}

/** GET /api/redirects/:id */
export function getRedirect(id: string) {
  return get<Redirect>(`/api/redirects/${encodeURIComponent(id)}`);
}

/** POST /api/redirects — { fromPath, toPath, statusCode? } (409 on duplicate fromPath) */
export function createRedirect(data: CreateRedirectPayload) {
  return post<Redirect>('/api/redirects', data);
}

/**
 * PUT /api/redirects/:id — only toPath + statusCode (fromPath immutable)
 */
export function updateRedirect(id: string, data: UpdateRedirectPayload) {
  // enforce whitelist — never send fromPath on update
  const payload: UpdateRedirectPayload = {};
  if (data.toPath !== undefined) payload.toPath = data.toPath;
  if (data.statusCode !== undefined) payload.statusCode = data.statusCode;
  return put<Redirect>(`/api/redirects/${encodeURIComponent(id)}`, payload);
}

/** DELETE /api/redirects/:id */
export function deleteRedirect(id: string) {
  return del<{ message?: string }>(`/api/redirects/${encodeURIComponent(id)}`);
}

// Aliases
export const fetchRedirects = getRedirects;
export const fetchRedirect = getRedirect;
