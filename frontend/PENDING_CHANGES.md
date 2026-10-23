# Website (frontend) — Pending Changes (plain-language guide)

> Status: NOT implemented yet. The data for all items below already comes
> from the backend — these changes are display-only.
> No code in this project was changed for the items below.

## 1. Treatment list page (`src/modules/treatments/treatments.tsx`)

**Problem:** treatment cards show no photos, even when the treatment has
a hero image in the system.

**What to change:** in each card, show the treatment's hero photo
(`heroImage.url`, falling back to `gallery[0].url`), keeping the current
generic icon only as the fallback when a treatment truly has no photo.

## 2. Treatment detail page (`src/modules/treatments/treatmentDetail.tsx`)

**Problem:** the page shows 6 of the 9 text sections. Duration,
"What to Expect" and "Why Dr. Ekta?" exist in the system but are never
displayed. Problems/benefits lists and the icon are also ignored.

**What to change:** add display blocks for `sections.duration`,
`sections.expectations`, `sections.whyDrEkta`, plus the problems and
benefits lists (same card style as the Procedure/Recovery blocks) and
use `treatment.icon` instead of the hardcoded icon.

## 3. Videos on the homepage (`src/modules/home/home.tsx`)

**Problem:** video thumbnails ignore the thumbnail saved in the system
and always guess a YouTube preview image instead. If the guess fails, a
wrong/joke video image can appear.

**What to change:** use `video.thumbnail` whenever it exists; only guess
the YouTube preview when there is no saved thumbnail, and never use a
hardcoded fallback video.

## 4. Instagram section on the homepage (`src/modules/home/home.tsx`)

**Problem:** this section always shows "no posts", even though Instagram
posts exist in the system — the page simply never asks for them (the
request function `getInstagramPosts` already exists and is unused).

**What to change:** load the posts with `getInstagramPosts` and show
each post's image (`image.url`), caption and link, same card style as
the gallery section.

## 5. Google search info + sitemap (SEO)

**Problem:** Google-related details (page titles, descriptions, preview
images) are hardcoded and identical on every page — the per-treatment
and per-article SEO data in the system is ignored. There is also no
sitemap or robots file, so Google discovers pages slowly.

**What to change:**
- Page titles/descriptions/preview images: use each treatment's and
  article's saved `seo` data (`src/app/layout.tsx`,
  `src/shared/components/seo/SEO.tsx`, treatment/article pages).
- Add `src/app/sitemap.ts` (lists all published treatments + articles
  automatically) and `src/app/robots.ts` (points to the sitemap).
- Optional: output the treatment FAQs in a format Google understands
  (the data is already on the page; the FAQ helper in `SEO.tsx` just
  needs to be called).

## Note on photo web addresses

Photo records carry several addresses (`url`, plus optimized versions).
Pages currently use only the basic `url`. Once the type definition in
`src/lib/api/types.ts` (`MediaAsset`) lists the optimized addresses,
pages can switch to them for faster loading — one-line change per page,
no backend work needed.
