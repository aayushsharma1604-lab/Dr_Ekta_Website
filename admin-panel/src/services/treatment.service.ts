import { get, post, put, del } from './api';

// ---------------------------------------------------------------------------
// Shared pagination types
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
// Treatment — per openapi.yaml
// ---------------------------------------------------------------------------
export interface Treatment {
  _id: string;
  slug: string;
  title: string;
  status: 'draft' | 'published';
  locationId?: string | null;
  sections?: {
    what?: string;
    who?: string;
    procedure?: string;
    pain?: string;
    recovery?: string;
    risks?: string;
    duration?: string;
    expectations?: string;
    whyDrEkta?: string;
    [k: string]: unknown;
  };
  faqs?: Array<{ question: string; answer: string; order?: number }>;
  heroImage?: string | Record<string, unknown> | null;
  gallery?: Array<string | Record<string, unknown>>;
  relatedTreatments?: Array<string | Record<string, unknown>>;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string | Record<string, unknown> | null;
    [k: string]: unknown;
  };
  createdBy?: Record<string, unknown> | null;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TreatmentListParams {
  page?: number;
  limit?: number;
  status?: 'draft' | 'published' | string;
  search?: string;
}

export interface CreateTreatmentPayload {
  title: string; // required
  slug?: string;
  status?: 'draft' | 'published';
  icon?: string;
  problems?: string[];
  benefits?: string[];
  sections?: Treatment['sections'];
  faqs?: Treatment['faqs'];
  heroImage?: string;
  gallery?: string[];
  relatedTreatments?: string[];
  seo?: Treatment['seo'];
  [k: string]: unknown;
}

export type UpdateTreatmentPayload = Partial<CreateTreatmentPayload>;

// ---------------------------------------------------------------------------
// Endpoints — via Next proxy: /api/treatments/* -> /api/admin/treatments/*
// ---------------------------------------------------------------------------

/** GET /api/treatments?page&limit&status&search */
export function getTreatments(params?: TreatmentListParams) {
  return get<PagedResponse<Treatment>>('/api/treatments', params as Record<string, unknown>);
}

/** GET /api/treatments/:id */
export function getTreatment(id: string) {
  return get<Treatment>(`/api/treatments/${encodeURIComponent(id)}`);
}

/** POST /api/treatments — { title } required */
export function createTreatment(data: CreateTreatmentPayload) {
  return post<Treatment>('/api/treatments', data);
}

/** PUT /api/treatments/:id — partial or full */
export function updateTreatment(id: string, data: UpdateTreatmentPayload) {
  return put<Treatment>(`/api/treatments/${encodeURIComponent(id)}`, data);
}

/** DELETE /api/treatments/:id */
export function deleteTreatment(id: string) {
  return del<{ message?: string }>(`/api/treatments/${encodeURIComponent(id)}`);
}

// Aliases matching prompt naming
export const fetchTreatments = getTreatments;
export const fetchTreatment = getTreatment;
