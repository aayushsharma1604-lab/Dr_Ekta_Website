"use client";

import type { ArticlePreviewData } from "./shared";
import { HeaderBlock, CoverBlock, TakeawaysTocGrid, FaqBlock, CtaBlock, ExtraBlocks, renderLines } from "./shared";

/** Medical Knowledge Guide — summary first, takeaways, warnings, structured body, FAQs. */
export function GuideLayout({ data }: { data: ArticlePreviewData }) {
  return (
    <div className="flex flex-col bg-white p-6 text-left sm:p-8">
      <HeaderBlock data={data} />
      <CoverBlock data={data} />
      <TakeawaysTocGrid data={data} />
      <div className="mt-6">{renderLines(data.body.split("\n"), "guide-body")}</div>
      <CtaBlock data={data} />
      <FaqBlock data={data} />
      <ExtraBlocks data={data} />
    </div>
  );
}
