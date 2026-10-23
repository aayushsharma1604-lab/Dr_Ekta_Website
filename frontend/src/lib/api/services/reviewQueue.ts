import { adminApi } from "../client";
import type { ReviewQueueItem, PagedResponse, ReviewQueueParams } from "../types";

/**
 * GET /api/admin/content/review-queue — moderation inbox (oldest-submitted first)
 * Query: page, limit, status (default pending), contentType
 */

export function getReviewQueue(params?: ReviewQueueParams): Promise<PagedResponse<ReviewQueueItem>> {
    return adminApi.get<PagedResponse<ReviewQueueItem>>("/content/review-queue", {
        params: params as Record<string, unknown>,
    });
}
