"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Article, ArticleListItem } from "@/lib/api/types";
import { resolveArticleImage } from "@/lib/media";
import {
  mapCategory, readMinutes, headingsOf, ArticleBody, AuthorCard,
  TagsBlock, CtaBanner, DisclaimerBlock, TocCard, BackLink,
} from "./shared";

function ChartBlock({ chart }: { chart: NonNullable<Article["chartData"]> }) {
  const labels = chart.labels || [];
  const values = chart.values || [];
  if (!labels.length || !values.length) return null;
  const max = Math.max(...values, 1);
  return (
    <div className="card mt-8">
      {chart.title && <h3 className="heading-sm mb-4">{chart.title}</h3>}
      <div className="flex h-44 items-end gap-2 sm:gap-3">
        {labels.map((l, i) => (
          <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <span className="text-xs font-semibold text-primary">{values[i] ?? "—"}</span>
            <div className="flex w-full flex-1 items-end rounded-t bg-secondary/30">
              <div className="w-full rounded-t bg-primary" style={{ height: `${Math.max(4, ((values[i] || 0) / max) * 100)}%` }} />
            </div>
            <span className="truncate text-[11px] text-zinc-500">{l}</span>
          </div>
        ))}
      </div>
      <p className="body-sm mt-3">Illustrative values from the article data — see references for primary sources.</p>
    </div>
  );
}

export function MedicalResearchArticle({ article, related }: { article: Article; related: ArticleListItem[] }) {
  const heroUrl = resolveArticleImage(article);
  const toc = headingsOf(article);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? Math.min(100, Math.round((el.scrollTop / total) * 100)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const citations = article.sources?.map((s) => ({ title: s.title, url: s.url, authors: s.authors })) || [];

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-40 h-1 bg-zinc-100 dark:bg-zinc-800"><div className="h-full bg-primary transition-[width]" style={{ width: `${progress}%` }} /></div>
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="w-full">
            <BackLink />
            <p className="eyebrow">Peer-Reviewed Style Summary · {mapCategory(article.category)}</p>
            <h1 className="heading-xl mt-4">{article.title}</h1>
            {(article.excerpt || article.seo?.metaDescription) && <p className="body-lg mt-4 font-light">{article.excerpt || article.seo?.metaDescription}</p>}
            <div className="mt-8"><AuthorCard article={article} reviewedAt={article.reviewedAt ? new Date(article.reviewedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null} /></div>
          </div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="container-custom">
          <div className="grid w-full gap-10 lg:grid-cols-3">
            <div className="min-w-0 lg:col-span-2">
              {heroUrl && <div className="mb-8 overflow-hidden rounded-2xl shadow-lg"><img src={heroUrl} alt={article.title} className="h-auto w-full object-cover" /></div>}
              <ArticleBody article={article} />
              {article.chartData && (article.chartData.labels?.length || 0) > 0 && <ChartBlock chart={article.chartData} />}
              {(article.warnings?.length || 0) > 0 && (
                <div className="card mt-8 !border-amber-300 !bg-amber-50 dark:!bg-amber-900/10">
                  <h3 className="heading-sm">Limitations & Cautions</h3>
                  <ul className="body-md mt-2 list-disc space-y-1 pl-5">{article.warnings!.map((w, i) => (<li key={i}>{w}</li>))}</ul>
                </div>
              )}
              <CtaBanner article={article} />
            </div>
            <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
              <TocCard headings={toc} title="Contents" />
              <div className="rounded-2xl bg-secondary/30 p-6 ring-1 ring-secondary/40">
                <h3 className="eyebrow mb-3">At a Glance</h3>
                <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                  <p><strong>{readMinutes(article)} min</strong> read</p>
                  <p><strong>{citations.length}</strong> citations</p>
                  <p><strong>{toc.length}</strong> sections</p>
                </div>
              </div>
              {related.length > 0 && (
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-900/5 dark:bg-zinc-800">
                  <h3 className="eyebrow mb-3">Related Research</h3>
                  <ul className="space-y-3">{related.map((a) => (<li key={a._id}><Link href={`/knowledge/${a.slug}`} className="text-sm font-medium text-primary hover:text-secondary-foreground">{a.title}</Link></li>))}</ul>
                </div>
              )}
            </aside>
          </div>
          <div className="mt-12 w-full">
            {citations.length > 0 && (
              <div className="rounded-2xl bg-zinc-50 p-6 dark:bg-zinc-800/50">
                <h3 className="heading-sm mb-3">Citations</h3>
                <ol className="list-decimal space-y-2 pl-5">
                  {citations.map((c, i) => (
                    <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400">
                      {c.authors ? `${c.authors}. ` : ""}{c.url ? <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{c.title}</a> : c.title}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <div className="mt-8 w-full"><DisclaimerBlock article={article} /><TagsBlock article={article} /></div>
          </div>
        </div>
      </section>
    </div>
  );
}
