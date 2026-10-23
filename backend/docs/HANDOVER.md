# Dr. Ekta Narula Dental Care — Backend Handover Document

> Review update (2026-09-21, branch `review/muse-improvements`): audit logging removed, patient-consent
> gate removed, content workflow collapsed to `draft`/`published`, 2FA stays removed, legal pages are
> served statically by the frontend (no backend). See `BACKEND_DOCUMENTATION.md` (authoritative) for details.

## Project Overview
- **Project**: Dr. Ekta Narula Dental Care Backend API
- **Version**: 1.0.0
- **Stack**: Node.js/Express/MongoDB/Mongoose
- **API Base**: `/api`
- **Port**: 4000 (configurable via `PORT` env var)

---

## Environment Variables (`.env`)
```
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://drekta.com
MONGODB_URI=mongodb://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
RECAPTCHA_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

**Never commit actual secrets.** Use `.env.example` as template.

---

## Service Accounts & Credentials

| Service | Purpose | Owner | Where Stored |
|---------|---------|-------|--------------|
| MongoDB | Primary database | DevOps | `.env` / Secret Manager |
| Cloudinary | Media uploads (images/videos) | DevOps | `.env` / Secret Manager |
| JWT Secrets | Auth tokens | DevOps | `.env` / Secret Manager |

**Rotation Policy**: Rotate JWT secrets quarterly. Cloudinary keys annually.

---

## Database Schema Overview

### Core Collections
| Collection | Purpose | Key Indexes |
|------------|---------|-------------|
| `users` | Admin auth | `email` (unique), `status` |
| `treatments` | Treatment pages | `slug` (unique), `status`, `locationId` |
| `articles` | Knowledge centre | `slug` (unique), `category`, `status`, `locationId` |
| `testimonials` | Patient stories | `treatmentTag`, `status`, `locationId` |
| `galleryitems` | Smile gallery | `treatmentTag`, `status`, `locationId` |
| `videos` | YouTube embeds | `category`, `status`, `locationId` |
| `curatedposts` | Instagram posts | `order`, `locationId` |
| `leads` | Enquiry funnel | `date`, `leadStatus`, `source`, `locationId` |
| `redirectmap` | URL redirects | `fromPath` (unique) |
| `analyticsevents` | Server-side analytics | `eventType`, `createdAt`, `refModel+refId` |
| `mediaassets` | Uploaded files | `uploadedBy`, `usedIn` |
| `clinicinfo` | Singleton practice info | `locationId` |
| `profile` | Singleton Dr. Ekta bio | `locationId` |
| `homepageconfig` | Homepage featured items | — |
| `bookingproviderconfig` | Practo config singleton | — |
| `locations` | Multi-location support | `code` (unique), `isActive` |

(Deleted in review: `contentreviews` (approval workflow), `auditlogs` (audit trail).)

---

## Key Endpoints

### Public (rate-limited)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/public/profile` | Dr. Ekta profile |
| GET | `/api/public/treatments` | List published treatments |
| GET | `/api/public/treatments/:slug` | Single treatment |
| GET | `/api/public/articles` | List published articles |
| GET | `/api/public/articles/:slug` | Single article |
| GET | `/api/public/videos` | List videos (filter by category) |
| GET | `/api/public/testimonials` | List testimonials (filter by treatment) |
| GET | `/api/public/gallery` | List gallery items (filter by treatment) |
| GET | `/api/public/instagram-posts` | Curated Instagram posts |
| GET | `/api/public/home` | Homepage aggregate |
| GET | `/api/public/booking-cta` | Practo booking URL |
| POST | `/api/public/enquiry` | Submit enquiry form |
| POST | `/api/public/leads/practo-click` | Log Practo click |
| GET | `/api/public/sitemap.xml` | XML sitemap |
| GET | `/api/public/robots.txt` | Robots.txt |
| GET | `/api/public/redirect/:path` | Redirect handler |

### Admin (auth required, single admin, email + password)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/admin/auth/login` | Login (returns access + refresh) |
| POST | `/api/admin/auth/refresh` | Refresh access token |
| POST | `/api/admin/auth/logout` | Logout (revoke refresh) |
| GET | `/api/admin/auth/me` | Current admin (requires token) |
| GET/PUT | `/api/admin/clinic-info` | Practice info |
| CRUD | `/api/admin/treatments` | Treatment management (draft/published, direct status) |
| CRUD | `/api/admin/articles` | Article management (draft/published, direct status) |
| CRUD | `/api/admin/testimonials` | Testimonials (draft/published, no consent) |
| CRUD | `/api/admin/gallery` | Gallery (draft/published, no consent) |
| CRUD | `/api/admin/videos` | Video management |
| CRUD | `/api/admin/instagram-posts` | Instagram posts |
| CRUD | `/api/admin/redirects` | Redirect map |
| CRUD | `/api/admin/profile` | Dr. Ekta profile |
| GET | `/api/admin/leads` | Lead list/filter (paginated) |
| PUT | `/api/admin/leads/:id` | Update lead status |
| GET | `/api/admin/leads/stats` | Lead funnel stats |
| GET | `/api/admin/leads/export` | CSV export (streamed, formula-escaped) |
| GET | `/api/admin/booking-provider` | Practo config |
| PUT | `/api/admin/booking-provider` | Update Practo config |
| GET | `/api/admin/practo-clicks` | Practo click analytics |
| GET | `/api/admin/analytics/reports/monthly` | Monthly report (live: enquiry + click events) |
| GET | `/api/admin/analytics/events` | Raw events |
| GET/PUT | `/api/admin/home/config` | Homepage featured config |

---

## Security Checklist
- [x] Helmet.js (CSP disabled for frontend flexibility)
- [x] CORS allowlist from `FRONTEND_URL` (comma-separated)
- [x] bcrypt 12-round password hashing
- [x] JWT access (15min) + rotating revocable refresh tokens
- [x] Uniform login errors (no account-state oracle)
- [x] Account lockout after 5 failed attempts (15min, DB-persisted)
- [x] Rate limiting: enquiry 20/min, auth 10/15min, reads 100/min (in-process store: single instance)
- [x] mongo-sanitize + key sanitization (NoSQL injection)
- [x] HTML sanitization on rich-text writes (allowlist)
- [x] Server-side captcha when `RECAPTCHA_SECRET` set (5s timeout, fail-closed)
- [x] Streaming CSV export with formula-injection escaping
- [x] `trust proxy` for rate limiting behind proxy
- [ ] TOTP 2FA — removed by owner decision (single password-only admin: use a strong, unique password)
- [ ] Audit logging — removed by owner decision (no admin activity trail)
- [ ] Cloudinary malware scanning on upload — not implemented (only type/size validated)

---

## Backup & Restore
- **Script**: `infra/backup-scripts/backup.js`
- **Schedule**: Daily (cron) + Weekly (Sunday) + Monthly (1st) — wire via cron ops-side; not scheduled by the API
- **Retention**: 7 daily, 4 weekly, 12 monthly
- **Location**: `./backups/{daily,weekly,monthly}/`
- **Restore Test**: manual (7.3) — restore into a scratch DB before launch; no `restore.js` ships with the repo

---

## Deployment Notes
- **Process Manager**: PM2 (or systemd)
- **Replicas**: 1 (rate limits are in-process; scale-out needs a shared store)
- **Health Check**: `GET /api/public/health` returns 200
- **Graceful Shutdown**: SIGTERM/SIGINT → close server → disconnect DB
- **Logs**: winston console/JSON (no request-ID threading; notification logs carry lead id only, no PII)

---

## SEO Handover
- Sitemap: `/api/public/sitemap.xml` (auto-generated from published content; videos linked by id)
- Robots: `/api/public/robots.txt` (references sitemap)
- Redirects: Admin-managed via `/api/admin/redirects`, resolved at `/api/public/redirect/:path`
- JSON-LD: no backend builders (removed as dead code) — frontend renders schema from API data

---

## Multi-Location Ready
All clinic-bound collections have `locationId` (nullable, indexed), including the `ClinicInfo` and `Profile` singletons. `Location` has no API endpoints; no default-location seeding. Second location = data change, not migration.

---

## Content Model (review simplification)
- No approval workflow: `status` is `draft` or `published`, set directly on create/update. No `pending/approved/rejected`, no review notes, no review queue.
- No consent gate: testimonials/gallery have no consent fields.
- No audit trail: admin writes leave no history. Be careful with deletes.

---

## Runbook: Common Operations

### Create Admin User
```bash
node -e "
const mongoose = require('mongoose');
const User = require('./src/models/User');
mongoose.connect(process.env.MONGODB_URI);
User.create({ name: 'Dr. Ekta', email: 'dr@ekta.com', passwordHash: 'use-a-strong-unique-password' });
"
```
(passwordHash is bcrypt-hashed by the pre-save hook; single admin — guard the credentials.)

### Trigger Backup Manually
```bash
node infra/backup-scripts/backup.js
```

### Restore Backup
```bash
# No restore script ships with the repo - mongorestore into a scratch DB, e.g.:
mongorestore --uri="<scratch-uri>" --gzip --archive=backups/daily/<file>.gz
```

### Clear Rate Limits (dev)
```bash
# In-process MemoryStore: restart the app to reset counters
```

---

## Support Contacts
- **Backend Dev**: [Name/Slack]
- **DevOps**: [Name/Slack]
- **Cloudinary**: [Account email]
- **MongoDB**: [Atlas project]

---

## Version History
- **v1.1.0** (2026-09-21): Review pass — audit/consent/workflow removed (draft/published only), XSS + CSV + sitemap + route fixes, phase6/7 tests (61 green)
- **v1.0.0** (2024-09-21): Initial release — Phases 1-7 complete