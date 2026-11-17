# Deploying the backend on Vercel

## In Vercel

1. **Add New → Project → Import** the GitHub repo.
2. **Root Directory:** `backend` (the repo is a monorepo; only this folder is the API).
3. Framework Preset: **Other**. Build and Output settings: leave empty.
4. Add the environment variables below (Production + Preview), then **Deploy**.

`vercel.json` rewrites every path to `api/index.js`, which runs the Express app as one
serverless function — `/api/public/...` and `/api/admin/...` keep working unchanged.

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

Do not set `PORT` — Vercel supplies its own.

## Atlas checklist

- Network Access: allow `0.0.0.0/0` (Vercel functions have no fixed IPs), or use Atlas IP access lists on a paid tier.
- The pool is capped at 5 connections per function instance when `VERCEL` is set, so on the free M0 tier (500 connections) keep an eye on concurrent function count.

## Known serverless limits

- Rate limiting uses in-memory counters, so limits apply per function instance, not globally.
- Enquiry notification email is sent inline; keep the SMTP provider fast (a slow one hits the 30 s function limit).
- Cold starts reconnect to Atlas on the first request of each instance.
