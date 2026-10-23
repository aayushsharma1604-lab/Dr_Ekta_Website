import { adminApi } from "../client";
import type { AnalyticsMonthlyReport, AnalyticsEventEntry, PagedResponse, AnalyticsEventParams } from "../types";

/**
 * GET /api/admin/analytics/reports/monthly — aggregated report (⚠ empty until events are logged)
 * GET /api/admin/analytics/events          — raw event list
 */

export function getMonthlyReport(params?: { startDate?: string; endDate?: string }): Promise<AnalyticsMonthlyReport> {
    return adminApi.get<AnalyticsMonthlyReport>("/analytics/reports/monthly", {
        params: params as Record<string, unknown>,
    });
}

export function getAnalyticsEvents(params?: AnalyticsEventParams): Promise<PagedResponse<AnalyticsEventEntry>> {
    return adminApi.get<PagedResponse<AnalyticsEventEntry>>("/analytics/events", {
        params: params as Record<string, unknown>,
    });
}
