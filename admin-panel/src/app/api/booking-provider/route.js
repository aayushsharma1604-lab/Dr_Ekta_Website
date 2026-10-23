import { proxy } from '@/lib/apiProxy';

export async function GET(req) {
  return proxy(req, '/api/admin/booking-provider');
}

export async function PUT(req) {
  return proxy(req, '/api/admin/booking-provider');
}
