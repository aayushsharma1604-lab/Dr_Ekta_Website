"use client";

import type { ArticlePreviewData } from "./shared";
import { HeaderBlock, CoverBlock, FaqBlock, CtaBlock, ExtraBlocks, renderLines, tocOf } from "./shared";

/** Long-Form Medical Research — header, TOC rail, body, findings emphasis. */
export function ResearchLayout({ data }: { data: ArticlePreviewData }) {
  const toc = tocOf(data.body);
  return (
    <div className="flex flex-col bg-white p-6 text-left sm:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Research Summary · {data.category || "Article"}</p>
      <h1 className="mt-2 text-3xl font-bold text-zinc-900">{data.title || "Untitled Article"}</h1>
      {data.excerpt && <p className="mt-3 font-light text-zinc-600">{data.excerpt}</p>}
      <div className="mt-4 flex items-center gap-3 rounded-xl bg-zinc-50 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700">👤</div>
        <div><p className="text-sm font-semibold text-zinc-900">{data.author || "Dr. Ekta Narula"}</p><p className="text-xs text-zinc-500">{data.credentialsDisplay}</p></div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CoverBlock data={data} />
          <div className="mt-6">{renderLines(data.body.split("\n"), "res-body")}</div>
        </div>
        <aside className="space-y-4">
          {toc.length > 1 && (
            <div className="rounded-2xl border border-zinc-200 p-5">
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Contents</h3>
              <ol className="space-y-1">{toc.map((h, i) => (<li key={i} className="text-sm text-teal-700"><span className="mr-2 font-semibold">{String(i + 1).padStart(2, "0")}</span>{h}</li>))}</ol>
            </div>
          )}
          <div className="rounded-2xl bg-teal-50/60 p-5">
            <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-700">At a Glance</h3>
            <p className="text-sm text-zinc-600">{toc.length} sections · {data.sources.length} citations</p>
          </div>
        </aside>
      </div>
      <CtaBlock data={data} />
      <FaqBlock data={data} />
      <ExtraBlocks data={data} />
    </div>
  );
}
