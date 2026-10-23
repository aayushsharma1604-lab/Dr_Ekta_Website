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
// GalleryItem — per openapi.yaml
// ---------------------------------------------------------------------------
export interface GalleryItem {
  _id: string;
  beforeImg: string | Record<string, unknown>; // MediaAsset ObjectId or populated object
  afterImg: string | Record<string, unknown>;
  treatmentTag?: string | Record<string, unknown> | null;
  content?: string;
  status: 'draft' | 'published' | string;
  locationId?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryListParams {
  page?: number;
  limit?: number;
  treatmentTag?: string;
  status?: 'draft' | 'published' | string;
}

export interface CreateGalleryPayload {
  beforeImg: string; // required — MediaAsset _id
  afterImg: string; // required — MediaAsset _id
  treatmentTag?: string;
  content?: string;
  status?: 'draft' | 'published';
}

export type UpdateGalleryPayload = Partial<CreateGalleryPayload>;

// ---------------------------------------------------------------------------
// Endpoints — via Next proxy: /api/gallery/* -> /api/admin/gallery/*
// ---------------------------------------------------------------------------

/** GET /api/gallery?page&limit&treatmentTag&status */
export function getGallery(params?: GalleryListParams) {
  return get<PagedResponse<GalleryItem>>('/api/gallery', params as Record<string, unknown>);
}

/** GET /api/gallery/:id */
export function getGalleryItem(id: string) {
  return get<GalleryItem>(`/api/gallery/${encodeURIComponent(id)}`);
}

/** POST /api/gallery — { beforeImg, afterImg } required (MediaAsset ObjectIds) */
export function createGalleryItem(data: CreateGalleryPayload) {
  return post<GalleryItem>('/api/gallery', data);
}

/** PUT /api/gallery/:id */
export function updateGalleryItem(id: string, data: UpdateGalleryPayload) {
  return put<GalleryItem>(`/api/gallery/${encodeURIComponent(id)}`, data);
}

/** DELETE /api/gallery/:id */
export function deleteGalleryItem(id: string) {
  return del<{ message?: string }>(`/api/gallery/${encodeURIComponent(id)}`);
}

// Aliases
export const getGalleryItems = getGallery;
export const createGallery = createGalleryItem;
export const updateGallery = updateGalleryItem;
export const deleteGallery = deleteGalleryItem;
