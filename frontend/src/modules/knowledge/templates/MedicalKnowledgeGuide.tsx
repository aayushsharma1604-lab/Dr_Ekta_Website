"use client";

import type { Article, ArticleListItem } from "@/lib/api/types";
import { resolveArticleImage } from "@/lib/media";
import {
  ArticleBody, AuthorCard, ReferencesBlock, TagsBlock, CtaBanner,
  DisclaimerBlock, TocCard, BackLink, CategoryEyebrow, headingsOf,
} from "./shared";
import Link from "next/link";

const FALLBACK = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200&auto=format&fit=crop";

export function MedicalKnowledgeGuide({ article, related }: { article: Article; related: ArticleListItem[] }) {
  const heroUrl = resolveArticleImage(article) || FALLBACK;
  const excerpt = article.excerpt || article.seo?.metaDescription || "";
  const toc = headingsOf(article);
  const faqs = (article.faqs || []).filter((f) => f.question).sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="flex flex-col">
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="mx-auto max-w-5xl">
            <BackLink />
            <CategoryEyebrow article={article} />
            <h1 className="heading-xl mt-4">{article.title}</h1>
            {excerpt && <div className="body-lg mt-4 font-light">{excerpt}</div>}
            <div className="mt-8"><AuthorCard article={article} reviewedAt={article.reviewedAt ? new Date(article.reviewedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null} /></div>
            <div className="mt-8 overflow-hidden rounded-2xl shadow-lg"><img src={heroUrl} alt={article.title} className="h-auto w-full object-cover" /></div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-secondary/20 pt-0">
        <div className="container-custom">
          <div className="mx-auto max-w-5xl space-y-6">
            {article.quickSummary && (
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary/20 dark:bg-zinc-800">
                <h3 className="eyebrow mb-2">Quick Summary</h3>
                <p className="body-md">{article.quickSummary}</p>
              </div>
            )}
            {(article.keyPoints?.length || 0) > 0 && (
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-900/5 dark:bg-zinc-800">
                <h3 className="eyebrow mb-3">Key Takeaways</h3>
                <ul className="space-y-2">{article.keyPoints!.map((k, i) => (<li key={i} className="body-md flex items-start gap-2"><span className="mt-1 text-emerald-600">✓</span>{k}</li>))}</ul>
              </div>
            )}
            {(article.warnings?.length || 0) > 0 && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/40 dark:bg-red-900/10">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-400"><span className="material-icons">warning</span>Important</h3>
                <ul className="space-y-1.5">{article.warnings!.map((w, i) => (<li key={i} className="body-md text-red-900 dark:text-red-200">• {w}</li>))}</ul>
              </div>
            )}
            <TocCard headings={toc} />
            <ArticleBody article={article} />
            {(article.checklist?.length || 0) > 0 && (
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-900/5 dark:bg-zinc-800">
                <h3 className="eyebrow mb-3">Checklist</h3>
                <ul className="space-y-2">{article.checklist!.map((c, i) => (<li key={i} className="flex items-start gap-3 text-sm"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-primary text-[11px] text-primary">✓</span><span className="body-md">{c}</span></li>))}</ul>
              </div>
            )}
            <CtaBanner article={article} />
            {faqs.length > 0 && (
              <div>
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
        </div>
      </section>

      {related.length > 0 && (
        <section className="section-padding pt-0">
          <div className="container-custom">
            <div className="mx-auto max-w-5xl">
              <div className="mb-8 text-center"><p className="eyebrow">Keep Reading</p><h2 className="heading-lg mt-2">Related <span className="gradient-text">Guides</span></h2></div>
              <div className="grid gap-6 md:grid-cols-3">
                {related.map((a) => (
                  <Link key={a._id} href={`/knowledge/${a.slug}`} className="card-hover group">
                    <h3 className="heading-sm transition-colors group-hover:text-primary">{a.title}</h3>
                    <p className="body-sm mt-2 line-clamp-2">{a.excerpt || a.seo?.metaDescription || ""}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
