# Admin Panel — Pending Changes (plain-language guide)

> Status: NOT implemented yet. Backend work for these items is already done.
> No code in this project was changed for the items below.

## How uploads should work everywhere (the rule)

Every photo upload in the admin panel must follow the same 3 steps —
the working example already exists in `src/lib/uploadMedia.ts`
(`uploadFileToLibrary`) and is used by the treatment form:

1. Ask the backend for permission (`POST /api/media/upload` with file name, type, size).
2. Send the file straight to Cloudinary from the browser (fast, no size limit problems).
3. Confirm with the backend (`POST /api/media/confirm`) so the photo appears
   in the **Media Library** and you get its ID to attach to the treatment/gallery/etc.

Never convert photos to long text strings, and never save placeholder/fake links.

## 1. Gallery page (`src/app/gallery/page.tsx`)

**Problem:** when you add before/after photos, the page saves a fake
placeholder link instead of uploading your photo. The photo you picked
never reaches Cloudinary or the Media Library.

**What to change:** delete the current `uploadMedia` shortcut and call the
shared `uploadFileToLibrary()` helper instead (same as treatments).
Everything else (before/after boxes, save button) stays the same.

## 2. Instagram posts page (`src/app/instagram-posts/page.tsx`)

**Problem:** same as Gallery — the post image is saved as a fake
placeholder link, never really uploaded.

**What to change:** replace its `uploadImage()` shortcut with the shared
`uploadFileToLibrary()` helper. Optionally add the existing "Library"
picker button (component `src/components/MediaPicker.tsx`) so you can
reuse a photo already in the Media Library instead of uploading again.

## 3. Profile page (`src/app/profile/page.tsx`)

**Problem:** the doctor's photo and video use the same fake-placeholder
shortcut, so uploads never really happen.

**What to change:** route both through `uploadFileToLibrary()`.
Photo box = images only; video box = videos only (the helper already
supports both). Optionally add the "Library" picker button to both boxes.

## 4. Stop saving the same photo twice (duplicate guard)

**Problem:** uploading the same photo twice creates two copies in the
Media Library and two files in Cloudinary.

**Backend (already done):** if an upload request includes the photo's
fingerprint (`fileHash`), the backend reuses the existing photo and
deletes the accidental second copy automatically.

**What to change here:** in `src/lib/uploadMedia.ts`, before uploading,
calculate the photo's fingerprint (SHA-256 of the file — a standard
browser feature, a few lines), send it along with the confirm request,
and use the returned photo (it comes back marked `reused: true` when it
matched an existing one). Because every form uses this one helper,
Gallery, Profile, Instagram, treatments and the Media page all get the
protection at once. Old photos already in the library simply have no
fingerprint — they keep working normally.

## 5. Articles page (`src/app/knowledge/page.tsx`)

**Problem:** the editor only has title, category, author and text. The
system also supports tags, sources, reviewer name display, SEO
title/description, and a cover photo — but the form has no boxes for
them, so they can never be filled.

**What to change:**
- Add inputs: tags (comma-separated words), sources (title + link rows),
  credentials display (e.g. "BDS, MDS"), SEO title (max 60) and SEO
  description (max 160).
- Add a cover-photo box using the same Dropzone + Library picker as
  treatments (saves as `seo.ogImage`).
- Extend the payload type in `src/services/article.service.ts`
  (types only, no logic change).

## 6. Announcements page (`src/app/announcements/page.tsx`)

**Problem:** this page looks fully working but everything is temporary —
announcements you add disappear when you refresh, because the page never
talks to the backend (the real backend for announcements already exists).

**What to change:** replace the temporary in-memory list with real calls
to `/api/announcements` (list, create, update, delete) following the same
pattern as the testimonials or gallery pages. Fields: title, content,
link URL (optional), status (draft/published), order number.

## 7. FAQ and SEO pages (`src/app/faqs/page.tsx`, `src/app/seo/page.tsx`)

**Problem:** both pages are mock-ups — buttons update the screen only,
nothing is saved anywhere. There is also no FAQ/SEO storage in the
backend (FAQs live inside each treatment).

**Decision needed (pick one per page):**
- Remove the page, or
- Keep it as a read-only checklist with no save buttons.

Recommended: remove the FAQ editor (FAQs are edited inside each
treatment already) and keep SEO as guidance text only until a real
need appears.
