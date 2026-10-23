"use client";

import { useState } from "react";
import { X, Monitor, Tablet, Smartphone } from "lucide-react";

export interface TeamPreviewData {
  name: string;
  slug: string;
  role: string;
  category: string;
  bio: string;
  layout: string;
  photoUrl: string;
  qualifications: { degree: string; institution: string; year?: number }[];
  experienceYears: number | null;
  languages: string[];
  consultationFee: number | null;
  location: string;
  services: string[];
  reviews: { patientName: string; rating: number; text: string }[];
}

type Viewport = "desktop" | "tablet" | "mobile";

const VIEWPORT_WIDTH: Record<Viewport, string> = {
  desktop: "max-w-5xl",
  tablet: "max-w-[768px]",
  mobile: "max-w-[375px]",
};

function StatsStrip({ data }: { data: TeamPreviewData }) {
  const stats: [string, string][] = [
    ["Experience", data.experienceYears != null ? `${data.experienceYears} years` : "—"],
    ["Languages", data.languages.length ? data.languages.join(", ") : "—"],
    ["Location", data.location || "—"],
    ["Consultation fee", data.consultationFee != null ? `₹${data.consultationFee}` : "—"],
  ];
  return (
    <div className="grid grid-cols-2 gap-4 border-t border-zinc-200 pt-6 sm:grid-cols-4">
      {stats.map(([k, v]) => (
        <div key={k} className="border-l border-zinc-200 pl-3">
          <p className="text-xs text-zinc-500">{k}</p>
          <p className="mt-0.5 text-sm font-bold text-zinc-900">{v}</p>
        </div>
      ))}
    </div>
  );
}

function QualList({ data }: { data: TeamPreviewData }) {
  if (!data.qualifications.length) return <p className="text-sm italic text-zinc-400">No qualifications added yet.</p>;
  return (
    <div className="space-y-4">
      {data.qualifications.map((q, i) => (
        <div key={i} className="flex items-start gap-3">
          <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-teal-600" />
          <div><p className="text-sm font-semibold text-zinc-900">{q.degree || "Qualification"}</p><p className="text-xs text-zinc-500">{[q.institution, q.year ? String(q.year) : ""].filter(Boolean).join(" · ")}</p></div>
        </div>
      ))}
    </div>
  );
}

function ServiceChips({ data }: { data: TeamPreviewData }) {
  if (!data.services.length) return <p className="text-sm italic text-zinc-400">No services added yet.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {data.services.map((s) => (<span key={s} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">{s}</span>))}
    </div>
  );
}

function BookingMock({ data }: { data: TeamPreviewData }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const times = ["10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <h3 className="font-semibold text-zinc-900">Book an appointment</h3>
      <p className="mt-0.5 text-xs text-zinc-500">{data.consultationFee != null ? `₹${data.consultationFee} per consultation` : "Fee on request"}</p>
      <p className="mb-2 mt-4 text-xs font-semibold text-zinc-700">Choose a day</p>
      <div className="grid grid-cols-5 gap-1.5">{days.map((d, i) => (<span key={d} className={`rounded-lg border px-1 py-2 text-center text-xs ${i === 0 ? "border-teal-600 bg-teal-50 font-semibold text-teal-700" : "text-zinc-500"}`}>{d}</span>))}</div>
      <p className="mb-2 mt-4 text-xs font-semibold text-zinc-700">Choose a time</p>
      <div className="grid grid-cols-3 gap-1.5">{times.map((t, i) => (<span key={t} className={`rounded-lg border px-1 py-2 text-center text-xs ${i === 1 ? "border-teal-600 bg-teal-50 font-semibold text-teal-700" : "text-zinc-500"}`}>{t}</span>))}</div>
      <span className="mt-4 block rounded-lg bg-teal-700 py-2.5 text-center text-sm font-medium text-white">Confirm booking</span>
    </div>
  );
}

function Photo({ url, name, className }: { url: string; name: string; className?: string }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name} className={className} />;
  }
  return <div className={`flex items-center justify-center bg-teal-50 text-4xl font-bold text-teal-600 ${className || ""}`}>{name.split(" ").map((w) => w[0]).slice(0, 2).join("") || "DR"}</div>;
}

function PreviewBody({ data }: { data: TeamPreviewData }) {
  const name = data.name || "Dr. Name";
  const roleLine = `${data.role || "Role"} · ${data.category || "Department"}`;

  if (data.layout === "sanctuary-editorial") {
    return (
      <div className="flex flex-col bg-white p-6 text-left sm:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-700">{data.category || "Doctor"}</p>
        <h1 className="mt-2 font-serif text-4xl text-zinc-900">{name}</h1>
        <p className="mt-2 text-zinc-500">{roleLine}</p>
        <Photo url={data.photoUrl} name={name} className="mt-6 aspect-[16/9] w-full rounded-2xl object-cover" />
        {data.bio && <p className="mt-6 leading-relaxed text-zinc-700">{data.bio}</p>}
        <h3 className="mb-3 mt-8 text-sm font-semibold text-zinc-900">Education & Experience</h3>
        <QualList data={data} />
        <h3 className="mb-3 mt-8 text-sm font-semibold text-zinc-900">Conditions & Services</h3>
        <ServiceChips data={data} />
      </div>
    );
  }

  if (data.layout === "compact-card") {
    return (
      <div className="flex flex-col items-center bg-white p-8 text-center">
        <Photo url={data.photoUrl} name={name} className="h-32 w-32 rounded-full object-cover ring-4 ring-teal-50" />
        <h1 className="mt-4 text-2xl font-bold text-zinc-900">{name}</h1>
        <p className="mt-1 text-sm font-medium text-teal-700">{data.role || "Role"}</p>
        <p className="text-xs text-zinc-500">{data.category}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-zinc-600">
          <span>{data.experienceYears != null ? `${data.experienceYears}+ yrs` : "—"}</span>
          <span>·</span><span>{data.languages.join(", ") || "—"}</span>
          <span>·</span><span>{data.consultationFee != null ? `₹${data.consultationFee}` : "—"}</span>
        </div>
        {data.bio && <p className="mt-4 max-w-md text-sm text-zinc-600">{data.bio}</p>}
        <span className="mt-5 rounded-full bg-teal-700 px-6 py-2.5 text-sm font-medium text-white">Book appointment</span>
        <div className="mt-6 w-full max-w-md text-left"><ServiceChips data={data} /></div>
      </div>
    );
  }

  if (data.layout === "timeline") {
    return (
      <div className="flex flex-col bg-white p-6 text-left sm:p-8">
        <div className="flex items-center gap-4">
          <Photo url={data.photoUrl} name={name} className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
          <div><h1 className="text-2xl font-bold text-zinc-900">{name}</h1><p className="text-sm text-zinc-500">{roleLine}</p></div>
        </div>
        <h3 className="mb-4 mt-8 text-sm font-semibold text-zinc-900">Career Journey</h3>
        <div className="relative ml-2 space-y-6 border-l-2 border-teal-100 pl-6">
          {data.qualifications.length ? data.qualifications.map((q, i) => (
            <div key={i} className="relative">
              <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-teal-600" />
              <p className="text-sm font-semibold text-zinc-900">{q.degree || "Milestone"}</p>
              <p className="text-xs text-zinc-500">{[q.institution, q.year ? String(q.year) : ""].filter(Boolean).join(" · ")}</p>
            </div>
          )) : <p className="text-sm italic text-zinc-400">Add qualifications to build the timeline.</p>}
        </div>
        {data.bio && <p className="mt-6 text-sm leading-relaxed text-zinc-700">{data.bio}</p>}
      </div>
    );
  }

  if (data.layout === "gallery-spotlight") {
    return (
      <div className="flex flex-col bg-white text-left">
        <div className="relative">
          <Photo url={data.photoUrl} name={name} className="aspect-[16/9] w-full object-cover" />
          <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/90 p-4 backdrop-blur">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-700">{data.category}</p>
            <h1 className="text-2xl font-bold text-zinc-900">{name}</h1>
            <p className="text-sm text-zinc-500">{roleLine}</p>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {[["Experience", data.experienceYears != null ? `${data.experienceYears} yrs` : "—"], ["Fee", data.consultationFee != null ? `₹${data.consultationFee}` : "—"], ["Languages", data.languages.slice(0, 2).join(", ") || "—"], ["Location", data.location || "—"]].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-zinc-50 p-3"><p className="text-xs text-zinc-500">{k}</p><p className="mt-0.5 truncate text-sm font-semibold text-zinc-900">{v}</p></div>
            ))}
          </div>
          {data.bio && <p className="mt-5 text-sm leading-relaxed text-zinc-700">{data.bio}</p>}
          <h3 className="mb-2 mt-6 text-sm font-semibold text-zinc-900">Services</h3>
          <ServiceChips data={data} />
        </div>
      </div>
    );
  }

  // classic-profile (reference design)
  return (
    <div className="flex flex-col bg-zinc-50 p-4 text-left sm:p-6">
      <p className="mb-3 px-1 text-xs text-zinc-500">Doctors / {data.category || "[Specialty]"} / Dr. {name.replace(/^Dr\.\s*/i, "") || "[Name]"}</p>
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex flex-col gap-5 sm:flex-row">
          <Photo url={data.photoUrl} name={name} className="h-44 w-40 shrink-0 rounded-2xl bg-teal-50 object-cover" />
          <div className="min-w-0 flex-1">
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">{data.category || "[Specialty]"}</span>
            <h1 className="mt-2 text-3xl font-bold text-zinc-900">{name.startsWith("Dr.") ? name : `Dr. ${name}` || "Dr. [Name]"}</h1>
            <p className="mt-1 text-sm text-zinc-500">{[data.qualifications[0]?.degree || "[Qualification]", data.location ? `${data.location}` : "[Hospital / Department]"].join(" · ")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-lg bg-teal-700 px-5 py-2 text-sm font-medium text-white">Book appointment</span>
              <span className="rounded-lg border border-teal-700 px-5 py-2 text-sm font-medium text-teal-700">Call clinic</span>
            </div>
          </div>
        </div>
        <StatsStrip data={data} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex gap-5 border-b border-zinc-200 text-sm font-medium">
            {["About", "Experience", "Services", "Reviews"].map((t, i) => (
              <span key={t} className={`pb-2 ${i === 0 ? "border-b-2 border-teal-700 text-teal-800" : "text-zinc-500"}`}>{t}</span>
            ))}
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h3 className="font-semibold text-zinc-900">About</h3>
            <p className="mt-2 text-sm text-zinc-600">{data.bio || "[Bio paragraph about the doctor, approach to care and focus areas]"}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h3 className="font-semibold text-zinc-900">Education and experience</h3>
            <div className="mt-3"><QualList data={data} /></div>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h3 className="font-semibold text-zinc-900">Conditions and services</h3>
            <div className="mt-3"><ServiceChips data={data} /></div>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h3 className="font-semibold text-zinc-900">Patient reviews</h3>
            {data.reviews.length ? (
              <div className="mt-3 space-y-4">
                {data.reviews.map((r, i) => (
                  <div key={i} className="border-b border-zinc-100 pb-3 last:border-0 last:pb-0">
                    <div className="mb-1 flex gap-0.5">{[...Array(Math.min(5, Math.max(1, r.rating || 5)))].map((_, s) => (<span key={s} className="text-sm text-amber-500">★</span>))}</div>
                    {r.text ? <p className="text-sm text-zinc-700">&ldquo;{r.text}&rdquo;</p> : null}
                    <p className="mt-1 text-xs text-zinc-500">{r.patientName || "Patient"}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm italic text-zinc-400">No reviews added yet — add them in the editor.</p>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <BookingMock data={data} />
          <div className="rounded-2xl bg-teal-50 p-5">
            <h3 className="text-sm font-semibold text-zinc-900">Clinic details</h3>
            <p className="mt-2 text-sm text-zinc-600">{data.location || "[Clinic address]"}</p>
            <p className="text-sm text-zinc-600">[Phone number]</p>
            <p className="text-sm text-zinc-600">[Opening hours]</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TeamPreviewModal({ data, onClose }: { data: TeamPreviewData; onClose: () => void }) {
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const tabs: { id: Viewport; label: string; icon: typeof Monitor }[] = [
    { id: "desktop", label: "Desktop", icon: Monitor },
    { id: "tablet", label: "Tablet", icon: Tablet },
    { id: "mobile", label: "Mobile", icon: Smartphone },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-100 dark:bg-zinc-950">
      <div className="flex flex-wrap items-center gap-3 border-b border-zinc-200 bg-white px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900">
        <button onClick={onClose} className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300">
          <X size={14} /> Close Preview
        </button>
        <span className="hidden h-5 w-px bg-zinc-200 dark:bg-zinc-700 sm:block" />
        <span className="inline-flex items-center gap-2 text-sm">
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700">Live Preview</span>
          <span className="max-w-[280px] truncate font-medium text-zinc-800 dark:text-zinc-100">{data.name || "Untitled"}</span>
          <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-700">{data.layout}</span>
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
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className={`mx-auto overflow-hidden rounded-2xl border border-zinc-300 bg-white shadow-xl transition-all dark:border-zinc-700 ${VIEWPORT_WIDTH[viewport]}`}>
          <div className="flex items-center gap-1.5 border-b border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="ml-2 truncate text-xs text-zinc-500">/team/{data.slug || "…"}</span>
          </div>
          <PreviewBody data={data} />
        </div>
        <p className="mt-3 text-center text-xs text-zinc-400">Draft preview — nothing is published. Save to persist changes.</p>
      </div>
    </div>
  );
}
