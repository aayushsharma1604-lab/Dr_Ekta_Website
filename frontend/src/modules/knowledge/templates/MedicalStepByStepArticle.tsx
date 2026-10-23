"use client";

import Link from "next/link";
import type { Article, ArticleListItem } from "@/lib/api/types";
import { resolveArticleImage } from "@/lib/media";
import {
  mapCategory, readMinutes, ArticleBody, AuthorCard,
  ReferencesBlock, TagsBlock, CtaBanner, DisclaimerBlock, CategoryEyebrow,
} from "./shared";

const FALLBACK = "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=1400&auto=format&fit=crop";

export function MedicalStepByStepArticle({ article, related }: { article: Article; related: ArticleListItem[] }) {
  const heroUrl = resolveArticleImage(article) || FALLBACK;
  const faqs = (article.faqs || []).filter((f) => f.question).sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="flex flex-col">
      <section className="section-padding bg-primary">
        <div className="container-custom">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <Link href="/knowledge" className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-white/80 hover:text-white"><span className="material-icons text-base">arrow_back</span>Back to Knowledge Centre</Link>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">How To · {mapCategory(article.category)}</p>
              <h1 className="heading-xl mt-3 text-white">{article.title}</h1>
              {(article.excerpt || article.seo?.metaDescription) && <p className="body-lg mt-3 font-light text-white/80">{article.excerpt || article.seo?.metaDescription}</p>}
              <p className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/70">
                <span className="flex items-center gap-1"><span className="material-icons text-base">schedule</span>{readMinutes(article)} min read</span>
                <span className="flex items-center gap-1"><span className="material-icons text-base">calendar_today</span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}</span>
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl shadow-xl"><img src={heroUrl} alt={article.title} className="aspect-[16/10] w-full object-cover" /></div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
            <div className="min-w-0 lg:col-span-2">
              <AuthorCard article={article} reviewedAt={article.reviewedAt ? new Date(article.reviewedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null} />
              <div className="mt-8"><ArticleBody article={article} /></div>
              {(article.checklist?.length || 0) > 0 && (
                <div className="card mt-8">
                  <h3 className="heading-sm">Your Checklist</h3>
                  <ul className="mt-3 space-y-2">{article.checklist!.map((c, i) => (<li key={i} className="flex items-start gap-3 text-sm"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-primary text-[11px] text-primary">✓</span><span className="body-md">{c}</span></li>))}</ul>
                </div>
              )}
              {((article.pros?.length || 0) > 0 || (article.cons?.length || 0) > 0) && (
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-emerald-50 p-6 dark:bg-emerald-900/10">
                    <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Pros</h3>
                    <ul className="mt-2 space-y-1.5">{(article.pros || []).map((p, i) => (<li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"><span className="text-emerald-600">✓</span>{p}</li>))}</ul>
                  </div>
                  <div className="rounded-2xl bg-red-50 p-6 dark:bg-red-900/10">
                    <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">Cons</h3>
                    <ul className="mt-2 space-y-1.5">{(article.cons || []).map((c, i) => (<li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"><span className="text-red-500">✕</span>{c}</li>))}</ul>
                  </div>
                </div>
              )}
              {article.whenToConsult && (
                <div className="mt-8 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/40 dark:bg-red-900/10">
                  <span className="material-icons text-red-600">emergency</span>
                  <div><h3 className="text-sm font-semibold text-red-700 dark:text-red-400">When To Consult a Doctor</h3><p className="body-md mt-1">{article.whenToConsult}</p></div>
                </div>
              )}
            </div>
            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <div className="card">
                <h3 className="eyebrow mb-2">Quick Tips</h3>
                <p className="body-sm">{article.quickSummary || "Follow each step in order. Take your time — accuracy matters more than speed."}</p>
              </div>
              <div className="card">
                <h3 className="eyebrow mb-2">Author</h3>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">{article.author || "Dr. Ekta Narula"}</p>
                <p className="text-xs text-zinc-500">{article.credentialsDisplay || "BDS (Gold Medalist)"}</p>
              </div>
              <CategoryEyebrow article={article} />
            </aside>
          </div>
          <div className="mx-auto mt-10 max-w-6xl">
            {faqs.length > 0 && (
              <div className="mx-auto max-w-5xl">
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
            <div className="mx-auto max-w-5xl"><CtaBanner article={article} /><DisclaimerBlock article={article} /><ReferencesBlock article={article} /><TagsBlock article={article} /></div>
          </div>
          {related.length > 0 && (
            <div className="mx-auto mt-14 max-w-6xl">
              <div className="mb-8 text-center"><p className="eyebrow">Keep Learning</p><h2 className="heading-lg mt-2">Related <span className="gradient-text">Guides</span></h2></div>
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
