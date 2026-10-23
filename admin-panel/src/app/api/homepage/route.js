import { proxy } from '@/lib/apiProxy';

// Legacy alias — canonical is /api/home and /api/home/config
export async function GET(req) { return proxy(req, '/api/admin/home'); }
