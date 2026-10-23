/**
 * Central API configuration
 * Mirrors docs/BACKEND_DOCUMENTATION.md §10
 * Base URL local: http://localhost:4000
 * Public prefix: /api/public
 * Admin prefix: /api/admin
 */

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api";

export const PUBLIC_API = `${API_BASE}/public`;
export const ADMIN_API = `${API_BASE}/admin`;

// Frontend URL for sitemap/SEO
export const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

// Backend health endpoints
export const API_HEALTH = `${PUBLIC_API}/health`;
export const API_ROOT = API_BASE.replace(/\/api$/, "/");
