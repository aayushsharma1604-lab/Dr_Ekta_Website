# Client Sign-off & Future-Build Checklist — Dr. Ekta Backend

Purpose: everything the backend deliberately does **not** do today, so it can be confirmed
with the client now and built later on request. Check an item off only when the client
has decided. Effort tags are backend estimates: S = hours, M = days, L = week+.

## A. Simplifications to confirm (built differently than the mandate asks)

- [ ] **No patient-consent gate (§14, §15).** Testimonials/gallery publish in one click with
  no stored consent. Confirm the clinic accepts operational (not system) consent handling. *(Re-add: M)*
- [ ] **No medical-review workflow (§8).** No draft→review→approve chain; the admin publishes
  directly. Confirm Dr. Ekta accepts review as discipline, not a system gate. *(Re-add: L)*
- [ ] **Password-only admin, no 2FA (§23).** Single biggest residual risk. Confirm accepted,
  and enforce a strong unique password. *(Add 2FA later: M)*
- [ ] **No audit trail (§4).** Admin writes leave no history. Confirm accepted. *(Re-add: M)*
- [ ] **Legal pages served by frontend (§26).** No backend legal CMS. Confirm accepted.
- [ ] **No WhatsApp backend logging (§12, §19).** WhatsApp clicks create no Lead rows.
  Confirm click-to-chat only, or approve a `whatsapp_click` logging endpoint. *(Add: S)*

## B. Launch-critical build-outs (still missing, nobody waived these)

- [ ] **Enquiry notifications (§20).** Leads are stored but nobody is told. Needs: recipient
  address + SLA decision, SMTP credentials, `nodemailer` wiring. *(M)*
- [ ] **Captcha activation (§23).** Code is live but dormant without `RECAPTCHA_SECRET` keys
  + frontend widget. Get keys before launch or accept honeypot-only spam protection. *(S)*
- [ ] **Backup schedule + restore proof (§23, §30).** Script exists; needs cron scheduling,
  a restore script, and one proven restore into a scratch DB. *(S–M)*
- [ ] **JSON-LD schema (§17).** Sitemap/robots/redirects exist; no LocalBusiness/Physician/
  FAQPage/Article markup is assembled. Decide: backend endpoint or frontend-rendered. *(S)*
- [ ] **Funnel blind spots (§19).** Only Practo clicks + enquiries create server events.
  Approve phone-click / map-click / video-play logging if full-funnel reporting is wanted. *(S)*

## C. Quality / future items (confirm scope, build when needed)

- [ ] **Monthly report as a job (§17).** Report endpoint works on demand; nothing runs or
  sends it monthly. *(S)*
- [ ] **CDN + upload malware scanning (§22, §23).** Neither configured. *(M, infra)*
- [ ] **Treatment `duration` / `expectations` fields (§7).** Pages can't answer "how long does
  it take?" from structured data. *(S)*
- [x] **Announcements model (§27).** Built: `Announcement` collection (title/body/linkUrl/status/order),
  admin CRUD + ordered public list, tests green. Done 2026-09-23.
- [ ] **Landmark / parking / public-transport fields (§25).** Not in ClinicInfo. *(S)*
- [ ] **Article "Myths" / "FAQs" categories (§9).** Backend has its own 9-category enum. *(S)*
- [ ] **Booking-provider widening (§13).** Provider enum is Practo-only; a second system
  needs a code change today. *(S)*
- [ ] **UTM support on booking links (§13).** No UTM params on Practo deep links. *(S)*
- [ ] **Location endpoints (§29).** `locationId` is on all collections; `Location` has no API. *(M)*
- [ ] **AI FAQ bot hook (§29).** No hook point exists. *(L, when roadmap confirms)*
- [ ] **Newsletter / consultations / corporate programmes (§29).** No models; articles + videos
  cover generic content needs. *(M, per module)*
- [ ] **Manual QA: load test (7.5) + real-device checks (§22, §30).** Not run. *(S)*
- [ ] **Lead-retention window.** No expiry/purge for never-converting leads; needs a business
  decision before any retention job is built. *(S + decision)*

## D. Pending activations & handover (credentials / access the client must supply)

- [ ] `RECAPTCHA_SECRET` keys (Google reCAPTCHA admin)
- [ ] SMTP credentials (Gmail App Password or Brevo/Resend; see backend summary 2026-09-21)
- [ ] Cloudinary cloud name / API key / secret (required for any media upload)
- [ ] Practo profile + booking URLs (stored via `PUT /api/admin/booking-provider`)
- [ ] GA4 + Search Console ownership/grants
- [ ] Google Business Profile consistency check (§16)
- [ ] Credentials table in `docs/HANDOVER.md` filled (still placeholders)
- [ ] CMS training guide written; training session held
- [ ] First admin user created + credentials handed over (runbook in HANDOVER.md)
- [ ] Treatment list + medical copy approved by Dr. Ekta
- [ ] Patient photos/testimonials + consent collected operationally (no system gate)
