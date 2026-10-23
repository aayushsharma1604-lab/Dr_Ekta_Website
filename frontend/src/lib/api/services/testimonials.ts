import { publicApi, adminApi, serverFetch } from "../client";
import type { Testimonial, PagedResponse, TestimonialListParams } from "../types";

/**
 * GET /api/public/testimonials/?page&limit&treatmentTag
 * GET /api/admin/testimonials/:id  (+ CRUD + workflow consent-gated)
 * Note: GET /api/admin/testimonials/ is shadowed — serves public list
 */

export function getTestimonials(params?: TestimonialListParams): Promise<PagedResponse<Testimonial>> {
  return publicApi.get<PagedResponse<Testimonial>>("/testimonials/", {
    params: params as Record<string, unknown>,
  });
}

export function getTestimonialsServer(params?: TestimonialListParams): Promise<PagedResponse<Testimonial>> {
  return serverFetch<PagedResponse<Testimonial>>(`/public/testimonials/`, {
    params: params as Record<string, string | number | boolean | undefined | string[]>,
    revalidate: 300,
    tags: ["testimonials"],
  });
}

// ─── Admin ─────────────────────────────────────────────────────────

export function getAdminTestimonials(params?: TestimonialListParams): Promise<PagedResponse<Testimonial>> {
  // shadowed — currently returns public list; keep for future fix
  return adminApi.get<PagedResponse<Testimonial>>("/testimonials/", {
    params: params as Record<string, unknown>,
  });
}

export function getAdminTestimonialById(id: string): Promise<Testimonial> {
  return adminApi.get<Testimonial>(`/testimonials/${id}`);
}

export function createTestimonial(data: Partial<Testimonial> & { patientDisplayName: string; content: string }): Promise<Testimonial> {
  return adminApi.post<Testimonial>("/testimonials/", data);
}

export function updateTestimonial(id: string, data: Partial<Testimonial>): Promise<Testimonial> {
  return adminApi.put<Testimonial>(`/testimonials/${id}`, data);
}

export function deleteTestimonial(id: string): Promise<{ message: string }> {
  return adminApi.delete<{ message: string }>(`/testimonials/${id}`);
}

export function submitTestimonial(id: string): Promise<{ message: string }> {
  return adminApi.post<{ message: string }>(`/testimonials/${id}/submit`, {});
}

export function approveTestimonial(id: string, reviewNote?: string): Promise<{ message: string }> {
  return adminApi.post<{ message: string }>(`/testimonials/${id}/approve`, reviewNote ? { reviewNote } : {});
}

export function rejectTestimonial(id: string, reviewNote: string): Promise<{ message: string }> {
  return adminApi.post<{ message: string }>(`/testimonials/${id}/reject`, { reviewNote });
}

export function publishTestimonial(id: string): Promise<{ message: string }> {
  return adminApi.post<{ message: string }>(`/testimonials/${id}/publish`, {});
}
