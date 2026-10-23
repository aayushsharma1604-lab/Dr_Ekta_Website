import { proxy } from '@/lib/apiProxy';

export async function GET(req) { return proxy(req, '/api/admin/team'); }
export async function POST(req) { return proxy(req, '/api/admin/team'); }
