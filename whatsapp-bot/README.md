# WhatsApp Appointment Booking Bot — Dr. Ekta Narula Dental Care

Production-ready conversational booking over the **WhatsApp Business Cloud API**.
No external APIs, no database — bookings persist to local JSON (`./data/bookings.json`),
audit trail to `./data/audit.log`, owner alerts go out over WhatsApp itself.

## Architecture

```
WhatsApp Cloud API ──webhook──▶ Express (src/server.js)
                                    │ verify (hub.mode/token/challenge)
                                    ▼
                        SessionStore (in-memory Map + 30-min TTL)
                                    ▼
                   Conversation engine (src/flow/engine.js) — state machine
                     name → phone → service → date → time → patientType
                       → notes → confirm ⇄ edit_pick → done
                                    │ validates (src/validation.js)
                                    ▼ on Confirm
                   bookingService.finalizeBooking()
                     ├─ buildBookingJson() — uuid bookingId + ISO createdAt
                     ├─ fileStore.saveBooking() → data/bookings.json
                     ├─ fileStore.audit() → data/audit.log (JSONL)
                     └─ notifyOwner() → WhatsApp text (or approved template)
```

Per your constraint: **no backend calls, no Mongo/schema**. To re-enable the
clinic-backend Lead sync later, add one POST in `finalizeBooking()`.

## Conversation flow

Configured in `src/config/flow.json` (business name, services, slots, keywords).
Cloud API allows **max 3 reply buttons** — so services (6) and time slots (7)
use **list messages**, while patient type / confirm / thank-you use buttons.

| Step | Prompt | Input |
|---|---|---|
| Welcome | 👋 Welcome… book in a few steps | auto |
| Name | What is your full name? | text, min 2 chars |
| Phone | Please enter your contact number. | 10-digit IN auto-`+91`, or full international |
| Service | Which service…? | list (6) |
| Date | preferred date | Today / Tomorrow buttons, or YYYY-MM-DD (never past) |
| Time | preferred time | list (7 slots) |
| Patient type | new or existing? | 2 buttons |
| Notes | describe concern (`-` skips, max 500) | text |
| Confirm | 📋 summary + Confirm Booking / Edit Details | buttons; Edit → field list → re-ask → back to summary |
| Done | ✅ + reference + Book Another / Contact Support | buttons |

`restart / menu / hi / hello` anytime (or after 30-min idle) restarts cleanly.
Invalid input → ⚠️ reason + same question again. Stale (>10 min) inbound
messages are ignored to avoid replays.

## Booking JSON (saved per booking)

```json
{
  "bookingId": "AUTO_GENERATED_UUID",
  "createdAt": "ISO_TIMESTAMP",
  "fullName": "John Doe",
  "phoneNumber": "+919999999999",
  "service": "Dental Consultation",
  "appointmentDate": "2026-10-15",
  "appointmentTime": "11:00 AM",
  "patientType": "New Patient",
  "notes": "Tooth pain in upper jaw",
  "status": "BOOKED"
}
```

Owner WhatsApp alert mirrors this as `🔔 New Appointment Booked … Booking ID: …`.

## Endpoints (bot's own — no external APIs)

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | liveness probe |
| GET | `/webhook` | Meta verification handshake |
| POST | `/webhook` | incoming message notifications (ACKs in <20s) |

## Setup

1. `npm install`
2. Copy `.env.example` → `.env`, fill `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`,
   `WHATSAPP_VERIFY_TOKEN`, `OWNER_PHONE`, `SUPPORT_PHONE`.
3. `npm start` (or `npm run dev`). Expose `:5000` via HTTPS (ngrok/Cloudflare).
4. Meta App → WhatsApp → Configuration → Callback URL `https://<you>/webhook`,
   verify token = `WHATSAPP_VERIFY_TOKEN`, subscribe to **messages** field.
5. Message the business number → welcome flow starts.

Owner alerts: plain WhatsApp text works inside the 24h customer window;
for guaranteed anytime delivery, create an approved utility template and set
`ADMIN_TEMPLATE_NAME` (bot auto-falls-back to text).

## Project layout

```
whatsapp-bot/
  package.json  .env.example  README.md
  src/
    server.js                 Express + routes
    logger.js                 JSON-line logs
    validation.js             name / phone / date rules
    config/flow.json          all copy, services, slots (edit without code)
    config/index.js           env loader
    session/store.js          in-memory sessions + TTL
    flow/engine.js            state machine + message parsing
    whatsapp/cloudApi.js      send text/buttons/list/template + retries
    whatsapp/webhook.js       verify + receive fan-out
    services/bookingService.js uuid JSON + file save + owner notify
    store/fileStore.js        bookings.json + audit.log
```

## Production notes

- Run behind PM2/systemd with `npm start`; logs are JSON lines (ship to any aggregator).
- Sessions are in-process: for multi-instance scale, swap `SessionStore` for Redis
  (same get/create/touch/finish interface).
- `data/` is git-ignored runtime state — back up `bookings.json` on your schedule.
