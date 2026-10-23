import { adminApi } from "../client";
import type { AuditLogEntry, PagedResponse, AuditLogParams } from "../types";

/**
 * GET /api/admin/audit-log — filterable, paginated audit trail (default limit 50)
 */

export function getAuditLog(params?: AuditLogParams): Promise<PagedResponse<AuditLogEntry>> {
    return adminApi.get<PagedResponse<AuditLogEntry>>("/audit-log", {
        params: params as Record<string, unknown>,
    });
}
