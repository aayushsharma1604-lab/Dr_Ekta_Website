import { adminApi } from "../client";
import type { RedirectMap, PagedResponse, RedirectListParams } from "../types";

/**
 * GET    /api/admin/redirects/     — paginated list (search across paths)
 * GET    /api/admin/redirects/:id
 * POST   /api/admin/redirects/     — create (409 on duplicate fromPath)
 * PUT    /api/admin/redirects/:id  — only toPath/statusCode editable
 * DELETE /api/admin/redirects/:id
 */

export function getRedirects(params?: RedirectListParams): Promise<PagedResponse<RedirectMap>> {
    return adminApi.get<PagedResponse<RedirectMap>>("/redirects/", { params: params as Record<string, unknown> });
}

export function getRedirectById(id: string): Promise<RedirectMap> {
    return adminApi.get<RedirectMap>(`/redirects/${id}`);
}

export function createRedirect(data: { fromPath: string; toPath: string; statusCode?: 301 | 302 }): Promise<RedirectMap> {
    return adminApi.post<RedirectMap>("/redirects/", data);
}

export function updateRedirect(id: string, data: { toPath?: string; statusCode?: 301 | 302 }): Promise<RedirectMap> {
    return adminApi.put<RedirectMap>(`/redirects/${id}`, data);
}

export function deleteRedirect(id: string): Promise<{ message: string }> {
    return adminApi.delete<{ message: string }>(`/redirects/${id}`);
}
