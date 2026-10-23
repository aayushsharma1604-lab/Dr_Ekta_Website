import { publicApi, adminApi, serverFetch } from "../client";
import type { Profile } from "../types";

/**
 * GET /api/public/profile/ — doctor singleton (cached 1h)
 * GET /api/admin/profile/ — shadowed → public profile (requires token but returns same)
 * PUT /api/public/profile/ + PUT /api/admin/profile/ — update (requires token)
 */

export function getProfile(): Promise<Profile> {
  return publicApi.get<Profile>("/profile/");
}

export function getProfileServer(): Promise<Profile> {
  return serverFetch<Profile>(`/public/profile/`, {
    revalidate: 3600,
    tags: ["profile"],
  });
}

export function getAdminProfile(): Promise<Profile> {
  return adminApi.get<Profile>("/profile/");
}

export function updateProfile(data: Partial<Profile>): Promise<Profile> {
  // admin path preferred
  return adminApi.put<Profile>("/profile/", data);
}
