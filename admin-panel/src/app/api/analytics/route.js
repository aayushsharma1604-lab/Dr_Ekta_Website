import { proxy } from '@/lib/apiProxy';

// Backward compat: /api/analytics -> analytics events list
// Preferred: use /api/analytics/reports/monthly and /api/analytics/events
export async function GET(req) {
  return proxy(req, '/api/admin/analytics/events');
}
