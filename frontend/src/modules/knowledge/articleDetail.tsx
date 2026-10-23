"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getArticleBySlugSafe, getArticles } from "@/lib/api/services/articles";
import type { Article, ArticleListItem } from "@/lib/api/types";
import { EmptyState } from "@/shared/components/EmptyState";
import { resolveArticleImage, resolveMediaUrl } from "@/lib/media";
import { BeforeAfterSlider } from "@/shared/components/gallery";
import { ArticleTemplateRenderer, isNewLayout } from "./templates/ArticleTemplateRenderer";

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function ArticleDetail({ slug }: { slug: string }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<ArticleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;
    getArticleBySlugSafe(slug)
      .then((api) => {
        if (!mounted) return;
        if (api) {
          setArticle(api);
          getArticles({ page: 1, limit: 4, category: api.category }).then((res) => {
            if (mounted) setRelated((res.items || []).filter((a) => a.slug !== slug).slice(0, 3));
          }).catch(() => {});
        } else setNotFound(true);
      })
      .catch(() => {
        if (mounted) setNotFound(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-[#dbeafe] px-4 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Loading article...</p>
        </div>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="bg-[#dbeafe] px-4 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px] rounded-2xl bg-white p-8 ring-1 ring-slate-200/80">
          <EmptyState moduleName="Articles" />
          <p className="mt-4 text-center text-sm text-slate-500">Slug: {slug}</p>
          <div className="mt-6 text-center">
            <Link href="/knowledge" className="btn-sanctuary-ghost">
              Back to Knowledge Centre
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const title = article.title;
  const excerpt = article.excerpt || article.seo?.metaDescription || article.title;
  const category = mapCategory(article.category);
  const author = article.author || "Dr. Ekta Narula";
  const credentials = article.credentialsDisplay || "BDS (Gold Medalist)";
  const dateStr = article.publishedAt || article.createdAt;
  const reviewedBy = typeof article.reviewer === "object" ? (article.reviewer as { name?: string })?.name : undefined;
  const reviewedAt = article.reviewedAt ? new Date(article.reviewedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null;
  const ogImg = resolveArticleImage(article);
  const heroUrl = ogImg || "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=1200&auto=format&fit=crop";
  const content = article.body || "";
  const layout = article.layout || "standard";
  const rawBefore = (article as unknown as { beforeImage?: unknown }).beforeImage;
  const rawAfter = (article as unknown as { afterImage?: unknown }).afterImage;
  const pickOriginal = (v: unknown): string | null => {
    if (v && typeof v === "object") {
      const u = (v as { url?: unknown }).url;
      if (typeof u === "string" && u.trim()) return u.trim();
    }
    return resolveMediaUrl(v);
  };
  const beforeUrl = pickOriginal(rawBefore);
  const afterUrl = pickOriginal(rawAfter);
  const keyPoints = article.keyPoints || [];
  const tags = article.tags || [];
  const faqs = (article.faqs || []).filter((f) => f.question).sort((a, b) => (a.order || 0) - (b.order || 0));
  const references = article.sources?.map((s) => ({ title: s.title, url: s.url })) || [];
  const toc = content.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("## ")).map((l) => l.slice(3));
  const readMins = Math.max(2, Math.round(content.split(/\s+/).length / 200));
  const cta = {
    title: article.ctaBox?.title || "Have a dental question?",
    subtitle: article.ctaBox?.subtitle || "Dr. Ekta is here to help. Schedule a consultation for personalised advice.",
    button: article.ctaBox?.buttonLabel || "Book Appointment",
  };

  const faqBlock = faqs.length > 0 && (
    <div className="mt-12">
      <p className="eyebrow">Questions / Quick answers</p>
      <h2 className="mt-3 heading-lg">Frequently asked questions</h2>
      <div className="mt-6 space-y-3">
        {faqs.map((f, i) => (
          <details key={i} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200/80">
            <summary className="cursor-pointer text-sm font-semibold text-slate-900">{f.question}</summary>
            <p className="body-sm mt-3 whitespace-pre-line">{f.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );

  const renderSteps = (contentStr: string) => {
    const lines = contentStr.split("\n");
    const blocks: { title: string | null; lines: string[] }[] = [];
    let cur: { title: string | null; lines: string[] } = { title: null, lines: [] };
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("## ")) {
        if (cur.title || cur.lines.some((l) => l.trim() !== "")) blocks.push(cur);
        cur = { title: trimmed.slice(3), lines: [] };
      } else {
        cur.lines.push(line);
      }
    });
    if (cur.title || cur.lines.some((l) => l.trim() !== "")) blocks.push(cur);
    let stepNo = 0;
    return (
      <div>
        {blocks.map((b, bi) => {
          if (!b.title) return <div key={bi}>{renderLines(b.lines, `pre-${bi}`)}</div>;
          stepNo += 1;
          return (
            <div key={bi} className="mb-4 rounded-2xl bg-white p-5 ring-1 ring-slate-200/80">
              <div className="flex items-start gap-4">
                <span className="font-heading text-4xl font-bold tracking-[-0.04em] text-slate-300">
                  {String(stepNo).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="heading-sm">{b.title}</h3>
                  <div className="mt-2">{renderLines(b.lines, `step-${bi}`)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderLines = (inputLines: string[], keyPrefix: string) => {
    const elements: React.ReactNode[] = [];
    let inList = false;
    let listItems: React.ReactNode[] = [];
    const flushList = () => {
      if (inList && listItems.length > 0) {
        elements.push(<ul key={`${keyPrefix}-list-${elements.length}`} className="my-4 space-y-2 pl-6">{listItems}</ul>);
        listItems = [];
        inList = false;
      }
    };
    inputLines.forEach((line, i) => {
      const trimmed = line.trim();
      if (trimmed === "") {
        flushList();
        return;
      }
      if (trimmed.startsWith("### ")) {
        flushList();
        elements.push(<h3 key={`${keyPrefix}-${i}`} className="heading-sm mt-8 mb-3">{trimmed.slice(4)}</h3>);
        return;
      }
      if (trimmed.startsWith("• ") || trimmed.startsWith("- ")) {
        inList = true;
        listItems.push(
          <li key={`${keyPrefix}-${i}`} className="body-md flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500" />
            <span dangerouslySetInnerHTML={{ __html: formatInline(trimmed.slice(2)) }} />
          </li>
        );
        return;
      }
      const numMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
      if (numMatch) {
        inList = true;
        listItems.push(
          <li key={`${keyPrefix}-${i}`} className="body-md flex items-start gap-2">
            <span className="mt-0.5 shrink-0 text-sm font-bold text-slate-900">{numMatch[1]}.</span>
            <span dangerouslySetInnerHTML={{ __html: formatInline(numMatch[2]) }} />
          </li>
        );
        return;
      }
      flushList();
      if (trimmed.startsWith("|")) return;
      elements.push(<p key={`${keyPrefix}-${i}`} className="body-md mb-4" dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />);
    });
    flushList();
    return elements;
  };

  const renderContent = (contentStr: string) => {
    if (layout === "step-guide") return renderSteps(contentStr);
    const lines = contentStr.split("\n");
    const elements: React.ReactNode[] = [];
    let inList = false;
    let listItems: React.ReactNode[] = [];
    const flushList = () => {
      if (inList && listItems.length > 0) {
        elements.push(<ul key={`list-${elements.length}`} className="my-4 space-y-2 pl-6">{listItems}</ul>);
        listItems = [];
        inList = false;
      }
    };
    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (trimmed === "") {
        flushList();
        return;
      }
      if (trimmed.startsWith("## ")) {
        flushList();
        const h = trimmed.slice(3);
        elements.push(<h2 key={i} id={slugify(h)} className="heading-md mt-10 mb-4 scroll-mt-24">{h}</h2>);
        return;
      }
      if (trimmed.startsWith("### ")) {
        flushList();
        elements.push(<h3 key={i} className="heading-sm mt-8 mb-3">{trimmed.slice(4)}</h3>);
        return;
      }
      if (trimmed.startsWith("• ") || trimmed.startsWith("- ")) {
        inList = true;
        listItems.push(
          <li key={i} className="body-md flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500" />
            <span dangerouslySetInnerHTML={{ __html: formatInline(trimmed.slice(2)) }} />
          </li>
        );
        return;
      }
      const numMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
      if (numMatch) {
        inList = true;
        listItems.push(
          <li key={i} className="body-md flex items-start gap-2">
            <span className="mt-0.5 shrink-0 text-sm font-bold text-slate-900">{numMatch[1]}.</span>
            <span dangerouslySetInnerHTML={{ __html: formatInline(numMatch[2]) }} />
          </li>
        );
        return;
      }
      flushList();
      if (trimmed.startsWith("|")) return;
      elements.push(<p key={i} className="body-md mb-4" dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />);
    });
    flushList();
    return elements;
  };

  const formatInline = (text: string): string =>
    text
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
      .replace(/\*(.+?)\*/g, "<em>$1</em>");

  // New medical CMS layouts render through dedicated templates selected by
  // the saved layout identifier. Legacy values keep the rendering below.
  if (isNewLayout((article as { layout?: string }).layout)) {
    return <ArticleTemplateRenderer article={article} related={related} />;
  }

  return (
    <div className="flex flex-col bg-[#dbeafe]">
      <section className="bg-[#dbeafe] px-2 pt-2 sm:px-3 sm:pt-3">
        <div className="mx-auto max-w-[1600px] overflow-hidden rounded-[28px] bg-white">
          <div className="mx-auto max-w-5xl px-6 py-12 sm:px-10 lg:py-16">
            <nav className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-slate-900">Home</Link>
              <span className="text-slate-300">/</span>
              <Link href="/knowledge" className="hover:text-slate-900">Knowledge</Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900">{category}</span>
            </nav>

            <div className="mt-8 flex items-center gap-3">
              <span className="h-px w-8 bg-slate-900" />
              <span className="eyebrow">{category}</span>
            </div>
            <h1 className="mt-3 heading-xl max-w-4xl">{title}</h1>
            <p className="body-lg mt-5 max-w-3xl">{excerpt}</p>

            <div className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl bg-[#eff6ff] p-4 ring-1 ring-slate-200/80">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
                  <span className="material-icons text-slate-600">person</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{author}</p>
                  <p className="text-xs text-slate-500">{credentials}</p>
                </div>
              </div>
              <div className="hidden h-8 w-px bg-slate-200 sm:block" />
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="material-icons text-base">calendar_today</span>
                  {dateStr ? new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-icons text-base">schedule</span>
                  {readMins} min read
                </span>
              </div>
            </div>

            {(reviewedBy || reviewedAt) && (
              <p className="mt-3 flex items-center gap-1 text-xs text-slate-500">
                <span className="material-icons text-base text-emerald-600">verified</span>
                Reviewed{reviewedBy && reviewedBy !== author ? ` by ${reviewedBy}` : ""}
                {reviewedAt ? ` • ${reviewedAt}` : ""}
              </p>
            )}

            <div className="mt-8 overflow-hidden rounded-2xl bg-slate-100">
              <img src={heroUrl} alt={title} className="aspect-video w-full object-cover" />
            </div>

            {layout === "before-after" && beforeUrl && afterUrl && (
              <div className="mt-6">
                <BeforeAfterSlider before={beforeUrl} after={afterUrl} beforeLabel="Before" afterLabel="After" />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-12 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-5xl">
          {keyPoints.length > 0 && (
            <div className="mb-8 rounded-2xl bg-[#eff6ff] p-5 ring-1 ring-slate-200/80">
              <h3 className="eyebrow mb-3">Key takeaways</h3>
              <ul className="space-y-2">
                {keyPoints.map((k, i) => (
                  <li key={i} className="body-md flex items-start gap-2">
                    <span className="material-icons mt-0.5 text-base text-emerald-600">check_circle</span>
                    <span>{k}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {toc.length > 1 && (
            <div className="mb-8 rounded-2xl bg-white p-5 ring-1 ring-slate-200/80">
              <h3 className="eyebrow mb-3">In this article</h3>
              <ol className="space-y-1.5">
                {toc.map((h, i) => (
                  <li key={i}>
                    <a href={`#${slugify(h)}`} className="text-sm text-slate-700 hover:text-slate-900">
                      <span className="mr-2 font-semibold text-slate-400">{String(i + 1).padStart(2, "0")}</span>
                      {h}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {layout === "faq" && faqBlock}
          {content ? <div className="prose-custom">{renderContent(content)}</div> : <EmptyState moduleName="Articles" />}

          <div className="mt-10 rounded-[24px] bg-slate-950 p-6 text-center sm:p-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">Private consultation</p>
            <h3 className="mt-3 heading-lg text-white">{cta.title}</h3>
            <p className="body-md mx-auto mt-3 max-w-2xl text-white/70">{cta.subtitle}</p>
            <a
              href="https://www.practo.com/delhi/doctor/dr-ekta-narula"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-900 transition-colors hover:bg-slate-100"
            >
              <span className="material-icons text-base">calendar_month</span>
              {cta.button}
            </a>
          </div>

          {layout !== "faq" && faqBlock}

          {references.length > 0 && (
            <div className="mt-8 rounded-2xl bg-[#eff6ff] p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">References & sources</h3>
              <ul className="space-y-2">
                {references.map((ref, i) => (
                  <li key={i}>
                    <a href={ref.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900">
                      <span className="material-icons text-base">open_in_new</span>
                      {ref.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {tags.length === 0 ? (
              <EmptyState moduleName="Tags" />
            ) : (
              tags.map((tag) => (
                <span key={tag} className="rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-medium text-slate-600">
                  {tag}
                </span>
              ))
            )}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-[#eff6ff] px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-[1400px]">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Keep reading</p>
                <h2 className="mt-3 heading-lg">Related articles</h2>
              </div>
              <Link href="/knowledge" className="btn-sanctuary-ghost shrink-0">
                All Articles
              </Link>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {related.map((a) => (
                <Link key={a._id} href={`/knowledge/${a.slug}`} className="card-hover group flex flex-col">
                  <p className="eyebrow mb-3">{mapCategory(a.category)}</p>
                  <h3 className="heading-sm transition-colors group-hover:text-slate-500">{a.title}</h3>
                  <p className="body-sm mt-2 line-clamp-2">{a.excerpt || a.seo?.metaDescription || ""}</p>
                  <span className="mt-auto pt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-900">
                    Read article
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function mapCategory(cat: string): string {
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
