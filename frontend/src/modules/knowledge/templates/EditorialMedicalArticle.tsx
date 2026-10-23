"use client";

import Link from "next/link";
import type { Article, ArticleListItem } from "@/lib/api/types";
import { resolveArticleImage } from "@/lib/media";
import {
  mapCategory, readMinutes, headingsOf, ArticleBody, AuthorCard,
  ReferencesBlock, TagsBlock, CtaBanner, DisclaimerBlock, TocCard, BackLink,
} from "./shared";

const FALLBACK = "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=1600&auto=format&fit=crop";

export function EditorialMedicalArticle({ article, related }: { article: Article; related: ArticleListItem[] }) {
  const heroUrl = resolveArticleImage(article) || FALLBACK;
  const excerpt = article.excerpt || article.seo?.metaDescription || "";
  const toc = headingsOf(article);

  return (
    <div className="flex flex-col">
      <section className="section-padding bg-background pb-0">
        <div className="container-custom">
          <div className="mx-auto max-w-4xl text-center">
            <BackLink />
            <p className="eyebrow">{mapCategory(article.category)}</p>
            <h1 className="font-heading mt-4 text-4xl leading-tight text-zinc-900 dark:text-white sm:text-5xl lg:text-6xl">{article.title}</h1>
            {excerpt && <p className="body-lg mx-auto mt-5 max-w-2xl font-light">{excerpt}</p>}
            <div className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-zinc-500">
              <span className="font-semibold text-zinc-900 dark:text-white">{article.author || "Dr. Ekta Narula"}</span>
              <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}</span>
              <span>{readMinutes(article)} min read</span>
            </div>
          </div>
          <div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-3xl shadow-xl">
            <img src={heroUrl} alt={article.title} className="aspect-[21/9] w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AuthorCard article={article} reviewedAt={article.reviewedAt ? new Date(article.reviewedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null} />
              {article.pullQuote && (
                <blockquote className="my-8 border-l-4 border-secondary-foreground pl-6 font-heading text-2xl italic leading-snug text-zinc-900 dark:text-white">
                  &ldquo;{article.pullQuote}&rdquo;
                </blockquote>
              )}
              <div className="mt-6"><ArticleBody article={article} /></div>
              <DisclaimerBlock article={article} />
              <ReferencesBlock article={article} />
              <TagsBlock article={article} />
            </div>
            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <TocCard headings={toc} title="Table of Contents" />
              {(article.keyPoints?.length || 0) > 0 && (
                <div className="rounded-2xl bg-secondary/30 p-6 ring-1 ring-secondary/40">
                  <h3 className="eyebrow mb-3">At a Glance</h3>
                  <ul className="space-y-2">{article.keyPoints!.map((k, i) => (<li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"><span className="text-emerald-600">✓</span>{k}</li>))}</ul>
                </div>
              )}
            </aside>
          </div>
          <div className="mx-auto max-w-5xl"><CtaBanner article={article} /></div>
          {related.length > 0 && (
            <div className="mx-auto mt-14 max-w-5xl">
              <div className="mb-8 text-center"><p className="eyebrow">Keep Reading</p><h2 className="heading-lg mt-2">Related <span className="gradient-text">Articles</span></h2></div>
              <div className="grid gap-6 md:grid-cols-3">
                {related.map((a) => (
                  <Link key={a._id} href={`/knowledge/${a.slug}`} className="card-hover group">
                    <p className="eyebrow mb-2">{mapCategory(a.category)}</p>
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
