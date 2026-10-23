import { proxy } from '@/lib/apiProxy';
export async function POST(req) { return proxy(req, '/api/admin/media/confirm'); }
