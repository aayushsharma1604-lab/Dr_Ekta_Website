"use client";

import Link from "next/link";
import type { Article, ArticleListItem } from "@/lib/api/types";
import { resolveArticleImage } from "@/lib/media";
import {
  readMinutes, ArticleBody, AuthorCard,
  ReferencesBlock, TagsBlock, CtaBanner, DisclaimerBlock, BackLink, CategoryEyebrow,
} from "./shared";

const FALLBACK = "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=1400&auto=format&fit=crop";

function ChipList({ title, items, tone }: { title: string; items?: string[]; tone: "teal" | "amber" | "red" | "zinc" }) {
  if (!items?.length) return null;
  const tones: Record<string, string> = {
    teal: "bg-secondary/40 text-primary",
    amber: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    zinc: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  };
  return (
    <div className="card">
      <h3 className="heading-sm">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">{items.map((x) => (<span key={x} className={`rounded-full px-3 py-1 text-xs font-medium ${tones[tone]}`}>{x}</span>))}</div>
    </div>
  );
}

/** Symptoms and Conditions — overview, symptoms, causes, risks, urgent warnings. */
export function SymptomsLayout({ article, related }: { article: Article; related: ArticleListItem[] }) {
  const heroUrl = resolveArticleImage(article) || FALLBACK;
  const faqs = (article.faqs || []).filter((f) => f.question).sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="flex flex-col">
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="w-full">
            <BackLink />
            <CategoryEyebrow article={article} />
            <h1 className="heading-xl mt-4">{article.title}</h1>
            {(article.excerpt || article.seo?.metaDescription) && <p className="body-lg mt-4 font-light">{article.excerpt || article.seo?.metaDescription}</p>}
            <p className="body-sm mt-3">{readMinutes(article)} min read · {article.audience ? `For ${article.audience}` : "General readers"}</p>
            <div className="mt-8"><AuthorCard article={article} reviewedAt={article.reviewedAt ? new Date(article.reviewedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null} /></div>
            <div className="mt-8 overflow-hidden rounded-2xl shadow-lg"><img src={heroUrl} alt={article.title} className="h-auto w-full object-cover" /></div>
          </div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="container-custom">
          <div className="grid w-full gap-6 md:grid-cols-2">
            <ChipList title="Common Symptoms" items={article.symptoms} tone="teal" />
            <ChipList title="Possible Causes" items={article.causes} tone="zinc" />
            <ChipList title="Risk Factors" items={article.riskFactors} tone="amber" />
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/40 dark:bg-red-900/10">
              <h3 className="heading-sm flex items-center gap-2 text-red-700 dark:text-red-400"><span className="material-icons">warning</span>Warning Signs</h3>
              {(article.warningSigns?.length || 0) > 0 ? (
                <ul className="mt-3 space-y-1.5">{article.warningSigns!.map((w) => (<li key={w} className="body-md font-medium text-red-900 dark:text-red-200">• {w}</li>))}</ul>
              ) : (
                <p className="body-sm mt-3 italic text-zinc-500">No urgent signs listed — seek care if anything feels wrong.</p>
              )}
            </div>
          </div>
          <div className="mt-8 w-full">
            <ArticleBody article={article} />
            {article.whenToConsult && (
              <div className="mt-8 flex items-start gap-3 rounded-2xl bg-primary p-6 text-white">
                <span className="material-icons">emergency</span>
                <div><h3 className="text-sm font-semibold">When To Seek Medical Care</h3><p className="body-md mt-1 text-white/85">{article.whenToConsult}</p></div>
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
              <div className="mb-8 text-center"><p className="eyebrow">Keep Reading</p><h2 className="heading-lg mt-2">Related <span className="gradient-text">Conditions</span></h2></div>
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
