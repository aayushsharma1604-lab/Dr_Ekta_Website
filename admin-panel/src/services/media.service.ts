import { get, post, del, upload } from './api';

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
// MediaAsset — per openapi.yaml
// ---------------------------------------------------------------------------
export interface MediaAsset {
  _id: string;
  filename: string;
  originalName?: string;
  storageKey?: string;
  url: string;
  optimizedUrl?: string | null;
  variants?: Array<{ name: 'thumb' | 'medium' | 'large' | string; width: number; url: string }>;
  mimeType: string;
  size: number;
  uploadedBy?: Record<string, unknown>;
  usedIn?: Array<Record<string, unknown>>;
  altText?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MediaListParams {
  page?: number;
  limit?: number;
  mimeType?: string;
}

// Cloudinary signed upload flow
export interface MediaUploadRequest {
  filename: string;
  mimeType: string;
  size: number;
}

export interface MediaUploadResponse {
  uploadUrl: string;
  publicId?: string;
  public_id?: string;
  apiKey?: string;
  timestamp?: number;
  signature?: string;
  paramsToSign?: Record<string, unknown>;
  // backend may return different keys — keep index signature
  [k: string]: unknown;
}

export interface MediaConfirmPayload {
  key: string; // required — must equal publicId per docs
  publicId: string; // required — must equal key
  url: string; // required — Cloudinary delivery URL
  filename: string; // required
  mimeType: string; // required
  size: number; // required
}

// ---------------------------------------------------------------------------
// Endpoints — via Next proxy:
//   GET    /api/media              -> GET    /api/admin/media
//   GET    /api/media/:id          -> GET    /api/admin/media/:id
//   POST   /api/media/upload       -> POST   /api/admin/media/upload   (JSON signed params)
//   POST   /api/media/confirm      -> POST   /api/admin/media/confirm  (JSON)
//   DELETE /api/media/:id          -> DELETE /api/admin/media/:id
//
// Note: The actual file bytes are POSTed directly to Cloudinary via
//       fetch(uploadUrl, { method:'POST', body: FormData }) — not via backend.
//       The generic `upload` helper is provided for any direct multipart
//       uploads should backend ever support POST /api/media as multipart.
// ---------------------------------------------------------------------------

/** GET /api/media?page&limit&mimeType */
export function getMedia(params?: MediaListParams) {
  return get<PagedResponse<MediaAsset>>('/api/media', params as Record<string, unknown>);
}

/** GET /api/media/:id */
export function getMediaById(id: string) {
  return get<MediaAsset>(`/api/media/${encodeURIComponent(id)}`);
}

/**
 * POST /api/media/upload — get Cloudinary signed params
 * Body: { filename, mimeType, size } required
 */
export function getUploadParams(data: MediaUploadRequest) {
  return post<MediaUploadResponse>('/api/media/upload', data);
}

/** Alias */
export const uploadMedia = getUploadParams;
export const getSignedUploadUrl = getUploadParams;

/**
 * POST /api/media/confirm — create MediaAsset after Cloudinary upload
 * Body: { key, publicId, url, filename, mimeType, size } — key === publicId
 */
export function confirmMedia(data: MediaConfirmPayload) {
  return post<MediaAsset>('/api/media/confirm', data);
}

/** DELETE /api/media/:id */
export function deleteMedia(id: string) {
  return del<{ message?: string }>(`/api/media/${encodeURIComponent(id)}`);
}

/**
 * Generic multipart upload — for any endpoint that accepts FormData.
 * Uses `api.upload` which strips Content-Type so boundary is set automatically.
 * @example uploadFile('/api/media', formData)  // if backend added multipart support
 */
export function uploadFile<T = MediaAsset>(url: string, formData: FormData) {
  return upload<T>(url, formData);
}

// Aliases matching existing saga naming
export const fetchMedia = getMedia;
export const fetchMediaById = getMediaById;
export const confirmUpload = confirmMedia;
export const removeMedia = deleteMedia;
