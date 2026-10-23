"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Stethoscope, ArrowLeft, Clock, Pencil, Star, Info, Bookmark, Eye } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchListRequest, createRequest, updateRequest, fetchOneRequest } from "./treatments.slice";
import { TreatmentSectionsSidebar, TreatmentSection } from "./components/TreatmentSectionsSidebar";
import { RichTextBlock, ListEditor } from "./components/TreatmentEditors";
import { IconField } from "./components/IconField";
import { Dropzone, DropzoneValue } from "./components/Dropzone";
import { TreatmentPreviewModal, TreatmentPreviewData } from "./components/TreatmentPreview";
import { SpinnerCustom } from "@/components/ui/spinner";
import { toast } from "sonner";

type Faq = { id: string; question: string; answer: string };

const defaultFaqs: Faq[] = [
  { id: "f1", question: "How long does the treatment take?", answer: "Typically 1-2 visits depending on complexity." },
  { id: "f2", question: "Is it painful?", answer: "No — performed under local anaesthesia, minimal discomfort." },
];

const defaultSections: TreatmentSection[] = [
  { id: "s-page", type: "pageSettings", label: "Page Settings" },
  { id: "s-hero", type: "hero", label: "Hero Section" },
  { id: "s-whatIs", type: "whatIs", label: "What Is" },
  { id: "s-whoNeeds", type: "whoNeeds", label: "Who Needs It" },
  { id: "s-problems", type: "problems", label: "Problems" },
  { id: "s-benefits", type: "benefits", label: "Benefits" },
  { id: "s-procedure", type: "procedure", label: "Procedure" },
  { id: "s-painful", type: "painful", label: "Is It Painful?" },
  { id: "s-duration", type: "duration", label: "Duration" },
  { id: "s-recovery", type: "recovery", label: "Recovery" },
  { id: "s-risks", type: "risks", label: "Risks & Limitations" },
  { id: "s-expectations", type: "expectations", label: "What to Expect" },
  { id: "s-whyDrEkta", type: "whyDrEkta", label: "Why Dr. Ekta?" },
  { id: "s-faqs", type: "faqs", label: "FAQs" },
];

const CATALOG_TABS = ["All Services", "Laser & Energy", "Injectables", "Facials & Peels", "Hair"] as const;
const CARD_CATEGORIES = ["Laser & Energy", "Hair & Skin", "Facials & Peels"] as const;
const MOCK_PRICING = [
  { single: "$350.00", pack: "$900.00", save: "Save $150" },
  { single: "$280.00", pack: "$1,000.00", save: "Save $120" },
  { single: "$150.00", pack: "$400.00", save: "Save $50" },
] as const;

function getCardCategory(idx: number): string {
  return CARD_CATEGORIES[idx % CARD_CATEGORIES.length];
}
function getCardBadge(idx: number): { label: string; icon: string } | null {
  if (idx % 3 === 0) return { label: "15%", icon: "◷" };
  if (idx % 3 === 1) return { label: "Bestseller", icon: "★" };
  return { label: "New", icon: "✦" };
}
function getDuration(idx: number): string {
  return `${[60, 45, 30][idx % 3]} mins`;
}
function toSku(slug: string, id: string): string {
  const prefix = slug.slice(0, 4).replace(/-/g, "").toUpperCase().padEnd(4, "X");
  const suffix = id.slice(-2).toUpperCase();
  return `SKU-${prefix}${suffix}`;
}
function getImageUrl(t: { heroImageUrl?: string; coverImageUrl?: string; heroImage?: unknown; gallery?: unknown }): string {
  if (typeof t.heroImage === "object" && t.heroImage && "url" in (t.heroImage as Record<string, unknown>)) return String((t.heroImage as { url: string }).url);
  const gallery = Array.isArray(t.gallery) ? t.gallery : [];
  const cover = gallery[0];
  if (typeof cover === "object" && cover && "url" in (cover as Record<string, unknown>)) return String((cover as { url: string }).url);
  if (t.coverImageUrl) return t.coverImageUrl;
  if (t.heroImageUrl) return t.heroImageUrl;
  return "";
}

/** Extract a { id, url } reference from a populated MediaAsset, raw ObjectId, or legacy value */
function toImageRef(input: unknown): DropzoneValue {
  if (!input) return { id: null, url: "" };
  if (typeof input === "object") {
    const o = input as Record<string, unknown>;
    const url = String(o.optimizedUrl || o.url || "");
    const rawId = o._id;
    const id = typeof rawId === "string" ? rawId : typeof rawId === "object" && rawId !== null && "$oid" in (rawId as object) ? String((rawId as { $oid: string }).$oid) : null;
    return { id, url };
  }
  if (typeof input === "string" && /^[a-f0-9]{24}$/i.test(input)) return { id: input, url: "" };
  if (typeof input === "string") return { id: null, url: input };
  return { id: null, url: "" };
}

/** Normalize a slug the same way the backend requires (lowercase, a-z0-9-) */
function normalizeSlug(slug: string): string {
  return slug.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export function Treatments() {
  const dispatch = useAppDispatch();
  const { items, loading, item } = useAppSelector((s) => (s as unknown as { treatments: { items: never[]; loading: boolean; item: unknown } }).treatments);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All Services");
  const [editing, setEditing] = useState<null | { _id?: string; title: string; slug: string }>(null);
  const [activeSectionId, setActiveSectionId] = useState("s-page");
  const [status, setStatus] = useState("Published");
  const [sections, setSections] = useState<TreatmentSection[]>(defaultSections);

  const [pageData, setPageData] = useState({ title: "Full Mouth Rehabilitation", slug: "full-mouth-rehabilitation", icon: "dentistry", metaTitle: "Full Mouth Rehabilitation | Dr. Ekta Narula", metaDescription: "Complete restoration with implants, crowns and veneers." });
  const [heroImages, setHeroImages] = useState<{ bgImage: DropzoneValue; coverImage: DropzoneValue }>({ bgImage: { id: null, url: "" }, coverImage: { id: null, url: "" } });
  const [whatIs, setWhatIs] = useState("Full mouth rehabilitation is a comprehensive treatment plan that restores every tooth in your mouth.");
  const [whoNeeds, setWhoNeeds] = useState("You may need this if you:\n\n• Have multiple missing teeth\n• Struggle to chew or speak");
  const [problems, setProblems] = useState(["Multiple missing teeth", "Severely worn teeth", "Difficulty chewing", "Jaw pain / TMJ", "Sunken face", "Collapsed bite", "Gum disease", "Full transformation"]);
  const [benefits, setBenefits] = useState(["Complete restoration", "Permanent results", "Full chewing power", "Preserves jawbone", "Confidence boost", "Digital plan"]);
  const [procedure, setProcedure] = useState("Step 1 — Consultation & 3D planning\nStep 2 — Temporary trial smile\nStep 3 — Definitive treatment\nStep 4 — Final smile");
  const [painful, setPainful] = useState("Performed under local anaesthesia with sedation options.");
  const [duration, setDuration] = useState("2 to 6 months depending on implants.");
  const [recovery, setRecovery] = useState("Day 1-3: Mild swelling\nWeek 1: Subsides\n3-6 months: Integration");
  const [risks, setRisks] = useState("High success rate with 3D planning. Rare risks: infection, sinus proximity.");
  const [expectations, setExpectations] = useState("Natural, fully functional smile lasting 15-20+ years.");
  const [whyDrEkta, setWhyDrEkta] = useState("Dr. Ekta brings 15+ years and prosthetic expertise.");
  const [faqs, setFaqs] = useState<Faq[]>(defaultFaqs);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => { dispatch(fetchListRequest({})); }, [dispatch]);

  useEffect(() => {
    if (!item) return;
    const t = item as unknown as { _id: string; title: string; slug: string; icon?: string; problems?: string[]; benefits?: string[]; heroImage?: unknown; gallery?: unknown[]; heroImageUrl?: string; coverImageUrl?: string; sections?: { what?: string; who?: string; procedure?: string; pain?: string; recovery?: string; risks?: string; duration?: string; expectations?: string; whyDrEkta?: string }; faqs?: { question: string; answer: string }[]; seo?: { metaTitle?: string; metaDescription?: string }; status?: string };
    setPageData({ title: t.title || "", slug: t.slug || "", icon: t.icon || "dentistry", metaTitle: t.seo?.metaTitle || "", metaDescription: t.seo?.metaDescription || "" });
    // heroImage -> Background slot, gallery[0] -> Cover slot (legacy URL fields as fallback)
    const bg = toImageRef(t.heroImage ?? t.heroImageUrl);
    const galleryArr = Array.isArray(t.gallery) ? t.gallery : [];
    const cover = toImageRef(galleryArr[0] ?? t.coverImageUrl);
    // Backfill preview URLs when the API returns bare IDs
    setHeroImages({ bgImage: bg, coverImage: cover });
    if (t.problems) setProblems(t.problems);
    if (t.benefits) setBenefits(t.benefits);
    if (t.sections) {
      setWhatIs(t.sections.what || "");
      setWhoNeeds(t.sections.who || "");
      setProcedure(t.sections.procedure || "");
      setPainful(t.sections.pain || "");
      setRecovery(t.sections.recovery || "");
      setRisks(t.sections.risks || "");
      setDuration(t.sections.duration || "");
      setExpectations(t.sections.expectations || "");
      setWhyDrEkta(t.sections.whyDrEkta || "");
    }
    if (t.faqs) setFaqs(t.faqs.map((f, i) => ({ id: `f${i}`, question: f.question, answer: f.answer })));
    if (t.status) setStatus(t.status === "published" ? "Published" : "Draft");
  }, [item]);

  const list = (items as unknown as { _id: string; title: string; slug: string; status: string; heroImageUrl?: string; coverImageUrl?: string; heroImage?: unknown; gallery?: unknown; sections?: { what?: string } }[]) || [];
  const filtered = list.filter((t, idx) => {
    const matchesSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.slug.toLowerCase().includes(search.toLowerCase()) || toSku(t.slug, t._id).toLowerCase().includes(search.toLowerCase());
    const cat = getCardCategory(idx);
    const matchesCat = activeCategory === "All Services" || cat === activeCategory || (activeCategory === "Laser & Energy" && cat === "Laser & Energy") || (activeCategory === "Injectables" && idx % 5 === 1) || (activeCategory === "Facials & Peels" && cat === "Facials & Peels") || (activeCategory === "Hair" && cat === "Hair & Skin");
    return matchesSearch && matchesCat;
  });

  const openEditor = (treatment: { _id?: string; title: string; slug: string }) => {
    if (treatment._id) {
      dispatch(fetchOneRequest(treatment._id as never));
    } else {
      setPageData({ title: treatment.title, slug: treatment.slug, icon: "dentistry", metaTitle: `${treatment.title} | Dr. Ekta Narula`, metaDescription: "" });
      // Fresh form for a new treatment — don't carry over previous images
      setHeroImages({ bgImage: { id: null, url: "" }, coverImage: { id: null, url: "" } });
    }
    setEditing(treatment);
    setActiveSectionId("s-page");
    setSections(defaultSections);
  };

  const handleSave = () => {
    // Images live in the Media Library; only their IDs are referenced.
    // External (non-library) URLs cannot be stored as heroImage/gallery ObjectIds.
    if (heroImages.bgImage.url && !heroImages.bgImage.id) {
      toast.error("Background image is an external URL — upload it to the Media Library (or pick from Library) to save it.");
      return;
    }
    if (heroImages.coverImage.url && !heroImages.coverImage.id) {
      toast.error("Cover photo is an external URL — upload it to the Media Library (or pick from Library) to save it.");
      return;
    }
    const payload = {
      title: pageData.title,
      slug: normalizeSlug(pageData.slug),
      icon: pageData.icon,
      problems: problems.filter((p) => p.trim()),
      benefits: benefits.filter((b) => b.trim()),
      // Background -> heroImage, Cover -> gallery[0]
      heroImage: heroImages.bgImage.id || undefined,
      gallery: heroImages.coverImage.id ? [heroImages.coverImage.id] : [],
      sections: {
        what: whatIs,
        who: whoNeeds,
        procedure,
        pain: painful,
        recovery,
        risks,
        duration,
        expectations,
        whyDrEkta,
      },
      faqs: faqs.filter((f) => f.question).map((f, i) => ({ question: f.question, answer: f.answer, order: i })),
      seo: { metaTitle: pageData.metaTitle?.slice(0, 60), metaDescription: pageData.metaDescription?.slice(0, 160) },
      status: status.toLowerCase(),
    };
    if (editing?._id) {
      dispatch(updateRequest({ id: editing._id, ...payload } as never));
    } else {
      dispatch(createRequest(payload as never));
    }
  };

  const activeSection = sections.find((s) => s.id === activeSectionId);

  const previewData: TreatmentPreviewData = {
    title: pageData.title,
    slug: normalizeSlug(pageData.slug),
    icon: pageData.icon,
    metaDescription: pageData.metaDescription,
    bgImageUrl: heroImages.bgImage.url,
    coverImageUrl: heroImages.coverImage.url,
    whatIs,
    whoNeeds,
    problems: problems.filter((p) => p.trim()),
    benefits: benefits.filter((b) => b.trim()),
    procedure,
    painful,
    duration,
    recovery,
    risks,
    expectations,
    whyDrEkta,
    faqs,
    status,
  };

  const renderEditor = () => {
    if (!activeSection) return null;
    switch (activeSection.type) {
      case "pageSettings":
        return (
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-white">Page Settings</h3>
            <p className="mb-4 text-xs text-zinc-500">SEO and hero content for this treatment page</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Treatment Title *</label>
                <input value={pageData.title} onChange={(e) => setPageData({ ...pageData, title: e.target.value })} className="w-full rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Slug *</label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-zinc-400">/treatments/</span>
                  <input value={pageData.slug} onChange={(e) => setPageData({ ...pageData, slug: e.target.value })} className="flex-1 rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white" />
                </div>
              </div>
              <IconField value={pageData.icon} onChange={(v) => setPageData({ ...pageData, icon: v })} />
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Meta Title (max 60)</label>
                <input value={pageData.metaTitle} onChange={(e) => setPageData({ ...pageData, metaTitle: e.target.value })} className="w-full rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Meta Description (max 160)</label>
                <textarea value={pageData.metaDescription} onChange={(e) => setPageData({ ...pageData, metaDescription: e.target.value })} rows={2} className="w-full rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white" />
              </div>
            </div>
          </div>
        );
      case "hero":
        return (
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-white">Hero Section</h3>
            <p className="mb-4 text-xs text-zinc-500">Hero background and cover photo</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Dropzone label="Background Image" value={heroImages.bgImage} onChange={(v) => setHeroImages({ ...heroImages, bgImage: v })} hint="Hero background — PNG/JPG/WEBP" />
              <Dropzone label="Cover Photo" value={heroImages.coverImage} onChange={(v) => setHeroImages({ ...heroImages, coverImage: v })} hint="Right side square image" />
            </div>
          </div>
        );
      case "whatIs": return <RichTextBlock title="What Is" subtitle="What is this treatment? — left column" value={whatIs} onChange={setWhatIs} placeholder="Describe what this treatment is..." />;
      case "whoNeeds": return <RichTextBlock title="Who Needs It" subtitle="Right column — use • for bullets" value={whoNeeds} onChange={setWhoNeeds} placeholder="You may need this if..." />;
      case "problems": return <ListEditor title="Problems" subtitle="Problems We Address — 3-col card grid" items={problems} onChange={setProblems} placeholder="e.g. Missing teeth" />;
      case "benefits": return <ListEditor title="Benefits" subtitle="Benefits — 2-col card grid" items={benefits} onChange={setBenefits} placeholder="e.g. Permanent solution" />;
      case "procedure": return <RichTextBlock title="The Procedure" value={procedure} onChange={setProcedure} rows={8} />;
      case "painful": return <RichTextBlock title="Is It Painful?" value={painful} onChange={setPainful} rows={4} />;
      case "duration": return <RichTextBlock title="Duration" value={duration} onChange={setDuration} rows={4} />;
      case "recovery": return <RichTextBlock title="Recovery" value={recovery} onChange={setRecovery} rows={4} />;
      case "risks": return <RichTextBlock title="Risks & Limitations" value={risks} onChange={setRisks} rows={4} />;
      case "expectations": return <RichTextBlock title="What to Expect" value={expectations} onChange={setExpectations} rows={4} />;
      case "whyDrEkta": return <RichTextBlock title="Why Dr. Ekta?" value={whyDrEkta} onChange={setWhyDrEkta} rows={4} />;
      case "faqs":
        return (
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">FAQs</h3>
            <div className="space-y-3">
              {faqs.map((f, idx) => (
                <div key={f.id} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-500">FAQ {idx + 1}</span>
                    <button onClick={() => setFaqs(faqs.filter((x) => x.id !== f.id))} className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600">✕</button>
                  </div>
                  <input value={f.question} onChange={(e) => setFaqs(faqs.map((x) => x.id === f.id ? { ...x, question: e.target.value } : x))} placeholder="Question" className="mb-2 w-full rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white" />
                  <textarea value={f.answer} onChange={(e) => setFaqs(faqs.map((x) => x.id === f.id ? { ...x, answer: e.target.value } : x))} rows={2} placeholder="Answer" className="w-full rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white" />
                </div>
              ))}
            </div>
            <button onClick={() => setFaqs([...faqs, { id: Date.now().toString(), question: "", answer: "" }])} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-blue-300 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400">+ Add FAQ</button>
          </div>
        );
      default: return null;
    }
  };

  if (editing) {
    return (
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button onClick={() => setEditing(null)} className="flex items-center gap-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400">
            <ArrowLeft size={14} /> Back to Treatments
          </button>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{pageData.title}</h2>
          <span className="text-xs text-zinc-500">/treatments/{pageData.slug}</span>
          <button onClick={() => setShowPreview(true)} className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"><Eye size={14} /> Preview</button>
          <button onClick={handleSave} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save Treatment</button>
        </div>
        {showPreview && <TreatmentPreviewModal data={previewData} onClose={() => setShowPreview(false)} />}
        <div className="flex flex-col gap-4 lg:flex-row">
          <TreatmentSectionsSidebar sections={sections} activeId={activeSectionId} onSelect={setActiveSectionId} onDelete={(id) => setSections(sections.filter((s) => s.id !== id))} status={status} onStatusChange={setStatus} />
          <div className="flex-1">{renderEditor()}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header — Treatments & Services Catalog */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[22px] font-bold leading-none text-zinc-900 dark:text-white">Treatments & Services Catalog</h2>
          <p className="mt-1.5 max-w-[560px] text-sm leading-5 text-zinc-500">Manage dermatological procedures, pricing, duration, and active promotional packages for Dr. Ekta Narula&apos;s Clinic.</p>
        </div>
        <button onClick={() => openEditor({ title: "New Treatment", slug: `new-treatment-${Date.now()}` })} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900">
          <Plus size={14} /> Add New Treatment
        </button>
      </div>

      {/* Stats row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">Total Procedures <Info size={12} className="text-zinc-400" /></div>
          <div className="mt-2 flex items-baseline gap-2"><span className="text-2xl font-bold text-zinc-900 dark:text-white">{list.length}</span><span className="text-xs font-medium text-emerald-600">+{Math.max(1, Math.floor(list.length / 3))} this month</span></div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">Active Promotions <Info size={12} className="text-zinc-400" /></div>
          <div className="mt-2 flex items-baseline gap-2"><span className="text-2xl font-bold text-zinc-900 dark:text-white">{list.filter((t) => t.status === "published").length || 6}</span><span className="text-xs text-zinc-500">Special bundles</span></div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">Avg. Session Duration <Info size={12} className="text-zinc-400" /></div>
          <div className="mt-2 flex items-baseline gap-2"><span className="text-2xl font-bold text-zinc-900 dark:text-white">45m</span><span className="text-xs text-zinc-500">Across all tiers</span></div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">Catalog Status <Info size={12} className="text-zinc-400" /></div>
          <div className="mt-2 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /><span className="text-sm font-semibold text-zinc-900 dark:text-white">Synced</span><span className="text-xs text-zinc-500">Online booking live</span></div>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col gap-3 border-b border-zinc-200 pb-3 dark:border-zinc-800 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {CATALOG_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveCategory(tab)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${activeCategory === tab ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative w-full shrink-0 lg:w-[320px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input type="text" placeholder="Search treatments, SKU, or tag" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-full border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-300 focus:ring-2 focus:ring-zinc-900/5 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
        </div>
      </div>

      {loading && <SpinnerCustom />}

      {/* Cards — image top, category + duration overlay, pricing, Active in Booking */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 && !loading ? (
          <p className="col-span-full py-12 text-center text-sm text-zinc-500">No treatments found. Create one with &quot;Add New Treatment&quot;.</p>
        ) : (
          filtered.map((treatment, idx) => {
            const img = getImageUrl(treatment as never) || `https://images.unsplash.com/photo-${idx % 2 === 0 ? "1588776814546-1ffcf47267a5" : "1559757148-5c350d0d3c56"}?q=80&w=600&auto=format&fit=crop`;
            const category = getCardCategory(idx);
            const badge = getCardBadge(idx);
            const pricing = MOCK_PRICING[idx % MOCK_PRICING.length];
            const sku = toSku(treatment.slug, treatment._id);
            const shortDesc = (treatment as { sections?: { what?: string } }).sections?.what?.slice(0, 98) || `Advanced ${treatment.title.toLowerCase()} targeting deep concerns, fine lines and texture.`;
            const isPublished = treatment.status === "published";
            return (
              <div key={treatment._id} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                <div className="relative h-[190px] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={treatment.title} className="h-full w-full object-cover" />
                  {badge && (
                    <div className="absolute left-1/2 top-3 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-900 shadow">
                      <span className="text-[11px]">{badge.icon}</span> {badge.label}
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-2.5">
                    <span className="rounded-full bg-zinc-900/75 px-3 py-1 text-xs font-medium text-white backdrop-blur">{category}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 shadow"><Clock size={12} /> {getDuration(idx)}</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[15px] font-semibold leading-tight text-zinc-900 dark:text-white">{treatment.title}</h3>
                    <span className="shrink-0 rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-500 dark:bg-zinc-800">SKU-{sku.split("-")[1]}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                    <span className="rounded bg-sky-50 px-1.5 py-0.5 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400">{treatment.slug.slice(0, 8).toUpperCase()}</span>
                    <span>{sku}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-5 text-zinc-500">{shortDesc}</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[11px] font-medium text-zinc-500">Single Session</p>
                      <p className="text-[15px] font-bold text-zinc-900 dark:text-white">{pricing.single}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-medium text-zinc-500">Package (3 Sessions)</p>
                      <p className="text-[15px] font-bold text-zinc-900 dark:text-white">{pricing.pack} <span className="text-xs font-medium text-emerald-600">{pricing.save}</span></p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                      <span className={`h-2 w-2 rounded-full ${isPublished ? "bg-emerald-500" : "bg-amber-500"}`} /> {isPublished ? "Active in Booking" : "Draft — Not live"}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditor({ _id: treatment._id, title: treatment.title, slug: treatment.slug })} className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"><Pencil size={14} /></button>
                      <button onClick={() => openEditor({ _id: treatment._id, title: treatment.title, slug: treatment.slug })} className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"><Bookmark size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
