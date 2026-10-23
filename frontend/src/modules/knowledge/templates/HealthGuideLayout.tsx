"use client";

import Link from "next/link";
import type { Article, ArticleListItem } from "@/lib/api/types";
import { resolveArticleImage } from "@/lib/media";
import {
  mapCategory, readMinutes, ArticleBody, AuthorCard,
  ReferencesBlock, TagsBlock, CtaBanner, DisclaimerBlock, BackLink, CategoryEyebrow,
} from "./shared";

const FALLBACK = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1400&auto=format&fit=crop";

/** Step-by-Step Health Guide — audience, prep, numbered steps, do/don't, checklist, consult. */
export function HealthGuideLayout({ article, related }: { article: Article; related: ArticleListItem[] }) {
  const heroUrl = resolveArticleImage(article) || FALLBACK;
  const faqs = (article.faqs || []).filter((f) => f.question).sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="flex flex-col">
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <BackLink />
              <CategoryEyebrow article={article} />
              <h1 className="heading-xl mt-4">{article.title}</h1>
              {(article.excerpt || article.seo?.metaDescription) && <p className="body-lg mt-3 font-light">{article.excerpt || article.seo?.metaDescription}</p>}
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-zinc-500">
                <span>{readMinutes(article)} min read</span>
                {article.audience && <span>For: {article.audience}</span>}
              </div>
              {article.preparation && (
                <div className="card mt-6">
                  <h3 className="heading-sm">Before You Begin</h3>
                  <p className="body-md mt-2">{article.preparation}</p>
                </div>
              )}
            </div>
            <div className="overflow-hidden rounded-2xl shadow-xl"><img src={heroUrl} alt={article.title} className="aspect-[4/3] w-full object-cover" /></div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-secondary/20 pt-0">
        <div className="container-custom">
          <div className="w-full">
            <AuthorCard article={article} reviewedAt={article.reviewedAt ? new Date(article.reviewedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null} />
            <div className="mt-8"><ArticleBody article={article} /></div>
            {(article.dos?.length || article.donts?.length) ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-emerald-50 p-6 dark:bg-emerald-900/10">
                  <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Do&apos;s</h3>
                  <ul className="mt-2 space-y-1.5">{(article.dos || []).map((x, i) => (<li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"><span className="text-emerald-600">✓</span>{x}</li>))}</ul>
                </div>
                <div className="rounded-2xl bg-red-50 p-6 dark:bg-red-900/10">
                  <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">Don&apos;ts</h3>
                  <ul className="mt-2 space-y-1.5">{(article.donts || []).map((x, i) => (<li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"><span className="text-red-500">✕</span>{x}</li>))}</ul>
                </div>
              </div>
            ) : null}
            {(article.checklist?.length || 0) > 0 && (
              <div className="card mt-8">
                <h3 className="heading-sm">Your Checklist</h3>
                <ul className="mt-3 space-y-2">{article.checklist!.map((c, i) => (<li key={i} className="flex items-start gap-3 text-sm"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-primary text-[11px] text-primary">✓</span><span className="body-md">{c}</span></li>))}</ul>
              </div>
            )}
            {article.whenToConsult && (
              <div className="mt-8 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/40 dark:bg-red-900/10">
                <span className="material-icons text-red-600">emergency</span>
                <div><h3 className="text-sm font-semibold text-red-700 dark:text-red-400">When To Consult a Doctor</h3><p className="body-md mt-1">{article.whenToConsult}</p></div>
              </div>
            )}
            {(article.warnings?.length || 0) > 0 && (
              <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/40 dark:bg-amber-900/10">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400"><span className="material-icons">warning</span>Important Warnings</h3>
                <ul className="space-y-1.5">{article.warnings!.map((w, i) => (<li key={i} className="body-md">• {w}</li>))}</ul>
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
              <div className="mb-8 text-center"><p className="eyebrow">Keep Learning</p><h2 className="heading-lg mt-2">Related <span className="gradient-text">Guides</span></h2></div>
              <div className="grid gap-6 md:grid-cols-3">
                {related.map((a) => (
                  <Link key={a._id} href={`/knowledge/${a.slug}`} className="card-hover group">
                    <p className="eyebrow mb-2">{mapCategory(a.category)}</p>
                    <h3 className="heading-sm transition-colors group-hover:text-primary">{a.title}</h3>
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
