import { api, get, put, del } from './api';

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
// Lead — per openapi.yaml
// ---------------------------------------------------------------------------
export interface Lead {
  _id: string;
  name: string;
  phone: string;
  treatmentInterest?: string | Record<string, unknown> | null;
  source: 'enquiry_form' | 'practo_click' | 'phone_click' | string;
  locationId?: string | null;
  date?: string;
  leadStatus: 'new' | 'contacted' | 'scheduled' | 'completed' | 'lost' | string;
  appointmentStatus: 'none' | 'booked' | 'completed' | 'cancelled' | 'no_show' | string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeadListParams {
  page?: number;
  limit?: number;
  status?: string; // maps to leadStatus
  source?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface LeadStatsParams {
  startDate?: string;
  endDate?: string;
  source?: string;
}

export interface LeadStats {
  total: number;
  byStatus?: Record<string, number>;
  bySource?: Record<string, number>;
  last7Days?: Array<{ _id: string; count: number }>;
  [k: string]: unknown;
}

export interface LeadExportParams {
  status?: string;
  source?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateLeadPayload {
  leadStatus?: Lead['leadStatus'];
  appointmentStatus?: Lead['appointmentStatus'];
  notes?: string;
  treatmentInterest?: string;
}

// ---------------------------------------------------------------------------
// Endpoints — via Next proxy:
//   GET    /api/leads              -> GET    /api/admin/leads/
//   GET    /api/leads/stats        -> GET    /api/admin/leads/stats
//   GET    /api/leads/export       -> GET    /api/admin/leads/export (text/csv)
//   GET    /api/leads/:id          -> GET    /api/admin/leads/:id
//   PUT    /api/leads/:id          -> PUT    /api/admin/leads/:id
//   DELETE /api/leads/:id          -> DELETE /api/admin/leads/:id
// ---------------------------------------------------------------------------

/** GET /api/leads?page&limit&status&source&startDate&endDate&search */
export function getLeads(params?: LeadListParams) {
  return get<PagedResponse<Lead>>('/api/leads', params as Record<string, unknown>);
}

/** GET /api/leads/stats?startDate&endDate&source */
export function getLeadStats(params?: LeadStatsParams) {
  return get<LeadStats>('/api/leads/stats', params as Record<string, unknown>);
}

/** GET /api/leads/:id */
export function getLead(id: string) {
  return get<Lead>(`/api/leads/${encodeURIComponent(id)}`);
}

/**
 * PUT /api/leads/:id — only 4 writable fields allowed:
 * leadStatus, appointmentStatus, notes, treatmentInterest
 */
export function updateLead(id: string, data: UpdateLeadPayload) {
  // enforce whitelist client-side to avoid 422 for extra keys
  const payload: UpdateLeadPayload = {};
  if (data.leadStatus !== undefined) payload.leadStatus = data.leadStatus;
  if (data.appointmentStatus !== undefined) payload.appointmentStatus = data.appointmentStatus;
  if (data.notes !== undefined) payload.notes = data.notes;
  if (data.treatmentInterest !== undefined) payload.treatmentInterest = data.treatmentInterest;
  return put<Lead>(`/api/leads/${encodeURIComponent(id)}`, payload);
}

/** DELETE /api/leads/:id */
export function deleteLead(id: string) {
  return del<{ message?: string }>(`/api/leads/${encodeURIComponent(id)}`);
}

/**
 * GET /api/leads/export — returns CSV blob
 * Caller is responsible for triggering download from blob.
 * Uses responseType:'blob' so res.data is a Blob.
 * @example const res = await exportLeads({ status: 'new' }); window.URL.createObjectURL(res.data)
 */
export function exportLeads(params?: LeadExportParams) {
  return api.get<Blob>('/api/leads/export', { params, responseType: 'blob' as const });
}

/**
 * Alias for blob export — same as exportLeads
 */
export function exportLeadsBlob(params?: LeadExportParams) {
  return api.get<Blob>('/api/leads/export', { params, responseType: 'blob' as const });
}

// Aliases
export const fetchLeads = getLeads;
export const fetchLeadStats = getLeadStats;
export const fetchLead = getLead;
