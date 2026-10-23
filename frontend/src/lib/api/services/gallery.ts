import { publicApi, adminApi, serverFetch } from "../client";
import type { GalleryItem, PagedResponse, TestimonialListParams } from "../types";

/**
 * GET /api/public/gallery/?page&limit&treatmentTag
 * GET /api/admin/gallery/:id + CRUD + workflow (consent-gated)
 * Shadowed GET /api/admin/gallery/ → public list
 */

export function getGallery(params?: TestimonialListParams): Promise<PagedResponse<GalleryItem>> {
  return publicApi.get<PagedResponse<GalleryItem>>("/gallery/", {
    params: params as Record<string, unknown>,
  });
}

export function getGalleryServer(params?: TestimonialListParams): Promise<PagedResponse<GalleryItem>> {
  return serverFetch<PagedResponse<GalleryItem>>(`/public/gallery/`, {
    params: params as Record<string, string | number | boolean | undefined | string[]>,
    revalidate: 300,
    tags: ["gallery"],
  });
}

// ─── Admin ─────────────────────────────────────────────────────────

export function getAdminGallery(params?: TestimonialListParams): Promise<PagedResponse<GalleryItem>> {
  return adminApi.get<PagedResponse<GalleryItem>>("/gallery/", {
    params: params as Record<string, unknown>,
  });
}

export function getAdminGalleryById(id: string): Promise<GalleryItem> {
  return adminApi.get<GalleryItem>(`/gallery/${id}`);
}

export function createGalleryItem(data: { beforeImg: string; afterImg: string; treatmentTag?: string; content?: string; consent?: unknown; status?: string }): Promise<GalleryItem> {
  return adminApi.post<GalleryItem>("/gallery/", data);
}

export function updateGalleryItem(id: string, data: Partial<GalleryItem>): Promise<GalleryItem> {
  return adminApi.put<GalleryItem>(`/gallery/${id}`, data);
}

export function deleteGalleryItem(id: string): Promise<{ message: string }> {
  return adminApi.delete<{ message: string }>(`/gallery/${id}`);
}

export function submitGalleryItem(id: string): Promise<{ message: string }> {
  return adminApi.post<{ message: string }>(`/gallery/${id}/submit`, {});
}

export function approveGalleryItem(id: string, reviewNote?: string): Promise<{ message: string }> {
  return adminApi.post<{ message: string }>(`/gallery/${id}/approve`, reviewNote ? { reviewNote } : {});
}

export function rejectGalleryItem(id: string, reviewNote: string): Promise<{ message: string }> {
  return adminApi.post<{ message: string }>(`/gallery/${id}/reject`, { reviewNote });
}

export function publishGalleryItem(id: string): Promise<{ message: string }> {
  return adminApi.post<{ message: string }>(`/gallery/${id}/publish`, {});
}
