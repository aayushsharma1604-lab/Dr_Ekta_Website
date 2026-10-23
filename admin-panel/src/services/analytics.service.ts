import { get } from './api';

// ---------------------------------------------------------------------------
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
export interface PagedResponse<T> {
  items: T[];
  pagination: Pagination;
}

// ---------------------------------------------------------------------------
// Analytics — per openapi.yaml /api/admin/analytics/*
// Two distinct endpoints:
//   GET /api/admin/analytics/reports/monthly?startDate&endDate
//   GET /api/admin/analytics/events?page&limit&eventType&startDate&endDate
// Proxied as:
//   GET /api/analytics/reports/monthly
//   GET /api/analytics/events
// Legacy alias GET /api/analytics -> GET /api/admin/analytics/events (events list)
// ---------------------------------------------------------------------------
export interface MonthlyReport {
  // Backend returns aggregates — shape is open object per spec
  // Example: { totalEnquiries, totalClicks, byMonth: [{ month, enquiries, clicks }] }
  totalEnquiries?: number;
  totalClicks?: number;
  byMonth?: Array<{ month: string; enquiries?: number; clicks?: number; [k: string]: unknown }>;
  bySource?: Record<string, number>;
  byStatus?: Record<string, number>;
  [k: string]: unknown;
}

export interface AnalyticsEvent {
  _id?: string;
  eventType: string;
  timestamp?: string;
  date?: string;
  metadata?: Record<string, unknown>;
  [k: string]: unknown;
}

export interface MonthlyReportParams {
  startDate?: string; // ISO date
  endDate?: string;
}

export interface AnalyticsEventsParams {
  page?: number;
  limit?: number;
  eventType?: string;
  startDate?: string;
  endDate?: string;
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

/**
 * GET /api/analytics/reports/monthly?startDate&endDate
 * Monthly report — live aggregates of enquiry + click events
 */
export function getMonthlyReport(params?: MonthlyReportParams) {
  return get<MonthlyReport>('/api/analytics/reports/monthly', params as Record<string, unknown>);
}

/**
 * GET /api/analytics/events?page&limit&eventType&startDate&endDate
 * Raw analytics event list — PagedResponse<AnalyticsEvent>
 */
export function getAnalyticsEvents(params?: AnalyticsEventsParams) {
  return get<PagedResponse<AnalyticsEvent>>('/api/analytics/events', params as Record<string, unknown>);
}

/**
 * Legacy alias — GET /api/analytics (proxied to events list)
 * Kept for backward compat with older saga code; prefer getAnalyticsEvents
 */
export function getAnalytics(params?: AnalyticsEventsParams) {
  return get<PagedResponse<AnalyticsEvent>>('/api/analytics', params as Record<string, unknown>);
}

// Aliases matching prompt + saga naming
export const fetchMonthlyReport = getMonthlyReport;
export const fetchAnalyticsEvents = getAnalyticsEvents;
export const getReports = getMonthlyReport;
export const getEvents = getAnalyticsEvents;
