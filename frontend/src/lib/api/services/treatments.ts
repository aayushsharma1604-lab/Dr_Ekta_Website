import { publicApi, adminApi, serverFetch, ApiClientError } from "../client";
import type { Treatment, PagedResponse, TreatmentListParams } from "../types";

/**
 * Public
 *  GET /api/public/treatments?page&limit&search  (cached 5m)
 *  GET /api/public/treatments/:slug              (cached 5m, 404 if unknown)
 *
 * Admin
 *  GET /api/admin/treatments?page&limit&status&search
 *  GET /api/admin/treatments/:id    (500 not 404 on unknown — handle)
 *  POST /api/admin/treatments
 *  PUT  /api/admin/treatments/:id   (strips status/publishedAt)
 *  DELETE /api/admin/treatments/:id
 *  POST /api/admin/treatments/:id/submit|approve|reject|publish|create-draft
 */

export function getTreatments(params?: TreatmentListParams): Promise<PagedResponse<Treatment>> {
  return publicApi.get<PagedResponse<Treatment>>("/treatments", { params: params as Record<string, unknown> });
}

export function getTreatmentBySlug(slug: string): Promise<Treatment> {
  return publicApi.get<Treatment>(`/treatments/${encodeURIComponent(slug)}`);
}

// Server helper with revalidate 300 (5m)
export function getTreatmentsServer(params?: TreatmentListParams): Promise<PagedResponse<Treatment>> {
  return serverFetch<PagedResponse<Treatment>>(`/public/treatments`, {
    params: params as Record<string, string | number | boolean | undefined | string[]>,
    revalidate: 300,
    tags: ["treatments"],
  });
}

export function getTreatmentBySlugServer(slug: string): Promise<Treatment> {
  return serverFetch<Treatment>(`/public/treatments/${encodeURIComponent(slug)}`, {
    revalidate: 300,
    tags: ["treatments", `treatment:${slug}`],
  });
}

// Safe wrapper that treats 500 as 404 for unknown slug (known bug)
export async function getTreatmentBySlugSafe(slug: string): Promise<Treatment | null> {
  try {
    return await getTreatmentBySlug(slug);
  } catch (e) {
    if (e instanceof ApiClientError && (e.status === 404 || e.status === 500)) return null;
    throw e;
  }
}

// ─── Admin ─────────────────────────────────────────────────────────

export function getAdminTreatments(params?: TreatmentListParams & { status?: string }): Promise<PagedResponse<Treatment>> {
  return adminApi.get<PagedResponse<Treatment>>("/treatments", { params: params as Record<string, unknown> });
}

export function getAdminTreatmentById(id: string): Promise<Treatment> {
  return adminApi.get<Treatment>(`/treatments/${id}`);
}

export function createTreatment(data: Partial<Treatment> & { title: string }): Promise<Treatment> {
  return adminApi.post<Treatment>("/treatments", data);
}

export function updateTreatment(id: string, data: Partial<Treatment>): Promise<Treatment> {
  return adminApi.put<Treatment>(`/treatments/${id}`, data);
}

export function deleteTreatment(id: string): Promise<{ message: string }> {
  return adminApi.delete<{ message: string }>(`/treatments/${id}`);
}

export function submitTreatment(id: string): Promise<{ message: string }> {
  return adminApi.post<{ message: string }>(`/treatments/${id}/submit`, {});
}

export function approveTreatment(id: string, reviewNote?: string): Promise<{ message: string }> {
  return adminApi.post<{ message: string }>(`/treatments/${id}/approve`, reviewNote ? { reviewNote } : {});
}

export function rejectTreatment(id: string, reviewNote: string): Promise<{ message: string }> {
  return adminApi.post<{ message: string }>(`/treatments/${id}/reject`, { reviewNote });
}

export function publishTreatment(id: string): Promise<{ message: string }> {
  return adminApi.post<{ message: string }>(`/treatments/${id}/publish`, {});
}

export function createDraftFromPublished(id: string): Promise<Treatment> {
  return adminApi.post<Treatment>(`/treatments/${id}/create-draft`, {});
}
