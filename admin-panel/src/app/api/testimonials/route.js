import { proxy } from '@/lib/apiProxy';

export async function GET(req) { return proxy(req, '/api/admin/testimonials'); }
export async function POST(req) { return proxy(req, '/api/admin/testimonials'); }
