"use client";

import Link from "next/link";
import type { Article, ArticleListItem } from "@/lib/api/types";
import { resolveArticleImage } from "@/lib/media";
import {
  mapCategory, readMinutes, headingsOf, ArticleBody, AuthorCard,
  ReferencesBlock, TagsBlock, CtaBanner, DisclaimerBlock, TocCard, BackLink, CategoryEyebrow,
} from "./shared";

const FALLBACK = "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=1400&auto=format&fit=crop";

/** Standard Medical Article — breadcrumbs, header, TOC, body, takeaways, FAQs. */
export function StandardArticleLayout({ article, related }: { article: Article; related: ArticleListItem[] }) {
  const heroUrl = resolveArticleImage(article) || FALLBACK;
  const excerpt = article.excerpt || article.seo?.metaDescription || "";
  const toc = headingsOf(article);
  const faqs = (article.faqs || []).filter((f) => f.question).sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="flex flex-col">
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="w-full">
            <p className="body-sm mb-4"><Link href="/" className="hover:text-primary">Home</Link><span className="mx-1.5 text-zinc-300">/</span><Link href="/knowledge" className="hover:text-primary">Articles</Link><span className="mx-1.5 text-zinc-300">/</span><span className="text-zinc-500">{article.title.slice(0, 40)}…</span></p>
            <BackLink />
            <CategoryEyebrow article={article} />
            <h1 className="heading-xl mt-4">{article.title}</h1>
            {excerpt && <div className="body-lg mt-4 font-light">{excerpt}</div>}
            <div className="mt-8"><AuthorCard article={article} reviewedAt={article.reviewedAt ? new Date(article.reviewedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null} /></div>
            <div className="mt-8 overflow-hidden rounded-2xl shadow-lg"><img src={heroUrl} alt={article.title} className="h-auto w-full object-cover" /></div>
          </div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="container-custom">
          <div className="w-full">
            <TocCard headings={toc} />
            <div className="mt-8"><ArticleBody article={article} /></div>
            {(article.keyPoints?.length || 0) > 0 && (
              <div className="card mt-8">
                <h3 className="heading-sm">Key Takeaways</h3>
                <ul className="mt-3 space-y-2">{article.keyPoints!.map((k, i) => (<li key={i} className="body-md flex items-start gap-2"><span className="mt-1 text-emerald-600">✓</span>{k}</li>))}</ul>
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
            <p className="body-sm mt-6 text-center text-zinc-400">{readMinutes(article)} min read · {mapCategory(article.category)}</p>
          </div>
          {related.length > 0 && (
            <div className="mt-14 w-full">
              <div className="mb-8 text-center"><p className="eyebrow">Keep Reading</p><h2 className="heading-lg mt-2">Related <span className="gradient-text">Articles</span></h2></div>
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
