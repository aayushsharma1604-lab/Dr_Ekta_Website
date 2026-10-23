/**
 * Barrel — re-export all API utilities
 */

// client + token helpers
export {
  api,
  apiFetch,
  publicApi,
  adminApi,
  serverFetch,
  getAccessToken,
  getRefreshToken,
  setTokens,
  setAccessToken,
  clearTokens,
  ApiClientError,
} from "./client";

// types
export type * from "./types";

// services — public + admin
export * from "./services/clinic";
export * from "./services/treatments";
export * from "./services/articles";
export * from "./services/testimonials";
export * from "./services/gallery";
export * from "./services/videos";
export * from "./services/instagram";
export * from "./services/home";
export * from "./services/enquiry";
export * from "./services/booking";
export * from "./services/profile";
export * from "./services/auth";

// admin-only services
export * from "./services/leads";
export * from "./services/media";
export * from "./services/redirects";
export * from "./services/analytics";
export * from "./services/auditLog";
export * from "./services/reviewQueue";
