"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ARTICLE_CATEGORIES } from "@/shared/constants/articles";
import { getArticles } from "@/lib/api/services/articles";
import type { ArticleListItem } from "@/lib/api/types";
import { EmptyState } from "@/shared/components/EmptyState";
import { resolveArticleImage } from "@/lib/media";
import { PAGE_VIDEO } from "@/shared/media/pageVideos";
import { CTASection, PageHero, SectionHeading } from "@/shared/components/layout";

export function KnowledgeCentre() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getArticles({ page: 1, limit: 50 })
      .then((res) => {
        if (!mounted) return;
        const mapped = (res.items || []).map((a) => ({
          ...a,
          id: a._id,
          excerpt: a.excerpt || a.seo?.metaDescription || a.title.slice(0, 100),
          category: mapBackendCategory(a.category) || a.category,
          readTime: "5 min read",
          date: a.publishedAt || a.createdAt,
          credentials: a.credentialsDisplay || "BDS (Gold Medalist)",
          reviewedBy: typeof a.reviewer === "object" ? (a.reviewer as { name?: string })?.name || "Dr. Ekta Narula" : "Dr. Ekta Narula",
          content: "",
          references: a.sources?.map((s) => ({ title: s.title, url: s.url })) || [],
          tags: a.tags || [],
        })) as unknown as ArticleListItem[];
        setArticles(mapped);
      })
      .catch((e) => {
        if (mounted) setError((e as Error).message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filteredArticles = activeCategory === "All" ? articles : articles.filter((a) => a.category === activeCategory);

  return (
    <div className="flex flex-col bg-[#dbeafe]">
      <PageHero
        eyebrow="Knowledge Centre"
        title={
          <>
            Dental <span className="text-slate-500">Knowledge Centre</span>
          </>
        }
        description="Evidence-based articles written and reviewed by Dr. Ekta Narula to help you make informed decisions about your dental health."
        image="/dental/service-cleaning.jpg"
        imageAlt="Healthy smile close-up"
        backgroundImage={PAGE_VIDEO.knowledge.poster}
        backgroundVideo={PAGE_VIDEO.knowledge.src}
      />

      <section className="bg-[#eff6ff] px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Library / Evidence-based reading"
              title="Read before you decide"
              description="Practical guidance on prevention, treatment, and everyday oral health."
            />
            <div className="flex max-w-[720px] flex-wrap gap-2">
              {ARTICLE_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                    activeCategory === category
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="mt-12 text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Loading articles...</p>
          ) : error ? (
            <div className="mt-12">
              <EmptyState moduleName="Articles" message={error} onRetry={() => window.location.reload()} />
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="mt-12">
              <EmptyState moduleName={activeCategory === "All" ? "Articles" : activeCategory} />
            </div>
          ) : (
            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((article) => {
                const imgUrl = resolveArticleImage(article);
                return (
                  <Link key={(article as unknown as { _id: string })._id || article.slug} href={`/knowledge/${article.slug}`} className="card-hover group flex flex-col">
                    <div className="media-card mb-5 aspect-video rounded-xl bg-slate-100">
                      {imgUrl ? (
                        <img src={imgUrl} alt={article.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="material-icons text-3xl text-slate-300">article</span>
                        </div>
                      )}
                      {imgUrl && (
                        <span className="media-badge">
                          Read article <span className="material-icons text-sm">arrow_outward</span>
                        </span>
                      )}
                    </div>
                    <div className="mb-3">
                      <span className="inline-block rounded-full bg-[#eff6ff] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700">{article.category}</span>
                    </div>
                    <h2 className="heading-sm transition-colors group-hover:text-slate-500">{article.title}</h2>
                    <p className="body-sm mt-2 flex-1 line-clamp-2">{(article as unknown as { excerpt: string }).excerpt}</p>
                    <div className="mt-6 flex items-center justify-between pt-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eff6ff]">
                          <span className="material-icons text-sm text-slate-600">person</span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{article.author}</p>
                          <p className="max-w-[150px] truncate text-[10px] text-slate-500">{(article as unknown as { credentials: string }).credentials}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{(article as unknown as { readTime: string }).readTime}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <CTASection
        title="Have a dental question?"
        description="Dr. Ekta is happy to answer any questions about your dental health. Schedule a consultation today."
      />
    </div>
  );
}

function mapBackendCategory(cat: string): string {
  const map: Record<string, string> = {
    "preventive-care": "Dental Care",
    "oral-surgery": "Oral Health",
    restorative: "Dental Implants",
    cosmetic: "Cosmetic Dentistry",
    pediatric: "Children's Dental Health",
    emergency: "Patient FAQs",
    technology: "Dental Myths",
    "patient-education": "Patient FAQs",
    orthodontics: "Oral Health",
  };
  return map[cat] || cat;
}
