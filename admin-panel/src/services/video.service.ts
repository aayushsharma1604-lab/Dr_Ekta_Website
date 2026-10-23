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
// Video — per openapi.yaml
// ---------------------------------------------------------------------------
export interface Video {
  _id: string;
  url: string;
  title: string;
  category: string;
  thumbnail?: string;
  order?: number;
  status: 'published' | 'hidden' | string;
  locationId?: string | null;
  transcript?: string;
  captionsUrl?: string | Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface VideoListParams {
  page?: number;
  limit?: number;
  status?: 'published' | 'hidden' | string;
  category?: string;
}

export interface CreateVideoPayload {
  url: string; // required
  title: string; // required
  category: string; // required
  thumbnail?: string;
  order?: number;
  status?: 'published' | 'hidden';
  transcript?: string;
  captionsUrl?: string;
}

export type UpdateVideoPayload = Partial<CreateVideoPayload> & Record<string, unknown>;
// Note: backend validator for PUT /api/admin/videos/:id is create-shaped —
// callers should send full object (url, title, category at minimum) to avoid 422.

// ---------------------------------------------------------------------------
// Endpoints — via Next proxy: /api/videos/* -> /api/admin/videos/*
// ---------------------------------------------------------------------------

/** GET /api/videos?page&limit&status&category */
export function getVideos(params?: VideoListParams) {
  return get<PagedResponse<Video>>('/api/videos', params as Record<string, unknown>);
}

/** GET /api/videos/:id */
export function getVideo(id: string) {
  return get<Video>(`/api/videos/${encodeURIComponent(id)}`);
}

/** POST /api/videos — { url, title, category } required */
export function createVideo(data: CreateVideoPayload) {
  return post<Video>('/api/videos', data);
}

/**
 * PUT /api/videos/:id
 * ⚠️ Backend expects full object (validator is create-shaped).
 * If you need a partial edit, fetch current video first and merge.
 */
export function updateVideo(id: string, data: UpdateVideoPayload) {
  return put<Video>(`/api/videos/${encodeURIComponent(id)}`, data);
}

/** DELETE /api/videos/:id */
export function deleteVideo(id: string) {
  return del<{ message?: string }>(`/api/videos/${encodeURIComponent(id)}`);
}

// Aliases
export const fetchVideos = getVideos;
export const fetchVideo = getVideo;
