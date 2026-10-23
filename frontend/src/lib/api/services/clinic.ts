import { publicApi, adminApi, serverFetch } from "../client";
import type { ClinicInfo } from "../types";

/**
 * GET /api/public/clinic-info — Cached 1h (public)
 * GET /api/admin/clinic-info — No cache (admin, requires token)
 * PUT /api/admin/clinic-info
 */

export function getClinicInfo(): Promise<ClinicInfo> {
  return publicApi.get<ClinicInfo>("/clinic-info");
}

// Server-component helper with Next.js revalidation (1h = 3600)
export function getClinicInfoServer(revalidate = 3600): Promise<ClinicInfo> {
  // serverFetch expects path relative to API_BASE (/public/...)
  return serverFetch<ClinicInfo>(`/public/clinic-info`, { revalidate, tags: ["clinic-info"] });
}

export function getAdminClinicInfo(): Promise<ClinicInfo> {
  return adminApi.get<ClinicInfo>("/clinic-info");
}

export function updateClinicInfo(data: Partial<ClinicInfo>): Promise<ClinicInfo> {
  return adminApi.put<ClinicInfo>("/clinic-info", data);
}

// Keep for backwards compat if some code imports directly
export const clinicService = {
  getClinicInfo,
  getClinicInfoServer,
  getAdminClinicInfo,
  updateClinicInfo,
};
