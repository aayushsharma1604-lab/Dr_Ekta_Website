import { publicApi, adminApi, serverFetch } from "../client";
import type { Video, PagedResponse, VideoListParams } from "../types";

/**
 * GET /api/public/videos/?page&limit&category
 * GET /api/admin/videos/:id + CRUD (no workflow, status published|hidden)
 */

export function getVideos(params?: VideoListParams): Promise<PagedResponse<Video>> {
  return publicApi.get<PagedResponse<Video>>("/videos/", {
    params: params as Record<string, unknown>,
  });
}

export function getVideosServer(params?: VideoListParams): Promise<PagedResponse<Video>> {
  return serverFetch<PagedResponse<Video>>(`/public/videos/`, {
    params: params as Record<string, string | number | boolean | undefined | string[]>,
    revalidate: 300,
    tags: ["videos"],
  });
}

// ─── Admin ─────────────────────────────────────────────────────────

export function getAdminVideos(params?: VideoListParams & { status?: string }): Promise<PagedResponse<Video>> {
  return adminApi.get<PagedResponse<Video>>("/videos/", {
    params: params as Record<string, unknown>,
  });
}

export function getAdminVideoById(id: string): Promise<Video> {
  return adminApi.get<Video>(`/videos/${id}`);
}

export function createVideo(data: { url: string; title: string; category: string; thumbnail?: string; order?: number; status?: string; transcript?: string; captionsUrl?: string }): Promise<Video> {
  return adminApi.post<Video>("/videos/", data);
}

export function updateVideo(id: string, data: Partial<Video> & { url: string; title: string; category: string }): Promise<Video> {
  // NOTE: validator is create-shaped — send full object
  return adminApi.put<Video>(`/videos/${id}`, data);
}

export function deleteVideo(id: string): Promise<{ message: string }> {
  return adminApi.delete<{ message: string }>(`/videos/${id}`);
}
