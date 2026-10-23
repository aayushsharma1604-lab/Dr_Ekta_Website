import { publicApi, adminApi, serverFetch, ApiClientError } from "../client";
import type { TeamMember, PagedResponse, TeamListParams } from "../types";

/**
 * Public
 *  GET /api/public/team?page&limit&category&search
 *  GET /api/public/team/:slug
 * Admin
 *  GET /api/admin/team?page&limit&status&category&search
 *  GET|PUT|DELETE /api/admin/team/:id
 *  POST /api/admin/team
 */

export function getTeam(params?: TeamListParams): Promise<PagedResponse<TeamMember>> {
  return publicApi.get<PagedResponse<TeamMember>>("/team", {
    params: params as unknown as Record<string, string | number | boolean | undefined | string[]>,
  });
}

export function getTeamMemberBySlug(slug: string): Promise<TeamMember> {
  return publicApi.get<TeamMember>(`/team/${encodeURIComponent(slug)}`);
}

export function getTeamServer(params?: TeamListParams): Promise<PagedResponse<TeamMember>> {
  return serverFetch<PagedResponse<TeamMember>>(`/public/team`, {
    params: params as unknown as Record<string, string | number | boolean | undefined | string[]>,
    revalidate: 300,
    tags: ["team"],
  });
}

export function getTeamMemberBySlugServer(slug: string): Promise<TeamMember> {
  return serverFetch<TeamMember>(`/public/team/${encodeURIComponent(slug)}`, {
    revalidate: 300,
    tags: ["team", `team:${slug}`],
  });
}

// 404-as-null for unknown slug
export async function getTeamMemberBySlugSafe(slug: string): Promise<TeamMember | null> {
  try {
    return await getTeamMemberBySlug(slug);
  } catch (e) {
    if (e instanceof ApiClientError && (e.status === 404 || e.status === 500)) return null;
    throw e;
  }
}

// ─── Admin ─────────────────────────────────────────────────────────

export function getAdminTeam(params?: TeamListParams & { status?: string }): Promise<PagedResponse<TeamMember>> {
  return adminApi.get<PagedResponse<TeamMember>>("/team", {
    params: params as unknown as Record<string, string | number | boolean | undefined | string[]>,
  });
}

export function getAdminTeamMemberById(id: string): Promise<TeamMember> {
  return adminApi.get<TeamMember>(`/team/${id}`);
}

export function createTeamMember(data: Partial<TeamMember> & { name: string; role: string; category: string }): Promise<TeamMember> {
  return adminApi.post<TeamMember>("/team", data);
}

export function updateTeamMember(id: string, data: Partial<TeamMember>): Promise<TeamMember> {
  return adminApi.put<TeamMember>(`/team/${id}`, data);
}

export function deleteTeamMember(id: string): Promise<{ message: string }> {
  return adminApi.delete<{ message: string }>(`/team/${id}`);
}
