"use client";

import { useCallback, useState } from "react";
import { MEDIA_TYPE_META, formatMediaDate, type MediaItem } from "@/shared/constants/media";

interface MediaCardProps {
  item: MediaItem;
  /** featured = wide horizontal card; grid = standard vertical card. */
  variant?: "grid" | "featured";
}

export default function MediaCard({ item, variant = "grid" }: MediaCardProps) {
  const [loaded, setLoaded] = useState(false);
  const meta = MEDIA_TYPE_META[item.type];
  const isFeatured = variant === "featured";

  /* A cached image is already `complete` when React attaches the handler, so its
     load event never fires — check it directly or the thumbnail stays hidden. */
  const markLoaded = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete) setLoaded(true);
  }, []);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-900/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(15,23,42,0.45)] focus-within:-translate-y-1 focus-within:shadow-[0_24px_50px_-28px_rgba(15,23,42,0.45)]">
      <div className={`relative overflow-hidden bg-slate-100 ${isFeatured ? "aspect-[16/10] sm:aspect-[21/9]" : "aspect-[16/10]"}`}>
        <img
          ref={markLoaded}
          src={item.image}
          alt={`${item.publication} — ${item.title}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-cover transition-opacity duration-500 group-hover:scale-105 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-900 shadow-sm">
          <span className="material-icons text-sm text-slate-600">{meta.icon}</span>
          {meta.label}
        </span>
      </div>

      <div className={`flex flex-1 flex-col p-5 ${isFeatured ? "sm:p-6" : ""}`}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{item.publication}</p>
          <time dateTime={item.date} className="shrink-0 text-[11px] font-medium text-slate-500">
            {formatMediaDate(item.date)}
          </time>
        </div>

        <h3
          className={`mt-3 font-heading font-bold leading-[1.15] tracking-[-0.02em] text-slate-900 ${
            isFeatured ? "text-[24px] sm:text-[30px]" : "text-[19px]"
          }`}
        >
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm outline-none transition-colors hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900"
          >
            {item.title}
          </a>
        </h3>

        <p className={`mt-3 flex-1 text-sm leading-6 text-slate-600 ${isFeatured ? "max-w-2xl" : "line-clamp-2"}`}>
          {item.excerpt}
        </p>

        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
        >
          {meta.cta}
          <span className="material-icons text-base">open_in_new</span>
        </a>
      </div>
    </article>
  );
}
