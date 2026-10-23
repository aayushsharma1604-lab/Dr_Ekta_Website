import { get, put } from './api';

// ---------------------------------------------------------------------------
// Types — per openapi.yaml ClinicInfo schema
// ---------------------------------------------------------------------------
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export interface Timing {
  day: string;
  open?: string;
  close?: string;
  isClosed?: boolean;
}

export interface MapCoordinates {
  latitude?: number;
  longitude?: number;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface ClinicInfo {
  _id?: string;
  practiceName?: string;
  address?: Address;
  phones?: string[];
  email?: string;
  timings?: Timing[];
  mapCoordinates?: MapCoordinates;
  socialLinks?: SocialLink[];
  legalEntityName?: string;
  locationId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type UpdateClinicInfoPayload = Partial<ClinicInfo>;

// ---------------------------------------------------------------------------
// Service — singleton resource (no :id)
// Endpoints via Next proxy:
//   GET /api/clinic-info -> GET /api/admin/clinic-info
//   PUT /api/clinic-info -> PUT /api/admin/clinic-info
// ---------------------------------------------------------------------------

/**
 * GET /api/clinic-info
 * No query params — singleton. Returns ClinicInfo object (not PagedResponse).
 */
export function getClinicInfo() {
  return get<ClinicInfo>('/api/clinic-info');
}

/**
 * PUT /api/clinic-info
 * Body: partial or full ClinicInfo object. Accepts any object per spec
 * (backend is lenient), but should send full merged object to avoid clearing
 * fields not included in payload.
 */
export function updateClinicInfo(data: UpdateClinicInfoPayload) {
  return put<ClinicInfo>('/api/clinic-info', data);
}

// Aliases
export const fetchClinicInfo = getClinicInfo;
export const updateClinic = updateClinicInfo;
