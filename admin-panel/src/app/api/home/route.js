import { proxy } from '@/lib/apiProxy';

// Public homepage aggregate — mirrors GET /api/public/home and GET /api/admin/home
// Backend serves same aggregate under both prefixes; we proxy to public for frontend use.
// Admin config lives at /api/home/config (see config/route.js)
export async function GET(req) {
  return proxy(req, '/api/public/home');
}
