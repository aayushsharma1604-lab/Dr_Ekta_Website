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
// CuratedPost (Instagram) — per openapi.yaml
// ---------------------------------------------------------------------------
export interface InstagramPost {
  _id: string;
  image: string | Record<string, unknown>; // MediaAsset ObjectId or populated
  caption?: string;
  permalink: string;
  order?: number;
  locationId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface InstagramListParams {
  page?: number;
  limit?: number;
}

export interface CreateInstagramPostPayload {
  image: string; // required — MediaAsset _id
  permalink: string; // required — URL
  caption?: string;
  order?: number;
}

export type UpdateInstagramPostPayload = Partial<CreateInstagramPostPayload>;

// ---------------------------------------------------------------------------
// Endpoints — via Next proxy: /api/instagram-posts/* -> /api/admin/instagram-posts/*
// ---------------------------------------------------------------------------

/** GET /api/instagram-posts?page&limit */
export function getInstagramPosts(params?: InstagramListParams) {
  return get<PagedResponse<InstagramPost>>('/api/instagram-posts', params as Record<string, unknown>);
}

/** GET /api/instagram-posts/:id */
export function getInstagramPost(id: string) {
  return get<InstagramPost>(`/api/instagram-posts/${encodeURIComponent(id)}`);
}

/** POST /api/instagram-posts — { image, permalink } required */
export function createInstagramPost(data: CreateInstagramPostPayload) {
  return post<InstagramPost>('/api/instagram-posts', data);
}

/** PUT /api/instagram-posts/:id — all fields optional */
export function updateInstagramPost(id: string, data: UpdateInstagramPostPayload) {
  return put<InstagramPost>(`/api/instagram-posts/${encodeURIComponent(id)}`, data);
}

/** DELETE /api/instagram-posts/:id */
export function deleteInstagramPost(id: string) {
  return del<{ message?: string }>(`/api/instagram-posts/${encodeURIComponent(id)}`);
}

// Aliases
export const fetchInstagramPosts = getInstagramPosts;
export const fetchInstagramPost = getInstagramPost;
