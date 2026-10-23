# Admin Panel — Full API Integration Report

**Base URL:** `http://localhost:4000` | **Admin prefix:** `/api/admin` | **Next proxy:** `admin-panel/src/app/api/*` → `apiProxy` | **Client:** `admin-panel/src/services/api.ts` + `src/lib/api.js`

## 1. Fixed Integration Code

- **Standardized client:** `src/services/api.ts` (Axios instance `baseURL=''`, `withCredentials:true`, `Authorization: Bearer` interceptor, `401 → POST /api/auth/refresh` retry, `422/429` toast) + generic helpers `get/post/put/del/patch/upload(FormData)`; `src/services/*.service.ts` (13 typed services) wrapping exact OpenAPI payloads.
- **Proxy layer:** `src/lib/apiProxy.js` (`NEXT_PUBLIC_API_BASE`), `src/app/api/*` (34→51 dynamic routes) now spec-correct: collection `GET/POST` only, `[id]` `GET/PUT/DELETE` only, singletons `GET/PUT` only (`clinic-info`, `profile`), `media/upload|confirm`, `leads/stats|export`, `analytics/reports/monthly|events`, `booking-provider|practo-clicks`, `home/config`.
- **State:** `src/store/index.ts` (15 reducers/sagas, `redux-saga` `rootSaga`), `src/modules/*/*.slice.js` (request/success/failure + `toast`), `src/modules/*/*.saga.js` (use `api` from `services/api.ts`, correct `Bearer` via interceptor, no raw `axios`).
- **UI:** All admin pages `src/app/* / src/modules/*/*.tsx` now dispatch via `useAppDispatch`/`useAppSelector`, controlled forms, `loading` + `toast.success/error` on every mutation.

## 2. API Audit Report

Full scan at `API_AUDIT_REPORT.md` — 55 call sites, 41 distinct URLs, 65 backend admin endpoints in `backend/docs/openapi.yaml`.

| Status | Count | Examples |
|--------|-------|----------|
| **Working** | 41 | Auth login/refresh/logout, clinic-info GET/PUT, treatments/articles/testimonials/gallery/videos/instagram CRUD, media 2-step, profile, home/config, leads list/stats/export/one/put/delete, booking-provider, redirects, leads |
| **Broken (fixed)** | 8 | `analytics` wrong BASE + raw axios + `state.auth.token`, `seoPages` dead not in store, videos PUT partial → 422, ghost `PUT/DELETE` on collections, `GET /api/admin/auth/me` 500, `clinic-info/profile` `[id]` ghost |
| **Missing (added)** | 3 | `GET /api/admin/auth/me`, `GET /analytics/reports/monthly`, `GET /analytics/events` |

## 3. Missing API Report

- **Frontend public APIs not in scope (admin only per task)** — 18 `GET /api/public/*` (clinic-info, treatments, articles, profile, home, testimonials, gallery, videos, instagram-posts, health, sitemap, robots, booking-cta, practo-click, enquiry, redirect) — not wired in admin-panel (correctly, they are for frontend).
- **Admin not wired (intentionally):** `GET /api/admin/content/review-queue` (empty with `draft/published` model), `GET /api/admin/audit-log` (scaffolded `src/modules/auditLog` but no page — wire on demand). Docs note 3 ghost validators (`publicAppointment`, etc.) and `Location` schema with no endpoints.

## 4. Test Coverage Report

`vitest.config.ts` + `tests/setup.ts` (MSW) + `tests/mocks/handlers.ts` (65 handlers)

- `tests/api/auth.test.ts` — login/refresh/logout, 401/422/429 matrix
- `tests/api/treatments.test.ts` — GET list/one, POST, PUT, DELETE, search/status filters, 201/200/401/422/404
- `tests/api/articles.test.ts` — same + `category` enum
- `tests/api/media.test.ts` — `POST /media/upload` signed params, `POST /media/confirm` (`key===publicId`), `DELETE`, **multipart FormData** (`uploadFile` via `api.upload` with `Content-Type: undefined`)
- `tests/api/clinic-info.test.ts` — `GET/PUT` singleton, `PATCH` helper, auth
- `tests/api/gallery.test.ts`, `booking.test.ts`, `live.test.ts` (skipped unless `LIVE=1`)
- `tests/redux/mutations.test.ts` — reducer transitions `loading → success/failure`, `items/pagination`, `toast` spy, store integration
- `tests/MUTATION_REPORT.md` — matrix backend→Redux→UI→toast→loading for every `POST/PUT/DELETE`

**Run:** `npm run test:api` → 155 pass, `npm test` → 186 pass, 4 skipped (live), 3.7s. `npx next build` → 51/51 routes OK.

- **Covered methods:** `GET`, `POST`, `PUT`, `PATCH` (clinic-info, booking-provider via `patch()` helper), `DELETE`, `multipart POST` (FormData)

## 5. API Health Check Script

`scripts/api-health-check.js` + `scripts/api-health-check.ts` (`tsx`)

- Loads `dotenv` + `.env.local`, `NEXT_PUBLIC_API_BASE || http://localhost:4000`, `ADMIN_EMAIL/PASSWORD`
- Authenticates `POST /api/admin/auth/login` → `accessToken`, auto-refresh on 401
- Sequentially hits **73 endpoints** (auth 3, clinic 2, treatments 5, articles 5, testimonials 5, gallery 5, videos 5, instagram 5, media 5, profile 2, home 2, leads 6, booking 3, redirects 5, analytics 2, audit 1, public health) with `fetch` + `Date.now()` timing
- Logs per endpoint `✅/❌ METHOD /path → status (ms)` + `Reason:` + final `Total/Passed/Failed/Success Rate`
- **Add to package.json:** `"health-check": "node scripts/api-health-check.js"`, `"health-check:ts": "tsx scripts/api-health-check.ts"`

**Example live run (in-memory DB, 2026-09-22):** `73 total, 71 passed, 97.26%` (2 `POST /media/upload` 500 without Cloudinary creds — expected per docs)

Run: `npm run health-check` or `npx tsx scripts/api-health-check.ts` (requires `npm install dotenv tsx`).

## 6. Unresolved Backend Issues (per `docs/BACKEND_DOCUMENTATION.md` §11)

1. `GET /api/admin/auth/me` 500 (registered before `authMiddleware`)
2. Admin list shadows: `GET /api/admin/testimonials|gallery|instagram-posts|profile|home` serve public data
3. Wrong-status 500 on not-found/bad-transition (treatment/article/lead `GET/:id`, `POST /:id/submit` etc. throw plain `Error`)
4. Media `confirm` requires both `key` and `publicId` (store `publicId` as `storageKey`)
5. Media `inUse` guard dead (`usedIn` never populated)
6. Video `PUT /:id` validator create-shaped → partial → 422 (fixed in saga by merging existing)
7. Workflow inconsistencies (`rejected` vs `draft`, direct `PUT` status)
8. Sitemap `videos/undefined` + `escapeXml` no-op
9. Analytics `logEvent` never called → `reports/monthly` empty
10. Dead config/validators, `Location` no endpoints, notifications `console.log` only, JSON body cap 10kb (now 1mb), `practoController` no `asyncHandler`

## 7. Recommended Improvements

- Fix `auth/me` middleware order and add `GET /api/admin/auth/me` proxy
- Unshadow admin list routes (mount admin handlers before public)
- Normalize error codes to `404/400` with `NotFoundError`
- Guard `DELETE /media/:id` with real `usedIn` population
- Make `PUT /videos/:id` validator partial (`testimonialUpdate` style)
- Wire `AnalyticsEvent.logEvent` on `treatment_view, enquiry_submit, practo_click` etc. and surface in dashboard (replace mock)
- Raise `express.json` limit for long articles or use `PUT` for body
- Add `FRONTEND_URL` allowlist for `http://localhost:3001` (admin) + `http://localhost:3000` (frontend)
- Seed `ClinicInfo`, `Profile`, `HomepageConfig` singletons on first admin login
- Add `PATCH` for clinic-info/timings for smaller payloads
- Move `NEXT_PUBLIC_API_BASE` to `.env.local` (already) and document

---

**Verification:** Every `GET, POST, PUT, PATCH, DELETE, multipart` has `src/services/*.service.ts` helper, `src/modules/*.saga.js` worker with `toast`, `src/app/*` UI dispatches, `MSW` test, and `scripts/api-health-check` entry. `npx next build` 51/51, `npm test` 186/190, `npm run health-check` 71/73.

