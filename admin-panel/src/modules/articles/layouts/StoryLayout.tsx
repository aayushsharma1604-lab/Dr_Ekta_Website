"use client";

import type { ArticlePreviewData } from "./shared";
import { HeaderBlock, CoverBlock, FaqBlock, CtaBlock, ExtraBlocks, renderLines } from "./shared";

/** Medical Visual Storytelling — big photo hero, alternating story sections, gallery. */
export function StoryLayout({ data }: { data: ArticlePreviewData }) {
  const sections = data.body.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("## ")).map((l) => l.slice(3));
  const paras = data.body.split("\n").map((l) => l.trim()).filter((l) => l !== "" && !l.startsWith("## ") && !l.startsWith("### "));
  const gallery = data.galleryUrls;
  return (
    <div className="flex flex-col bg-white text-left">
      {data.coverUrl ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.coverUrl} alt={data.title} className="aspect-[16/8] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200">Patient Story · {data.category || "Article"}</p>
            <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">{data.title || "Untitled Article"}</h1>
            <p className="mt-1 text-sm text-white/80">{data.author || "Dr. Ekta Narula"}</p>
          </div>
        </div>
      ) : (
        <div className="p-6 sm:p-8"><HeaderBlock data={data} /></div>
      )}
      <div className="p-6 sm:p-8">
        {sections.length > 0 ? (
          <div className="space-y-10">
            {sections.map((title, i) => (
              <div key={i} className="grid items-center gap-6 lg:grid-cols-2">
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  {gallery[i] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={gallery[i]} alt={title} className="aspect-[4/3] w-full rounded-2xl object-cover" />
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-teal-50 text-5xl font-light text-teal-600">{String(i + 1).padStart(2, "0")}</div>
                  )}
                </div>
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-700">Chapter {String(i + 1).padStart(2, "0")}</p>
                  <h2 className="mt-1 text-xl font-bold text-zinc-900">{title}</h2>
                  <p className="mt-2 text-sm text-zinc-600">{paras[i] || paras[paras.length - 1] || ""}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>{renderLines(data.body.split("\n"), "story-body")}</div>
        )}
        {data.pullQuote && (
          <blockquote className="mx-auto my-8 max-w-2xl rounded-2xl bg-teal-50/60 p-6 text-center text-xl italic text-zinc-900">&ldquo;{data.pullQuote}&rdquo;</blockquote>
        )}
        {gallery.length > 0 && (
          <div className="mt-8">
            <h2 className="text-center text-xl font-bold text-zinc-900">Moments</h2>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {gallery.map((g, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={g} alt={`Gallery ${i + 1}`} className="aspect-square w-full rounded-xl object-cover" />
              ))}
            </div>
          </div>
        )}
        <FaqBlock data={data} />
        <CtaBlock data={data} />
        <ExtraBlocks data={data} />
      </div>
    </div>
  );
}
