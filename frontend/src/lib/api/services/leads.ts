import { adminApi } from "../client";
import type { Lead, PagedResponse, LeadListParams, LeadStats } from "../types";

/**
 * GET  /api/admin/leads         — paginated list (filters: status, source, dates, search)
 * GET  /api/admin/leads/stats   — funnel numbers
 * GET  /api/admin/leads/export  — CSV download
 * GET  /api/admin/leads/:id     — single lead (⚠ 500 on unknown id)
 * PUT  /api/admin/leads/:id     — update (leadStatus, appointmentStatus, notes, treatmentInterest)
 * DELETE /api/admin/leads/:id
 */

export function getLeads(params?: LeadListParams): Promise<PagedResponse<Lead>> {
    return adminApi.get<PagedResponse<Lead>>("/leads", { params: params as Record<string, unknown> });
}

export function getLeadById(id: string): Promise<Lead> {
    return adminApi.get<Lead>(`/leads/${id}`);
}

export function updateLead(
    id: string,
    data: { leadStatus?: string; appointmentStatus?: string; notes?: string; treatmentInterest?: string },
): Promise<Lead> {
    return adminApi.put<Lead>(`/leads/${id}`, data);
}

export function deleteLead(id: string): Promise<{ message: string }> {
    return adminApi.delete<{ message: string }>(`/leads/${id}`);
}

export function getLeadStats(params?: {
    startDate?: string;
    endDate?: string;
    source?: string;
}): Promise<LeadStats> {
    return adminApi.get<LeadStats>("/leads/stats", { params: params as Record<string, unknown> });
}

export function exportLeads(params?: {
    startDate?: string;
    endDate?: string;
    source?: string;
    status?: string;
}): Promise<string> {
    return adminApi.get<string>("/leads/export", { params: params as Record<string, unknown>, raw: true });
}
