import { get, put } from './api';

// ---------------------------------------------------------------------------
// Homepage — per openapi.yaml
// Public aggregate + featured config
// ---------------------------------------------------------------------------
export interface HomeConfig {
  featuredTreatments?: string[]; // ObjectId[]
  featuredArticles?: string[]; // ObjectId[]
  featuredVideos?: string[]; // ObjectId[]
  featuredTestimonials?: string[]; // ObjectId[]
  [k: string]: unknown;
}

export interface HomeAggregate {
  treatments?: unknown[];
  articles?: unknown[];
  videos?: unknown[];
  testimonials?: unknown[];
  clinicInfo?: unknown;
  profile?: unknown;
  [k: string]: unknown;
}

export type UpdateHomeConfigPayload = Partial<HomeConfig>;

// ---------------------------------------------------------------------------
// Endpoints — via Next proxy:
//   GET /api/home/config -> GET /api/admin/home/config
//   PUT /api/home/config -> PUT /api/admin/home/config
//   GET /api/home        -> GET /api/public/home  (public aggregate, cached)
// ---------------------------------------------------------------------------

/** GET /api/home/config — featured config (requires Bearer despite public note) */
export function getHomeConfig() {
  return get<HomeConfig>('/api/home/config');
}

/**
 * PUT /api/home/config — update featured id arrays
 * Body: { featuredTreatments?, featuredArticles?, featuredVideos?, featuredTestimonials? }: string[]
 */
export function updateHomeConfig(data: UpdateHomeConfigPayload) {
  return put<HomeConfig>('/api/home/config', data);
}

/**
 * GET /api/home — public homepage aggregate (uses /api/public/home)
 * Proxied via src/app/api/home/route.js -> GET /api/public/home
 * Cached, no auth required but Bearer is forwarded if present
 */
export function getHome() {
  return get<HomeAggregate>('/api/home');
}

/** Alias for public aggregate */
export const getHomepage = getHome;
export const fetchHomeConfig = getHomeConfig;
