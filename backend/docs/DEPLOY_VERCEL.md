# Deploying the backend on Vercel

## In Vercel

1. **Add New → Project → Import** the GitHub repo.
2. **Root Directory:** `backend` (the repo is a monorepo; only this folder is the API).
3. **Framework Preset:** leave on auto-detect — Vercel detects Express from `src/app.js`.
4. Add the environment variables below, then **Deploy**.

No `vercel.json` and no `api/` function are needed. Vercel detects the Express app
exported by `src/app.js` and runs it as a single function, so every route
(`/api/public/...`, `/api/admin/...`) works unchanged. If detection ever fails, set
**Framework Preset** to `Express` in Project → Settings → Build & Development.

Verify after deploying: `GET https://<deployment>/` returns
`{"name":"Dr. Ekta Narula Dental Care API",...}`.

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `MONGODB_URI` | yes | **MongoDB Atlas** connection string (`mongodb+srv://...`). `localhost` will not work. |
| `JWT_ACCESS_SECRET` | yes | Long random string |
| `JWT_REFRESH_SECRET` | yes | Long random string, different from access |
| `FRONTEND_URL` | yes | Deployed frontend origin(s), comma-separated, for CORS |
| `NODE_ENV` | yes | `production` |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | for media | Direct browser uploads |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `NOTIFICATION_EMAIL` | for email | Enquiry notifications |
| `RECAPTCHA_SECRET` | recommended | Without it captcha is not verified server-side |
| `PRACTO_PROFILE_URL` / `PRACTO_BOOKING_URL` | optional | |
| `GA_MEASUREMENT_ID` / `GA_API_SECRET` | optional | |

Do not set `PORT` — Vercel supplies its own. The app expects Node `26.x` (see `engines`).

## Atlas checklist

- Network Access: allow `0.0.0.0/0` (Vercel functions have no fixed IPs), or use Atlas IP access lists on a paid tier.
- The pool is capped at 5 connections per function instance when `VERCEL` is set, so on the free M0 tier (500 connections) keep an eye on concurrent function count.

## How it behaves on serverless

- The DB connects on the first request of each instance (`src/app.js`, gated on `VERCEL`) and is reused for the rest of that instance. An unreachable DB returns `503`, not a hung request.
- Rate limiting uses in-memory counters, so limits apply per function instance, not globally.
- Enquiry notification email is sent inline; keep the SMTP provider fast.
- `express.static()` is not served by Vercel — uploads go to Cloudinary, so this does not matter here.
