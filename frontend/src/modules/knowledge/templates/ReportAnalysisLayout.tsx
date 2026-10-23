"use client";

import Link from "next/link";
import type { Article, ArticleListItem } from "@/lib/api/types";
import { resolveArticleImage } from "@/lib/media";
import {
  mapCategory, readMinutes, headingsOf, ArticleBody, AuthorCard,
  ReferencesBlock, TagsBlock, CtaBanner, DisclaimerBlock, TocCard, BackLink,
} from "./shared";

const FALLBACK = "https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=1400&auto=format&fit=crop";

/** Medical Report Analysis — test overview, purpose/prep, marker cards, limitations. No diagnosis claims. */
export function ReportAnalysisLayout({ article, related }: { article: Article; related: ArticleListItem[] }) {
  const heroUrl = resolveArticleImage(article) || FALLBACK;
  const toc = headingsOf(article);
  const markers = article.markers || [];
  const faqs = (article.faqs || []).filter((f) => f.question).sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="flex flex-col">
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="w-full">
            <BackLink />
            <p className="eyebrow">Lab Report Education · {mapCategory(article.category)}</p>
            <h1 className="heading-xl mt-4">{article.title}</h1>
            {(article.excerpt || article.seo?.metaDescription) && <p className="body-lg mt-4 font-light">{article.excerpt || article.seo?.metaDescription}</p>}
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-zinc-500">
              <span>{readMinutes(article)} min read</span>
              <span>{markers.length} markers explained</span>
            </div>
            <div className="mt-8"><AuthorCard article={article} reviewedAt={article.reviewedAt ? new Date(article.reviewedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null} /></div>
            <div className="mt-8 overflow-hidden rounded-2xl shadow-lg"><img src={heroUrl} alt={article.title} className="h-auto w-full object-cover" /></div>
          </div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="container-custom">
          <div className="w-full">
            {article.preparation && (
              <div className="card mb-8">
                <h3 className="heading-sm">Preparation</h3>
                <p className="body-md mt-2">{article.preparation}</p>
              </div>
            )}
            {markers.length > 0 && (
              <div>
                <h2 className="heading-lg">Marker-by-Marker <span className="gradient-text">Guide</span></h2>
                <p className="body-sm mt-2">Educational explanations only — ranges vary by laboratory, age and sex.</p>
                <div className="mt-6 space-y-4">
                  {markers.map((m, i) => (
                    <div key={i} className="card">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="heading-sm">{i + 1}. {m.name}</h3>
                        {m.unit && <span className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-xs text-zinc-600 dark:bg-zinc-800">unit: {m.unit}</span>}
                      </div>
                      {m.description && <p className="body-md mt-2">{m.description}</p>}
                      <dl className="mt-3 space-y-2 border-t border-zinc-100 pt-3 text-sm dark:border-zinc-800">
                        {m.range && <div className="flex gap-2"><dt className="w-36 shrink-0 font-semibold text-zinc-900 dark:text-white">Reference range</dt><dd className="body-sm">{m.range}</dd></div>}
                        {m.interpretation && <div className="flex gap-2"><dt className="w-36 shrink-0 font-semibold text-zinc-900 dark:text-white">Interpretation</dt><dd className="body-sm">{m.interpretation}</dd></div>}
                        {m.factors && <div className="flex gap-2"><dt className="w-36 shrink-0 font-semibold text-zinc-900 dark:text-white">Influences</dt><dd className="body-sm">{m.factors}</dd></div>}
                      </dl>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-8"><TocCard headings={toc} /></div>
            <div className="mt-8"><ArticleBody article={article} /></div>
            {(article.warnings?.length || 0) > 0 && (
              <div className="card mt-8 !border-amber-300 !bg-amber-50 dark:!bg-amber-900/10">
                <h3 className="heading-sm">Limitations</h3>
                <ul className="body-md mt-2 list-disc space-y-1 pl-5">{article.warnings!.map((w, i) => (<li key={i}>{w}</li>))}</ul>
              </div>
            )}
            {article.whenToConsult && (
              <div className="mt-8 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/40 dark:bg-red-900/10">
                <span className="material-icons text-red-600">emergency</span>
                <div><h3 className="text-sm font-semibold text-red-700 dark:text-red-400">When To Consult a Healthcare Professional</h3><p className="body-md mt-1">{article.whenToConsult}</p></div>
              </div>
            )}
            <CtaBanner article={article} />
            {faqs.length > 0 && (
              <div className="mt-12">
                <h2 className="heading-lg text-center">Frequently Asked <span className="gradient-text">Questions</span></h2>
                <div className="mt-6 space-y-3">
                  {faqs.map((f, i) => (
                    <details key={i} className="card">
                      <summary className="cursor-pointer font-medium text-zinc-900 dark:text-white">{f.question}</summary>
                      <p className="body-sm mt-2 whitespace-pre-line">{f.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}
            <DisclaimerBlock article={article} />
            <ReferencesBlock article={article} />
            <TagsBlock article={article} />
          </div>
          {related.length > 0 && (
            <div className="mt-14 w-full">
              <div className="mb-8 text-center"><p className="eyebrow">Keep Reading</p><h2 className="heading-lg mt-2">Related <span className="gradient-text">Reports</span></h2></div>
              <div className="grid gap-6 md:grid-cols-3">
                {related.map((a) => (
                  <Link key={a._id} href={`/knowledge/${a.slug}`} className="card-hover group">
                    <h3 className="heading-sm transition-colors group-hover:text-primary">{a.title}</h3>
                    <p className="body-sm mt-2 line-clamp-2">{a.excerpt || a.seo?.metaDescription || ""}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
