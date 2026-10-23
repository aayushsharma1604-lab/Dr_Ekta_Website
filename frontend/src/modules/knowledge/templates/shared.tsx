"use client";

import Link from "next/link";
import type { Article } from "@/lib/api/types";
import { EmptyState } from "@/shared/components/EmptyState";

export function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

export function mapCategory(cat: string): string {
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

export function readMinutes(article: Article): number {
  const words = `${article.title} ${article.body || ""}`.split(/\s+/).length;
  return Math.max(2, Math.round(words / 200));
}

export function headingsOf(article: Article): string[] {
  return (article.body || "").split("\n").map((l) => l.trim()).filter((l) => l.startsWith("## ")).map((l) => l.slice(3));
}

function renderLines(lines: string[], prefix: string) {
  const elements: React.ReactNode[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];
  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(<ul key={`${prefix}-ul-${elements.length}`} className="my-4 space-y-2 pl-6">{listItems}</ul>);
      listItems = [];
      inList = false;
    }
  };
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed === "") { flushList(); return; }
    if (trimmed.startsWith("## ")) { flushList(); const h = trimmed.slice(3); elements.push(<h2 key={`${prefix}-${i}`} id={slugify(h)} className="heading-md mt-10 mb-4 scroll-mt-24">{h}</h2>); return; }
    if (trimmed.startsWith("### ")) { flushList(); elements.push(<h3 key={`${prefix}-${i}`} className="heading-sm mt-8 mb-3">{trimmed.slice(4)}</h3>); return; }
    if (trimmed.startsWith("• ") || trimmed.startsWith("- ")) {
      inList = true;
      listItems.push(<li key={`${prefix}-${i}`} className="body-md flex items-start gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500" /><span dangerouslySetInnerHTML={{ __html: formatInline(trimmed.slice(2)) }} /></li>);
      return;
    }
    const numMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
    if (numMatch) {
      inList = true;
      listItems.push(<li key={`${prefix}-${i}`} className="body-md flex items-start gap-2"><span className="mt-0.5 shrink-0 text-sm font-bold text-slate-900">{numMatch[1]}.</span><span dangerouslySetInnerHTML={{ __html: formatInline(numMatch[2]) }} /></li>);
      return;
    }
    flushList();
    if (trimmed.startsWith("|")) return;
    elements.push(<p key={`${prefix}-${i}`} className="body-md mb-4" dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />);
  });
  flushList();
  return elements;
}

export function ArticleBody({ article }: { article: Article }) {
  if (!article.body) return <EmptyState moduleName="Articles" />;
  return <div className="prose-custom">{renderLines(article.body.split("\n"), "body")}</div>;
}

export function AuthorCard({ article, reviewedAt }: { article: Article; reviewedAt: string | null }) {
  const author = article.author || "Dr. Ekta Narula";
  const credentials = article.credentialsDisplay || "BDS (Gold Medalist)";
  const dateStr = article.publishedAt || article.createdAt;
  const reviewedBy = typeof article.reviewer === "object" ? (article.reviewer as { name?: string })?.name : undefined;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-6 rounded-2xl bg-[#eff6ff] p-5 ring-1 ring-slate-200/80">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-white"><span className="material-icons text-slate-600">person</span></div><div><p className="font-semibold text-slate-900">{author}</p><p className="text-xs text-slate-500">{credentials}</p></div></div>
        <div className="h-8 w-px bg-slate-200" />
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1"><span className="material-icons text-base">calendar_today</span>{dateStr ? new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}</span>
          <span className="flex items-center gap-1"><span className="material-icons text-base">schedule</span>{readMinutes(article)} min read</span>
        </div>
      </div>
      {(reviewedBy || reviewedAt) && (
        <p className="mt-4 flex items-center gap-1 text-sm text-slate-500"><span className="material-icons text-base text-emerald-600">verified</span>Reviewed{reviewedBy && reviewedBy !== author ? ` by ${reviewedBy}` : ""}{reviewedAt ? ` • ${reviewedAt}` : ""}</p>
      )}
    </div>
  );
}

export function ReferencesBlock({ article }: { article: Article }) {
  const references = article.sources?.map((s) => ({ title: s.title, url: s.url })) || [];
  if (!references.length) return null;
  return (
    <div className="mt-10 rounded-2xl bg-[#eff6ff] p-6"><h3 className="mb-3 text-sm font-semibold text-slate-900">References & sources</h3><ul className="space-y-2">{references.map((ref, i) => (<li key={i}><a href={ref.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-700 transition-colors hover:text-slate-900"><span className="material-icons text-base">open_in_new</span>{ref.title}</a></li>))}</ul></div>
  );
}

export function TagsBlock({ article }: { article: Article }) {
  const tags = article.tags || [];
  return (
    <div className="mt-10 flex flex-wrap gap-2">{tags.length === 0 ? <EmptyState moduleName="Tags" /> : tags.map((tag) => (<span key={tag} className="rounded-full bg-[#eff6ff] px-3 py-1.5 text-xs font-medium text-slate-600">{tag}</span>))}</div>
  );
}

export function CtaBanner({ article }: { article: Article }) {
  const title = article.ctaBox?.title || "Have a dental question?";
  const subtitle = article.ctaBox?.subtitle || "Dr. Ekta is here to help. Schedule a consultation for personalised advice.";
  const button = article.ctaBox?.buttonLabel || "Book Appointment";
  return (
    <div className="mt-12 rounded-[24px] bg-slate-950 p-8 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">Private consultation</p>
      <h3 className="mt-3 heading-lg text-white">{title}</h3>
      <p className="body-md mx-auto mt-3 max-w-2xl text-white/70">{subtitle}</p>
      <a href="https://www.practo.com/delhi/doctor/dr-ekta-narula" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-900 transition-colors hover:bg-slate-100"><span className="material-icons text-base">calendar_month</span>{button}</a>
    </div>
  );
}

export function DisclaimerBlock({ article }: { article: Article }) {
  return (
    <div className="mt-10 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/40 dark:bg-amber-900/10">
      <span className="material-icons text-amber-600">medical_information</span>
      <p className="body-sm">{article.disclaimer || "This article is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult Dr. Ekta Narula or your dentist with questions about a dental condition."}</p>
    </div>
  );
}

export function TocCard({ headings, title }: { headings: string[]; title?: string }) {
  if (headings.length < 2) return null;
  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200/80">
      <h3 className="eyebrow mb-3">{title || "In this article"}</h3>
      <ol className="space-y-1.5">
        {headings.map((h, i) => (
          <li key={i}><a href={`#${slugify(h)}`} className="text-sm text-slate-700 transition-colors hover:text-slate-900"><span className="mr-2 font-semibold text-slate-400">{String(i + 1).padStart(2, "0")}</span>{h}</a></li>
        ))}
      </ol>
    </div>
  );
}

export function BackLink() {
  return <Link href="/knowledge" className="mb-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600 transition-colors hover:text-slate-900"><span className="material-icons text-base">arrow_back</span>Back to Knowledge Centre</Link>;
}

export function CategoryEyebrow({ article }: { article: Article }) {
  return (
    <div className="inline-flex items-center gap-3">
      <span className="h-px w-8 bg-slate-900" />
      <span className="eyebrow">{mapCategory(article.category)}</span>
    </div>
  );
}
