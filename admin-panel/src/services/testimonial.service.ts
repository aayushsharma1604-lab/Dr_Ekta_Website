import { get, post, put, del } from './api';

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
// Testimonial — per openapi.yaml
// ---------------------------------------------------------------------------
export interface Testimonial {
  _id: string;
  patientDisplayName: string;
  treatmentTag?: string | Record<string, unknown> | null;
  type?: 'text' | 'video' | 'audio' | string;
  content: string;
  status: 'draft' | 'published' | string;
  locationId?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TestimonialListParams {
  page?: number;
  limit?: number;
  treatmentTag?: string;
  status?: 'draft' | 'published' | string;
}

export interface CreateTestimonialPayload {
  patientDisplayName: string; // required
  content: string; // required
  treatmentTag?: string;
  type?: 'text' | 'video' | 'audio';
  status?: 'draft' | 'published';
}

export type UpdateTestimonialPayload = Partial<CreateTestimonialPayload>;

// ---------------------------------------------------------------------------
// Endpoints — via Next proxy: /api/testimonials/* -> /api/admin/testimonials/*
// ---------------------------------------------------------------------------

/** GET /api/testimonials?page&limit&treatmentTag&status */
export function getTestimonials(params?: TestimonialListParams) {
  return get<PagedResponse<Testimonial>>('/api/testimonials', params as Record<string, unknown>);
}

/** GET /api/testimonials/:id */
export function getTestimonial(id: string) {
  return get<Testimonial>(`/api/testimonials/${encodeURIComponent(id)}`);
}

/** POST /api/testimonials — { patientDisplayName, content } required */
export function createTestimonial(data: CreateTestimonialPayload) {
  return post<Testimonial>('/api/testimonials', data);
}

/** PUT /api/testimonials/:id */
export function updateTestimonial(id: string, data: UpdateTestimonialPayload) {
  return put<Testimonial>(`/api/testimonials/${encodeURIComponent(id)}`, data);
}

/** DELETE /api/testimonials/:id */
export function deleteTestimonial(id: string) {
  return del<{ message?: string }>(`/api/testimonials/${encodeURIComponent(id)}`);
}

// Aliases
export const fetchTestimonials = getTestimonials;
export const fetchTestimonial = getTestimonial;
