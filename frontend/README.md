This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## In the Media page (`/media`)

Press-mentions page (articles, podcasts, magazines, video/TV, awards) with instant type/year/search
filtering, featured mentions, load-more, empty state, an inline podcast embed and a media-inquiry CTA.

### Run it

```bash
npm run dev     # http://localhost:3000/media
npm run build   # production build
npm run lint    # eslint
```

### Add a new media item

Edit `src/shared/constants/media.ts` and append to `MEDIA_ITEMS` — nothing else to touch. The page
sorts newest first, and the filters, year dropdown, search, featured block and result count all
update themselves.

```ts
{
  id: "times-of-india-smile-makeovers",   // unique
  type: "article",                         // article | podcast | magazine | video | award
  title: "Headline as it ran",
  publication: "The Times of India",
  date: "2026-08-14",                      // YYYY-MM-DD (drives sorting + the year filter)
  url: "https://example.com/article",      // opens in a new tab
  image: "/dental/service-veneers.jpg",    // any /public path or remote URL
  excerpt: "One or two lines of standfirst.",
  featured: true,                          // optional — shows in the featured block
  youtubeId: "dQw4w9WgXcQ",                // optional — enables the inline podcast embed
}
```

`type` drives the badge icon, the badge label and the CTA wording ("Read Article", "Listen Now",
"View Issue", "Watch Now", "View Recognition") — see `MEDIA_TYPE_META`.

### Change the colours / fonts / spacing

Everything is tokenised in one place, exactly like the rest of the site:

| What | Where |
| --- | --- |
| Colours (`--primary`, `--background`, `--radius`, …) | `src/app/globals.css` → `:root` |
| Fonts (`--font-roboto-condensed`, `--font-display`, …) | `src/app/layout.tsx` (`next/font`) |
| Type scale, spacing, radii helpers (`.heading-xl`, `.btn-sanctuary`, `.eyebrow`, …) | `src/app/globals.css` → `@layer components` |

The page itself uses the site's slate/blue palette and its heading/body fonts, so a re-theme in
`globals.css` covers this page and the rest of the site at once. Page-specific spacing follows the
same 8px scale (`py-16`, `gap-4`, `px-4` …).

### Files

```
src/app/media/page.tsx               # route + SEO metadata
src/modules/media/media.tsx          # page: filters, featured block, grid, embed, CTA
src/shared/components/media/MediaCard.tsx
src/shared/constants/media.ts        # ← the data + type metadata (edit this to add mentions)
src/shared/constants/index.ts        # NAVIGATION (the "Media" nav entry)
```


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
