import { proxy } from '@/lib/apiProxy';

export async function GET(req) { return proxy(req, '/api/admin/redirects'); }
export async function POST(req) { return proxy(req, '/api/admin/redirects'); }
