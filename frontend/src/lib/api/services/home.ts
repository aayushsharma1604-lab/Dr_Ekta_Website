import { publicApi, adminApi, serverFetch } from "../client";
import type { HomepageAggregate, HomepageConfig } from "../types";

/**
 * GET /api/public/home/ — aggregate (treatments/articles/videos/testimonials)
 *                   cached 1m
 * GET /api/public/home/config + PUT /api/public/home/config  (both require token despite public prefix — use admin)
 * GET /api/admin/home/config + PUT /api/admin/home/config
 * Note: GET /api/admin/home/ is shadowed → public aggregate
 */

export function getHome(): Promise<HomepageAggregate> {
  return publicApi.get<HomepageAggregate>("/home/");
}

export function getHomeServer(): Promise<HomepageAggregate> {
  return serverFetch<HomepageAggregate>(`/public/home/`, {
    revalidate: 60,
    tags: ["home"],
  });
}

export function getHomepageConfig(): Promise<HomepageConfig> {
  // Prefer admin path
  return adminApi.get<HomepageConfig>("/home/config");
}

export function updateHomepageConfig(data: Partial<HomepageConfig> & {
  featuredTreatments?: string[];
  featuredArticles?: string[];
  featuredVideos?: string[];
  featuredTestimonials?: string[];
}): Promise<HomepageConfig> {
  return adminApi.put<HomepageConfig>("/home/config", data);
}
