import { get, put, post } from './api';

// ---------------------------------------------------------------------------
// Booking Provider — per openapi.yaml /api/admin/booking-provider + clicks
// ---------------------------------------------------------------------------
export interface BookingProvider {
  _id?: string;
  providerName?: string; // e.g. 'practo'
  profileUrl?: string;
  bookingUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateBookingProviderPayload {
  providerName?: string; // defaults to 'practo' if omitted (saga coerces)
  profileUrl?: string;
  bookingUrl?: string;
  isActive?: boolean;
}

export interface PractoClicksParams {
  startDate?: string; // ISO date string
  endDate?: string;
}

export interface PractoClicksResponse {
  totalClicks: number;
  dailyStats: Array<{ _id: string; count: number }>; // _id is YYYY-MM-DD
}

// ---------------------------------------------------------------------------
// Endpoints — via Next proxy:
//   GET /api/booking-provider   -> GET /api/admin/booking-provider (404 if not configured)
//   PUT /api/booking-provider   -> PUT /api/admin/booking-provider (upsert)
//   GET /api/practo-clicks      -> GET /api/admin/practo-clicks?startDate&endDate
//   GET /api/booking-cta        -> GET /api/admin/booking-cta (dual mount, no auth) — optional helper
//   POST /api/practo-click      -> POST /api/admin/leads/practo-click (log click) — optional
// ---------------------------------------------------------------------------

/** GET /api/booking-provider — singleton, 404 if not configured */
export function getBookingProvider() {
  return get<BookingProvider | null>('/api/booking-provider');
}

/**
 * PUT /api/booking-provider — upsert
 * Body: { providerName?, profileUrl?, bookingUrl?, isActive? }
 * providerName defaults to 'practo' when omitted
 */
export function updateBookingProvider(data: UpdateBookingProviderPayload) {
  const body: UpdateBookingProviderPayload = {
    providerName: data.providerName || 'practo',
    ...(data.profileUrl !== undefined ? { profileUrl: data.profileUrl } : {}),
    ...(data.bookingUrl !== undefined ? { bookingUrl: data.bookingUrl } : {}),
    ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
  };
  return put<BookingProvider>('/api/booking-provider', body);
}

/** GET /api/practo-clicks?startDate&endDate */
export function getPractoClicks(params?: PractoClicksParams) {
  return get<PractoClicksResponse>('/api/practo-clicks', params as Record<string, unknown>);
}

/**
 * GET /api/booking-cta — active Practo links (dual mount, also at /api/public/booking-cta)
 * No auth required — but included for admin preview
 */
export function getBookingCta() {
  return get<BookingProvider>('/api/booking-cta');
}

/**
 * POST /api/leads/practo-click — log a click (always 200)
 * Dual mount: /api/public/leads/practo-click and /api/admin/leads/practo-click
 */
export function logPractoClick() {
  return post<{ message?: string }>('/api/leads/practo-click', {});
}

// Aliases matching saga naming
export const fetchBookingProvider = getBookingProvider;
export const fetchPractoClicks = getPractoClicks;
