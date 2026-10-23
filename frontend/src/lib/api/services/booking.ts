import { publicApi, adminApi } from "../client";
import type { BookingCTA, BookingProviderConfig } from "../types";

/**
 * GET /api/public/booking-cta — 200 { provider, profileUrl, bookingUrl } | 404 no active provider
 * POST /api/public/leads/practo-click — always 200 (fire-and-forget)
 * GET|PUT /api/admin/booking-provider — admin provider config
 * GET /api/admin/practo-clicks?startDate&endDate — totals + 30-day daily
 */

export function getBookingCTA(): Promise<BookingCTA> {
  return publicApi.get<BookingCTA>("/booking-cta");
}

export function logPractoClick(): Promise<{ message: string }> {
  // fire-and-forget; body ignored
  return publicApi.post<{ message: string }>("/leads/practo-click", {});
}

// ─── Admin ─────────────────────────────────────────────────────────

export function getBookingProvider(): Promise<BookingProviderConfig> {
  return adminApi.get<BookingProviderConfig>("/booking-provider");
}

export function updateBookingProvider(data: Partial<BookingProviderConfig>): Promise<BookingProviderConfig> {
  return adminApi.put<BookingProviderConfig>("/booking-provider", data);
}

export function getPractoClicks(params?: { startDate?: string; endDate?: string }): Promise<{
  totalClicks: number;
  dailyStats: Array<{ _id: string; count: number }>;
}> {
  return adminApi.get("/practo-clicks", { params: params as Record<string, unknown> });
}
