# API Endpoints — Frontend vs Admin Panel

Base URL local: `http://localhost:4000`. Every response is JSON except CSV (`leads/export`),
XML (`sitemap.xml`), plain text (`robots.txt`), and the redirect resolver (HTTP 301/302).

## How to tell them apart

| | **Frontend endpoints** | **Admin panel endpoints** |
|---|---|---|
| Prefix | `/api/public/...` | `/api/admin/...` |
| Auth | None (open to the internet) | `Authorization: Bearer <accessToken>` on every call **except** login/refresh/logout |
| Writes | Only 2: submit enquiry, log Practo click | Full create/update/delete on everything |
| Sees drafts? | **Never** — only `status: published` items (videos: `published`, not `hidden`) | Yes — sees all statuses, filters by `status` |
| Internal fields | Excluded (`createdBy`, notes, full user objects) | Included (populated `createdBy`, full docs) |
| Caching | `Cache-Control` per content type (profile 1h, lists 5min, home 1min) | `no-store` everywhere |
| Rate limits | Reads 100/min, enquiry 20/min (per IP) | Login/refresh 10 per 15 min |

Only `published` content is ever public. Publishing = setting `status: "published"` on create/update.
There is no review workflow: no submit/approve/reject endpoints exist.

## Table 1 — Frontend endpoints (website, no token)

| Method | Endpoint | Purpose | Notes |
|---|---|---|---|
| GET | `/` | API info (`name`, `version`, `status`) | Health-check helper |
| GET | `/api/public/health` | Liveness probe | `{ status: "ok", timestamp }` |
| GET | `/api/public/clinic-info` | Phones, address, timings, map, socials, email | Cached 1h + ETag; powers header/footer/contact |
| GET | `/api/public/treatments?page=&limit=&search=` | Published treatment cards | Limit capped at 100; full-text search |
| GET | `/api/public/treatments/:slug` | Treatment detail (sections, FAQs, SEO) | 404 unless published |
| GET | `/api/public/articles?page=&limit=&category=&tags=&search=` | Published article list (**no `body`**) | Teaser list; link to detail for full text |
| GET | `/api/public/articles/:slug` | Article detail (full body, sources, byline) | 404 unless published |
| GET | `/api/public/profile/` | Doctor bio, qualifications, photo/video | Cached 1h |
| GET | `/api/public/testimonials/?treatmentTag=` | Published patient stories | Filter by treatment for treatment pages |
| GET | `/api/public/gallery/?treatmentTag=` | Published before/after items | `beforeImg.url` / `afterImg.url` for sliders |
| GET | `/api/public/videos/?category=` | Published videos + transcripts | Embed `url`, show `transcript` for accessibility |
| GET | `/api/public/instagram-posts/` | Curated grid | Everything stored is public; links out via `permalink` |
| GET | `/api/public/announcements/` | Published notices (ordered) | `order` then newest; drafts hidden |
| GET | `/api/public/home/` | Homepage aggregate (treatments ≤6, articles ≤4, videos ≤4, testimonials ≤3) | One call powers the whole homepage |
| POST | `/api/public/enquiry` | Enquiry form → creates a Lead | `201 { message, leadId }`; honeypot-filled returns fake `200` with no lead; `422` on bad phone/unknown treatment/medical fields; needs `captchaToken` when captcha is configured |
| GET | `/api/public/booking-cta` | Practo `{ provider, profileUrl, bookingUrl }` | `404` when no active provider — hide/fallback the Book button |
| POST | `/api/public/leads/practo-click` | Fire-and-forget click log | Always `200`; send `{}` without awaiting |
| GET | `/api/public/sitemap.xml` | Generated sitemap (published content) | XML; videos linked by id |
| GET | `/api/public/robots.txt` | Generated robots (points at sitemap) | Plain text |
| GET | `/api/public/redirect/:path` | Legacy-URL redirect | `301`/`302` to `toPath`, else `404` |

## Table 2 — Admin panel endpoints (token required)

Auth: `POST /api/admin/auth/login` → store pair → send `Authorization: Bearer <accessToken>` →
silent `POST /api/admin/auth/refresh` on 401 → `POST /api/admin/auth/logout` on exit.

| Method | Endpoint | Purpose | Notes |
|---|---|---|---|
| POST | `/api/admin/auth/login` | Login *(no token)* | `{ email, password }` → `{ user, accessToken, refreshToken }`; uniform `401 Invalid credentials`; 5 fails → 15-min lock (`429`) |
| POST | `/api/admin/auth/refresh` | Rotate token pair *(no token)* | Body or httpOnly cookie; old refresh token is revoked |
| POST | `/api/admin/auth/logout` | Revoke refresh token *(no token)* | Always `200`; clears cookie |
| GET | `/api/admin/auth/me` | Current admin | `{ user: { id, name, email, lastLogin } }` |
| GET / PUT | `/api/admin/clinic-info` | Read / update practice info | PUT allowlist: practiceName, address, phones, timings, mapCoordinates, socialLinks, legalEntityName, email, locationId |
| POST | `/api/admin/media/upload` | Step 1: validate + Cloudinary signature bundle | `{ filename, mimeType, size }`; `422` on bad type/size; images get eager 400/800/1600px transforms |
| POST | `/api/admin/media/confirm` | Step 2: create MediaAsset | Send **both** `key` and `publicId` (same value) + http(s) `url`; `optimizedUrl`/`variants` stored automatically |
| GET | `/api/admin/media?page=&limit=&mimeType=` | List uploads (own only) | `uploadedBy` = you |
| GET / DELETE | `/api/admin/media/:id` | One asset / delete it | Delete blocked (`409`) only if `usedIn` is non-empty |
| GET | `/api/admin/treatments?status=&search=` | List all statuses | Limit capped at 100 |
| GET / POST / PUT / DELETE | `/api/admin/treatments[/:id]` | Full treatment CRUD | `status: draft\|published` set directly; rich text sanitized; `404` on unknown id |
| GET | `/api/admin/articles?status=&category=&search=` | List all statuses | Limit capped at 100 |
| GET / POST / PUT / DELETE | `/api/admin/articles[/:id]` | Full article CRUD | Same direct-status model; reviewer/credentials/sources editable |
| GET | `/api/admin/testimonials?status=&treatmentTag=` | List all statuses | Status filter **works** (split routers) |
| GET / POST / PUT / DELETE | `/api/admin/testimonials[/:id]` | Full testimonial CRUD | No consent fields; partial updates allowed |
| GET | `/api/admin/gallery?status=&treatmentTag=` | List all statuses | Status filter **works** |
| GET / POST / PUT / DELETE | `/api/admin/gallery[/:id]` | Full gallery CRUD | `beforeImg` + `afterImg` required on create |
| GET | `/api/admin/videos?status=&category=` | List all statuses | — |
| GET / POST / PUT / DELETE | `/api/admin/videos[/:id]` | Full video CRUD | `status: published\|hidden`; send the **full object** on PUT (validator is create-shaped) |
| GET | `/api/admin/instagram-posts/` | List curated posts | Status filter **works**; no status field (all live) |
| GET / POST / PUT / DELETE | `/api/admin/instagram-posts[/:id]` | Full curated-post CRUD | `image` + `permalink` (URL) required on create; all-optional on PUT |
| GET | `/api/admin/announcements?status=` | List all statuses | Status filter **works** |
| GET / POST / PUT / DELETE | `/api/admin/announcements[/:id]` | Full announcement CRUD | `title` + `body` required on create; `status: draft\|published` direct; body sanitized |
| GET | `/api/admin/profile/` | Doctor profile (admin view) | Same read as public |
| PUT | `/api/admin/profile/` | Update profile | Bio sanitized; `locationId` settable |
| GET / PUT | `/api/admin/home/config` | Read / replace featured-id arrays | `{ featuredTreatments, featuredArticles, featuredVideos, featuredTestimonials }` |
| GET | `/api/admin/leads?status=&source=&startDate=&endDate=&search=` | Lead table | Limit capped at 100; `status` = `leadStatus` |
| GET | `/api/admin/leads/stats` | Funnel cards | `{ byStatus, bySource, total, last7Days }` |
| GET | `/api/admin/leads/export?...` | CSV download (streamed, formula-escaped) | Same filters; fetch as blob |
| GET / PUT / DELETE | `/api/admin/leads/:id` | One lead / update status+notes / delete | Update allows only `leadStatus, appointmentStatus, notes, treatmentInterest`; `404` on unknown id |
| GET / PUT | `/api/admin/booking-provider` | Read / upsert Practo URLs | `404` on GET when unconfigured; public Book button updates immediately |
| GET | `/api/admin/practo-clicks` | Click totals + 30-day daily stats | Optional date filters |
| GET | `/api/admin/redirects?search=` | List redirects | Limit capped at 100 |
| GET / POST / PUT / DELETE | `/api/admin/redirects[/:id]` | Full redirect CRUD | `fromPath` unique (`/` prepended), immutable on PUT; `409 DUPLICATE_REDIRECT` |
| GET | `/api/admin/analytics/reports/monthly` | Monthly aggregates | Live: enquiry + click events; optional date filters |
| GET | `/api/admin/analytics/events?...` | Raw event list | Limit capped at 100 |

## Table 3 — Same resource, both sides (the differentiation cheat-sheet)

| Resource | Frontend (public, published-only) | Admin panel (all statuses, full CRUD) | Key difference |
|---|---|---|---|
| Treatments | `GET /api/public/treatments`, `GET .../treatments/:slug` | `GET/POST/PUT/DELETE /api/admin/treatments[/:id]` | Slug vs id lookup; public hides drafts + `createdBy` |
| Articles | `GET /api/public/articles`, `GET .../articles/:slug` | `GET/POST/PUT/DELETE /api/admin/articles[/:id]` | Public list omits `body`; admin sees full body + drafts |
| Testimonials | `GET /api/public/testimonials/` | `GET/POST/PUT/DELETE /api/admin/testimonials[/:id]` | Different paths, independent handlers |
| Gallery | `GET /api/public/gallery/` | `GET/POST/PUT/DELETE /api/admin/gallery[/:id]` | Same as above |
| Videos | `GET /api/public/videos/` | `GET/POST/PUT/DELETE /api/admin/videos[/:id]` | Public hides `hidden`; direct status on both sides |
| Instagram | `GET /api/public/instagram-posts/` | `GET/POST/PUT/DELETE /api/admin/instagram-posts[/:id]` | No status anywhere — all posts are live |
| Announcements | `GET /api/public/announcements/` | `GET/POST/PUT/DELETE /api/admin/announcements[/:id]` | Ordered published list vs full CRUD; `linkUrl` optional |
| Profile | `GET /api/public/profile/` | `GET /api/admin/profile/`, `PUT ...` | Same read; only admin writes |
| Homepage | `GET /api/public/home/` | `GET/PUT /api/admin/home/config` | Aggregate vs featured-id config |
| Booking | `GET /api/public/booking-cta` | `GET/PUT /api/admin/booking-provider` | Read links vs manage links |

## Exceptions and footnotes (read before wiring the frontend)

1. **Three admin-prefix routes need no token:** `POST .../auth/login`, `POST .../auth/refresh`, `POST .../auth/logout`. Everything else under `/api/admin` 401s without a token.
2. **Two public handlers also answer under `/api/admin`:** `GET /api/admin/booking-cta` and `POST /api/admin/leads/practo-click` (same handlers, no token needed). Prefer the `/api/public` URLs.
3. **`GET /api/admin/home/` serves the public aggregate** (same as `/api/public/home/`). Admin config lives at `/api/admin/home/config`.
4. **`GET /api/public/home/config` requires a token** despite the public prefix — treat it as admin-only.
5. **No workflow endpoints exist** (`submit`/`approve`/`reject`/`publish` all return `404 Route not found`). Publish by sending `status: "published"`.
6. **No consent fields exist** on testimonials/gallery — do not send `consent`; it is ignored.
7. **Error shape is uniform:** `{ error, code }`, plus `details[]` on `422`. In tests, `stack` is attached — never in production.
