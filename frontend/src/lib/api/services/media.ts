import { adminApi } from "../client";
import type {
    MediaAsset,
    PagedResponse,
    MediaListParams,
    MediaUploadPayload,
    MediaUploadResponse,
    MediaConfirmPayload,
} from "../types";

/**
 * POST /api/admin/media/upload   — Step 1: validate + get Cloudinary signature
 * POST /api/admin/media/confirm  — Step 2: create MediaAsset row (send key AND publicId)
 * GET  /api/admin/media          — list (filtered to current user's uploads)
 * GET  /api/admin/media/:id
 * DELETE /api/admin/media/:id    — Cloudinary destroy + DB delete
 */

export function getMediaUploadUrl(payload: MediaUploadPayload): Promise<MediaUploadResponse> {
    return adminApi.post<MediaUploadResponse>("/media/upload", payload);
}

export function confirmMediaUpload(payload: MediaConfirmPayload): Promise<MediaAsset> {
    return adminApi.post<MediaAsset>("/media/confirm", payload);
}

export function listMedia(params?: MediaListParams): Promise<PagedResponse<MediaAsset>> {
    return adminApi.get<PagedResponse<MediaAsset>>("/media", { params: params as Record<string, unknown> });
}

export function getMediaById(id: string): Promise<MediaAsset> {
    return adminApi.get<MediaAsset>(`/media/${id}`);
}

export function deleteMedia(id: string): Promise<{ message: string }> {
    return adminApi.delete<{ message: string }>(`/media/${id}`);
}
