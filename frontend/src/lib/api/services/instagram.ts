import { publicApi, adminApi, serverFetch } from "../client";
import type { CuratedPost, PagedResponse, PaginationParams } from "../types";

/**
 * GET /api/public/instagram-posts/?page&limit
 * GET /api/admin/instagram-posts/:id + CRUD (no status, always public)
 * Shadowed: GET /api/admin/instagram-posts/ → public list
 */

export function getInstagramPosts(params?: PaginationParams): Promise<PagedResponse<CuratedPost>> {
  return publicApi.get<PagedResponse<CuratedPost>>("/instagram-posts/", {
    params: params as Record<string, unknown>,
  });
}

export function getInstagramPostsServer(params?: PaginationParams): Promise<PagedResponse<CuratedPost>> {
  return serverFetch<PagedResponse<CuratedPost>>(`/public/instagram-posts/`, {
    params: params as Record<string, string | number | boolean | undefined | string[]>,
    revalidate: 300,
    tags: ["instagram-posts"],
  });
}

// ─── Admin ─────────────────────────────────────────────────────────

export function getAdminInstagramPosts(params?: PaginationParams): Promise<PagedResponse<CuratedPost>> {
  return adminApi.get<PagedResponse<CuratedPost>>("/instagram-posts/", {
    params: params as Record<string, unknown>,
  });
}

export function getAdminInstagramPostById(id: string): Promise<CuratedPost> {
  return adminApi.get<CuratedPost>(`/instagram-posts/${id}`);
}

export function createInstagramPost(data: { image: string; permalink: string; caption?: string; order?: number }): Promise<CuratedPost> {
  return adminApi.post<CuratedPost>("/instagram-posts/", data);
}

export function updateInstagramPost(id: string, data: Partial<CuratedPost>): Promise<CuratedPost> {
  return adminApi.put<CuratedPost>(`/instagram-posts/${id}`, data);
}

export function deleteInstagramPost(id: string): Promise<{ message: string }> {
  return adminApi.delete<{ message: string }>(`/instagram-posts/${id}`);
}
