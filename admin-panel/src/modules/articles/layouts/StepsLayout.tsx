"use client";

import type { ArticlePreviewData } from "./shared";
import { HeaderBlock, CoverBlock, FaqBlock, CtaBlock, ExtraBlocks, renderLines, tocOf } from "./shared";

/** Step-by-Step Medical Explainer — numbered step cards in a 2-column grid. */
export function StepsLayout({ data }: { data: ArticlePreviewData }) {
  const lines = data.body.split("\n");
  const blocks: { title: string | null; lines: string[] }[] = [];
  let cur: { title: string | null; lines: string[] } = { title: null, lines: [] };
  lines.forEach((line) => {
    const t = line.trim();
    if (t.startsWith("## ")) {
      if (cur.title || cur.lines.some((l) => l.trim())) blocks.push(cur);
      cur = { title: t.slice(3), lines: [] };
    } else cur.lines.push(line);
  });
  if (cur.title || cur.lines.some((l) => l.trim())) blocks.push(cur);
  const toc = tocOf(data.body);

  return (
    <div className="flex flex-col bg-white p-6 text-left sm:p-8">
      <HeaderBlock data={data} />
      <CoverBlock data={data} />
      {toc.length > 1 && (
        <div className="mt-6 rounded-2xl border border-zinc-200 p-5">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Steps Overview</h3>
          <ol className="space-y-1">{toc.map((h, i) => (<li key={i} className="text-sm text-teal-700"><span className="mr-2 font-semibold">{String(i + 1).padStart(2, "0")}</span>{h}</li>))}</ol>
        </div>
      )}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {blocks.length > 0 ? blocks.map((b, bi) => (!b.title
          ? <div key={bi} className="lg:col-span-2">{renderLines(b.lines, `pre-${bi}`)}</div>
          : <div key={bi} className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl font-light text-teal-700">{String(blocks.filter((x) => x.title).indexOf(b) + 1).padStart(2, "0")}</span>
              <div className="min-w-0 flex-1"><h3 className="font-semibold text-zinc-900">{b.title}</h3><div className="mt-1">{renderLines(b.lines, `sb-${bi}`)}</div></div>
            </div>
          </div>)) : renderLines(data.body.split("\n"), "steps-body")}
      </div>
      <CtaBlock data={data} />
      <FaqBlock data={data} />
      <ExtraBlocks data={data} />
    </div>
  );
}
