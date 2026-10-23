"use client";

import Link from "next/link";
import type { Article, ArticleListItem } from "@/lib/api/types";
import { resolveArticleImage, resolveMediaUrl } from "@/lib/media";
import {
  mapCategory, readMinutes, ArticleBody, AuthorCard,
  ReferencesBlock, TagsBlock, CtaBanner, DisclaimerBlock, BackLink, CategoryEyebrow,
} from "./shared";

const FALLBACKS = [
  "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1400&auto=format&fit=crop",
];

function StorySection({ index, title, text, image, flip }: { index: number; title: string; text: string; image: string | null; flip: boolean }) {
  return (
    <div className={`grid items-center gap-8 lg:grid-cols-2 ${flip ? "" : ""}`}>
      <div className={flip ? "lg:order-2" : ""}>
        {image ? (
          <div className="overflow-hidden rounded-2xl shadow-lg"><img src={image} alt={title} className="aspect-[4/3] w-full object-cover" loading="lazy" /></div>
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-secondary/30 font-heading text-5xl font-light text-secondary-foreground">{String(index + 1).padStart(2, "0")}</div>
        )}
      </div>
      <div className={flip ? "lg:order-1" : ""}>
        <p className="eyebrow">Chapter {String(index + 1).padStart(2, "0")}</p>
        <h2 className="heading-md mt-2">{title}</h2>
        <p className="body-lg mt-3 font-light">{text}</p>
      </div>
    </div>
  );
}

export function MedicalStoryArticle({ article, related }: { article: Article; related: ArticleListItem[] }) {
  const heroUrl = resolveArticleImage(article) || FALLBACKS[0];
  const gallery = (article.galleryImages || []).map((g) => resolveMediaUrl(g)).filter(Boolean) as string[];
  const sections = (article.body || "").split("\n").map((l) => l.trim()).filter((l) => l.startsWith("## ")).map((l) => l.slice(3));
  const bodyAfterHeadings = (article.body || "").split("\n").filter((l) => { const t = l.trim(); return t !== "" && !t.startsWith("## ") && !t.startsWith("### "); });
  const excerpt = article.excerpt || article.seo?.metaDescription || "";
  const faqs = (article.faqs || []).filter((f) => f.question);

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden">
        <img src={heroUrl} alt={article.title} className="aspect-[16/8] w-full object-cover sm:aspect-[21/8]" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/30 to-transparent" />
        <div className="container-custom absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-5xl pb-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200">Patient Story · {mapCategory(article.category)}</p>
            <h1 className="mt-2 font-heading text-3xl text-white sm:text-5xl">{article.title}</h1>
            {excerpt && <p className="mt-3 max-w-2xl font-light text-white/85">{excerpt}</p>}
            <p className="mt-4 text-sm text-white/70">{article.author || "Dr. Ekta Narula"} · {readMinutes(article)} min read</p>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="mx-auto max-w-5xl">
            <BackLink />
            <AuthorCard article={article} reviewedAt={article.reviewedAt ? new Date(article.reviewedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null} />
          </div>
          <div className="mx-auto mt-12 max-w-5xl space-y-16">
            {sections.length > 0 ? sections.map((title, i) => (
              <StorySection
                key={i}
                index={i}
                title={title}
                text={bodyAfterHeadings[i] || bodyAfterHeadings[bodyAfterHeadings.length - 1] || ""}
                image={gallery[i] || null}
                flip={i % 2 === 1}
              />
            )) : <div className="mx-auto max-w-5xl"><ArticleBody article={article} /></div>}
          </div>
          <div className="mx-auto mt-12 max-w-5xl">
            {article.pullQuote && (
              <blockquote className="rounded-2xl bg-secondary/30 p-8 text-center font-heading text-2xl italic text-zinc-900 ring-1 ring-secondary/40 dark:text-white">
                &ldquo;{article.pullQuote}&rdquo;
              </blockquote>
            )}
            {gallery.length > 0 && (
              <div className="mt-10">
                <h2 className="heading-md text-center">Moments</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {gallery.map((g, i) => (
                    <div key={i} className="overflow-hidden rounded-2xl shadow-sm"><img src={g} alt={`${article.title} photo ${i + 1}`} className="aspect-square w-full object-cover" loading="lazy" /></div>
                  ))}
                </div>
              </div>
            )}
            {faqs.length > 0 && (
              <div className="mt-10">
                <h2 className="heading-md text-center">Questions</h2>
                <div className="mt-4 space-y-3">
                  {faqs.map((f, i) => (
                    <details key={i} className="card">
                      <summary className="cursor-pointer font-medium text-zinc-900 dark:text-white">{f.question}</summary>
                      <p className="body-sm mt-2 whitespace-pre-line">{f.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}
            <CtaBanner article={article} />
            <DisclaimerBlock article={article} />
            <ReferencesBlock article={article} />
            <TagsBlock article={article} />
          </div>
          {related.length > 0 && (
            <div className="mx-auto mt-14 max-w-5xl">
              <div className="mb-8 text-center"><p className="eyebrow">More Stories</p><h2 className="heading-lg mt-2">Related <span className="gradient-text">Stories</span></h2></div>
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
