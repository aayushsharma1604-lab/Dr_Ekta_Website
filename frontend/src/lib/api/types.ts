/**
 * API Types — mirrors docs/openapi.yaml (OpenAPI 3.0.3)
 * Covers all schemas used by public + admin endpoints
 */

// ─── Common ──────────────────────────────────────────────────────────

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

export interface ApiError {
  error: string;
  code?: string;
  details?: Array<{ field: string; message: string; value?: unknown }>;
}

export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
  message?: string; // some endpoints use `message`
}

// ─── Media ───────────────────────────────────────────────────────────

export interface MediaAsset {
  _id: string;
  filename: string;
  originalName: string;
  storageKey: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedBy: { _id: string; name?: string; email?: string } | string;
  usedIn: Array<{ collection: string; documentId: string; field: string }>;
  altText: string;
  createdAt: string;
  updatedAt: string;
}

// ─── ClinicInfo (singleton) ────────────────────────────────────────

export interface ClinicTimings {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface ClinicInfo {
  _id: string;
  practiceName: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  phones: string[];
  timings: ClinicTimings[];
  mapCoordinates: {
    latitude: number;
    longitude: number;
  };
  socialLinks: SocialLink[];
  legalEntityName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Treatment ─────────────────────────────────────────────────────

export type ContentStatus =
  | "draft"
  | "pending"
  | "approved"
  | "published"
  | "rejected";

export interface TreatmentSections {
  what?: string;
  who?: string;
  procedure?: string;
  pain?: string;
  recovery?: string;
  risks?: string;
  duration?: string;
  expectations?: string;
  whyDrEkta?: string;
}

export interface TreatmentFaq {
  question: string;
  answer: string;
  order?: number;
}

export interface TreatmentSeo {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: MediaAsset | string | null;
}

export interface Treatment {
  _id: string;
  slug: string;
  title: string;
  status: ContentStatus;
  locationId: string | null;
  sections: TreatmentSections;
  faqs: TreatmentFaq[];
  heroImage: MediaAsset | null | string;
  gallery: (MediaAsset | string)[];
  relatedTreatments: (Treatment | { title: string; slug: string })[];
  seo: TreatmentSeo;
  createdBy: { _id: string; name?: string; email?: string } | null;
  reviewedBy: { _id: string; name?: string; email?: string } | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // compat with frontend mock shape
  description?: string;
  icon?: string;
  shortDescription?: string;
  problems?: string[];
  benefits?: string[];
}

// ─── Article ───────────────────────────────────────────────────────

export type ArticleCategory =
  | "preventive-care"
  | "restorative"
  | "cosmetic"
  | "orthodontics"
  | "oral-surgery"
  | "pediatric"
  | "emergency"
  | "technology"
  | "patient-education";

export interface ArticleSource {
  title: string;
  url: string;
  authors?: string;
  publishedDate?: string;
}

export interface ArticleFaq {
  question: string;
  answer: string;
  order?: number;
}

export interface ArticleCtaBox {
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
}

export interface Article {
  _id: string;
  title: string;
  slug: string;
  category: ArticleCategory;
  tags: string[];
  body: string;
  excerpt?: string;
  layout?: "standard" | "hero-feature" | "step-guide" | "faq" | "before-after" | "editorial" | "medical-guide" | "research" | "storytelling" | "step-by-step" | "health-guide" | "report-analysis" | "symptoms" | "clinical-deep-dive";
  beforeImage?: MediaAsset | string | null;
  afterImage?: MediaAsset | string | null;
  coverImage?: MediaAsset | string | null;
  galleryImages?: (MediaAsset | string)[];
  quickSummary?: string;
  pullQuote?: string;
  warnings?: string[];
  checklist?: string[];
  pros?: string[];
  cons?: string[];
  whenToConsult?: string;
  chartData?: { title?: string; labels?: string[]; values?: number[] } | null;
  disclaimer?: string;
  abstract?: string;
  audience?: string;
  preparation?: string;
  keyFindings?: string[];
  dos?: string[];
  donts?: string[];
  symptoms?: string[];
  causes?: string[];
  riskFactors?: string[];
  warningSigns?: string[];
  markers?: { name: string; description?: string; unit?: string; range?: string; interpretation?: string; factors?: string }[];
  keyPoints?: string[];
  faqs?: ArticleFaq[];
  ctaBox?: ArticleCtaBox | null;
  reviewedAt?: string | null;
  author: string;
  reviewer: { _id: string; name?: string } | null;
  credentialsDisplay: string;
  sources: ArticleSource[];
  status: ContentStatus;
  locationId: string | null;
  publishedAt: string | null;
  seo: TreatmentSeo;
  createdAt: string;
  updatedAt: string;
  // list endpoint omits body — make it optional for list types
}

export type ArticleListItem = Omit<Article, "body"> & { body?: string };

// ─── Testimonial ───────────────────────────────────────────────────

export type TestimonialType = "text" | "video" | "audio" | "image";

export interface TestimonialConsent {
  consentGiven: boolean;
  consentDocRef: MediaAsset | string | null;
  consentDate: string | null;
}

export interface Testimonial {
  _id: string;
  patientDisplayName: string;
  treatmentTag: { _id: string; title: string; slug: string } | null;
  type: TestimonialType;
  content: string;
  consent: TestimonialConsent;
  status: ContentStatus;
  locationId: string | null;
  reviewedBy: { _id: string; name?: string } | null;
  reviewNote: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── TeamMember (Our Team) ─────────────────────────────────────────

export type TeamCategory =
  | "general"
  | "orthodontics"
  | "endodontics"
  | "oral-surgery"
  | "periodontics"
  | "implantology"
  | "prosthodontics"
  | "cosmetic"
  | "pediatric";

export interface TeamQualification {
  degree?: string;
  institution?: string;
  year?: number;
}

export interface TeamMember {
  _id: string;
  name: string;
  slug: string;
  role: string;
  category: TeamCategory;
  photo: MediaAsset | string | null;
  bio: string;
  qualifications: TeamQualification[];
  experienceYears: number | null;
  order: number;
  status: ContentStatus;
  locationId: string | null;
  layout?: "classic-profile" | "sanctuary-editorial" | "compact-card" | "timeline" | "gallery-spotlight";
  languages?: string[];
  consultationFee?: number | null;
  location?: string;
  services?: string[];
  reviews?: { patientName?: string; rating?: number; text?: string }[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── GalleryItem ───────────────────────────────────────────────────

export interface GalleryItem {
  _id: string;
  beforeImg: MediaAsset | string;
  afterImg: MediaAsset | string;
  treatmentTag: { _id: string; title: string; slug: string } | null;
  content: string;
  consent: TestimonialConsent;
  status: ContentStatus;
  locationId: string | null;
  reviewedBy: { _id: string; name?: string } | null;
  reviewNote: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Video ─────────────────────────────────────────────────────────

export type VideoStatus = "published" | "hidden";

export interface Video {
  _id: string;
  url: string;
  title: string;
  category: string;
  thumbnail: string;
  order: number;
  status: VideoStatus;
  locationId: string | null;
  transcript: string;
  captionsUrl: MediaAsset | null | string;
  createdAt: string;
  updatedAt: string;
}

// ─── CuratedPost (Instagram) ───────────────────────────────────────

export interface CuratedPost {
  _id: string;
  image: MediaAsset | string;
  caption: string;
  permalink: string;
  order: number;
  locationId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Lead ──────────────────────────────────────────────────────────

export type LeadSource = "enquiry_form" | "practo_click" | "phone_click";
export type LeadStatus = "new" | "contacted" | "scheduled" | "completed" | "lost";
export type AppointmentStatus =
  | "none"
  | "booked"
  | "completed"
  | "cancelled"
  | "no_show";

export interface Lead {
  _id: string;
  name: string;
  phone: string;
  treatmentInterest: { _id: string; title: string; slug: string } | null | string;
  source: LeadSource;
  locationId: string | null;
  date: string;
  leadStatus: LeadStatus;
  appointmentStatus: AppointmentStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Profile (doctor singleton) ────────────────────────────────────

export interface ProfileQualification {
  degree: string;
  institution: string;
  year: number;
}

export interface ProfileMembership {
  organization: string;
  role: string;
  since: string;
}

export interface ProfileAward {
  title: string;
  issuer: string;
  year: number;
}

export interface ProfileMediaAppearance {
  outlet: string;
  title: string;
  date: string;
  url: string;
}

export interface ProfilePublication {
  title: string;
  journal: string;
  year: number;
  url: string;
}

export interface Profile {
  _id: string;
  qualifications: ProfileQualification[];
  memberships: ProfileMembership[];
  awards: ProfileAward[];
  mediaAppearances: ProfileMediaAppearance[];
  publications: ProfilePublication[];
  photo: MediaAsset | null | string;
  video: MediaAsset | null | string;
  bio: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Homepage ──────────────────────────────────────────────────────

export interface HomepageAggregate {
  treatments: Treatment[];
  articles: ArticleListItem[];
  videos: Video[];
  testimonials: Testimonial[];
}

export interface HomepageConfig {
  _id?: string;
  featuredTreatments: string[] | Treatment[];
  featuredArticles: string[] | Article[];
  featuredVideos: string[] | Video[];
  featuredTestimonials: string[] | Testimonial[];
  createdAt?: string;
  updatedAt?: string;
}

// ─── Booking ───────────────────────────────────────────────────────

export interface BookingCTA {
  provider: string;
  profileUrl: string;
  bookingUrl: string;
}

export interface BookingProviderConfig {
  _id?: string;
  providerName: string;
  profileUrl: string;
  bookingUrl: string;
  isActive: boolean;
}

// ─── Auth ──────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  lastLogin?: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// ─── Enquiry ───────────────────────────────────────────────────────

export interface EnquiryPayload {
  name: string;
  phone: string;
  treatmentInterest?: string;
  honeypot?: string;
  captchaToken?: string;
}

export interface EnquiryResponse {
  message: string;
  leadId?: string;
}

// ─── Params ────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface TreatmentListParams extends PaginationParams {
  search?: string;
}

export interface ArticleListParams extends PaginationParams {
  category?: string;
  tags?: string[];
  search?: string;
}

export interface TestimonialListParams extends PaginationParams {
  treatmentTag?: string;
}

export interface TeamListParams extends PaginationParams {
  category?: string;
  search?: string;
}

export interface VideoListParams extends PaginationParams {
  category?: string;
}

// ─── Lead Params & Stats ────────────────────────────────────────────

export interface LeadListParams extends PaginationParams {
  status?: LeadStatus;
  source?: LeadSource;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface LeadStats {
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  total: number;
  last7Days: number;
}

// ─── Media Upload ───────────────────────────────────────────────────

export interface MediaListParams extends PaginationParams {
  mimeType?: string;
}

export interface MediaUploadPayload {
  filename: string;
  mimeType: string;
  size: number;
}

export interface MediaUploadResponse {
  uploadUrl: string;
  publicUrl: string;
  publicId: string;
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  resourceType: string;
  paramsToSign: Record<string, string>;
  expiresIn: number;
}

export interface MediaConfirmPayload {
  filename: string;
  mimeType: string;
  size: number;
  key: string;
  publicId: string;
  url: string;
}

// ─── Redirect ───────────────────────────────────────────────────────

export interface RedirectMap {
  _id: string;
  fromPath: string;
  toPath: string;
  statusCode: 301 | 302;
  createdAt: string;
  updatedAt: string;
}

export interface RedirectListParams extends PaginationParams {
  search?: string;
}

// ─── Audit Log ──────────────────────────────────────────────────────

export interface AuditLogEntry {
  _id: string;
  actorId: { _id: string; name?: string; email?: string } | null;
  action: string;
  targetCollection: string;
  targetId?: string;
  before?: unknown;
  after?: unknown;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogParams extends PaginationParams {
  actorId?: string;
  action?: string;
  targetCollection?: string;
  targetId?: string;
  startDate?: string;
  endDate?: string;
}

// ─── Analytics ──────────────────────────────────────────────────────

export interface AnalyticsMonthlyReport {
  byEventType: Record<string, number>;
  dailyStats: Array<{ date: string; count: number }>;
  topPages: Array<{ _id: string; count: number }>;
  leadSources: Record<string, number>;
}

export interface AnalyticsEventEntry {
  _id: string;
  eventType: string;
  refId?: string;
  refModel?: string;
  metadata?: Record<string, unknown>;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AnalyticsEventParams extends PaginationParams {
  eventType?: string;
  startDate?: string;
  endDate?: string;
}

// ─── Review Queue ───────────────────────────────────────────────────

export interface ReviewQueueItem {
  _id: string;
  contentType: "treatment" | "article" | "testimonial" | "galleryItem";
  contentId: string;
  status: ContentStatus;
  reviewedBy?: { _id: string; name?: string } | null;
  reviewNote?: string;
  submittedAt?: string;
  reviewedAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewQueueParams extends PaginationParams {
  status?: string;
  contentType?: string;
}
