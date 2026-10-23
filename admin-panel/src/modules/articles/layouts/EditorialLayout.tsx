"use client";

import type { ArticlePreviewData } from "./shared";
import { HeaderBlock, CoverBlock, TakeawaysTocGrid, FaqBlock, CtaBlock, ExtraBlocks, renderLines } from "./shared";

/** Editorial Medical Magazine — centered magazine hero, wide cover, pull quote, full body. */
export function EditorialLayout({ data }: { data: ArticlePreviewData }) {
  return (
    <div className="flex flex-col bg-white p-6 text-left sm:p-10">
      <div className="text-center">
        <HeaderBlock data={data} centered />
      </div>
      <CoverBlock data={data} wide />
      <TakeawaysTocGrid data={data} />
      {data.pullQuote && (
        <blockquote className="mx-auto my-8 max-w-2xl border-l-4 border-teal-500 pl-6 text-center font-serif text-2xl italic text-zinc-900">
          &ldquo;{data.pullQuote}&rdquo;
        </blockquote>
      )}
      <div className="mx-auto mt-6 w-full max-w-3xl">{renderLines(data.body.split("\n"), "ed-body")}</div>
      <div className="mx-auto w-full max-w-3xl"><CtaBlock data={data} /></div>
      <div className="mx-auto w-full max-w-3xl"><FaqBlock data={data} /></div>
      <div className="mx-auto w-full max-w-3xl"><ExtraBlocks data={data} /></div>
    </div>
  );
}
