import { proxy } from '@/lib/apiProxy';
export async function GET(req) { return proxy(req, '/api/admin/leads/stats'); }
