import { proxy } from '@/lib/apiProxy';

export async function GET(req) {
  return proxy(req, '/api/admin/analytics/reports/monthly');
}
