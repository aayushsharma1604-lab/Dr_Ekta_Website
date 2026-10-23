"use client";

import { useMemo, useState } from "react";
import {
  MEDIA_ITEMS,
  MEDIA_TYPE_FILTERS,
  mediaYears,
  sortByDateDesc,
  type MediaType,
} from "@/shared/constants/media";
import MediaCard from "@/shared/components/media/MediaCard";
import { PageHero, SectionHeading } from "@/shared/components/layout";
import { EmptyState } from "@/shared/components/EmptyState";

const PAGE_SIZE = 6;

/** Publication wordmarks for the "As featured in" row. */
const FEATURED_PUBLICATIONS = [
  "The Times of India",
  "Hindustan Times",
  "The Indian Express",
  "India Today",
  "Outlook Health",
  "Femina",
  "NDTV Profit",
  "Aaj Tak TV",
  "Asia Book of Records",
];

export function MediaPage() {
  const [type, setType] = useState<MediaType | "all">("all");
  const [year, setYear] = useState("all");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const sorted = useMemo(() => sortByDateDesc(MEDIA_ITEMS), []);
  const years = useMemo(() => mediaYears(MEDIA_ITEMS), []);

  /* One predicate for every list on the page, so the featured block, the grid
     and the result count always agree with each other. */
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (item: (typeof MEDIA_ITEMS)[number]) => {
      if (type !== "all" && item.type !== type) return false;
      if (year !== "all" && !item.date.startsWith(year)) return false;
      if (!q) return true;
      return `${item.title} ${item.publication} ${item.excerpt}`.toLowerCase().includes(q);
    };
  }, [type, year, query]);

  const featured = useMemo(() => sorted.filter((item) => item.featured && matches(item)), [sorted, matches]);
  const filtered = useMemo(() => sorted.filter((item) => !item.featured && matches(item)), [sorted, matches]);
  const total = featured.length + filtered.length;

  const shown = filtered.slice(0, visible);
  const hasFilters = type !== "all" || year !== "all" || query.trim() !== "";

  const applyFilter = (next: Partial<{ type: MediaType | "all"; year: string; query: string }>) => {
    if (next.type !== undefined) setType(next.type);
    if (next.year !== undefined) setYear(next.year);
    if (next.query !== undefined) setQuery(next.query);
    setVisible(PAGE_SIZE);
  };

  const clearFilters = () => {
    setType("all");
    setYear("all");
    setQuery("");
    setVisible(PAGE_SIZE);
  };

  const podcast = MEDIA_ITEMS.find((item) => item.type === "podcast" && item.youtubeId);

  return (
    <div className="flex flex-col bg-[#dbeafe]">
      <PageHero
        eyebrow="Press & recognition"
        title={
          <>
            In the <span className="text-slate-500">Media</span>
          </>
        }
        description="Every article, podcast, magazine feature, interview and award that features Dr. Ekta Narula and her clinic — collected in one place."
        image="/doctor-certificates.jpg"
        imageAlt="Framed certificates and awards of Dr. Ekta Narula"
        backgroundImage="/dental/clinic-room.jpg"
      >
        <a href="#mentions" className="btn-sanctuary">
          Browse mentions
        </a>
        <a href="#press" className="btn-sanctuary-ghost">
          Media enquiries
        </a>
      </PageHero>

      {/* As featured in */}
      <section className="bg-white px-4 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            As featured in
          </p>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 sm:gap-x-14">
            {FEATURED_PUBLICATIONS.map((publication) => (
              <li key={publication}>
                <span className="cursor-default font-heading text-[15px] font-bold uppercase tracking-[0.14em] text-slate-400 transition-colors duration-200 hover:text-slate-900 sm:text-[17px]">
                  {publication}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Mentions */}
      <section id="mentions" className="bg-[#eff6ff] px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1400px]">
          {/* Filter bar */}
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Press archive / 2019 — today"
              title="Every mention, in one place"
              description="Filter by format, year or keyword. Filtering happens instantly — no page reloads."
            />

            <div className="flex flex-wrap items-center gap-3">
              <label className="sr-only" htmlFor="media-year">
                Filter by year
              </label>
              <select
                id="media-year"
                value={year}
                onChange={(event) => applyFilter({ year: event.target.value })}
                className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700 outline-none transition-colors focus-visible:border-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
              >
                <option value="all">All years</option>
                {years.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <label className="sr-only" htmlFor="media-search">
                Search mentions
              </label>
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-4 material-icons text-base text-slate-400">
                  search
                </span>
                <input
                  id="media-search"
                  type="search"
                  value={query}
                  placeholder="Search"
                  onChange={(event) => applyFilter({ query: event.target.value })}
                  className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus-visible:border-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 sm:w-48"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter by media type">
            {MEDIA_TYPE_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                aria-pressed={type === filter.value}
                onClick={() => applyFilter({ type: filter.value })}
                className={`rounded-full px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
                  type === filter.value
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Featured mentions */}
          {featured.length > 0 && (
            <div className="mt-14">
              <div className="flex items-end justify-between gap-4">
                <h2 className="heading-md">Featured mentions</h2>
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Handpicked by the clinic
                </span>
              </div>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {featured.map((item) => (
                  <MediaCard key={item.id} item={item} variant="featured" />
                ))}
              </div>
            </div>
          )}

          {/* Grid */}
          <div className="mt-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="heading-md">All mentions</h2>
              <p aria-live="polite" className="text-sm text-slate-600">
                {total} {total === 1 ? "mention" : "mentions"}
                {hasFilters ? " match your filters" : " in the archive"}
              </p>
            </div>

            {total === 0 ? (
              <EmptyState
                moduleName="media mentions"
                message="No mentions match your filters. Try a different type, year or keyword."
              />
            ) : (
              <>
                {filtered.length > 0 && (
                  <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {shown.map((item) => (
                      <MediaCard key={item.id} item={item} />
                    ))}
                  </div>
                )}

                {visible < filtered.length && (
                  <div className="mt-10 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setVisible((count) => count + PAGE_SIZE)}
                      className="btn-sanctuary"
                    >
                      Load more
                      <span className="material-icons text-base">expand_more</span>
                    </button>
                  </div>
                )}
              </>
            )}

            {hasFilters && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 underline underline-offset-4 transition-colors hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Podcast / video embed */}
      {podcast?.youtubeId && (
        <section className="bg-white px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
            <div className="lg:col-span-5">
              <p className="eyebrow">Listen / Podcast episode</p>
              <h2 className="mt-3 heading-lg">{podcast.title}</h2>
              <p className="mt-4 body-md">{podcast.excerpt}</p>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {podcast.publication}
              </p>
              <a
                href={podcast.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-sanctuary mt-6"
              >
                Listen now
                <span className="material-icons text-base">open_in_new</span>
              </a>
            </div>
            <div className="lg:col-span-7">
              <div className="aspect-video overflow-hidden rounded-2xl bg-slate-950 ring-1 ring-slate-900/10">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${podcast.youtubeId}?rel=0`}
                  title={`${podcast.publication} — ${podcast.title}`}
                  loading="lazy"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Media enquiries */}
      <section id="press" className="bg-white px-4 pb-16 sm:px-8 lg:px-12 lg:pb-24">
        <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[28px] bg-slate-950">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <img src="/dental/clinic-room.jpg" alt="" className="h-full w-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-slate-950/70" />
          </div>
          <div className="relative px-6 py-14 text-center sm:px-10 lg:py-20" data-reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
              Press office
            </p>
            <h2 className="mt-3 heading-xl text-white">Media enquiries</h2>
            <p className="mx-auto mt-5 max-w-2xl body-lg text-white/70">
              Journalists, producers and event organisers: reach the clinic directly for interviews, imagery,
              patient-consent documentation or a comment on dental health.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href="mailto:press@drektanarula.com"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-900 transition-colors hover:bg-slate-100"
              >
                <span className="material-icons text-base">mail</span>
                press@drektanarula.com
              </a>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white ring-1 ring-white/25 transition-colors hover:bg-white/20"
              >
                <span className="material-icons text-base">contact_mail</span>
                Contact the clinic
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
