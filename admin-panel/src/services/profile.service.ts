import { get, put } from './api';

// ---------------------------------------------------------------------------
// Profile — singleton per openapi.yaml /api/admin/profile/
// ---------------------------------------------------------------------------
export interface Qualification {
  degree: string;
  institution: string;
  year: number; // 1950-2030
}

export interface Membership {
  organization: string;
  role?: string;
  since?: number; // 1950-2030
}

export interface Award {
  title: string;
  issuer?: string;
  year?: number;
}

export interface MediaAppearance {
  outlet?: string;
  title?: string;
  date?: string; // ISO date
  url?: string;
}

export interface Publication {
  title: string;
  journal?: string;
  year?: number;
  url?: string;
}

export interface Profile {
  _id?: string;
  bio?: string;
  qualifications?: Qualification[];
  memberships?: Membership[];
  awards?: Award[];
  mediaAppearances?: MediaAppearance[];
  publications?: Publication[];
  photo?: string | Record<string, unknown> | null; // MediaAsset _id or populated
  video?: string | Record<string, unknown> | null; // MediaAsset _id or populated
  locationId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type UpdateProfilePayload = Partial<{
  bio: string;
  qualifications: Qualification[];
  memberships: Membership[];
  awards: Award[];
  mediaAppearances: MediaAppearance[];
  publications: Publication[];
  photo: string; // MediaAsset ObjectId
  video: string; // MediaAsset ObjectId
}>;

// ---------------------------------------------------------------------------
// Endpoints — via Next proxy: singleton, no :id
//   GET /api/profile -> GET /api/admin/profile/
//   PUT /api/profile -> PUT /api/admin/profile/
// ---------------------------------------------------------------------------

/** GET /api/profile — singleton */
export function getProfile() {
  return get<Profile>('/api/profile');
}

/**
 * PUT /api/profile — update singleton
 * Body whitelist: bio, qualifications[], memberships[], awards[],
 * mediaAppearances[], publications[], photo, video
 * Years validated 1950-2030 client-side before calling
 */
export function updateProfile(data: UpdateProfilePayload) {
  return put<Profile>('/api/profile', data);
}

// Aliases
export const fetchProfile = getProfile;
