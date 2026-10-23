"use client";

export interface ArticlePreviewData {
  title: string;
  slug: string;
  category: string;
  author: string;
  credentialsDisplay: string;
  excerpt: string;
  body: string;
  layout: string;
  coverUrl: string;
  beforeUrl: string;
  afterUrl: string;
  keyPoints: string[];
  faqs: { question: string; answer: string }[];
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButton: string;
  reviewedAt: string;
  tags: string[];
  sources: { title: string; url: string }[];
  status: string;
  quickSummary: string;
  pullQuote: string;
  warnings: string[];
  checklist: string[];
  pros: string[];
  cons: string[];
  whenToConsult: string;
  chartTitle: string;
  chartLabels: string[];
  chartValues: number[];
  galleryUrls: string[];
  disclaimer: string;
  abstract: string;
  audience: string;
  preparation: string;
  keyFindings: string[];
  dos: string[];
  donts: string[];
  symptoms: string[];
  causes: string[];
  riskFactors: string[];
  warningSigns: string[];
  markers: { name: string; description: string; unit: string; range: string; interpretation: string; factors: string }[];
}

export function inline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

export function tocOf(body: string): string[] {
  return body.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("## ")).map((l) => l.slice(3));
}

export function renderLines(lines: string[], prefix: string) {
  const elements: React.ReactNode[] = [];
  let inList = false;
  let items: React.ReactNode[] = [];
  const flush = () => {
    if (inList && items.length) {
      elements.push(<ul key={`${prefix}-ul-${elements.length}`} className="my-3 space-y-1.5">{items}</ul>);
      items = [];
      inList = false;
    }
  };
  lines.forEach((line, i) => {
    const t = line.trim();
    if (!t) { flush(); return; }
    if (t.startsWith("## ")) { flush(); elements.push(<h2 key={`${prefix}-${i}`} className="mb-2 mt-6 text-xl font-bold text-zinc-900">{t.slice(3)}</h2>); return; }
    if (t.startsWith("### ")) { flush(); elements.push(<h3 key={`${prefix}-${i}`} className="mb-1 mt-4 text-base font-semibold text-zinc-900">{t.slice(4)}</h3>); return; }
    if (t.startsWith("• ") || t.startsWith("- ")) {
      inList = true;
      items.push(<li key={`${prefix}-${i}`} className="flex items-start gap-2 text-sm text-zinc-700"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" /><span dangerouslySetInnerHTML={{ __html: inline(t.slice(2)) }} /></li>);
      return;
    }
    const num = t.match(/^(\d+)\.\s+(.+)/);
    if (num) {
      inList = true;
      items.push(<li key={`${prefix}-${i}`} className="flex items-start gap-2 text-sm text-zinc-700"><span className="font-bold text-teal-700">{num[1]}.</span><span dangerouslySetInnerHTML={{ __html: inline(num[2]) }} /></li>);
      return;
    }
    flush();
    if (t.startsWith("|")) return;
    elements.push(<p key={`${prefix}-${i}`} className="mb-3 text-sm text-zinc-700" dangerouslySetInnerHTML={{ __html: inline(t) }} />);
  });
  flush();
  return elements;
}

export function HeaderBlock({ data, centered }: { data: ArticlePreviewData; centered?: boolean }) {
  return (
    <div className={centered ? "text-center" : ""}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-700">{data.category || "Article"}</p>
      <h1 className={`mt-2 font-bold text-zinc-900 ${centered ? "text-4xl" : "text-3xl"}`}>{data.title || "Untitled Article"}</h1>
      {data.excerpt && <p className={`mt-3 text-zinc-600 ${centered ? "mx-auto max-w-2xl" : ""}`}>{data.excerpt}</p>}
      <div className={`mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-zinc-50 p-4 ${centered ? "mx-auto max-w-xl justify-center" : ""}`}>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700">👤</div>
        <div className="text-left"><p className="text-sm font-semibold text-zinc-900">{data.author || "Dr. Ekta Narula"}</p><p className="text-xs text-zinc-500">{data.credentialsDisplay}</p></div>
        {data.reviewedAt && <span className="ml-auto text-xs text-zinc-500">Reviewed • {data.reviewedAt}</span>}
      </div>
    </div>
  );
}

export function CoverBlock({ data, wide }: { data: ArticlePreviewData; wide?: boolean }) {
  if (!data.coverUrl) return <div className="mt-6 flex h-40 items-center justify-center rounded-2xl bg-zinc-100 text-sm text-zinc-400">No cover image — add one in the editor</div>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={data.coverUrl} alt={data.title} className={`mt-6 w-full rounded-2xl object-cover ${wide ? "aspect-video" : "max-h-72"}`} />;
}

export function TakeawaysTocGrid({ data }: { data: ArticlePreviewData }) {
  const toc = tocOf(data.body);
  if (!data.keyPoints.length && toc.length < 2) return null;
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      {data.keyPoints.length > 0 && (
        <div className="rounded-2xl bg-teal-50/60 p-5">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-700">Key Takeaways</h3>
          <ul className="space-y-1.5">{data.keyPoints.map((k, i) => (<li key={i} className="flex items-start gap-2 text-sm text-zinc-700"><span className="text-emerald-600">✓</span>{k}</li>))}</ul>
        </div>
      )}
      {toc.length > 1 && (
        <div className="rounded-2xl border border-zinc-200 p-5">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">In This Article</h3>
          <ol className="space-y-1">{toc.map((h, i) => (<li key={i} className="text-sm text-teal-700"><span className="mr-2 font-semibold">{String(i + 1).padStart(2, "0")}</span>{h}</li>))}</ol>
        </div>
      )}
    </div>
  );
}

export function FaqBlock({ data }: { data: ArticlePreviewData }) {
  const faqs = data.faqs.filter((f) => f.question.trim());
  if (!faqs.length) return null;
  return (
    <div className="mt-8">
      <h2 className="text-center text-xl font-bold text-zinc-900">Frequently Asked Questions</h2>
      <div className="mt-4 space-y-2">
        {faqs.map((f, i) => (
          <details key={i} className="rounded-xl border border-zinc-200 bg-white p-4">
            <summary className="cursor-pointer text-sm font-medium text-zinc-900">{f.question}</summary>
            <p className="mt-1 whitespace-pre-line text-sm text-zinc-600">{f.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

export function CtaBlock({ data }: { data: ArticlePreviewData }) {
  return (
    <div className="mt-8 rounded-2xl bg-teal-700 p-6 text-center text-white">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">Private Consultation</p>
      <h3 className="mt-1 text-lg font-bold">{data.ctaTitle || "Have a dental question?"}</h3>
      <p className="mt-1 text-sm text-white/80">{data.ctaSubtitle || "Dr. Ekta is here to help. Schedule a consultation."}</p>
      <span className="mt-3 inline-block rounded-full bg-white px-5 py-2 text-sm font-medium text-teal-700">{data.ctaButton || "Book Appointment"}</span>
    </div>
  );
}

export function ExtraBlocks({ data }: { data: ArticlePreviewData }) {
  return (
    <>
      {data.quickSummary && (
        <div className="mt-6 rounded-2xl border border-teal-200 bg-teal-50/60 p-5">
          <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-700">Quick Summary</h3>
          <p className="text-sm text-zinc-700">{data.quickSummary}</p>
        </div>
      )}
      {data.abstract && (
        <div className="mt-6 rounded-2xl bg-zinc-900 p-5 text-white">
          <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">Abstract</h3>
          <p className="text-sm text-white/90">{data.abstract}</p>
        </div>
      )}
      {data.keyFindings.length > 0 && (
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Key Findings</h3>
          <ul className="space-y-1.5">{data.keyFindings.map((k, i) => (<li key={i} className="flex items-start gap-2 text-sm text-zinc-700"><span className="font-bold text-teal-700">{i + 1}.</span>{k}</li>))}</ul>
        </div>
      )}
      {(data.audience || data.preparation) && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {data.audience && <div className="rounded-2xl bg-zinc-50 p-5"><h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Who Is This For</h3><p className="mt-1 text-sm text-zinc-700">{data.audience}</p></div>}
          {data.preparation && <div className="rounded-2xl bg-zinc-50 p-5"><h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Preparation</h3><p className="mt-1 text-sm text-zinc-700">{data.preparation}</p></div>}
        </div>
      )}
      {data.pullQuote && (
        <blockquote className="my-6 border-l-4 border-teal-500 pl-4 text-lg italic text-zinc-800">&ldquo;{data.pullQuote}&rdquo;</blockquote>
      )}
      {data.warnings.length > 0 && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h3 className="mb-1 text-sm font-semibold text-red-700">Important</h3>
          <ul className="space-y-1">{data.warnings.map((w, i) => (<li key={i} className="text-sm text-red-900">• {w}</li>))}</ul>
        </div>
      )}
      {data.checklist.length > 0 && (
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Checklist</h3>
          <ul className="space-y-1.5">{data.checklist.map((c, i) => (<li key={i} className="flex items-start gap-2 text-sm text-zinc-700"><span className="text-teal-600">✓</span>{c}</li>))}</ul>
        </div>
      )}
      {(data.pros.length > 0 || data.cons.length > 0) && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-emerald-50 p-5"><h3 className="text-sm font-semibold text-emerald-700">Pros</h3><ul className="mt-1 space-y-1">{data.pros.map((p, i) => (<li key={i} className="text-sm text-zinc-700">✓ {p}</li>))}</ul></div>
          <div className="rounded-2xl bg-red-50 p-5"><h3 className="text-sm font-semibold text-red-700">Cons</h3><ul className="mt-1 space-y-1">{data.cons.map((c, i) => (<li key={i} className="text-sm text-zinc-700">✕ {c}</li>))}</ul></div>
        </div>
      )}
      {data.whenToConsult && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h3 className="text-sm font-semibold text-red-700">When To Consult a Doctor</h3>
          <p className="mt-1 text-sm text-zinc-700">{data.whenToConsult}</p>
        </div>
      )}
      {data.chartTitle && data.chartLabels.length > 0 && data.chartValues.length > 0 && (
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-zinc-900">{data.chartTitle}</h3>
          <div className="flex h-32 items-end gap-2">
            {data.chartLabels.map((l, i) => {
              const max = Math.max(...data.chartValues, 1);
              return (
                <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                  <span className="text-[11px] font-semibold text-teal-700">{data.chartValues[i] ?? "—"}</span>
                  <div className="flex w-full flex-1 items-end rounded-t bg-teal-50"><div className="w-full rounded-t bg-teal-600" style={{ height: `${Math.max(4, ((data.chartValues[i] || 0) / max) * 100)}%` }} /></div>
                  <span className="truncate text-[10px] text-zinc-500">{l}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {data.galleryUrls.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-2">
          {data.galleryUrls.map((g, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={g} alt={`Gallery ${i + 1}`} className="aspect-square w-full rounded-xl object-cover" />
          ))}
        </div>
      )}
      {data.markers.length > 0 && (
        <div className="mt-6 space-y-3">
          {data.markers.map((m, i) => (
            <div key={i} className="rounded-2xl border border-zinc-200 bg-white p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold text-zinc-900">{m.name}</h3>
                {m.unit && <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">{m.unit}</span>}
              </div>
              {m.description && <p className="mt-1 text-sm text-zinc-700">{m.description}</p>}
              {m.range && <p className="mt-2 text-sm text-zinc-700"><strong>Reference range:</strong> {m.range}</p>}
              {m.interpretation && <p className="mt-1 text-sm text-zinc-700"><strong>What it means:</strong> {m.interpretation}</p>}
              {m.factors && <p className="mt-1 text-xs text-zinc-500">Influenced by: {m.factors}</p>}
            </div>
          ))}
        </div>
      )}
      {(data.symptoms.length > 0 || data.causes.length > 0 || data.riskFactors.length > 0 || data.warningSigns.length > 0) && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[["Symptoms", data.symptoms, "teal"], ["Possible causes", data.causes, "teal"], ["Risk factors", data.riskFactors, "amber"], ["Warning signs", data.warningSigns, "red"]].map(([t, arr, color]) => (
            (arr as string[]).length > 0 && (
              <div key={t as string} className="rounded-2xl border border-zinc-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-zinc-900">{t}</h3>
                <ul className="mt-2 space-y-1">{(arr as string[]).map((x, i) => (<li key={i} className={`text-sm text-zinc-700 ${color === "red" ? "font-medium text-red-800" : ""}`}>• {x}</li>))}</ul>
              </div>
            )
          ))}
        </div>
      )}
      {(data.dos.length > 0 || data.donts.length > 0) && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-emerald-50 p-5"><h3 className="text-sm font-semibold text-emerald-700">Do&apos;s</h3><ul className="mt-1 space-y-1">{data.dos.map((x, i) => (<li key={i} className="text-sm text-zinc-700">✓ {x}</li>))}</ul></div>
          <div className="rounded-2xl bg-red-50 p-5"><h3 className="text-sm font-semibold text-red-700">Don&apos;ts</h3><ul className="mt-1 space-y-1">{data.donts.map((x, i) => (<li key={i} className="text-sm text-zinc-700">✕ {x}</li>))}</ul></div>
        </div>
      )}
      {data.disclaimer && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs text-amber-900">{data.disclaimer}</p>
        </div>
      )}
      {data.sources.length > 0 && (
        <div className="mt-6 rounded-2xl bg-zinc-50 p-5">
          <h3 className="mb-2 text-sm font-semibold text-zinc-900">References & Sources</h3>
          <ul className="space-y-1">{data.sources.map((s, i) => (<li key={i} className="text-sm text-teal-700">{s.title || s.url}</li>))}</ul>
        </div>
      )}
      {data.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">{data.tags.map((t) => (<span key={t} className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">{t}</span>))}</div>
      )}
    </>
  );
}
