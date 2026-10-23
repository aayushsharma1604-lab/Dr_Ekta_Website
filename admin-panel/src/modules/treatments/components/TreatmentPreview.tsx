"use client";

import { useState } from "react";
import { X, Monitor, Tablet, Smartphone } from "lucide-react";

export type PreviewFaq = { id: string; question: string; answer: string };

export interface TreatmentPreviewData {
  title: string;
  slug: string;
  icon: string;
  metaDescription: string;
  bgImageUrl: string;
  coverImageUrl: string;
  whatIs: string;
  whoNeeds: string;
  problems: string[];
  benefits: string[];
  procedure: string;
  painful: string;
  duration: string;
  recovery: string;
  risks: string;
  expectations: string;
  whyDrEkta: string;
  faqs: PreviewFaq[];
  status: string;
}

type Viewport = "desktop" | "tablet" | "mobile";

const VIEWPORT_WIDTH: Record<Viewport, string> = {
  desktop: "max-w-5xl",
  tablet: "max-w-[768px]",
  mobile: "max-w-[375px]",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="heading-lg text-center">{children}</h2>;
}

function RichText({ text }: { text: string }) {
  if (!text.trim()) return <p className="body-sm italic text-zinc-400">Not filled yet — add content in the editor.</p>;
  return <div className="body-md whitespace-pre-line">{text}</div>;
}

function PreviewBody({ data }: { data: TreatmentPreviewData }) {
  return (
    <div className="flex flex-col bg-white text-left dark:bg-zinc-900">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {data.bgImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.bgImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-sky-100" />
        )}
        <div className="absolute inset-0 bg-white/70 dark:bg-zinc-900/70" />
        <div className="relative mx-auto grid max-w-5xl items-center gap-8 px-6 py-14 md:grid-cols-2">
          <div>
            <p className="mb-3 inline-block rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">/treatments/{data.slug || "…"}</p>
            <h1 className="heading-xl">{data.title || "Untitled Treatment"}</h1>
            {data.metaDescription && <p className="body-lg mt-4">{data.metaDescription}</p>}
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-sky-600 px-6 py-3 text-sm font-medium text-white">
              <span className="material-icons text-base">calendar_month</span>Book Appointment
            </div>
          </div>
          <div>
            {data.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.coverImageUrl} alt={data.title} className="aspect-square w-full rounded-3xl object-cover shadow-lg" />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded-3xl bg-zinc-100 text-sm text-zinc-400">No cover photo — add one in Hero Section</div>
            )}
          </div>
        </div>
      </section>

      {/* What / Who */}
      <section className="mx-auto grid w-full max-w-5xl gap-8 px-6 py-12 md:grid-cols-2">
        <div><h2 className="heading-lg">What is <span className="gradient-text">{data.title || "this treatment"}?</span></h2><div className="mt-4"><RichText text={data.whatIs} /></div></div>
        <div><h2 className="heading-lg">Who <span className="gradient-text">Needs It?</span></h2><div className="mt-4"><RichText text={data.whoNeeds} /></div></div>
      </section>

      {/* Problems */}
      <section className="bg-zinc-50 px-6 py-12 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-5xl">
          <SectionTitle>Problems <span className="gradient-text">We Address</span></SectionTitle>
          {data.problems.length > 0 ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.problems.map((p, i) => (<div key={i} className="card"><p className="body-md">{p}</p></div>))}
            </div>
          ) : <p className="mt-8 text-center text-sm italic text-zinc-400">No problems added yet.</p>}
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto w-full max-w-5xl px-6 py-12">
        <SectionTitle>Benefits of <span className="gradient-text">{data.title || "Treatment"}</span></SectionTitle>
        {data.benefits.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {data.benefits.map((b, i) => (<div key={i} className="card"><p className="body-md">{b}</p></div>))}
          </div>
        ) : <p className="mt-8 text-center text-sm italic text-zinc-400">No benefits added yet.</p>}
      </section>

      {/* Procedure cards */}
      <section className="bg-zinc-50 px-6 py-12 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-5xl">
          <SectionTitle>Procedure & <span className="gradient-text">Details</span></SectionTitle>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[["The Procedure", data.procedure], ["Is It Painful?", data.painful], ["Duration", data.duration], ["Recovery", data.recovery], ["Risks & Limitations", data.risks]].map(([t, v]) => (
              <div key={t} className="card"><h3 className="heading-sm">{t}</h3><div className="body-sm mt-2 whitespace-pre-line"><RichText text={v} /></div></div>
            ))}
          </div>
        </div>
      </section>

      {/* Expectations */}
      <section className="mx-auto w-full max-w-5xl px-6 py-12">
        <h2 className="heading-lg">What to <span className="gradient-text">Expect</span></h2>
        <div className="body-lg mt-4"><RichText text={data.expectations} /></div>
        <h2 className="heading-lg mt-10">Why <span className="gradient-text">Dr. Ekta?</span></h2>
        <div className="body-lg mt-4"><RichText text={data.whyDrEkta} /></div>
      </section>

      {/* FAQs */}
      <section className="bg-zinc-50 px-6 py-12 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-3xl">
          <SectionTitle>Frequently Asked <span className="gradient-text">Questions</span></SectionTitle>
          {data.faqs.filter((f) => f.question).length === 0 ? (
            <p className="mt-8 text-center text-sm italic text-zinc-400">No FAQs added yet.</p>
          ) : (
            <div className="mt-8 space-y-3">
              {data.faqs.filter((f) => f.question).map((f) => (
                <details key={f.id} className="card">
                  <summary className="cursor-pointer font-medium text-zinc-900 dark:text-white">{f.question}</summary>
                  <p className="body-sm mt-2 whitespace-pre-line">{f.answer}</p>
                </details>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export function TreatmentPreviewModal({ data, onClose }: { data: TreatmentPreviewData; onClose: () => void }) {
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const tabs: { id: Viewport; label: string; icon: typeof Monitor }[] = [
    { id: "desktop", label: "Desktop", icon: Monitor },
    { id: "tablet", label: "Tablet", icon: Tablet },
    { id: "mobile", label: "Mobile", icon: Smartphone },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-100 dark:bg-zinc-950">
      {/* Preview toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-zinc-200 bg-white px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900">
        <button onClick={onClose} className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300">
          <X size={14} /> Close Preview
        </button>
        <span className="hidden h-5 w-px bg-zinc-200 dark:bg-zinc-700 sm:block" />
        <span className="inline-flex items-center gap-2 text-sm">
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700">Live Preview</span>
          <span className="max-w-[280px] truncate font-medium text-zinc-800 dark:text-zinc-100">{data.title || "Untitled"}</span>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${data.status === "Published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{data.status}</span>
        </span>
        <div className="ml-auto flex items-center gap-1 rounded-full border border-zinc-200 p-1 dark:border-zinc-700">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = viewport === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setViewport(t.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${active ? "bg-emerald-600 text-white" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
              >
                <Icon size={14} />{t.label}
              </button>
            );
          })}
        </div>
      </div>
      {/* Viewport frame */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className={`mx-auto overflow-hidden rounded-2xl border border-zinc-300 bg-white shadow-xl transition-all dark:border-zinc-700 ${VIEWPORT_WIDTH[viewport]}`}>
          <div className="flex items-center gap-1.5 border-b border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="ml-2 truncate text-xs text-zinc-500">/treatments/{data.slug || "…"}</span>
          </div>
          <PreviewBody data={data} />
        </div>
        <p className="mt-3 text-center text-xs text-zinc-400">Draft preview — nothing is published. Save Treatment to persist changes.</p>
      </div>
    </div>
  );
}
