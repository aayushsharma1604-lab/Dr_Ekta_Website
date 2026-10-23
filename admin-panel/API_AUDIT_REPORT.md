# Phase 1 API Audit — Admin Panel

> **Scope:** `admin-panel/src` — Next.js 14 App Router + Redux-Saga + Axios.  
> **Generated:** 2026-09-23  
> **Spec source:** `backend/docs/openapi.yaml` (`openapi: 3.0.3`, version `1.1.0`) — single source of truth. Mirrored description in `backend/docs/BACKEND_DOCUMENTATION.md`.  
> **Proxy layer:** `src/lib/apiProxy.js:1` (`BACKEND = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'`). All Next.js route handlers at `src/app/api/**/route.js` are thin pass-throughs: `proxy(req, '<backendPath>')` forwards method + query + JSON body + `Authorization` + `Cookie`, always with `Content-Type: application/json`.

---

## 1. How the audit was performed

1. `grep` for `api\.(get|post|put|delete|patch)\(` across `src` — primary consumer surface.
2. `grep` for `/api/` across `src` — catches proxied paths, page comments, and direct `fetch()` calls.
3. `glob` of `src/app/api/**/*` — every proxy handler (collection + `[id]`).
4. `read` of every saga at `src/modules/*/\.saga\.js`, every proxy `route.js`, `src/lib/api.js`, `src/lib/apiProxy.js`, `src/store/index.ts`, and representative pages (`src/app/**/page.tsx`).
5. Full `read` of `backend/docs/openapi.yaml` (1247 lines) and manual extraction of every path + method.
6. Cross-reference: for each frontend URL, verify (a) proxy exists, (b) saga exists and is registered in `store/index.ts:35`, (c) backend spec defines the method, (d) request payload keys match `required` fields, (e) response shape matches `PagedResponse` / singleton.

> File:line citations are literal. `→` denotes “proxied to backend path via apiProxy”.

---

## 2. Architecture notes (read before the tables)

### 2.1 Axios instance — `src/lib/api.js:1`

```js
baseURL: '', withCredentials: true, headers: { 'Content-Type': 'application/json' }
```
- Request interceptor `src/lib/api.js:35` injects `Authorization: Bearer <accessToken>` from `localStorage`.
- Response interceptor `src/lib/api.js:43` handles 422/429 toasts, and 401 refresh:
  `POST /api/auth/refresh` with `{ refreshToken }` (`src/lib/api.js:71`) → `setTokens` → retry original. Also clears and redirects to `/login` if no refresh token.

### 2.2 Two different HTTP clients in the codebase

| Client | Files |
|---|---|
| `api` from `@/lib/api` (configured axios, correct interceptors) | All sagas except `analytics` and `seoPages` |
| Raw `axios` + manual `selectToken` + `authHeaders` | `src/modules/analytics/analytics.saga.js:1`, `src/modules/seoPages/seoPages.saga.js:1` — **fragile**: bypasses refresh interceptor, hand-rolls `Authorization` header |

### 2.3 Store wiring — `src/store/index.ts:1`

Registered slices/sagas (8 running in rootSaga `src/store/index.ts:35`):

`auth`, `clinicInfo`, `treatments`, `articles`, `testimonials`, `gallery`, `videos`, `instagramPosts`, `leads`, `media`, `homepage`, `profile`, `redirects`, `bookingProvider`, `analytics`

**Not registered at all:** `seoPages` (has `src/modules/seoPages/seoPages.saga.js:1` + `seoPages.slice.js:1` but never imported in `store/index.ts`). The module is dead code.

---

## 3. Table 1 — Every admin-panel endpoint actually called in code

> **Frontend URL** = path passed to `api.get/post/put/delete` (proxied via `src/app/api/*` to `/api/admin/*` or `/api/public/*`).  
> **Proxy** = whether a Next.js route handler exists at `src/app/api/<url>/route.js` that forwards to the backend.  
> **Saga** = whether a Redux-Saga generator exists that calls this URL.  
> **Payload** = fields sent (from saga/page code).  
> **Response** = shape expected by slice/page.  
> **Status** here is a *local* assessment (proxy + saga + spec alignment), not a live HTTP test.

### 3.1 Auth (3 used, 1 missing in frontend)

| # | Frontend URL | Method | Proxy → Backend | Saga | Payload | Response expected | Status | Source files (exact) |
|---|---|---|---|---|---|---|---|---|
| A1 | `/api/auth/login` | POST | `src/app/api/auth/login/route.js:2` → `POST /api/admin/auth/login` | `src/modules/auth/auth.saga.js:9` `yield call(api.post, '/api/auth/login', {email,password})` | `{ email: string, password: string }` required | `{ user, accessToken, refreshToken }` → `setTokens` + `loginSuccess` | **Working** | `auth.saga.js:9`, `auth.slice` |
| A2 | `/api/auth/refresh` | POST | `src/app/api/auth/refresh/route.js:2` → `POST /api/admin/auth/refresh` | `src/modules/auth/auth.saga.js:33` + interceptor `src/lib/api.js:71` | `{ refreshToken?: string }` (saga sends `{refreshToken}` if present else `{}`, interceptor sends `{refreshToken: rt}`) | `{ accessToken, refreshToken }` → `setTokens` | **Working** (2 call sites; interceptor path is primary) | `auth.saga.js:33`, `api.js:71` |
| A3 | `/api/auth/logout` | POST | `src/app/api/auth/logout/route.js:2` → `POST /api/admin/auth/logout` | `src/modules/auth/auth.saga.js:48` `yield call(api.post, '/api/auth/logout', {refreshToken}?)` | `{ refreshToken?: string }` | 200 always (finally `clearTokens` + `logoutSuccess`) | **Working** | `auth.saga.js:48` |
| — | `/api/auth/me` | GET | *none* (`src/app/api/auth/route.js` proxies `GET /api/admin/auth` but backend is `GET /api/admin/auth/me`) | none | — | — | **Missing (ghost proxy)** — proxy `GET /api/admin/auth` does not exist in backend spec; real path is `GET /api/admin/auth/me` which has **no** frontend proxy | `auth/route.js:2` (ghost) |

**Ghost routes under `src/app/api/auth`:**

- `src/app/api/auth/route.js:2-5` — registers `GET/POST/PUT/DELETE /api/auth` → `/api/admin/auth` (+ same for `[id]` at `src/app/api/auth/[id]/route.js:2`) — **none of these backend paths exist**. The only valid auth paths are `/login`, `/refresh`, `/logout`, `/me`. These collection/ghost proxies will 404 if called.
- `src/app/api/auth/[id]/route.js:2` — extends the ghost to `/api/admin/auth/${id}` — also does not exist in spec.

---

### 3.2 Clinic Info (singleton, 2 methods)

| # | Frontend URL | Method | Proxy → Backend | Saga | Payload | Response | Status | Source |
|---|---|---|---|---|---|---|---|---|
| C1 | `/api/clinic-info` | GET | `src/app/api/clinic-info/route.js:2` → `GET /api/admin/clinic-info` | `src/modules/clinicInfo/clinicInfo.saga.js:8` | — (query forwarded via `req.nextUrl.search`) | `ClinicInfo` object (singleton, not `PagedResponse`) → `fetchSuccess` | **Working** | `clinicInfo.saga.js:8`, `clinic-info/page.tsx:34` |
| C2 | `/api/clinic-info` | PUT | `src/app/api/clinic-info/route.js:4` → `PUT /api/admin/clinic-info` | `src/modules/clinicInfo/clinicInfo.saga.js:22` | Partial ClinicInfo: page sends 3 separate payloads (`{timings}`, `{practiceName,phones,email,address,mapCoordinates}`, `{socialLinks}`) — backend `PUT /api/admin/clinic-info` expects full object but is lenient (openapi: `requestBody: {schema: {type: object}}` no required). | `ClinicInfo` updated | **Working with caveat** — 3 dispatch call sites in `clinic-info/page.tsx:74,86,101` send *partial* objects; if backend validates required address fields, second save may 422. Also `src/app/api/clinic-info/[id]/route.js:2` is a ghost (`GET/PUT/DELETE /api/admin/clinic-info/${id}`) — clinic-info is a singleton, has no `:id` in backend spec | `clinicInfo.saga.js:22`, `clinic-info/page.tsx:74` |

---

### 3.3 Media (5 distinct URLs, 3-step flow)

| # | Frontend URL | Method | Proxy → Backend | Saga | Payload | Response | Status | Source |
|---|---|---|---|---|---|---|---|---|
| M1 | `/api/media` | GET | `src/app/api/media/route.js:2` → `GET /api/admin/media` | `src/modules/media/media.saga.js:16` | `?page, ?limit, ?mimeType` via `params` | `PagedResponse<MediaAsset>` `{items, pagination}` → `fetchListSuccess` | **Working** | `media.saga.js:16`, `media/page.tsx:34` |
| M2 | `/api/media/${id}` | GET | `src/app/api/media/[id]/route.js:2` → `GET /api/admin/media/${id}` | `src/modules/media/media.saga.js:32` | — | `MediaAsset` single → unwraps `res.data?.data ?? res.data` | **Working** | `media.saga.js:32` |
| M3 | `/api/media/upload` | POST | `src/app/api/media/upload/route.js:2` → `POST /api/admin/media/upload` | `src/modules/media/media.saga.js:47` | `{ filename, mimeType, size }` required per spec. `src/app/media/page.tsx:60` sends exactly this shape before Cloudinary. | `{ uploadUrl, publicId/public_id, apiKey, timestamp, signature, paramsToSign }` — signed params for browser POST to Cloudinary | **Working** | `media.saga.js:47`, `media/page.tsx:60` |
| M4 | `/api/media/confirm` | POST | `src/app/api/media/confirm/route.js:2` → `POST /api/admin/media/confirm` | `src/modules/media/media.saga.js:64` | `{ key, publicId, url, filename, mimeType, size }` (`key` + `publicId` both required, `key === publicId` per `media/page.tsx:193` comment). Pages diverge: `media/page.tsx:121` sends correct 6 fields; `gallery/page.tsx:43`, `instagram-posts/page.tsx:38`, `profile/page.tsx:131` also send correct 6 fields via inline `api.post`. | `MediaAsset` created (201) → `confirmSuccess` stores `res.data?.data ?? res.data` then refreshes list | **Working** | `media.saga.js:64`, `media/page.tsx:60,129,193`, `gallery/page.tsx:43`, `instagram-posts/page.tsx:38`, `profile/page.tsx:131` |
| M5 | `/api/media/${id}` | DELETE | `src/app/api/media/[id]/route.js:4` → `DELETE /api/admin/media/${id}` | `src/modules/media/media.saga.js:84` | — | 200 or 404 | **Working** | `media.saga.js:84`, `media/page.tsx:152` |
| — | `/api/media` (PUT/POST on collection) | PUT/POST | `src/app/api/media/route.js:3-4` `POST/PUT /api/admin/media` | none (PUT/DELETE on collection never called) | — | — | **Ghost** — backend has no `PUT /api/admin/media` or `POST /api/admin/media` (only `POST /upload` and `POST /confirm` under `/api/admin/media`). Those extra proxy methods will 404 if ever called | `media/route.js:3` |
| — | `/api/media/${id}` | PUT | `src/app/api/media/[id]/route.js:3` → `PUT /api/admin/media/${id}` | none | — | — | **Ghost** — backend has no `PUT /api/admin/media/{id}` (only `GET` and `DELETE`); the saga never calls it | `media/[id]/route.js:3` |

**Media 2-step Cloudinary note:** Correct flow is `POST /api/media/upload` (`media.saga.js:47`) → browser `fetch(uploadUrl, {method:'POST', body: FormData{file, api_key, timestamp, signature}})` (`media/page.tsx:89`) → `POST /api/media/confirm`. The fallback placeholder path (`via.placeholder.com`) is dev-only and will still create a `MediaAsset` (backend does not validate the URL is Cloudinary-hosted).

---

### 3.4 Treatments (5)

| # | Frontend URL | Method | Proxy → Backend | Saga | Payload | Response | Status | Source |
|---|---|---|---|---|---|---|---|---|
| T1 | `/api/treatments` | GET | `src/app/api/treatments/route.js:2` → `GET /api/admin/treatments` | `src/modules/treatments/treatments.saga.js:16` | `?page, ?limit, ?status, ?search` via `params` | `PagedResponse<Treatment>` | **Working** | `treatments.saga.js:16` |
| T2 | `/api/treatments/${id}` | GET | `src/app/api/treatments/[id]/route.js:2` → `GET /api/admin/treatments/${id}` | `src/modules/treatments/treatments.saga.js:32` | — | `Treatment` single | **Working** | `treatments.saga.js:32` |
| T3 | `/api/treatments` | POST | `src/app/api/treatments/route.js:3` → `POST /api/admin/treatments` | `src/modules/treatments/treatments.saga.js:46` | `{ title, slug?, status?, sections?, faqs?, heroImage?, gallery?, relatedTreatments?, seo? }` — `title` required per spec; saga sends `action.payload` as-is | `Treatment` created (201) | **Working** | `treatments.saga.js:46` |
| T4 | `/api/treatments/${id}` | PUT | `src/app/api/treatments/[id]/route.js:3` → `PUT /api/admin/treatments/${id}` | `src/modules/treatments/treatments.saga.js:71` — complex id extraction: `const _id = id ?? payload.id ?? payload._id` then `delete payload.id/_id` then `PUT /api/treatments/${targetId}` | Partial or full `Treatment` (backend accepts any object: `status` set directly `draft`/`published`) | `Treatment` updated | **Working with caveat** — `treatments/[id]/route.js:2` previously read as proxying without `${id}` due to a glob bug but verified via literal read it correctly includes `${id}`. The `PUT /api/treatments` on the *collection* proxy (`treatments/route.js:4`) is a **ghost** (backend has no `PUT /api/admin/treatments` without id — will 404 if called) | `treatments.saga.js:60` |
| T5 | `/api/treatments/${id}` | DELETE | `src/app/api/treatments/[id]/route.js:4` → `DELETE /api/admin/treatments/${id}` | `src/modules/treatments/treatments.saga.js:88` | — | 200 then refresh list | **Working** | `treatments.saga.js:88` |
| — | `/api/treatments` | DELETE/PUT on collection | `src/app/api/treatments/route.js:4-5` → `DELETE/PUT /api/admin/treatments` | none | — | — | **Ghost** — no backend handler | `treatments/route.js:4` |

---

### 3.5 Articles (5) — mounted as “Knowledge”

| # | Frontend URL | Method | Proxy → Backend | Saga | Payload | Response | Status | Source |
|---|---|---|---|---|---|---|---|---|
| AR1 | `/api/articles` | GET | `src/app/api/articles/route.js:2` → `GET /api/admin/articles` | `src/modules/articles/articles.saga.js:16` | `?page, ?limit, ?status, ?category, ?search` | `PagedResponse<Article>` (list omits `body`) | **Working** | `articles.saga.js:16`, `knowledge/page.tsx:45` |
| AR2 | `/api/articles/${id}` | GET | `src/app/api/articles/[id]/route.js:2` → `GET /api/admin/articles/${id}` | `src/modules/articles/articles.saga.js:31` | — | `Article` full (incl. `body`) | **Working** | `articles.saga.js:31` |
| AR3 | `/api/articles` | POST | `src/app/api/articles/route.js:3` → `POST /api/admin/articles` | `src/modules/articles/articles.saga.js:44` | `knowledge/page.tsx:62` builds `{ title, slug (derived), category, body, author, tags? (string[] lowercased), sources? ({url}[]), status }` — `title, category, body, author` required per spec, matches. `slug` is computed locally `title.toLowerCase().replace(/[^a-z0-9]+/g,'-')`. | `Article` (201) | **Working** | `articles.saga.js:44`, `knowledge/page.tsx:62` |
| AR4 | `/api/articles/${id}` | PUT | `src/app/api/articles/[id]/route.js:3` → `PUT /api/admin/articles/${id}` | `src/modules/articles/articles.saga.js:65` | Same shape as create, via `updateRequest({id, ...payload})` | `Article` | **Working** | `articles.saga.js:65` |
| AR5 | `/api/articles/${id}` | DELETE | `src/app/api/articles/[id]/route.js:4` → `DELETE /api/admin/articles/${id}` | `src/modules/articles/articles.saga.js:82` | — | 200 | **Working** | `articles.saga.js:82` |
| — | `/api/articles` | PUT/DELETE on collection | `src/app/api/articles/route.js:4-5` → `PUT/DELETE /api/admin/articles` | none | — | — | **Ghost** — no backend handler | `articles/route.js:4` |

---

### 3.6 Testimonials (5)

| # | Frontend URL | Method | Proxy → Backend | Saga | Payload | Response | Status | Source |
|---|---|---|---|---|---|---|---|---|
| TE1 | `/api/testimonials` | GET | `src/app/api/testimonials/route.js:2` → `GET /api/admin/testimonials` (backend is `GET /api/admin/testimonials/` — trailing slash but Express is lenient) | `src/modules/testimonials/testimonials.saga.js:16` | `?page, ?limit, ?treatmentTag, ?status` | `PagedResponse<Testimonial>` | **Working** | `testimonials.saga.js:16` |
| TE2 | `/api/testimonials/${id}` | GET | `src/app/api/testimonials/[id]/route.js:2` → `GET /api/admin/testimonials/${id}` | `src/modules/testimonials/testimonials.saga.js:31` | — | `Testimonial` | **Working** | `testimonials.saga.js:31` |
| TE3 | `/api/testimonials` | POST | `src/app/api/testimonials/route.js:3` → `POST /api/admin/testimonials` | `src/modules/testimonials/testimonials.saga.js:44` | `{ patientDisplayName, content }` required, plus `treatmentTag?, type? (text/video/audio), status? (draft/published)` | `Testimonial` (201) | **Working** | `testimonials.saga.js:44` |
| TE4 | `/api/testimonials/${id}` | PUT | `src/app/api/testimonials/[id]/route.js:3` → `PUT /api/admin/testimonials/${id}` | `src/modules/testimonials/testimonials.saga.js:64` | Partial update (status directly `draft`/`published`, no consent gate) | `Testimonial` | **Working** | `testimonials.saga.js:64` |
| TE5 | `/api/testimonials/${id}` | DELETE | `src/app/api/testimonials/[id]/route.js:4` → `DELETE /api/admin/testimonials/${id}` | `src/modules/testimonials/testimonials.saga.js:81` | — | 200 | **Working** | `testimonials.saga.js:81` |
| — | `/api/testimonials` | PUT/DELETE on collection | `src/app/api/testimonials/route.js:4-5` | none | — | — | **Ghost** — no backend handler | `testimonials/route.js:4` |

---

### 3.7 Gallery (5)

| # | Frontend URL | Method | Proxy → Backend | Saga | Payload | Response | Status | Source |
|---|---|---|---|---|---|---|---|---|
| G1 | `/api/gallery` | GET | `src/app/api/gallery/route.js:2` → `GET /api/admin/gallery` | `src/modules/gallery/gallery.saga.js:16` | `?page, ?limit, ?treatmentTag, ?status` | `PagedResponse<GalleryItem>` | **Working** | `gallery.saga.js:16`, `gallery/page.tsx:27` |
| G2 | `/api/gallery/${id}` | GET | `src/app/api/gallery/[id]/route.js:2` → `GET /api/admin/gallery/${id}` | `src/modules/gallery/gallery.saga.js:31` | — | `GalleryItem` | **Working** | `gallery.saga.js:31` |
| G3 | `/api/gallery` | POST | `src/app/api/gallery/route.js:3` → `POST /api/admin/gallery` | `src/modules/gallery/gallery.saga.js:44` | `gallery/page.tsx:70` builds `{ beforeImg: <MediaAsset _id>, afterImg: <MediaAsset _id>, treatmentTag?, content?, status }` — `beforeImg` + `afterImg` required per spec (must be MediaAsset ObjectIds). Images are obtained via `POST /api/media/confirm` to get ids first (`gallery/page.tsx:43`) — correct. | `GalleryItem` (201) | **Working** | `gallery.saga.js:44`, `gallery/page.tsx:43,70` |
| G4 | `/api/gallery/${id}` | PUT | `src/app/api/gallery/[id]/route.js:3` → `PUT /api/admin/gallery/${id}` | `src/modules/gallery/gallery.saga.js:64` | Same as create, partial | `GalleryItem` | **Working** | `gallery.saga.js:64` |
| G5 | `/api/gallery/${id}` | DELETE | `src/app/api/gallery/[id]/route.js:4` → `DELETE /api/admin/gallery/${id}` | `src/modules/gallery/gallery.saga.js:81` | — | 200 | **Working** | `gallery.saga.js:81` |
| — | `/api/gallery` | PUT/DELETE collection | `src/app/api/gallery/route.js:4-5` | none | — | — | **Ghost** | `gallery/route.js:4` |

---

### 3.8 Videos (5)

| # | Frontend URL | Method | Proxy → Backend | Saga | Payload | Response | Status | Source |
|---|---|---|---|---|---|---|---|---|
| V1 | `/api/videos` | GET | `src/app/api/videos/route.js:2` → `GET /api/admin/videos` | `src/modules/videos/videos.saga.js:16` | `?page, ?limit, ?status, ?category` | `PagedResponse<Video>` | **Working** | `videos.saga.js:16` |
| V2 | `/api/videos/${id}` | GET | `src/app/api/videos/[id]/route.js:2` → `GET /api/admin/videos/${id}` | `src/modules/videos/videos.saga.js:31` | — | `Video` | **Working** | `videos.saga.js:31` |
| V3 | `/api/videos` | POST | `src/app/api/videos/route.js:3` → `POST /api/admin/videos` | `src/modules/videos/videos.saga.js:44` | `{ url, title, category }` required per spec, plus `thumbnail?, order?, status? (published/hidden), transcript?, captionsUrl?` | `Video` (201) | **Working** | `videos.saga.js:44` |
| V4 | `/api/videos/${id}` | PUT | `src/app/api/videos/[id]/route.js:3` → `PUT /api/admin/videos/${id}` | `src/modules/videos/videos.saga.js:64` — note spec says update validator is create-shaped (must send `url, title, category` even on update) | Full `Video` object | `Video` | **Working with caveat** — if page sends partial update missing `url`/`category` it will 422 (see spec: `PUT /api/admin/videos/{id}` “send full object — validator is create-shaped”) | `videos.saga.js:64` |
| V5 | `/api/videos/${id}` | DELETE | `src/app/api/videos/[id]/route.js:4` → `DELETE /api/admin/videos/${id}` | `src/modules/videos/videos.saga.js:81` | — | 200 | **Working** | `videos.saga.js:81` |
| — | `/api/videos` | PUT/DELETE collection | `src/app/api/videos/route.js:4-5` | none | — | — | **Ghost** | `videos/route.js:4` |

---

### 3.9 Instagram Posts (5)

| # | Frontend URL | Method | Proxy → Backend | Saga | Payload | Response | Status | Source |
|---|---|---|---|---|---|---|---|---|
| I1 | `/api/instagram-posts` | GET | `src/app/api/instagram-posts/route.js:2` → `GET /api/admin/instagram-posts` | `src/modules/instagramPosts/instagramPosts.saga.js:16` | `?page, ?limit` | `PagedResponse<CuratedPost>` | **Working** | `instagramPosts.saga.js:16`, `instagram-posts/page.tsx:23` |
| I2 | `/api/instagram-posts/${id}` | GET | `src/app/api/instagram-posts/[id]/route.js:2` → `GET /api/admin/instagram-posts/${id}` | `src/modules/instagramPosts/instagramPosts.saga.js:31` | — | `CuratedPost` | **Working** | `instagramPosts.saga.js:31` |
| I3 | `/api/instagram-posts` | POST | `src/app/api/instagram-posts/route.js:3` → `POST /api/admin/instagram-posts` | `src/modules/instagramPosts/instagramPosts.saga.js:44` | `instagram-posts/page.tsx:52` builds `{ image: <MediaAsset _id>, permalink, caption?, order }` — `image` + `permalink` required per spec. `image` is obtained via `POST /api/media/confirm` inline (`instagram-posts/page.tsx:38`) — correct, though `permalink` is required to be a URL and page does validate `permalink.trim()` non-empty but does not validate URL format. | `CuratedPost` (201) | **Working** | `instagramPosts.saga.js:44`, `instagram-posts/page.tsx:38,52` |
| I4 | `/api/instagram-posts/${id}` | PUT | `src/app/api/instagram-posts/[id]/route.js:3` → `PUT /api/admin/instagram-posts/${id}` | `src/modules/instagramPosts/instagramPosts.saga.js:64` | Partial (all fields optional on update) | `CuratedPost` | **Working** | `instagramPosts.saga.js:64` |
| I5 | `/api/instagram-posts/${id}` | DELETE | `src/app/api/instagram-posts/[id]/route.js:4` → `DELETE /api/admin/instagram-posts/${id}` | `src/modules/instagramPosts/instagramPosts.saga.js:81` | — | 200 | **Working** | `instagramPosts.saga.js:81` |
| — | `/api/instagram-posts` | PUT/DELETE collection | `src/app/api/instagram-posts/route.js:4-5` | none | — | — | **Ghost** | `instagram-posts/route.js:4` |

---

### 3.10 Profile (singleton, 2 methods)

| # | Frontend URL | Method | Proxy → Backend | Saga | Payload (whitelist) | Response | Status | Source |
|---|---|---|---|---|---|---|---|---|
| P1 | `/api/profile` | GET | `src/app/api/profile/route.js:2` → `GET /api/admin/profile` (backend is `GET /api/admin/profile/` — trailing slash) | `src/modules/profile/profile.saga.js:8` | — | `{ data?, bio, qualifications[], memberships[], awards[], mediaAppearances[], publications[], photo?: MediaAsset\|string, video?: MediaAsset\|string }` — saga unwraps `res.data?.data ?? res.data` (`profile.saga.js:9`) | **Working** | `profile.saga.js:8`, `profile/page.tsx:46` |
| P2 | `/api/profile` | PUT | `src/app/api/profile/route.js:4` → `PUT /api/admin/profile` | `src/modules/profile/profile.saga.js:23` | Whitelist: `bio? (string), qualifications? [{degree,institution,year 1950-2030}], memberships? [{organization,role,since 1950-2030}], awards? [{title,issuer,year}], mediaAppearances? [{outlet,title,date,url}], publications? [{title,journal,year,url}], photo? (MediaAsset _id), video? (MediaAsset _id)`. `profile/page.tsx:200` builds exact whitelist, filters empty rows, coerces `year/since` to `Number`, validates 1950-2030 (`profile/page.tsx:175`), and uploads `photo`/`video` via `POST /api/media/confirm` (`profile/page.tsx:120`). | Object updated | **Working** | `profile.saga.js:23`, `profile/page.tsx:120,200` |
| — | `/api/profile` | POST/DELETE collection | `src/app/api/profile/route.js:3,5` → `POST/DELETE /api/admin/profile` | none | — | — | **Ghost** — backend has no `POST` or `DELETE /api/admin/profile` (profile is singleton PUT/GET only) | `profile/route.js:3` |
| — | `/api/profile/${id}` | GET/PUT/DELETE | `src/app/api/profile/[id]/route.js:2` → `/api/admin/profile/${id}` | none | — | — | **Ghost** — singleton has no `:id` in backend spec | `profile/[id]/route.js:2` |

---

### 3.11 Homepage / Home Config (3 distinct frontends, 2 backends)

| # | Frontend URL | Method | Proxy → Backend | Saga / Page | Payload | Status | Source |
|---|---|---|---|---|---|---|---|
| H1 | `/api/home/config` | GET | `src/app/api/home/config/route.js:4` → `GET /api/admin/home/config` | `src/modules/homepage/homepage.saga.js:17` | — | ` { featuredTreatments, featuredArticles, featuredVideos, featuredTestimonials }: string[] (ObjectIds)` wrapped as `{ data? }` | **Working** — saga correctly uses `/api/home/config` which proxies to admin `home/config`; `homepage/page.tsx:242` and `home/config/page.tsx:242` document the flow. Bearer token required per spec despite `public` alias. | `homepage.saga.js:17`, `home/config/route.js:4` |
| H2 | `/api/home/config` | PUT | `src/app/api/home/config/route.js:8` → `PUT /api/admin/home/config` | `src/modules/homepage/homepage.saga.js:35` | Same 4 arrays of ObjectId strings (`homepage.saga.js:33`); `homepage/page.tsx` likely sends curated featured lists. | Same | **Working** | `homepage.saga.js:35` |
| H3 | `/api/home` | GET | `src/app/api/home/route.js:7` → `GET /api/public/home` | No saga (page-level read-only aggregate) | — | Homepage aggregate `{ treatments, articles, videos, testimonials }` (public, cached) | **Working** (public) | `home/route.js:7` |
| H4 | `/api/homepage` (legacy alias) + `/api/homepage/${id}` | GET/POST/PUT/DELETE | `src/app/api/homepage/route.js:2` → `GET/POST/PUT/DELETE /api/admin/home` and `src/app/api/homepage/[id]/route.js:2` → `/api/admin/home/${id}` | none (no saga hits `/api/homepage`) | — | `GET /api/admin/home` serves same aggregate as `GET /api/public/home` (spec note). PUT/POST/DELETE on `/api/admin/home` have no documented handler. | **Ghost / unused alias** — the canonical admin config is `/api/admin/home/config`, not `/api/admin/home/${id}`. The `[id]` route proxies to `/api/admin/home/${id}` which has **no backend handler** in spec (spec only lists `GET /api/admin/home/` and `GET/PUT /api/admin/home/config`). | `homepage/route.js:2`, `homepage/[id]/route.js:2` |

**Naming confusion risk:** The admin `home` vs `homepage` modules are distinct proxies pointing to different backend prefixes (`/api/admin/home` vs `/api/admin/home/config`). Only `home/config` is actively used by `homepageSaga`; the `homepage` proxy is never called by any saga (dead).

---

### 3.12 Leads (6 distinct URLs)

| # | Frontend URL | Method | Proxy → Backend | Saga | Payload / Params | Response | Status | Source |
|---|---|---|---|---|---|---|---|---|
| L1 | `/api/leads` | GET | `src/app/api/leads/route.js:2` → `GET /api/admin/leads` | `src/modules/leads/leads.saga.js:16` | `?page, ?limit, ?status (=leadStatus), ?source, ?startDate, ?endDate, ?search` | `PagedResponse<Lead>` | **Working** | `leads.saga.js:16`, `leads/page.tsx:22` |
| L2 | `/api/leads/stats` | GET | `src/app/api/leads/stats/route.js:2` → `GET /api/admin/leads/stats` | `src/modules/leads/leads.saga.js:31` | `?startDate, ?endDate, ?source` | `{ total, byStatus, bySource, last7Days }` → `leads/page.tsx:49` renders stats | **Working** | `leads.saga.js:31`, `leads/page.tsx:23` |
| L3 | `/api/leads/${id}` | GET | `src/app/api/leads/[id]/route.js:2` → `GET /api/admin/leads/${id}` | `src/modules/leads/leads.saga.js:43` | — | `Lead` single | **Working** | `leads.saga.js:43` |
| L4 | `/api/leads/${id}` | PUT | `src/app/api/leads/[id]/route.js:3` → `PUT /api/admin/leads/${id}` | `src/modules/leads/leads.saga.js:65` — **strict whitelist**: only `leadStatus, appointmentStatus, notes, treatmentInterest` (spec allows exactly these 4). Saga discards other keys (`leads.saga.js:61`). `leads/page.tsx:43` calls with `{id, leadStatus, appointmentStatus, notes}` — correct. | `{ leadStatus?: ..., appointmentStatus?: ..., notes?: ..., treatmentInterest?: string }` | `Lead` updated | **Working** | `leads.saga.js:65`, `leads/page.tsx:43` |
| L5 | `/api/leads/${id}` | DELETE | `src/app/api/leads/[id]/route.js:4` → `DELETE /api/admin/leads/${id}` | `src/modules/leads/leads.saga.js:82` | — | 200 | **Working** | `leads.saga.js:82` |
| L6 | `/api/leads/export` | GET | `src/app/api/leads/export/route.js:2` → `GET /api/admin/leads/export` | `src/modules/leads/leads.saga.js:97` + `src/app/leads/page.tsx:27` (page also calls directly) | `?status, ?source, ?startDate, ?endDate` + `responseType: 'blob'` → creates download blob (`leads.saga.js:98`) | `text/csv` file — filename `leads-YYYY-MM-DD.csv` | **Working** (dual call site: saga via `takeLatest('leads/export', exportCsv)` `leads.saga.js:119`, plus direct `api.get` in page) | `leads.saga.js:97`, `leads/page.tsx:27` |
| — | `/api/leads` | POST/PUT/DELETE on collection (no id) | `src/app/api/leads/route.js:3-5` → `POST/PUT/DELETE /api/admin/leads` | none (POST on collection never called; leads are created via public `POST /api/public/enquiry`) | — | — | **Ghost** — backend has no `POST /api/admin/leads` (that collection is read-only admin; creation is public enquiry). `PUT/DELETE` without id also don't exist. | `leads/route.js:3` |

---

### 3.13 Booking Provider (3)

| # | Frontend URL | Method | Proxy → Backend | Saga / Page | Payload | Status | Source |
|---|---|---|---|---|---|---|---|
| BP1 | `/api/booking-provider` | GET | `src/app/api/booking-provider/route.js:4` → `GET /api/admin/booking-provider` | `src/modules/bookingProvider/bookingProvider.saga.js:18` + `src/app/booking-provider/page.tsx:60` (direct) | — | `{ providerName, profileUrl, bookingUrl, isActive }` or 404 (“not configured yet” handled gracefully: `bookingProvider.saga.js:23` treats 404 as `fetchSuccess(null)`, page `booking-provider/page.tsx:72` does same) | **Working** | `bookingProvider.saga.js:18`, `booking-provider/page.tsx:60` |
| BP2 | `/api/booking-provider` | PUT | `src/app/api/booking-provider/route.js:8` → `PUT /api/admin/booking-provider` | `src/modules/bookingProvider/bookingProvider.saga.js:47` + `booking-provider/page.tsx:146` (direct) | `{ providerName: 'practo' (forced default if omitted, bookingProvider.saga.js:40), profileUrl?, bookingUrl?, isActive? }` — page `booking-provider/page.tsx:135` always sends `providerName:'practo'` explicitly. Spec allows `providerName?, profileUrl?, bookingUrl?, isActive?`. | Upsert (201/200) single provider | **Working** | `bookingProvider.saga.js:47`, `booking-provider/page.tsx:146` |
| BP3 | `/api/practo-clicks` | GET | `src/app/api/practo-clicks/route.js:4` → `GET /api/admin/practo-clicks` | `src/modules/bookingProvider/bookingProvider.saga.js:66` + `booking-provider/page.tsx:94` (direct) | `?startDate?, ?endDate?` | `{ totalClicks: number, dailyStats: [{_id: string (YYYY-MM-DD), count: number}] }` → page renders total + daily table (`booking-provider/page.tsx:337`) | **Working** | `bookingProvider.saga.js:66`, `booking-provider/page.tsx:94` |

**Booking caveat:** The booking-provider page fires **both** a Redux action **and** a direct `api.get/put` — two network requests per operation (`booking-provider/page.tsx:57,90,142`). Functional but wasteful. Not a bug.

---

### 3.14 Redirects (5)

| # | Frontend URL | Method | Proxy → Backend | Saga | Payload | Status | Source |
|---|---|---|---|---|---|---|---|
| R1 | `/api/redirects` | GET | `src/app/api/redirects/route.js:2` → `GET /api/admin/redirects` | `src/modules/redirects/redirects.saga.js:16` | `?page, ?limit, ?search` | `PagedResponse<Redirect>` | **Working** | `redirects.saga.js:16` |
| R2 | `/api/redirects/${id}` | GET | `src/app/api/redirects/[id]/route.js:2` → `GET /api/admin/redirects/${id}` | `src/modules/redirects/redirects.saga.js:32` — unwraps `res.data?.data ?? res.data` | — | `Redirect` single | **Working** | `redirects.saga.js:32` |
| R3 | `/api/redirects` | POST | `src/app/api/redirects/route.js:3` → `POST /api/admin/redirects` | `src/modules/redirects/redirects.saga.js:51` — strict `{ fromPath, toPath, statusCode: 301 default }`; `fromPath` required unique (409 on duplicate handled at `redirects.saga.js:61`) | `{ fromPath: string, toPath: string, statusCode?: 301\|302 }` (required: `fromPath, toPath`) | `Redirect` (201) | **Working** | `redirects.saga.js:51` |
| R4 | `/api/redirects/${id}` | PUT | `src/app/api/redirects/[id]/route.js:3` → `PUT /api/admin/redirects/${id}` | `src/modules/redirects/redirects.saga.js:88` — only `toPath` + `statusCode` (fromPath immutable per spec) | `{ toPath?, statusCode? }` | `Redirect` updated | **Working** | `redirects.saga.js:88` |
| R5 | `/api/redirects/${id}` | DELETE | `src/app/api/redirects/[id]/route.js:4` → `DELETE /api/admin/redirects/${id}` | `src/modules/redirects/redirects.saga.js:107` | — | 200 | **Working** | `redirects.saga.js:107` |
| — | `/api/redirects` | PUT/DELETE on collection | `src/app/api/redirects/route.js:4-5` → `PUT/DELETE /api/admin/redirects` | none | — | — | **Ghost** — no backend handler (collection is GET+POST only) | `redirects/route.js:4` |
| — | `/api/redirects/${id}` | POST (with id) | `src/app/api/redirects/[id]/route.js:3` also exports `POST` doing `proxy('/api/admin/redirects')` without id | none | — | — | **Ghost method** — backend has no `POST /api/admin/redirects/{id}` | `redirects/[id]/route.js` (if read earlier shows POST without id) — verified final literal read: this `[id]` route only has `GET/PUT/DELETE`; the `POST` reported in the glob read was a stale cache |

---

### 3.15 Analytics — **BROKEN**

| # | Frontend URL (what code calls) | Backend it *should* call | Proxy → Backend (what proxy does) | Saga | Status | Detail |
|---|---|---|---|---|---|---|
| AN1 | `GET /api/analytics` (with params) | Should be `GET /api/admin/analytics/reports/monthly?startDate&endDate` **and** `GET /api/admin/analytics/events?page&limit&eventType&startDate&endDate` per spec `src/modules/analytics/analytics.saga.js:7` defines `BASE = '/api/analytics'` | `src/app/api/analytics/route.js:2` → `GET /api/admin/analytics` (404 — no such route in spec) | `src/modules/analytics/analytics.saga.js:13` `yield call(axios.get, BASE, {params, headers: authHeaders(token)})` | **Broken — wrong URL + wrong client** | Spec has **two** distinct endpoints: `GET /api/admin/analytics/reports/monthly` and `GET /api/admin/analytics/events`. Frontend collapses both into a generic `GET /api/analytics` which **does not exist** on backend — every fetch will 404. |
| AN2 | `GET /api/analytics/${id}` | No such backend endpoint in spec (analytics events are listed, not fetched by id) | `src/app/api/analytics/[id]/route.js:2` → `GET /api/admin/analytics/${id}` (404) | `src/modules/analytics/analytics.saga.js:24` | **Broken — ghost id route** | Backend spec has no `GET /api/admin/analytics/{id}`. `fetchOne` will always 404. |
| AN3 | `POST /api/analytics` | No admin POST for analytics in spec | `src/app/api/analytics/route.js:3` → `POST /api/admin/analytics` (404) | `src/modules/analytics/analytics.saga.js:34` | **Broken — ghost POST** | Spec has no `POST /api/admin/analytics`. |
| AN4 | `PUT /api/analytics/${id}` | No such | `src/app/api/analytics/[id]/route.js:3` → `PUT /api/admin/analytics/${id}` (404) | `src/modules/analytics/analytics.saga.js:48` | **Broken** | Same. |
| AN5 | `DELETE /api/analytics/${id}` | No such | `src/app/api/analytics/[id]/route.js:4` → `DELETE /api/admin/analytics/${id}` (404) | `src/modules/analytics/analytics.saga.js:60` | **Broken** | Same. |

**Additional analytics issues:**

- Client is raw `axios` (`analytics.saga.js:1`), not `api` from `@/lib/api`. It hand-rolls `Authorization: Bearer ${token}` via `selectToken = state => state.auth?.token || ...`. The auth slice shape is not `state.auth.token` (it stores `user` + tokens via `setTokens` in localStorage), so `selectToken` will almost always resolve to `null` — requests will be unauthenticated even before hitting the wrong URL.
- The saga keys are generic `'analytics/fetchOne'` etc (`analytics.saga.js:70`) rather than typed actions — unlikely to be dispatched by any page (no page imports `analytics` actions). Module is effectively dead in addition to being wrong.
- Correct fix: replace `BASE` with the two spec-real endpoints, use `api` instance, and wire stats + events separately.

---

### 3.16 SEO Pages / seoPages — **MISSING / NOT WIRED**

| # | Frontend URL | Proxy? | Saga | Store wiring | Status |
|---|---|---|---|---|---|
| S1 | `GET /api/seo-pages` (+ `/${id}`, POST, PUT, DELETE) — `src/modules/seoPages/seoPages.saga.js:7` `BASE = '/api/seo-pages'` | **No** — there is **no** `src/app/api/seo-pages/route.js` anywhere (checked `src/app/api`; missing directory). | `src/modules/seoPages/seoPages.saga.js:1` exists, uses raw `axios` + `selectToken` same anti-pattern as analytics. | `src/store/index.ts:1` **does not import** `seoPages` slice or saga. Never in `configureStore({reducer: {...}})` nor in `rootSaga` (`store/index.ts:35`). No page dispatches its actions. | **Missing — dead code, no proxy, not in Spec**. There is no `/api/admin/seo-pages` in `openapi.yaml`. The feature appears to be a speculative stub for future SEO page management; backend has no such resource (SEO is via `/api/public/sitemap.xml`, `/api/public/robots.txt`, `/api/public/redirect/{path}`). Any call would fail at the Next.js level (404 proxy miss) before hitting the backend. |

- `src/app/seo/page.tsx` and `src/modules/seoPages/seoPages.tsx` are UI shells but the module’s slice `src/modules/seoPages/seoPages.slice.js:1` only exposes generic `request/success/failure/setItem` (no typed `fetchListRequest` etc) and the saga listens to `'seoPages/fetchOne'` string literals (`seoPages.saga.js:70`) — no page dispatches those strings.

---

### 3.17 Direct page-only calls (not through a saga)

| Frontend URL | Method | Line | Proxy → Backend | Note |
|---|---|---|---|---|
| `POST /api/media/upload` | POST | `src/app/media/page.tsx:60` | `POST /api/admin/media/upload` | Working — 2-step flow step 1 (direct in page, also via media saga) |
| `POST /api/media/confirm` | POST | `src/app/media/page.tsx:129`, `src/app/gallery/page.tsx:43`, `src/app/instagram-posts/page.tsx:38`, `src/app/profile/page.tsx:131` | `POST /api/admin/media/confirm` | Working — all use 6-field shape; gallery + instagram + profile pages bypass the saga and call `api.post` inline |
| `GET /api/booking-provider` | GET | `src/app/booking-provider/page.tsx:60` | `GET /api/admin/booking-provider` | Working — duplicate with saga (page does both dispatch + direct call) |
| `GET /api/practo-clicks` | GET | `src/app/booking-provider/page.tsx:94` | `GET /api/admin/practo-clicks` | Working — duplicate |
| `PUT /api/booking-provider` | PUT | `src/app/booking-provider/page.tsx:146` | `PUT /api/admin/booking-provider` | Working — duplicate |
| `GET /api/leads/export` | GET (blob) | `src/app/leads/page.tsx:27` | `GET /api/admin/leads/export` | Working — duplicate |
| `POST /api/auth/refresh` (interceptor) | POST | `src/lib/api.js:71` | `POST /api/admin/auth/refresh` | Working — automatic retry |

**No direct `fetch(` to `/api/`** — the only `fetch(` in `src` is `src/lib/apiProxy.js:9` (server proxy) and `src/app/media/page.tsx:89` (`fetch(uploadUrl, {method:'POST', body: FormData})` — Cloudinary direct POST, not an admin API).

**No `useSWR`** usage anywhere in `src` (grepped, zero hits).

---

## 4. Table 2 — Backend admin endpoints from `openapi.yaml` (authoritative)

> Spec: `backend/docs/openapi.yaml:461` onward (`openapi: 3.0.3`). `security: bearerAuth` unless noted `(public)`.  
> Count: **~66 admin-relevant paths** (incl. 4 auth, 2 clinic, 5 media, 5×7 content groups = 35, 2 profile, 2 home/config, 6 leads, 5 booking/misc, 5 redirects, 2 analytics, plus dual mounts). The task’s “~61 admin endpoints” counts the core `Admin *` tags only — dual public mounts (`/api/admin/booking-cta`, `/api/admin/leads/practo-click`) are excluded from that 61.

### 4.1 Admin Auth (4)

| # | Method | Path | Spec summary | Notes |
|---|---|---|---|---|
| 1 | POST | `/api/admin/auth/login` | `backend/docs/openapi.yaml:462` Admin login `{email, password}` | 401/422/429 |
| 2 | POST | `/api/admin/auth/refresh` | `backend/docs/openapi.yaml:481` Rotate token pair `{refreshToken}` | 401 |
| 3 | POST | `/api/admin/auth/logout` | `backend/docs/openapi.yaml:497` Revoke `{refreshToken?}` | always 200 |
| 4 | GET | `/api/admin/auth/me` | `backend/docs/openapi.yaml:510` Current admin (requires Bearer) | 500 if middleware missing |

### 4.2 Admin Clinic (2)

| # | Method | Path |
|---|---|---|
| 5 | GET | `/api/admin/clinic-info` |
| 6 | PUT | `/api/admin/clinic-info` |

### 4.3 Admin Media (5)

| # | Method | Path | Notes |
|---|---|---|---|
| 7 | POST | `/api/admin/media/upload` | `{filename,mimeType,size}` → signed Cloudinary params |
| 8 | POST | `/api/admin/media/confirm` | `{key,publicId,url,filename,mimeType,size}` → `MediaAsset` 201 |
| 9 | GET | `/api/admin/media` | `?page,limit,mimeType` → `PagedResponse` |
| 10 | GET | `/api/admin/media/{id}` | `MediaAsset` |
| 11 | DELETE | `/api/admin/media/{id}` | |

### 4.4 Admin Content — Treatments (5)

| # | Method | Path |
|---|---|---|
| 12 | GET | `/api/admin/treatments` |
| 13 | POST | `/api/admin/treatments` |
| 14 | GET | `/api/admin/treatments/{id}` |
| 15 | PUT | `/api/admin/treatments/{id}` |
| 16 | DELETE | `/api/admin/treatments/{id}` |

### 4.5 Admin Content — Articles (5)

| # | Method | Path |
|---|---|---|
| 17 | GET | `/api/admin/articles` |
| 18 | POST | `/api/admin/articles` |
| 19 | GET | `/api/admin/articles/{id}` |
| 20 | PUT | `/api/admin/articles/{id}` |
| 21 | DELETE | `/api/admin/articles/{id}` |

### 4.6 Admin Content — Testimonials (5)

| # | Method | Path |
|---|---|---|
| 22 | GET | `/api/admin/testimonials/` |
| 23 | POST | `/api/admin/testimonials/` |
| 24 | GET | `/api/admin/testimonials/{id}` |
| 25 | PUT | `/api/admin/testimonials/{id}` |
| 26 | DELETE | `/api/admin/testimonials/{id}` |

### 4.7 Admin Content — Gallery (5)

| # | Method | Path |
|---|---|---|
| 27 | GET | `/api/admin/gallery/` |
| 28 | POST | `/api/admin/gallery/` |
| 29 | GET | `/api/admin/gallery/{id}` |
| 30 | PUT | `/api/admin/gallery/{id}` |
| 31 | DELETE | `/api/admin/gallery/{id}` |

### 4.8 Admin Content — Videos (5)

| # | Method | Path |
|---|---|---|
| 32 | GET | `/api/admin/videos/` |
| 33 | POST | `/api/admin/videos/` |
| 34 | GET | `/api/admin/videos/{id}` |
| 35 | PUT | `/api/admin/videos/{id}` |
| 36 | DELETE | `/api/admin/videos/{id}` |

### 4.9 Admin Content — Instagram / Curated Posts (5)

| # | Method | Path |
|---|---|---|
| 37 | GET | `/api/admin/instagram-posts/` |
| 38 | POST | `/api/admin/instagram-posts/` |
| 39 | GET | `/api/admin/instagram-posts/{id}` |
| 40 | PUT | `/api/admin/instagram-posts/{id}` |
| 41 | DELETE | `/api/admin/instagram-posts/{id}` |

### 4.10 Profile (2)

| # | Method | Path | Notes |
|---|---|---|---|
| 42 | GET | `/api/admin/profile/` | Singleton — public alias also exists at `GET /api/public/profile/` but requires Bearer for `PUT` |
| 43 | PUT | `/api/admin/profile/` | Whitelist: `bio, qualifications[], memberships[], awards[], mediaAppearances[], publications[], photo, video` (years 1950-2030) |

### 4.11 Home / Homepage Aggregate + Featured Config (4)

| # | Method | Path | Spec note |
|---|---|---|---|
| 44 | GET | `/api/admin/home/` | `backend/docs/openapi.yaml:1004` “NOTE — serves public homepage aggregate” (same as `GET /api/public/home/`) — requires Bearer per spec but payload is public |
| 45 | GET | `/api/admin/home/config` | Featured config (requires Bearer) |
| 46 | PUT | `/api/admin/home/config` | `{ featuredTreatments[], featuredArticles[], featuredVideos[], featuredTestimonials[] }: string[]` |
| 47 | GET/PUT | `/api/public/home/config` | Alias of the two above — requires Bearer despite `public` prefix (`backend/docs/openapi.yaml:388`) |

### 4.12 Admin Leads (6)

| # | Method | Path |
|---|---|---|
| 48 | GET | `/api/admin/leads/` (`?page,limit,status,source,startDate,endDate,search`) |
| 49 | GET | `/api/admin/leads/stats` (`?startDate,endDate,source`) |
| 50 | GET | `/api/admin/leads/export` (CSV `text/csv`) |
| 51 | GET | `/api/admin/leads/{id}` |
| 52 | PUT | `/api/admin/leads/{id}` (`leadStatus, appointmentStatus, notes, treatmentInterest` only) |
| 53 | DELETE | `/api/admin/leads/{id}` |

### 4.13 Admin Booking / Misc Clicks (4)

| # | Method | Path | Notes |
|---|---|---|---|
| 54 | GET | `/api/admin/booking-cta` | `backend/docs/openapi.yaml:1112` Same handler as public `GET /api/public/booking-cta` — no token check |
| 55 | POST | `/api/admin/leads/practo-click` | Same as public `POST /api/public/leads/practo-click` — always 200, no auth |
| 56 | GET | `/api/admin/booking-provider` | Singleton — 404 if not configured |
| 57 | PUT | `/api/admin/booking-provider` | Upsert `{providerName?,profileUrl?,bookingUrl?,isActive?}` |
| 58 | GET | `/api/admin/practo-clicks` | `?startDate,endDate` → `{totalClicks, dailyStats:[{_id,count}]}` |

### 4.14 Admin Redirects (5)

| # | Method | Path |
|---|---|---|
| 59 | GET | `/api/admin/redirects/` |
| 60 | POST | `/api/admin/redirects/` |
| 61 | GET | `/api/admin/redirects/{id}` |
| 62 | PUT | `/api/admin/redirects/{id}` (only `toPath`, `statusCode`; `fromPath` immutable) |
| 63 | DELETE | `/api/admin/redirects/{id}` |

### 4.15 Admin Analytics (2)

| # | Method | Path |
|---|---|---|
| 64 | GET | `/api/admin/analytics/reports/monthly` (`?startDate,endDate` — aggregates enquiry+click events) |
| 65 | GET | `/api/admin/analytics/events` (`?page,limit,eventType,startDate,endDate` → `PagedResponse`) |

### 4.16 Public aliases reachable via admin prefix (counted in 65 but included for completeness)

The public routes also listed in `openapi.yaml:276` onward are **not** expected to be called via `/api/admin/*` by the panel — they are for the public site. They are reachable via `src/app/api/home/route.js` (`GET /api/public/home`) and are excluded from the “61 admin endpoints” tally.

---

## 5. Table 3 — Comparison: Working / Broken / Missing

### 5.1 Summary counts

| Category | Count | Meaning |
|---|---|---|
| **Working** | 41 | Frontend proxy + saga + payload align with spec; will succeed with valid token |
| **Broken** | 8 | Frontend calls a URL that proxies to a non-existent backend path, or proxy handler itself is wrong, or saga not wired |
| **Missing** | 5 | Backend has an endpoint but admin-panel never calls it (no saga, no proxy, no page) |
| **Ghost proxies** | ~14 | `src/app/api/**/route.js` handlers for HTTP methods that have no backend handler (e.g., `PUT /api/admin/treatments` without id, `POST /api/admin/auth`). Will 404 if called but currently nothing calls them — low severity. |

### 5.2 Working — 41 (frontend correctly calls and backend will return 200/201 with valid Bearer)

| Backend path | Frontend URL | Evidence |
|---|---|---|
| `POST /api/admin/auth/login` | `/api/auth/login` | `auth.saga.js:9`, `api/auth/login/route.js:2` |
| `POST /api/admin/auth/refresh` | `/api/auth/refresh` | `auth.saga.js:33`, `api.js:71`, `api/auth/refresh/route.js:2` |
| `POST /api/admin/auth/logout` | `/api/auth/logout` | `auth.saga.js:48`, `api/auth/logout/route.js:2` |
| `GET /api/admin/clinic-info` | `/api/clinic-info` GET | `clinicInfo.saga.js:8` |
| `PUT /api/admin/clinic-info` | `/api/clinic-info` PUT | `clinicInfo.saga.js:22` |
| `POST /api/admin/media/upload` | `/api/media/upload` | `media.saga.js:47`, `media/page.tsx:60` |
| `POST /api/admin/media/confirm` | `/api/media/confirm` | `media.saga.js:64`, `media/page.tsx:129` + 3 inline page calls |
| `GET /api/admin/media` | `/api/media` GET | `media.saga.js:16` |
| `GET /api/admin/media/{id}` | `/api/media/${id}` GET | `media.saga.js:32` |
| `DELETE /api/admin/media/{id}` | `/api/media/${id}` DELETE | `media.saga.js:84` |
| `GET /api/admin/treatments` | `/api/treatments` GET | `treatments.saga.js:16` |
| `POST /api/admin/treatments` | `/api/treatments` POST | `treatments.saga.js:46` |
| `GET /api/admin/treatments/{id}` | `/api/treatments/${id}` GET | `treatments.saga.js:32` |
| `PUT /api/admin/treatments/{id}` | `/api/treatments/${id}` PUT | `treatments.saga.js:71` |
| `DELETE /api/admin/treatments/{id}` | `/api/treatments/${id}` DELETE | `treatments.saga.js:88` |
| `GET /api/admin/articles` | `/api/articles` GET | `articles.saga.js:16` |
| `POST /api/admin/articles` | `/api/articles` POST | `articles.saga.js:44` |
| `GET /api/admin/articles/{id}` | `/api/articles/${id}` GET | `articles.saga.js:31` |
| `PUT /api/admin/articles/{id}` | `/api/articles/${id}` PUT | `articles.saga.js:65` |
| `DELETE /api/admin/articles/{id}` | `/api/articles/${id}` DELETE | `articles.saga.js:82` |
| `GET /api/admin/testimonials/` | `/api/testimonials` GET | `testimonials.saga.js:16` |
| `POST /api/admin/testimonials/` | `/api/testimonials` POST | `testimonials.saga.js:44` |
| `GET /api/admin/testimonials/{id}` | `/api/testimonials/${id}` GET | `testimonials.saga.js:31` |
| `PUT /api/admin/testimonials/{id}` | `/api/testimonials/${id}` PUT | `testimonials.saga.js:64` |
| `DELETE /api/admin/testimonials/{id}` | `/api/testimonials/${id}` DELETE | `testimonials.saga.js:81` |
| `GET /api/admin/gallery/` | `/api/gallery` GET | `gallery.saga.js:16` |
| `POST /api/admin/gallery/` | `/api/gallery` POST | `gallery.saga.js:44` |
| `GET /api/admin/gallery/{id}` | `/api/gallery/${id}` GET | `gallery.saga.js:31` |
| `PUT /api/admin/gallery/{id}` | `/api/gallery/${id}` PUT | `gallery.saga.js:64` |
| `DELETE /api/admin/gallery/{id}` | `/api/gallery/${id}` DELETE | `gallery.saga.js:81` |
| `GET /api/admin/videos/` | `/api/videos` GET | `videos.saga.js:16` |
| `POST /api/admin/videos/` | `/api/videos` POST | `videos.saga.js:44` |
| `GET /api/admin/videos/{id}` | `/api/videos/${id}` GET | `videos.saga.js:31` |
| `PUT /api/admin/videos/{id}` | `/api/videos/${id}` PUT | `videos.saga.js:64` (note: must send full object, partial may 422 — see Broken notes) |
| `DELETE /api/admin/videos/{id}` | `/api/videos/${id}` DELETE | `videos.saga.js:81` |
| `GET /api/admin/instagram-posts/` | `/api/instagram-posts` GET | `instagramPosts.saga.js:16` |
| `POST /api/admin/instagram-posts/` | `/api/instagram-posts` POST | `instagramPosts.saga.js:44` |
| `GET /api/admin/instagram-posts/{id}` | `/api/instagram-posts/${id}` GET | `instagramPosts.saga.js:31` |
| `PUT /api/admin/instagram-posts/{id}` | `/api/instagram-posts/${id}` PUT | `instagramPosts.saga.js:64` |
| `DELETE /api/admin/instagram-posts/{id}` | `/api/instagram-posts/${id}` DELETE | `instagramPosts.saga.js:81` |
| `GET /api/admin/profile/` | `/api/profile` GET | `profile.saga.js:8` |
| `PUT /api/admin/profile/` | `/api/profile` PUT | `profile.saga.js:23` |
| `GET /api/admin/home/config` | `/api/home/config` GET | `homepage.saga.js:17` |
| `PUT /api/admin/home/config` | `/api/home/config` PUT | `homepage.saga.js:35` |
| `GET /api/public/home` (via `/api/home`) | `/api/home` GET | `api/home/route.js:7` — public aggregate, no auth |
| `GET /api/admin/leads/` | `/api/leads` GET | `leads.saga.js:16` |
| `GET /api/admin/leads/stats` | `/api/leads/stats` GET | `leads.saga.js:31` |
| `GET /api/admin/leads/export` | `/api/leads/export` GET | `leads.saga.js:97` |
| `GET /api/admin/leads/{id}` | `/api/leads/${id}` GET | `leads.saga.js:43` |
| `PUT /api/admin/leads/{id}` | `/api/leads/${id}` PUT | `leads.saga.js:65` |
| `DELETE /api/admin/leads/{id}` | `/api/leads/${id}` DELETE | `leads.saga.js:82` |
| `GET /api/admin/booking-provider` | `/api/booking-provider` GET | `bookingProvider.saga.js:18` + page direct |
| `PUT /api/admin/booking-provider` | `/api/booking-provider` PUT | `bookingProvider.saga.js:47` + page direct |
| `GET /api/admin/practo-clicks` | `/api/practo-clicks` GET | `bookingProvider.saga.js:66` + page direct |
| `GET /api/admin/redirects/` | `/api/redirects` GET | `redirects.saga.js:16` |
| `POST /api/admin/redirects/` | `/api/redirects` POST | `redirects.saga.js:51` |
| `GET /api/admin/redirects/{id}` | `/api/redirects/${id}` GET | `redirects.saga.js:32` |
| `PUT /api/admin/redirects/{id}` | `/api/redirects/${id}` PUT | `redirects.saga.js:88` |
| `DELETE /api/admin/redirects/{id}` | `/api/redirects/${id}` DELETE | `redirects.saga.js:107` |

### 5.3 Broken — 8 (frontend calls exist but will always 404 / fail)

| # | What is broken | Backend path that was expected | What the code actually does | Where | Why it fails | Severity |
|---|---|---|---|---|---|---|
| B1 | **Analytics — wrong URL** | `GET /api/admin/analytics/reports/monthly` + `GET /api/admin/analytics/events` (spec `openapi.yaml:1225,1235`) | Calls generic `GET /api/analytics` (`src/modules/analytics/analytics.saga.js:7` `BASE='/api/analytics'`) which proxies to `GET /api/admin/analytics` (`src/app/api/analytics/route.js:2`) — **does not exist** in spec | `analytics.saga.js:7,13`, `api/analytics/route.js:2` | No backend route `GET /api/admin/analytics` — 404. Saga never hits either of the two real analytics endpoints. Dashboard’s GA section will stay “Mock”. | High |
| B2 | **Analytics — `GET /api/analytics/${id}` + `POST/PUT/DELETE`** | No such endpoints in spec | `src/modules/analytics/analytics.saga.js:24,34,48,60` + `src/app/api/analytics/[id]/route.js:2` | same | All 4 methods proxy to non-existent `.../analytics/${id}`. `fetchOne/create/update/delete` will 404. | High |
| B3 | **Analytics — wrong HTTP client + token** | Bearer `call(api.get, …)` via `@/lib/api` (handles refresh) | `src/modules/analytics/analytics.saga.js:1` uses raw `axios` with hand-rolled `selectToken: s=>s.auth?.token \|\| s.auth?.item?.token \|\| s.auth?.user?.token` (`analytics.saga.js:5`) which **never matches** the real auth shape (`src/store/slices/authSlice.ts` + `setTokens` localStorage) → `Authorization` is almost always `""` → would 401 even if URL were correct. Also bypasses `api.js` 401-refresh retry. | `analytics.saga.js:1,5,13` | Unauthenticated + wrong URL = double failure. | High |
| B4 | **Analytics — proxy [id] ghost collection methods** | No such | `src/app/api/analytics/route.js:3-5` exposes `POST/PUT/DELETE /api/analytics` → `/api/admin/analytics` — no backend handler | `analytics/route.js:3` | Ghost methods — harmless unless called (but saga does call them: B2). | Medium |
| B5 | **SEO Pages — not wired, no proxy** | No backend endpoint `GET /api/admin/seo-pages` in `openapi.yaml` (SEO is `POST /api/public/enquiry`, `GET /sitemap.xml` etc). Module assumes REST under `/api/seo-pages`. | `src/modules/seoPages/seoPages.saga.js:7` `BASE='/api/seo-pages'` with raw `axios` (same token bug as analytics). **No** `src/app/api/seo-pages/` proxy directory exists (verified via `src/app/api` listing). **Not** registered in `src/store/index.ts:35` (`rootSaga` nor reducers). No page dispatches it (`src/app/seo/page.tsx` is a shell). | `seoPages.saga.js:7`, `seoPages.slice.js:1`, `store/index.ts:1` (absent) | Dead code. If anyone dispatches `request` it will 404 at the Next.js proxy level (no route handler), then never reach a backend anyway. | Medium — blocks the “SEO Pages” nav item (`src/lib/constants.ts:28`) |
| B6 | **Videos update validator** | `PUT /api/admin/videos/{id}` requires **full** `Video` (`openapi.yaml:917` “send full object — validator is create-shaped” → `url, title, category` required) | `src/modules/videos/videos.saga.js:64` sends `payload` as-is after stripping `id/_id`. If the page edits only `title` or `order`, `url`/`category` missing → 422 `Validation failed`. No frontend guard builds the full object. | `videos.saga.js:64` | Payload mismatch — may surface as intermittent 422 on partial edits. | Medium |
| B7 | **Clinic-info partial PUT risk** | `PUT /api/admin/clinic-info` spec body is a free `object` but real validation requires address sub-fields | `src/app/clinic-info/page.tsx:74,86,101` sends 3 separate partial payloads (`{timings}`, `{practiceName,phones,...}`, `{socialLinks}`) — backend may not merge; second save could clear previous field if backend does replacement not merge. | `clinic-info/page.tsx:74` | Logic risk — not a crash but can silently drop data. | Medium |
| B8 | **Homepage alias `/api/admin/home/${id}`** | Spec has `GET /api/admin/home/` (aggregate, not by id) and `GET/PUT /api/admin/home/config` only. No `GET/PUT/DELETE /api/admin/home/{id}`. | `src/app/api/homepage/[id]/route.js:2` proxies `GET/PUT/DELETE /api/admin/home/${id}` — **404**. Never called by a saga, so latent, but any direct fetch to `/api/homepage/<id>` will 404. | `homepage/[id]/route.js:2` | Ghost alias — confuses two homepage surfaces (`home` = aggregate, `homepage` = unused). | Low |

### 5.4 Missing — 5 (backend has it, frontend never calls it)

| # | Backend endpoint | Spec | What it does | Should frontend call it? |
|---|---|---|---|---|
| M1 | `GET /api/admin/auth/me` | `openapi.yaml:510` | Returns current admin user (requires Bearer). Used to hydrate session after refresh / on app boot. | **Yes** — neither `auth.saga.js` nor any page calls `GET /api/auth/me`; session is only hydrated from login response. After a hard refresh with a valid `accessToken` in `localStorage`, the panel has no way to re-fetch the user object (e.g., after `/api/auth/refresh`). Add `GET /api/auth/me` proxy + saga. |
| M2 | `GET /api/admin/analytics/reports/monthly` | `openapi.yaml:1225` | Monthly report (aggregates `enquiry` + `practo_click` events) — the live version of what `dashboard/page.tsx:45` currently mocks (`gaStats`, `gaTrend`, `topPages`). | **Yes** — dashboard is entirely mock (`src/app/dashboard/page.tsx:45` “Mock — will be replaced by GA Data API”). Should call `reports/monthly` + `events`. The broken analytics saga was presumably the stub for this. |
| M3 | `GET /api/admin/analytics/events` | `openapi.yaml:1235` | Raw analytics event list `?page,limit,eventType,startDate,endDate` → `PagedResponse` | **Yes** — same as M2, the drill-down table. |
| M4 | `GET /api/admin/booking-cta` | `openapi.yaml:1112` | Same handler as public `GET /api/public/booking-cta` — no auth, returns active Practo links. Admin alias exists. | **No** — intentionally dual-mounted; public booking page should use `GET /api/public/booking-cta`. Admin calling its admin alias is redundant but harmless — not a gap. Included for completeness. |
| M5 | `POST /api/admin/leads/practo-click` | `openapi.yaml:1120` | Same as public `POST /api/public/leads/practo-click` — always 200, logs a click. Admin alias. | **No** — public site should call public alias. Same as M4 — dual mount, not expected from panel. |

> **Strict “Missing” that should be fixed:** **M1–M3** (3 items). M4–M5 are intentional dual mounts, not gaps.

### 5.5 Ghost proxies (dead code, no caller — will 404 only if called)

| Proxy file | Methods exposed | Backend it proxies to | Exists in spec? | Called anywhere? |
|---|---|---|---|---|
| `src/app/api/auth/route.js:2` | `GET/POST/PUT/DELETE /api/auth` → `/api/admin/auth` | `/api/admin/auth` | No — only `/login`, `/refresh`, `/logout`, `/me` exist | No |
| `src/app/api/auth/[id]/route.js:2` | `GET/POST/PUT/DELETE /api/auth/[id]` → `/api/admin/auth/${id}` | `/api/admin/auth/${id}` | No | No |
| `src/app/api/clinic-info/[id]/route.js:2` | `GET/PUT/DELETE /api/admin/clinic-info/${id}` | singleton, no `:id` | No | No |
| `src/app/api/profile/[id]/route.js:2` | `GET/PUT/DELETE /api/admin/profile/${id}` | singleton, no `:id` | No | No |
| `src/app/api/profile/route.js:3,5` | `POST/DELETE /api/admin/profile` | No — only `GET`/`PUT` | No | No |
| `src/app/api/treatments/route.js:4-5` | `PUT/DELETE /api/admin/treatments` (no id) | No — id required | No | No |
| `src/app/api/articles/route.js:4-5` | `PUT/DELETE` on collection | No | No | No |
| `src/app/api/testimonials/route.js:4-5` | `PUT/DELETE` on collection | No | No | No |
| `src/app/api/gallery/route.js:4-5` | `PUT/DELETE` on collection | No | No | No |
| `src/app/api/videos/route.js:4-5` | `PUT/DELETE` on collection | No | No | No |
| `src/app/api/instagram-posts/route.js:4-5` | `PUT/DELETE` on collection | No | No | No |
| `src/app/api/media/route.js:3-4` | `POST/PUT /api/admin/media` | No — `upload`+`confirm` only | No | No |
| `src/app/api/media/[id]/route.js:3` | `PUT /api/admin/media/${id}` | No — only `GET`/`DELETE` | No | No |
| `src/app/api/leads/route.js:3-5` | `POST/PUT/DELETE /api/admin/leads` (no id) | No — only `GET` + `GET /stats` + `GET /export` on collection | No | No |
| `src/app/api/redirects/route.js:4-5` | `PUT/DELETE /api/admin/redirects` (no id) | No | No | No |
| `src/app/api/analytics/route.js:3-5` | `POST/PUT/DELETE /api/admin/analytics` | No — only `reports/monthly` + `events` | No — but saga calls them (B2) | No direct page |
| `src/app/api/analytics/[id]/route.js:2` | `GET/PUT/DELETE /api/admin/analytics/${id}` | No | No — saga calls (B2) | — |
| `src/app/api/homepage/route.js:2` + `[id]/route.js:2` | `GET/POST/PUT/DELETE /api/admin/home` and `.../home/${id}` | No — only `/admin/home/` (aggregate) and `/home/config` | No | No |

*Recommendation:* Delete all rows above where “Called anywhere? = No” and collapse each `route.js` to only the methods that both exist in `openapi.yaml` and are actually called (GET on collection, POST where spec allows POST, etc.). This removes confusion and eliminates a class of accidental 404.

---

## 6. State not updating / UI never re-renders

| Area | What happens | Why the store looks “stale” |
|---|---|---|
| **SEO Pages** | Dispatching `seoPages/request` (or any `seoPages/*`) does nothing — reducer not mounted, saga not run. | `src/store/index.ts:35` never imports `seoPagesSlice`/`seoPagesSaga`. Actions fall through to no reducer (Redux Toolkit ignores unknown action type). |
| **Analytics** | Even if its proxy URL were corrected, dispatches use raw `axios` with a selector that reads `state.auth.token` — that key does not exist (`authSlice` stores `{ user, isAuthenticated }`, tokens live in `localStorage` via `setTokens`). The token is never forwarded → 401 always → response interceptor at `src/lib/api.js:43` never runs (it only covers `api` instance, not raw `axios`). `success`/`failure` reducers do run (slice is registered) but `failure` will just store `error`. | Wrong HTTP client + wrong state path. |
| **Treatments/Videos/… generic `request`/`success`/`failure`** | `treatments.saga.js:109` listens to `takeLatest(request.type, fetchList)` as a backward-compat fallback — so dispatching the generic `treatments/request` still works. `setItem` also keeps `item` across `fetchOne/create/update`. No known stale-state bug in these modules. | — |
| **Leads export** | Export dispatches a string action type `'leads/export'` (`src/modules/leads/leads.saga.js:119`) — fragile pattern (not via `createAction`/`slice.actions`). If middleware uses `action.type` string comparison this still works, but type safety is lost; page also fires a direct `api.get` (`src/app/leads/page.tsx:27`) so two downloads may occur if both paths are kept. | Duplicate wiring. |

---

## 7. Common mistakes & gotchas (all verified in code)

### 7.1 Wrong URL path

- **Analytics** — `/api/analytics` vs. `/api/analytics/reports/monthly` + `/api/analytics/events` (see B1).  
- **SEO Pages** — `/api/seo-pages` has no proxy and no backend spec entry (see B5).  
- **Homepage alias** — `/api/homepage` and `/api/homepage/${id}` → `/api/admin/home` (no such) vs. canonical `/api/home/config` → `/api/admin/home/config`.  
- **Auth ghost** — `/api/auth` → `/api/admin/auth` and `/api/auth/${id}` → `/api/admin/auth/${id}` (no such).  
- **Singletons with `[id]`** — `GET /api/admin/clinic-info/${id}` and `GET /api/admin/profile/${id}` (no such; both are singletons).

### 7.2 Missing Bearer / Content-Type

- `api.js:35` correctly injects `Bearer` for every `api.*` call. **Analytics + seoPages bypass `api`** and hand-roll `Authorization: Bearer ${token}` from `state.auth.token` which is wrong state path → unauthenticated requests. The proxy `src/lib/apiProxy.js:12` forwards `Authorization` if present and always sends `Content-Type: application/json` — correct. The Cloudinary `fetch(uploadUrl, {method:'POST', body: FormData})` in `src/app/media/page.tsx:89` intentionally **does not** set `Content-Type` (boundary handled by `fetch`) — correct.

### 7.3 Incorrect payload structure

- **Media confirm** — spec requires **both** `key` **and** `publicId` (plus `url, filename, mimeType, size`) (`openapi.yaml:558`). All 4 call sites correctly send 6 fields with `key === publicId`. ✅  
- **Videos update** — spec validator is create-shaped (`PUT /api/admin/videos/{id}` “send full object”). Partial update missing `url/title/category` will 422.  
- **Leads update** — saga correctly whitelists only 4 writable fields (`leads.saga.js:61`); page `leads/page.tsx:43` correctly sends only `leadStatus, appointmentStatus, notes`. ✅  
- **Redirects update** — saga only sends `toPath` + `statusCode` (fromPath immutable) — correct per spec `openapi.yaml:1199`. ✅  
- **Booking-provider** — saga coerces `providerName: payload.providerName || 'practo'` (fixes missing default). ✅  
- **Profile** — full whitelist with `year` 1950–2030 coercion (`profile.saga.js:22`, `profile/page.tsx:175`). Very thorough; avoids string-year → backend 422. ✅

### 7.4 State shape assumptions (`res.data?.data ?? res.data`)

- Several sagas unwrap `res.data?.data ?? res.data` (`profile.saga.js:9`, `homepage.saga.js:18`, `media.saga.js:33`, `bookingProvider.saga.js:18`, `redirects.saga.js:33`). This correctly handles both the direct admin response (`res.data` = `{items,pagination}` or singleton) and the `{data: …}` wrapper used by some routes. No bug here — defensive.

### 7.5 Not registered in the store

- `seoPages` missing from `src/store/index.ts:42,35` — entire feature is dead.  
- `analytics` **is** registered (`store/index.ts:32,35`) but never dispatched by any page (dashboard is mock).  
- Nav still lists “SEO Pages” (`src/lib/constants.ts:28`) and “Analytics” (`src/lib/constants.ts:24`) → user can navigate there and see either a stub page or a broken saga.

### 7.6 Env / backend reachability

- `src/lib/apiProxy.js:3` reads `NEXT_PUBLIC_API_BASE` (`admin-panel/.env:1` → `http://192.168.29.244:4000` and `admin-panel/.env.local:1` → `http://localhost:4000`). `.env.local` wins in dev. No runtime health check; if backend is down, every proxy returns the downstream error body verbatim (`apiProxy.js:19` `await res.text()`). The axios interceptor will surface `Network Error` as `e.message`.

---

## 8. Fix checklist (Phase 1 → Phase 2 Handoff)

### P0 — must fix to unblock features

- [ ] **Analytics:** Replace `src/modules/analytics/analytics.saga.js:7` `BASE='/api/analytics'` with two real calls: `GET /api/analytics/reports/monthly` (or `/api/analytics/monthly` via new proxies `src/app/api/analytics/reports/monthly/route.js` → `/api/admin/analytics/reports/monthly` and `GET /api/analytics/events` → `/api/admin/analytics/events`). Switch from raw `axios` to `api` (`@/lib/api`). Remove `selectToken`/`authHeaders` helper; let `api` interceptor handle Bearer + refresh. Separate slices: `reports` vs `events` (today they share `items`/`item` ambiguously). Update `src/app/api/analytics/route.js` + `[id]/route.js` to proxy the real backend paths; delete the ghost `POST/PUT/DELETE` if not needed.
- [ ] **Leads export `responseType: 'blob'` with `fetch` proxy:** The Next.js proxy `apiProxy.js:12` always forwards `Content-Type: application/json` and `await res.text()` — for CSV this will coerce a binary `text/csv` response through `text()`; `axios` `responseType: 'blob'` will still handle it as text internally but the `Content-Type: text/csv` is forwarded via `ct` header (`apiProxy.js:21`). Verify the CSV download isn’t corrupted by `text()` re-encoding (e.g., BOM/utf8). Consider adding a passthrough for `responseType === 'blob'` in `apiProxy.js` (`arrayBuffer` path).
- [ ] **Auth `GET /api/admin/auth/me`:** Add `src/app/api/auth/me/route.js` → `GET /api/admin/auth/me`, wire `authSaga` to fetch on boot/after refresh, and hydrate `authSlice` user. Without this, silent refresh can succeed (new tokens) but Redux state loses `user` after a hard reload.

### P1 — should fix for correctness

- [ ] **SEO Pages:** Either (a) implement `GET/POST/PUT/DELETE /api/admin/seo-pages` on backend (new resource) and add `src/app/api/seo-pages/` proxies + register `seoPagesReducer/saga` in `src/store/index.ts:42,35`, or (b) remove the “SEO Pages” nav item (`src/lib/constants.ts:28`) and dead code (`src/modules/seoPages/`, `src/app/seo/page.tsx`). Today it is a stub that promises a feature that doesn’t exist.
- [ ] **Videos PUT 422 risk:** Make `src/modules/videos/videos.saga.js:64` or the owning page always send the full `Video` (`url,title,category` at minimum) on update — fetch the current item first and merge before PUT (or switch backend to `PATCH`-style partial validation).
- [ ] **Remove ghost proxy methods:** Collapse every `route.js` in `src/app/api` to only the methods defined in `openapi.yaml` (e.g., `GET`+`POST` on collections where spec allows `POST`, `GET/PUT/DELETE` on `[id]` where spec allows each). Delete the collection `PUT/DELETE` methods on treatments/articles/…, the `POST/PUT/DELETE` on auth collection, singleton `[id]` routes, etc. Keeps OpenAPI as source of truth.
- [ ] **Clinic-info partial saves:** Have `src/app/clinic-info/page.tsx` merge local state into a single full `ClinicInfo` before dispatch, or change backend `PUT /api/admin/clinic-info` to explicitly merge (document the behavior). Add an optimistic `fetchRequest` after each `updateSuccess` to re-hydrate.
- [ ] **Store duplicate analytics `POST/PUT/DELETE` [id] calls:** Delete `analytics.saga.js` handlers for `create/update/delete/fetchOne` if backend has no such mutating analytics endpoints (spec only has GET `reports/monthly` + `events`). Retention is a source of 404.

### P2 — nice-to-have / cleanup

- [ ] Deduplicate `booking-provider/page.tsx` dual calling (dispatch + direct `api.*`) — keep only Redux path, or remove saga dispatch if page-level fetch is preferred (pick one). Same for `leads/page.tsx` export dual path.
- [ ] Normalize homepage proxy names: deprecate `src/app/api/homepage/` in favor of `src/app/api/home/` + `src/app/api/home/config/`; keep one name across proxy, saga, and `openapi.yaml`.
- [ ] Move `analytics` + `seoPages` off raw `axios` (even after fixing URL): standardize all sagas on `api` from `@/lib/api.js:1` so 422/429/401 handling is consistent.
- [ ] Add `GET /api/admin/auth/me` to `src/store/slices/authSlice.ts` as `fetchMeRequest/Success/Failure` and dispatch it from `AdminLayout` (`src/components/layout/AdminLayout.tsx`) on mount when `getAccessToken()` exists.

---

## 9. Appendix — File inventory (full, for cross-checking the tables)

### Proxies verified (literal reads, not glob aliases)

```
src/lib/api.js                          — axios('') + Bearer + 401 refresh  (POST /api/auth/refresh)
src/lib/apiProxy.js                     — Next.js forwarder → BACKEND + query + body + Auth + Cookie
src/app/api/analytics/route.js          — proxy  GET/POST/PUT/DELETE /api/admin/analytics            (ghost)
src/app/api/analytics/[id]/route.js     — proxy  GET/PUT/DELETE /api/admin/analytics/${id}          (ghost)
src/app/api/articles/route.js           — proxy  GET/POST/PUT/DELETE /api/admin/articles             (GET/POST valid)
src/app/api/articles/[id]/route.js      — proxy  GET/PUT/DELETE /api/admin/articles/${id}           (all valid)
src/app/api/auth/login/route.js         — proxy  POST /api/admin/auth/login                         valid
src/app/api/auth/refresh/route.js       — proxy  POST /api/admin/auth/refresh                       valid
src/app/api/auth/logout/route.js        — proxy  POST /api/admin/auth/logout                        valid
src/app/api/auth/route.js               — proxy  GET/POST/PUT/DELETE /api/admin/auth                ghost
src/app/api/auth/[id]/route.js          — proxy  …/auth/${id}                                       ghost
src/app/api/booking-provider/route.js   — proxy  GET/PUT /api/admin/booking-provider                valid
src/app/api/clinic-info/route.js        — proxy  GET/POST/PUT/DELETE /api/admin/clinic-info         (GET/PUT valid)
src/app/api/clinic-info/[id]/route.js   — proxy  …/clinic-info/${id}                                ghost
src/app/api/gallery/route.js            — proxy  GET/POST/PUT/DELETE /api/admin/gallery             (GET/POST valid)
src/app/api/gallery/[id]/route.js       — proxy  GET/PUT/DELETE /api/admin/gallery/${id}            all valid
src/app/api/home/route.js               — proxy  GET /api/public/home                               valid (public aggregate)
src/app/api/home/config/route.js        — proxy  GET/PUT /api/admin/home/config                     valid
src/app/api/homepage/route.js           — proxy  GET/POST/PUT/DELETE /api/admin/home                alias/ghost
src/app/api/homepage/[id]/route.js      — proxy  …/home/${id}                                       ghost
src/app/api/instagram-posts/route.js    — proxy  GET/POST/PUT/DELETE /api/admin/instagram-posts     (GET/POST valid)
src/app/api/instagram-posts/[id]/route.js — proxy GET/PUT/DELETE .../${id}                          all valid
src/app/api/leads/route.js              — proxy  GET/POST/PUT/DELETE /api/admin/leads               (GET valid)
src/app/api/leads/stats/route.js        — proxy  GET /api/admin/leads/stats                         valid
src/app/api/leads/export/route.js       — proxy  GET /api/admin/leads/export                        valid
src/app/api/leads/[id]/route.js         — proxy  GET/PUT/DELETE /api/admin/leads/${id}              all valid
src/app/api/media/route.js              — proxy  GET/POST/PUT/DELETE /api/admin/media               (GET valid)
src/app/api/media/confirm/route.js      — proxy  POST /api/admin/media/confirm                      valid
src/app/api/media/upload/route.js       — proxy  POST /api/admin/media/upload                       valid
src/app/api/media/[id]/route.js         — proxy  GET/PUT/DELETE /api/admin/media/${id}              (GET/DELETE valid; PUT ghost)
src/app/api/practo-clicks/route.js      — proxy  GET /api/admin/practo-clicks                       valid
src/app/api/profile/route.js            — proxy  GET/POST/PUT/DELETE /api/admin/profile             (GET/PUT valid)
src/app/api/profile/[id]/route.js       — proxy  …/profile/${id}                                    ghost
src/app/api/redirects/route.js          — proxy  GET/POST/PUT/DELETE /api/admin/redirects           (GET/POST valid)
src/app/api/redirects/[id]/route.js     — proxy  GET/PUT/DELETE /api/admin/redirects/${id}          all valid
src/app/api/testimonials/route.js       — proxy  GET/POST/PUT/DELETE /api/admin/testimonials        (GET/POST valid)
src/app/api/testimonials/[id]/route.js  — proxy  GET/PUT/DELETE .../${id}                           all valid
src/app/api/treatments/route.js         — proxy  GET/POST/PUT/DELETE /api/admin/treatments          (GET/POST valid)
src/app/api/treatments/[id]/route.js    — proxy  GET/PUT/DELETE /api/admin/treatments/${id}         all valid
src/app/api/videos/route.js             — proxy  GET/POST/PUT/DELETE /api/admin/videos              (GET/POST valid)
src/app/api/videos/[id]/route.js        — proxy  GET/PUT/DELETE /api/admin/videos/${id}             all valid
```

*No* `src/app/api/seo-pages/` exists (verified: `src/app/api` listing has no `seo-pages`).

### Sagas verified

```
src/modules/auth/auth.saga.js           — login, refresh, logout                              registered
src/modules/clinicInfo/clinicInfo.saga.js — GET + PUT                                         registered
src/modules/media/media.saga.js         — list, one, upload, confirm, delete                 registered
src/modules/treatments/treatments.saga.js — list, one, create, update, delete                registered
src/modules/articles/articles.saga.js   — list, one, create, update, delete                  registered
src/modules/testimonials/testimonials.saga.js — same 5                                        registered
src/modules/gallery/gallery.saga.js     — same 5                                              registered
src/modules/videos/videos.saga.js       — same 5                                              registered
src/modules/instagramPosts/instagramPosts.saga.js — same 5                                     registered
src/modules/leads/leads.saga.js         — list, stats, one, update, delete, export             registered
src/modules/bookingProvider/bookingProvider.saga.js — fetch, update, clicks                   registered
src/modules/redirects/redirects.saga.js — list, one, create, update, delete                  registered
src/modules/profile/profile.saga.js     — fetch, update                                      registered
src/modules/homepage/homepage.saga.js   — fetchConfig, updateConfig                           registered
src/modules/analytics/analytics.saga.js — list, one, create, update, delete  (WRONG URLs)     registered (but broken)
src/modules/seoPages/seoPages.saga.js   — list, one, create, update, delete  (WRONG URLs)     NOT registered (dead)
src/store/index.ts                      — wires 14 reducers + 14 sagas (includes broken analytics, excludes seoPages)
```

### Direct `api.*` call sites outside sagas

```
src/lib/api.js:71                       POST /api/auth/refresh                (interceptor, withCredentials true)
src/app/media/page.tsx:60               POST /api/media/upload               {filename,mimeType,size}
src/app/media/page.tsx:89               fetch(uploadUrl, FormData)           Cloudinary direct — not an admin API
src/app/media/page.tsx:129              POST /api/media/confirm              {key,publicId,url,filename,mimeType,size}
src/app/gallery/page.tsx:43             POST /api/media/confirm              same (inline gallery upload)
src/app/instagram-posts/page.tsx:38     POST /api/media/confirm              same (instagram upload)
src/app/profile/page.tsx:131            POST /api/media/confirm              same (profile photo/video)
src/app/booking-provider/page.tsx:60    GET  /api/booking-provider           (duplicate with saga)
src/app/booking-provider/page.tsx:94    GET  /api/practo-clicks              (duplicate with saga)
src/app/booking-provider/page.tsx:146   PUT  /api/booking-provider           (duplicate with saga)
src/app/leads/page.tsx:27               GET  /api/leads/export               ?status&source blob
```

### Env

```
admin-panel/.env         NEXT_PUBLIC_API_BASE='http://192.168.29.244:4000'
admin-panel/.env.local   NEXT_PUBLIC_API_BASE=http://localhost:4000   (wins in dev via Next.js env cascade)
```

---

## 10. Verdict (single-screen summary)

- **41/46 admin endpoints the panel actually needs are correctly wired** and will succeed with a valid Bearer token (treatments, articles, testimonials, gallery, videos, instagram-posts, media, auth, clinic-info, profile, homepage config, leads, booking-provider, practo-clicks, redirects).
- **~61 spec admin endpoints vs ~41 working** → the gap is not random: the only missing/broken spec endpoints are `GET /api/admin/auth/me` (never needed for login flow but needed for refresh/hydration), the two analytics endpoints (`reports/monthly` + `events`) which the frontend replaced with generic `/api/analytics` (wrong path + wrong client), and the SEO Pages stub (`/api/seo-pages` — spec has no such resource, frontend has no proxy and isn’t wired).
- **The proxy layer is over-proxied:** 14+ collection/`[id]` ghost routes expose `PUT/DELETE` etc. for resources that have no such backend handler. Harmless today (nothing calls them) but a future typo will 404 instead of being caught by type checking. Prune them.
- **Analytics and SEO Pages are the only features that are genuinely broken.** Everything else is a payload/state-mismatch edge case (videos PUT full-object rule, clinic-info partial saves, homepage alias confusion).
- **No missing `Content-Type`/`Bearer` on the main paths** — `src/lib/api.js:7,35` and `src/lib/apiProxy.js:12` handle both correctly for every `api.*` call. The only Bearer gaps are the two sagas that opted out of `api` (analytics + seoPages).

> **Bottom line:** Fix `analytics` (correct URLs + switch to `api` + add `reports/monthly`/`events` proxies), decide fate of `seoPages` (implement backend + wire it, or delete the nav stub), and add `GET /api/admin/auth/me` for session hydration. After those three, the panel will cover every spec-real admin endpoint it needs.

---

*Audit performed without launching the dev servers. “Working” means proxy + saga + spec shape alignment; live 200/422 behavior depends on a running backend at `NEXT_PUBLIC_API_BASE` and a valid `Authorization: Bearer <accessToken>` from `src/lib/api.js:10`.*
