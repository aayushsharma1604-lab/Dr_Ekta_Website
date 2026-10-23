"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { Pencil, BarChart3, Search, Eye, Award, AlertTriangle, FileText, Check, X, Info, ImageIcon, Plus, Trash2 } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchListRequest, createRequest, updateRequest, fetchOneRequest, deleteRequest } from "@/modules/articles/articles.slice";
import { Dropzone, DropzoneValue } from "@/modules/treatments/components/Dropzone";
import { SpinnerCustom } from "@/components/ui/spinner";
import { ArticlePreviewModal, ArticlePreviewData } from "@/modules/articles/ArticlePreview";

type Article = {
  _id: string;
  title: string;
  category: string;
  author?: string;
  status?: string;
  body?: string;
  createdAt?: string;
  updatedAt?: string;
  // optional fields — shown only if your API returns them
  views?: number;
  seoScore?: number;
  coverImage?: string;
  seo?: { ogImage?: { _id?: string; url?: string; optimizedUrl?: string } | string } | null;
};

function resolveCoverImage(a: Article): string | null {
  const og = a.seo?.ogImage;
  if (og) {
    if (typeof og === "string") {
      // populated MediaAsset URL vs raw ObjectId — only render real URLs
      if (/^https?:\/\//i.test(og) || og.startsWith("/") || og.startsWith("data:")) return og;
    } else {
      const url = og.optimizedUrl || og.url;
      if (url) return url;
    }
  }
  if (a.coverImage && (/^https?:\/\//i.test(a.coverImage) || a.coverImage.startsWith("/"))) return a.coverImage;
  return null;
}

const categories = [
  { value: "preventive-care", label: "Preventive Care", short: "Preventive" },
  { value: "restorative", label: "Restorative", short: "Restorative" },
  { value: "cosmetic", label: "Cosmetic", short: "Skincare" },
  { value: "orthodontics", label: "Orthodontics", short: "Post-Op Care" },
  { value: "oral-surgery", label: "Oral Surgery", short: "Laser Safety" },
  { value: "pediatric", label: "Pediatric", short: "Pediatric" },
  { value: "emergency", label: "Emergency", short: "Emergency" },
  { value: "technology", label: "Technology", short: "Anti-Aging" },
  { value: "patient-education", label: "Patient Education", short: "Education" },
];

const TABS = ["All Resources", "Skincare", "Laser Safety", "Post-Op Care", "Anti-Aging"] as const;

function tabToCategory(tab: string): string | null {
  if (tab === "Skincare") return "cosmetic";
  if (tab === "Laser Safety") return "oral-surgery";
  if (tab === "Post-Op Care") return "orthodontics";
  if (tab === "Anti-Aging") return "technology";
  return null;
}

function categoryShort(cat: string): string {
  return categories.find((c) => c.value === cat)?.short || cat;
}
function categoryColor(cat: string): string {
  if (cat === "orthodontics" || cat === "post-op") return "bg-teal-600 text-white";
  if (cat === "cosmetic") return "bg-emerald-600 text-white";
  if (cat === "oral-surgery") return "bg-amber-500 text-white";
  if (cat === "technology") return "bg-purple-600 text-white";
  return "bg-zinc-800 text-white";
}
function seoColor(score: number): string {
  if (score >= 90) return "text-emerald-600";
  if (score >= 80) return "text-amber-600";
  return "text-red-500";
}
function seoBg(score: number): string {
  if (score >= 90) return "bg-emerald-50";
  if (score >= 80) return "bg-amber-50";
  return "bg-red-50";
}

function timeAgo(date?: string): string | null {
  if (!date) return null;
  const t = new Date(date).getTime();
  if (Number.isNaN(t)) return null;
  const mins = Math.floor((Date.now() - t) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

function formatViews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function KnowledgePage() {
  const dispatch = useAppDispatch();
  const { items, loading, item, error } = useAppSelector(
    (s) => (s as unknown as { articles: { items: unknown[]; loading: boolean; item: unknown; error?: unknown } }).articles
  );

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("All Resources");

  // editor state (empty by default — nothing hardcoded)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [draftMode, setDraftMode] = useState(true);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("cosmetic");
  const [author, setAuthor] = useState("Dr. Ekta Narula");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  // Batch 3 — missing fields: tags, sources, cover image (seo.ogImage), SEO meta, credentialsDisplay
  const [tagsInput, setTagsInput] = useState("");
  const [coverImage, setCoverImage] = useState<DropzoneValue>({ id: null, url: "" });
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [credentialsDisplay, setCredentialsDisplay] = useState("BDS (Gold Medalist), 15+ Years Experience");
  const [sources, setSources] = useState<{ title: string; url: string; authors: string; publishedDate: string }[]>([]);
  // Article page fields: key takeaways, FAQs, CTA banner, reviewed date
  const [keyPointsInput, setKeyPointsInput] = useState("");
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [ctaTitle, setCtaTitle] = useState("");
  const [ctaSubtitle, setCtaSubtitle] = useState("");
  const [ctaButton, setCtaButton] = useState("");
  const [reviewedAt, setReviewedAt] = useState("");
  const [quickSummary, setQuickSummary] = useState("");
  const [pullQuote, setPullQuote] = useState("");
  const [warningsInput, setWarningsInput] = useState("");
  const [checklistInput, setChecklistInput] = useState("");
  const [prosInput, setProsInput] = useState("");
  const [consInput, setConsInput] = useState("");
  const [whenToConsult, setWhenToConsult] = useState("");
  const [chartTitle, setChartTitle] = useState("");
  const [chartLabels, setChartLabels] = useState("");
  const [chartValues, setChartValues] = useState("");
  const [gallery, setGallery] = useState<DropzoneValue[]>([{ id: null, url: "" }, { id: null, url: "" }, { id: null, url: "" }]);
  const [disclaimer, setDisclaimer] = useState("");
  // spec template fields: guide prep, report markers, symptoms blocks, deep-dive research
  const [abstract, setAbstract] = useState("");
  const [audience, setAudience] = useState("");
  const [preparation, setPreparation] = useState("");
  const [keyFindingsInput, setKeyFindingsInput] = useState("");
  const [dosInput, setDosInput] = useState("");
  const [dontsInput, setDontsInput] = useState("");
  const [symptomsInput, setSymptomsInput] = useState("");
  const [causesInput, setCausesInput] = useState("");
  const [riskFactorsInput, setRiskFactorsInput] = useState("");
  const [warningSignsInput, setWarningSignsInput] = useState("");
  const [markers, setMarkers] = useState<{ name: string; description: string; unit: string; range: string; interpretation: string; factors: string }[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  // layout picker (Choose a layout dialog)
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const [pickedLayout, setPickedLayout] = useState<string>("standard");
  const [layout, setLayout] = useState<string>("standard");
  const [beforeImage, setBeforeImage] = useState<DropzoneValue>({ id: null, url: "" });
  const [afterImage, setAfterImage] = useState<DropzoneValue>({ id: null, url: "" });

const ARTICLE_LAYOUTS = [
  { value: "standard", name: "Standard Medical Article", desc: "General health education, awareness and wellness posts.", thumb: "lines" },
  { value: "health-guide", name: "Step-by-Step Health Guide", desc: "Prep guides with steps, do's and don'ts, checklists.", thumb: "steps" },
  { value: "report-analysis", name: "Medical Report Analysis", desc: "Test markers with units, ranges and interpretations.", thumb: "chart" },
  { value: "symptoms", name: "Symptoms and Conditions", desc: "Symptoms, causes, risk factors and warning signs.", thumb: "guide" },
  { value: "clinical-deep-dive", name: "Clinical Deep Dive", desc: "Evidence summaries, findings, charts and citations.", thumb: "hero" },
] as const;

function layoutBodyTemplate(l: string): string {
  if (l === "step-by-step" || l === "health-guide") return "## Step 1\n\nDescribe the first step.\n\n## Step 2\n\nDescribe the second step.\n";
  if (l === "medical-guide") return "## Symptoms\n\nDescribe the symptoms.\n\n## Causes\n\nDescribe the causes.\n\n## Treatment\n\nDescribe the treatment.\n";
  if (l === "symptoms") return "## Overview\n\nDescribe the condition.\n\n## Common Symptoms\n\nList the symptoms.\n\n## When to Seek Care\n\nUrgent signs.\n";
  if (l === "report-analysis") return "## Purpose of the Test\n\nWhy this test is done.\n\n## How to Read Your Report\n\nExplain the sections.\n\n## Limitations\n\nWhat the report cannot show.\n";
  if (l === "research" || l === "clinical-deep-dive") return "## Findings\n\nSummarize the evidence.\n\n## Limitations\n\nNote the limitations.\n";
  if (l === "storytelling") return "## The Beginning\n\nTell the story.\n\n## The Turning Point\n\nWhat changed.\n";
  return "";
}

  // save tracking + feedback
  const [saveStatus, setSaveStatus] = useState<"idle" | "waiting" | "saving">("idle");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchListRequest({}));
  }, [dispatch]);

  // after a create/update request finishes: refresh list, show result, clear form on success
  useEffect(() => {
    if (saveStatus === "waiting" && loading) setSaveStatus("saving");
    if (saveStatus === "saving" && !loading) {
      setSaveStatus("idle");
      if (error) {
        setMessage({ type: "error", text: "Could not save the article. Please try again." });
      } else {
        setMessage({ type: "success", text: "Article saved successfully." });
        resetEditor();
        dispatch(fetchListRequest({}));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, saveStatus]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  useEffect(() => {
    if (!item) return;
    const a = item as unknown as Article & { tags?: string[]; sources?: { title: string; url: string; authors?: string; publishedDate?: string }[]; seo?: { metaTitle?: string; metaDescription?: string; ogImage?: { _id: string; url: string; optimizedUrl?: string } | string }; credentialsDisplay?: string };
    setEditingId(a._id);
    setTitle(a.title || "");
    setCategory(a.category || "cosmetic");
    setAuthor(a.author || "Dr. Ekta Narula");
    setExcerpt((a as unknown as { excerpt?: string }).excerpt || a.body?.slice(0, 160) || "");
    setBody(a.body || "");
    setDraftMode((a.status || "draft") === "draft");
    setTagsInput((a.tags || []).join(", "));
    setSources((a.sources || []).map((s) => ({ title: s.title || "", url: s.url || "", authors: s.authors || "", publishedDate: s.publishedDate ? new Date(s.publishedDate as unknown as string).toISOString().slice(0, 10) : "" })));
    setCredentialsDisplay((a as unknown as { credentialsDisplay?: string }).credentialsDisplay || "BDS (Gold Medalist), 15+ Years Experience");
    const og = (a as unknown as { seo?: { ogImage?: unknown } }).seo?.ogImage;
    if (og) {
      if (typeof og === "string") setCoverImage({ id: og, url: "" });
      else {
        const o = og as { _id: string; url: string; optimizedUrl?: string };
        setCoverImage({ id: o._id || null, url: o.url || o.optimizedUrl || "" });
      }
    } else {
      // legacy coverImage field
      const legacy = (a as unknown as { coverImage?: string }).coverImage;
      if (legacy) setCoverImage({ id: null, url: legacy });
      else setCoverImage({ id: null, url: "" });
    }
    setSeoTitle((a as unknown as { seo?: { metaTitle?: string } }).seo?.metaTitle || "");
    setSeoDescription((a as unknown as { seo?: { metaDescription?: string } }).seo?.metaDescription || "");
    const ax = a as unknown as { keyPoints?: string[]; faqs?: { question: string; answer: string }[]; ctaBox?: { title?: string; subtitle?: string; buttonLabel?: string }; reviewedAt?: string };
    setKeyPointsInput((ax.keyPoints || []).join("\n"));
    setFaqs((ax.faqs || []).map((f) => ({ question: f.question || "", answer: f.answer || "" })));
    setCtaTitle(ax.ctaBox?.title || "");
    setCtaSubtitle(ax.ctaBox?.subtitle || "");
    setCtaButton(ax.ctaBox?.buttonLabel || "");
    setReviewedAt(ax.reviewedAt ? new Date(ax.reviewedAt).toISOString().slice(0, 10) : "");
    setQuickSummary((ax as unknown as { quickSummary?: string }).quickSummary || "");
    setPullQuote((ax as unknown as { pullQuote?: string }).pullQuote || "");
    setWarningsInput(((ax as unknown as { warnings?: string[] }).warnings || []).join("\n"));
    setChecklistInput(((ax as unknown as { checklist?: string[] }).checklist || []).join("\n"));
    setProsInput(((ax as unknown as { pros?: string[] }).pros || []).join("\n"));
    setConsInput(((ax as unknown as { cons?: string[] }).cons || []).join("\n"));
    setWhenToConsult((ax as unknown as { whenToConsult?: string }).whenToConsult || "");
    const ch = (ax as unknown as { chartData?: { title?: string; labels?: string[]; values?: number[] } }).chartData;
    setChartTitle(ch?.title || "");
    setChartLabels((ch?.labels || []).join(", "));
    setChartValues((ch?.values || []).join(", "));
    const gx = (ax as unknown as { galleryImages?: unknown }).galleryImages;
    if (Array.isArray(gx)) {
      const refs = gx.slice(0, 3).map((g) => {
        if (!g) return { id: null, url: "" };
        if (typeof g === "string") return /^[a-f0-9]{24}$/i.test(g) ? { id: g, url: "" } : { id: null, url: g };
        const o = g as { _id?: string; url?: string; optimizedUrl?: string };
        return { id: o._id || null, url: o.optimizedUrl || o.url || "" };
      });
      while (refs.length < 3) refs.push({ id: null, url: "" });
      setGallery(refs as DropzoneValue[]);
    } else {
      setGallery([{ id: null, url: "" }, { id: null, url: "" }, { id: null, url: "" }]);
    }
    setDisclaimer((ax as unknown as { disclaimer?: string }).disclaimer || "");
    setLayout((ax as unknown as { layout?: string }).layout || "standard");
    const toRef = (v: unknown): DropzoneValue => {
      if (!v) return { id: null, url: "" };
      if (typeof v === "string") return /^[a-f0-9]{24}$/i.test(v) ? { id: v, url: "" } : { id: null, url: v };
      const o = v as { _id?: string; url?: string; optimizedUrl?: string };
      return { id: o._id || null, url: o.optimizedUrl || o.url || "" };
    };
    const bx = a as unknown as { beforeImage?: unknown; afterImage?: unknown };
    setBeforeImage(toRef(bx.beforeImage));
    setAfterImage(toRef(bx.afterImage));
    const cx = ax as unknown as {
      abstract?: string; audience?: string; preparation?: string; keyFindings?: string[];
      dos?: string[]; donts?: string[]; symptoms?: string[]; causes?: string[];
      riskFactors?: string[]; warningSigns?: string[];
      markers?: { name?: string; description?: string; unit?: string; range?: string; interpretation?: string; factors?: string }[];
    };
    setAbstract(cx.abstract || "");
    setAudience(cx.audience || "");
    setPreparation(cx.preparation || "");
    setKeyFindingsInput((cx.keyFindings || []).join("\n"));
    setDosInput((cx.dos || []).join("\n"));
    setDontsInput((cx.donts || []).join("\n"));
    setSymptomsInput((cx.symptoms || []).join("\n"));
    setCausesInput((cx.causes || []).join("\n"));
    setRiskFactorsInput((cx.riskFactors || []).join("\n"));
    setWarningSignsInput((cx.warningSigns || []).join("\n"));
    setMarkers((cx.markers || []).map((m) => ({ name: m.name || "", description: m.description || "", unit: m.unit || "", range: m.range || "", interpretation: m.interpretation || "", factors: m.factors || "" })));
  }, [item]);

  const list = useMemo(() => (Array.isArray(items) ? (items as unknown as Article[]) : []), [items]);

  // strict filtering — no fallback rows
  const filtered = useMemo(() => {
    let r = list;
    const cat = tabToCategory(activeTab);
    if (cat) r = r.filter((a) => a.category === cat);
    const q = search.trim().toLowerCase();
    if (q) {
      r = r.filter(
        (a) => (a.title || "").toLowerCase().includes(q) || (a.category || "").toLowerCase().includes(q)
      );
    }
    return r;
  }, [list, activeTab, search]);

  // stats computed only from API data
  const stats = useMemo(() => {
    const total = list.length;
    const pending = list.filter((a) => (a.status || "draft") === "draft").length;
    const withViews = list.filter((a) => typeof a.views === "number");
    const totalViews = withViews.length ? withViews.reduce((s, a) => s + (a.views as number), 0) : null;
    const withSeo = list.filter((a) => typeof a.seoScore === "number");
    const avgSeo = withSeo.length
      ? Math.round(withSeo.reduce((s, a) => s + (a.seoScore as number), 0) / withSeo.length)
      : null;
    return { total, pending, totalViews, avgSeo };
  }, [list]);

  // SEO health check computed from what's typed in the editor
  const seoChecks = useMemo(() => {
    const t = title.trim().length;
    const e = excerpt.trim().length;
    return [
      { ok: t >= 30 && t <= 65, label: "Title length is optimal (30–65 characters)" },
      { ok: e >= 120 && e <= 160, label: "Excerpt / meta description length optimal (120–160)" },
      { ok: !!title.trim() && !!excerpt.trim(), label: "Title and excerpt are filled in" },
    ];
  }, [title, excerpt]);
  const seoScore = Math.round((seoChecks.filter((c) => c.ok).length / seoChecks.length) * 100);

  const resetEditor = () => {
    setEditingId(null);
    setShowEditor(false);
    setTitle("");
    setCategory("cosmetic");
    setAuthor("Dr. Ekta Narula");
    setExcerpt("");
    setBody("");
    setDraftMode(true);
    setTagsInput("");
    setCoverImage({ id: null, url: "" });
    setSeoTitle("");
    setSeoDescription("");
    setCredentialsDisplay("BDS (Gold Medalist), 15+ Years Experience");
    setSources([]);
    setKeyPointsInput("");
    setFaqs([]);
    setCtaTitle("");
    setCtaSubtitle("");
    setCtaButton("");
    setReviewedAt("");
    setQuickSummary("");
    setPullQuote("");
    setWarningsInput("");
    setChecklistInput("");
    setProsInput("");
    setConsInput("");
    setWhenToConsult("");
    setChartTitle("");
    setChartLabels("");
    setChartValues("");
    setGallery([{ id: null, url: "" }, { id: null, url: "" }, { id: null, url: "" }]);
    setDisclaimer("");
    setAbstract("");
    setAudience("");
    setPreparation("");
    setKeyFindingsInput("");
    setDosInput("");
    setDontsInput("");
    setSymptomsInput("");
    setCausesInput("");
    setRiskFactorsInput("");
    setWarningSignsInput("");
    setMarkers([]);
    setLayout("standard");
    setBeforeImage({ id: null, url: "" });
    setAfterImage({ id: null, url: "" });
  };

  const handleAddNew = () => {
    resetEditor();
    setPickedLayout("standard");
    setShowLayoutPicker(true);
    setMessage(null);
  };

  const handleLayoutContinue = () => {
    setLayout(pickedLayout);
    setBody(layoutBodyTemplate(pickedLayout));
    setShowLayoutPicker(false);
    setShowEditor(true);
    setTimeout(() => {
      editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      titleRef.current?.focus();
    }, 250);
  };

  const previewData: ArticlePreviewData = {
    title,
    slug: title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100),
    category,
    author,
    credentialsDisplay,
    excerpt,
    body,
    layout,
    coverUrl: coverImage.url,
    beforeUrl: beforeImage.url,
    afterUrl: afterImage.url,
    keyPoints: keyPointsInput.split("\n").map((k) => k.trim()).filter(Boolean),
    faqs: faqs.filter((f) => f.question.trim()).map((f) => ({ question: f.question.trim(), answer: f.answer.trim() })),
    ctaTitle,
    ctaSubtitle,
    ctaButton,
    reviewedAt,
    tags: tagsInput.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
    sources: sources.filter((s) => s.title.trim() || s.url.trim()).map((s) => ({ title: s.title.trim(), url: s.url.trim() })),
    status: draftMode ? "Draft" : "Published",
    quickSummary,
    pullQuote,
    warnings: warningsInput.split("\n").map((k) => k.trim()).filter(Boolean),
    checklist: checklistInput.split("\n").map((k) => k.trim()).filter(Boolean),
    pros: prosInput.split("\n").map((k) => k.trim()).filter(Boolean),
    cons: consInput.split("\n").map((k) => k.trim()).filter(Boolean),
    whenToConsult,
    chartTitle,
    chartLabels: chartLabels.split(",").map((l) => l.trim()).filter(Boolean),
    chartValues: chartValues.split(",").map((v) => parseFloat(v.trim())).filter((v) => !Number.isNaN(v)),
    galleryUrls: gallery.map((g) => g.url).filter(Boolean),
    disclaimer,
    abstract,
    audience,
    preparation,
    keyFindings: keyFindingsInput.split("\n").map((k) => k.trim()).filter(Boolean),
    dos: dosInput.split("\n").map((k) => k.trim()).filter(Boolean),
    donts: dontsInput.split("\n").map((k) => k.trim()).filter(Boolean),
    symptoms: symptomsInput.split("\n").map((k) => k.trim()).filter(Boolean),
    causes: causesInput.split("\n").map((k) => k.trim()).filter(Boolean),
    riskFactors: riskFactorsInput.split("\n").map((k) => k.trim()).filter(Boolean),
    warningSigns: warningSignsInput.split("\n").map((k) => k.trim()).filter(Boolean),
    markers: markers.filter((m) => m.name.trim()).map((m) => ({ name: m.name.trim(), description: m.description.trim(), unit: m.unit.trim(), range: m.range.trim(), interpretation: m.interpretation.trim(), factors: m.factors.trim() })),
  };

  const handleSave = (publish: boolean) => {
    if (!title.trim() || saveStatus !== "idle") return;
    if (coverImage.url && !coverImage.id) {
      setMessage({ type: "error", text: "Cover image is an external URL — upload or pick from Media Library to save it." });
      return;
    }
    if ((beforeImage.url && !beforeImage.id) || (afterImage.url && !afterImage.id)) {
      setMessage({ type: "error", text: "Before/After images must come from the Media Library — external URLs cannot be saved." });
      return;
    }
    const galleryExt = gallery.find((g) => g.url && !g.id);
    if (galleryExt) {
      setMessage({ type: "error", text: "Gallery images must come from the Media Library — external URLs cannot be saved." });
      return;
    }
    const lines = (s: string, max: number) => s.split("\n").map((k) => k.trim()).filter(Boolean).slice(0, max);
    const chartLabelsArr = chartLabels.split(",").map((l) => l.trim()).filter(Boolean).slice(0, 24);
    const chartValuesArr = chartValues.split(",").map((v) => parseFloat(v.trim())).filter((v) => !Number.isNaN(v)).slice(0, 24);
    const chartData: Record<string, unknown> = {};
    if (chartTitle.trim()) chartData.title = chartTitle.trim().slice(0, 120);
    if (chartLabelsArr.length) chartData.labels = chartLabelsArr;
    if (chartValuesArr.length) chartData.values = chartValuesArr;
    const galleryIds = gallery.map((g) => g.id).filter(Boolean) as string[];
    const cleanMarkers = markers.filter((m) => m.name.trim()).map((m) => ({
      name: m.name.trim().slice(0, 120),
      description: m.description.trim().slice(0, 1000) || undefined,
      unit: m.unit.trim().slice(0, 60) || undefined,
      range: m.range.trim().slice(0, 200) || undefined,
      interpretation: m.interpretation.trim().slice(0, 1000) || undefined,
      factors: m.factors.trim().slice(0, 500) || undefined,
    }));
    const slug =
      title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100) ||
      `article-${Date.now()}`;
    const tags = tagsInput.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
    const seo: Record<string, unknown> = {};
    if (seoTitle.trim()) seo.metaTitle = seoTitle.trim().slice(0, 60);
    if (seoDescription.trim()) seo.metaDescription = seoDescription.trim().slice(0, 160);
    if (coverImage.id) seo.ogImage = coverImage.id;
    const keyPoints = keyPointsInput.split("\n").map((k) => k.trim()).filter(Boolean).slice(0, 20);
    const faqList = faqs.filter((f) => f.question.trim()).map((f, i) => ({ question: f.question.trim(), answer: f.answer.trim(), order: i }));
    const ctaBox: Record<string, unknown> = {};
    if (ctaTitle.trim()) ctaBox.title = ctaTitle.trim().slice(0, 120);
    if (ctaSubtitle.trim()) ctaBox.subtitle = ctaSubtitle.trim().slice(0, 300);
    if (ctaButton.trim()) ctaBox.buttonLabel = ctaButton.trim().slice(0, 60);
    const cleanedSources = sources.filter((s) => s.title.trim() || s.url.trim()).map((s) => ({
      title: s.title.trim(),
      url: s.url.trim(),
      authors: s.authors.trim() || undefined,
      publishedDate: s.publishedDate ? new Date(s.publishedDate).toISOString() : undefined,
    }));
    const payload: Record<string, unknown> = {
      title: title.trim(),
      slug,
      category,
      tags: tags.length ? tags : undefined,
      body: body.trim() || excerpt.trim(),
      excerpt: excerpt.trim().slice(0, 300) || undefined,
      author: author.trim() || "Dr. Ekta Narula",
      credentialsDisplay: credentialsDisplay.trim() || undefined,
      sources: cleanedSources.length ? cleanedSources : undefined,
      seo: Object.keys(seo).length ? seo : undefined,
      coverImage: coverImage.id || undefined,
      layout,
      beforeImage: beforeImage.id || undefined,
      afterImage: afterImage.id || undefined,
      galleryImages: galleryIds.length ? galleryIds : undefined,
      quickSummary: quickSummary.trim().slice(0, 1000) || undefined,
      pullQuote: pullQuote.trim().slice(0, 500) || undefined,
      warnings: lines(warningsInput, 20).length ? lines(warningsInput, 20) : undefined,
      checklist: lines(checklistInput, 30).length ? lines(checklistInput, 30) : undefined,
      pros: lines(prosInput, 20).length ? lines(prosInput, 20) : undefined,
      cons: lines(consInput, 20).length ? lines(consInput, 20) : undefined,
      whenToConsult: whenToConsult.trim().slice(0, 1000) || undefined,
      chartData: Object.keys(chartData).length ? chartData : undefined,
      disclaimer: disclaimer.trim().slice(0, 1000) || undefined,
      abstract: abstract.trim().slice(0, 1000) || undefined,
      audience: audience.trim().slice(0, 500) || undefined,
      preparation: preparation.trim().slice(0, 1000) || undefined,
      keyFindings: lines(keyFindingsInput, 30).length ? lines(keyFindingsInput, 30) : undefined,
      dos: lines(dosInput, 30).length ? lines(dosInput, 30) : undefined,
      donts: lines(dontsInput, 30).length ? lines(dontsInput, 30) : undefined,
      symptoms: lines(symptomsInput, 40).length ? lines(symptomsInput, 40) : undefined,
      causes: lines(causesInput, 40).length ? lines(causesInput, 40) : undefined,
      riskFactors: lines(riskFactorsInput, 40).length ? lines(riskFactorsInput, 40) : undefined,
      warningSigns: lines(warningSignsInput, 40).length ? lines(warningSignsInput, 40) : undefined,
      markers: cleanMarkers.length ? cleanMarkers : undefined,
      keyPoints: keyPoints.length ? keyPoints : undefined,
      faqs: faqList.length ? faqList : undefined,
      ctaBox: Object.keys(ctaBox).length ? ctaBox : undefined,
      reviewedAt: reviewedAt ? new Date(reviewedAt).toISOString() : undefined,
      status: publish ? "published" : "draft",
    };
    setMessage(null);
    setSaveStatus("waiting");
    if (editingId) {
      dispatch(updateRequest({ id: editingId, ...payload } as never));
    } else {
      dispatch(createRequest(payload as never)); // POST to your API
    }
  };

  const handleEdit = (id: string) => {
    setShowEditor(true);
    dispatch(fetchOneRequest(id as never));
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (id: string, title: string) => {
    if (typeof window !== "undefined" && !window.confirm(`Delete "${title}"?\n\nThis action cannot be undone.`)) return;
    setDeletingId(id);
    dispatch(deleteRequest(id as never));
  };

  // clear the deleting flag once the request settles so the button re-enables
  useEffect(() => {
    if (deletingId && !loading) {
      const t = setTimeout(() => setDeletingId(null), 500);
      return () => clearTimeout(t);
    }
  }, [loading, deletingId]);

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 xl:flex-row">
        {/* LEFT — main */}
        <div className="min-w-0 flex-1 space-y-4">
          {/* Header + Add button */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Knowledge Base</h2>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              <Plus size={16} /> Add Article
            </button>
          </div>

          {/* Editor — Batch 3: all backend fields (tags, sources, cover image SEO.ogImage, SEO meta, credentialsDisplay) */}
          {showEditor && (
            <div ref={editorRef} className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{editingId ? "Edit Article" : "Add Article"}</h3>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">{ARTICLE_LAYOUTS.find((l) => l.value === layout)?.name || layout}</span>
                  <button onClick={resetEditor} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"><X size={16} /></button>
                </div>
              </div>
              {message && <div className={`mb-3 rounded-lg px-3 py-2 text-sm ${message.type === "success" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20" : "bg-red-50 text-red-700 dark:bg-red-900/20"}`}>{message.text}</div>}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Title *</label>
                  <input ref={titleRef} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Article title" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Category *</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                    {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Author *</label>
                  <input value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Credentials Display</label>
                  <input value={credentialsDisplay} onChange={(e) => setCredentialsDisplay(e.target.value)} placeholder="e.g. BDS (Gold Medalist), 15+ Years" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
                <div className="md:col-span-2">
                  <Dropzone label="Cover Image (SEO ogImage)" value={coverImage} onChange={setCoverImage} hint="Drag & drop or Library — will be saved as seo.ogImage" />
                </div>
                {layout === "before-after" && (
                  <>
                    <div>
                      <Dropzone label="Before Image" value={beforeImage} onChange={setBeforeImage} hint="Library only — left side of slider" />
                    </div>
                    <div>
                      <Dropzone label="After Image" value={afterImage} onChange={setAfterImage} hint="Library only — right side of slider" />
                    </div>
                  </>
                )}
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Tags (comma-separated, lowercased)</label>
                  <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="e.g. implants, painless, aftercare" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Body *</label>
                  <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} placeholder="Full article body... Use ## for section headings." className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Excerpt (hero intro, max 300)</label>
                  <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} maxLength={300} rows={2} placeholder="Short summary shown under the title..." className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                  <p className="text-xs text-zinc-400">{excerpt.length}/300</p>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Key Takeaways (one per line, max 20)</label>
                  <textarea value={keyPointsInput} onChange={(e) => setKeyPointsInput(e.target.value)} rows={3} placeholder={"Permanent tooth replacement\nLooks and feels natural"} className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Reviewed Date</label>
                  <input type="date" value={reviewedAt} onChange={(e) => setReviewedAt(e.target.value)} className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Sources</label>
                  <div className="space-y-2">
                    {sources.map((s, idx) => (
                      <div key={idx} className="grid gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700 md:grid-cols-2">
                        <input value={s.title} onChange={(e) => { const n=[...sources]; n[idx].title=e.target.value; setSources(n); }} placeholder="Title" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        <input value={s.url} onChange={(e) => { const n=[...sources]; n[idx].url=e.target.value; setSources(n); }} placeholder="URL https://..." className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        <input value={s.authors} onChange={(e) => { const n=[...sources]; n[idx].authors=e.target.value; setSources(n); }} placeholder="Authors" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        <input type="date" value={s.publishedDate} onChange={(e) => { const n=[...sources]; n[idx].publishedDate=e.target.value; setSources(n); }} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        <button onClick={() => setSources(sources.filter((_, i) => i !== idx))} className="md:col-span-2 rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-800">Remove source</button>
                      </div>
                    ))}
                    <button onClick={() => setSources([...sources, { title: "", url: "", authors: "", publishedDate: "" }])} className="w-full rounded-lg border border-dashed border-zinc-300 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400">+ Add Source</button>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Article FAQs (shown as accordion)</label>
                  <div className="space-y-2">
                    {faqs.map((f, idx) => (
                      <div key={idx} className="grid gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                        <input value={f.question} onChange={(e) => { const n=[...faqs]; n[idx].question=e.target.value; setFaqs(n); }} placeholder="Question" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        <textarea value={f.answer} onChange={(e) => { const n=[...faqs]; n[idx].answer=e.target.value; setFaqs(n); }} rows={2} placeholder="Answer" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        <button onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))} className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-800">Remove FAQ</button>
                      </div>
                    ))}
                    <button onClick={() => setFaqs([...faqs, { question: "", answer: "" }])} className="w-full rounded-lg border border-dashed border-zinc-300 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400">+ Add FAQ</button>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">CTA Banner (consultation box — blank = default)</label>
                  <div className="grid gap-2 md:grid-cols-3">
                    <input value={ctaTitle} onChange={(e) => setCtaTitle(e.target.value)} maxLength={120} placeholder="Title" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                    <input value={ctaSubtitle} onChange={(e) => setCtaSubtitle(e.target.value)} maxLength={300} placeholder="Subtitle" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                    <input value={ctaButton} onChange={(e) => setCtaButton(e.target.value)} maxLength={60} placeholder="Button label" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Quick Summary (guide hero panel)</label>
                  <textarea value={quickSummary} onChange={(e) => setQuickSummary(e.target.value)} maxLength={1000} rows={2} placeholder="2-3 sentence plain-language summary..." className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Pull Quote (editorial highlight)</label>
                  <input value={pullQuote} onChange={(e) => setPullQuote(e.target.value)} maxLength={500} placeholder="A memorable line worth highlighting..." className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Important Warnings (one per line)</label>
                  <textarea value={warningsInput} onChange={(e) => setWarningsInput(e.target.value)} rows={2} placeholder={"Never ignore chest pain\nAlways consult your doctor"} className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Checklist (one per line)</label>
                  <textarea value={checklistInput} onChange={(e) => setChecklistInput(e.target.value)} rows={2} placeholder={"Fasting required\nBring previous reports"} className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Pros (one per line)</label>
                  <textarea value={prosInput} onChange={(e) => setProsInput(e.target.value)} rows={2} placeholder={"Painless\nQuick"} className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Cons (one per line)</label>
                  <textarea value={consInput} onChange={(e) => setConsInput(e.target.value)} rows={2} placeholder={"Needs follow-up\nMild sensitivity"} className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">When To Consult a Doctor</label>
                  <textarea value={whenToConsult} onChange={(e) => setWhenToConsult(e.target.value)} maxLength={1000} rows={2} placeholder="Red-flag symptoms that need professional care..." className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Data Chart (research — bars from your numbers only)</label>
                  <div className="grid gap-2 md:grid-cols-3">
                    <input value={chartTitle} onChange={(e) => setChartTitle(e.target.value)} maxLength={120} placeholder="Chart title" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                    <input value={chartLabels} onChange={(e) => setChartLabels(e.target.value)} placeholder="Labels, comma separated" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                    <input value={chartValues} onChange={(e) => setChartValues(e.target.value)} placeholder="Values, comma separated" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Story Gallery (up to 3, Library only)</label>
                  <div className="grid gap-2 md:grid-cols-3">
                    {gallery.map((g, i) => (
                      <Dropzone key={i} label={`Photo ${i + 1}`} value={g} onChange={(v) => { const n = [...gallery]; n[i] = v; setGallery(n); }} hint="Library image" />
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Medical Disclaimer (blank = default site disclaimer)</label>
                  <textarea value={disclaimer} onChange={(e) => setDisclaimer(e.target.value)} maxLength={1000} rows={2} placeholder="This article is for education only and is not medical advice..." className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Abstract / Executive Summary (deep dive)</label>
                  <textarea value={abstract} onChange={(e) => setAbstract(e.target.value)} maxLength={1000} rows={2} placeholder="Evidence summary in 2-3 sentences..." className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Key Findings (one per line, deep dive)</label>
                  <textarea value={keyFindingsInput} onChange={(e) => setKeyFindingsInput(e.target.value)} rows={2} placeholder={"Finding one\nFinding two"} className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Who Is This Guide For (audience)</label>
                  <input value={audience} onChange={(e) => setAudience(e.target.value)} maxLength={500} placeholder="Adults 18+" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Preparation Requirements</label>
                  <input value={preparation} onChange={(e) => setPreparation(e.target.value)} maxLength={1000} placeholder="Fasting 8 hours" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Do&apos;s (one per line)</label>
                  <textarea value={dosInput} onChange={(e) => setDosInput(e.target.value)} rows={2} placeholder={"Arrive early\nBring reports"} className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Don&apos;ts (one per line)</label>
                  <textarea value={dontsInput} onChange={(e) => setDontsInput(e.target.value)} rows={2} placeholder={"Skip medication\nRush the steps"} className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Symptoms (one per line)</label>
                  <textarea value={symptomsInput} onChange={(e) => setSymptomsInput(e.target.value)} rows={2} placeholder={"Tooth pain\nSensitivity"} className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Possible Causes (one per line)</label>
                  <textarea value={causesInput} onChange={(e) => setCausesInput(e.target.value)} rows={2} placeholder={"Cavities\nGum disease"} className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Risk Factors (one per line)</label>
                  <textarea value={riskFactorsInput} onChange={(e) => setRiskFactorsInput(e.target.value)} rows={2} placeholder={"Sugary diet\nSmoking"} className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Warning Signs — urgent (one per line)</label>
                  <textarea value={warningSignsInput} onChange={(e) => setWarningSignsInput(e.target.value)} rows={2} placeholder={"Swelling with fever\nUncontrolled bleeding"} className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Report Markers (name required — add rows as needed)</label>
                  <div className="space-y-2">
                    {markers.map((m, idx) => (
                      <div key={idx} className="grid gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700 md:grid-cols-2">
                        <input value={m.name} onChange={(e) => { const n=[...markers]; n[idx].name=e.target.value; setMarkers(n); }} placeholder="Marker name *" maxLength={120} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        <input value={m.unit} onChange={(e) => { const n=[...markers]; n[idx].unit=e.target.value; setMarkers(n); }} placeholder="Unit (e.g. g/dL)" maxLength={60} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        <input value={m.description} onChange={(e) => { const n=[...markers]; n[idx].description=e.target.value; setMarkers(n); }} placeholder="What it measures" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white md:col-span-2" />
                        <input value={m.range} onChange={(e) => { const n=[...markers]; n[idx].range=e.target.value; setMarkers(n); }} placeholder="Reference range (lab-verified only)" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white md:col-span-2" />
                        <input value={m.interpretation} onChange={(e) => { const n=[...markers]; n[idx].interpretation=e.target.value; setMarkers(n); }} placeholder="How to interpret" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white md:col-span-2" />
                        <input value={m.factors} onChange={(e) => { const n=[...markers]; n[idx].factors=e.target.value; setMarkers(n); }} placeholder="Factors that influence the result" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white md:col-span-2" />
                        <button onClick={() => setMarkers(markers.filter((_, i) => i !== idx))} className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-800 md:col-span-2">Remove marker</button>
                      </div>
                    ))}
                    <button onClick={() => setMarkers([...markers, { name: "", description: "", unit: "", range: "", interpretation: "", factors: "" }])} className="w-full rounded-lg border border-dashed border-zinc-300 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400">+ Add Marker</button>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">SEO Meta Title (max 60)</label>
                  <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} maxLength={60} placeholder="Meta title" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                  <p className="text-xs text-zinc-400">{seoTitle.length}/60</p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">SEO Meta Description (max 160)</label>
                  <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} maxLength={160} rows={2} placeholder="Meta description" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                  <p className="text-xs text-zinc-400">{seoDescription.length}/160</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => handleSave(false)} disabled={saveStatus !== "idle"} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900">Save Draft</button>
                <button onClick={() => setShowPreview(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"><Eye size={14} /> Preview</button>
                <button onClick={() => handleSave(true)} disabled={saveStatus !== "idle"} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50">Publish</button>
                <button onClick={resetEditor} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400">Cancel</button>
                {saveStatus !== "idle" && <SpinnerCustom />}
              </div>
            </div>
          )}
          {showPreview && <ArticlePreviewModal data={previewData} onClose={() => setShowPreview(false)} />}

          {/* Stats */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold tracking-widest text-zinc-500">TOTAL ARTICLES</p>
                  <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">{loading ? "…" : stats.total}</p>
                </div>
                <span className="rounded-lg bg-zinc-100 p-1.5 text-zinc-600 dark:bg-zinc-800"><FileText size={14} /></span>
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold tracking-widest text-zinc-500">TOTAL VIEWS</p>
                  <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
                    {loading ? "…" : stats.totalViews !== null ? formatViews(stats.totalViews) : "—"}
                  </p>
                </div>
                <span className="rounded-lg bg-zinc-100 p-1.5 text-zinc-600 dark:bg-zinc-800"><Eye size={14} /></span>
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold tracking-widest text-zinc-500">AVG. SEO SCORE</p>
                  <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
                    {loading ? "…" : stats.avgSeo !== null ? `${stats.avgSeo}/100` : "—"}
                  </p>
                </div>
                <span className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600"><Award size={14} /></span>
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold tracking-widest text-zinc-500">PENDING REVIEWS</p>
                  <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
                    {loading ? "…" : stats.pending}
                    {!loading && stats.pending > 0 && (
                      <span className="ml-1 text-xs font-medium text-amber-600">Drafts awaiting sign-off</span>
                    )}
                  </p>
                </div>
                <span className="rounded-lg bg-amber-50 p-1.5 text-amber-600"><AlertTriangle size={14} /></span>
              </div>
            </div>
          </div>

          {/* Tabs + search */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1 overflow-x-auto rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                    activeTab === t
                      ? "bg-zinc-900 text-white shadow dark:bg-white dark:text-zinc-900"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-[220px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search knowledge"
                className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
            </div>
          </div>

          {/* Articles list — API data only */}
          <div className="space-y-3">
            {loading && <SpinnerCustom />}

            {!loading && !!error && (
              <p className="py-8 text-center text-sm text-red-500">Failed to load articles. Please try again.</p>
            )}

            {!loading &&
              !error &&
              filtered.map((a) => {
                const updated = timeAgo(a.updatedAt || a.createdAt);
                const meta = [
                  `By ${a.author || "Unknown"}`,
                  updated ? `Updated ${updated}` : null,
                  typeof a.views === "number" ? `${formatViews(a.views)} views` : null,
                ]
                  .filter(Boolean)
                  .join(" • ");
                return (
                  <div
                    key={a._id}
                    className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-3 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    {(() => {
                      const cover = resolveCoverImage(a);
                      return cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cover} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
                          <ImageIcon size={20} />
                        </div>
                      );
                    })()}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${categoryColor(a.category)}`}>
                          {categoryShort(a.category)}
                        </span>
                        {typeof a.seoScore === "number" && (
                          <span
                            className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium ${seoBg(a.seoScore)} ${seoColor(a.seoScore)}`}
                          >
                            ● SEO: {a.seoScore}%
                          </span>
                        )}
                        {a.status === "draft" && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">
                            Draft
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1 line-clamp-1 text-[14px] font-semibold leading-tight text-zinc-900 dark:text-white">
                        {a.title}
                      </h3>
                      <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">{meta}</p>
                    </div>
                    <div className="flex shrink-0 items-start gap-1">
                      <button
                        onClick={() => handleEdit(a._id)}
                        title="Edit article"
                        aria-label={`Edit ${a.title}`}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(a._id, a.title)}
                        disabled={deletingId === a._id && loading}
                        title="Delete article"
                        aria-label={`Delete ${a.title}`}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        title="View stats"
                        aria-label={`Stats for ${a.title}`}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
                      >
                        <BarChart3 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}

            {!loading && !error && filtered.length === 0 && (
              <p className="py-10 text-center text-sm text-zinc-500">
                {list.length === 0
                  ? "No articles yet — click “Add Article” to create your first one."
                  : "No articles match your filter or search."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Choose a layout dialog */}
      {showLayoutPicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={() => setShowLayoutPicker(false)}>
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between p-6 pb-0">
              <div>
                <h3 className="text-lg font-semibold text-white">Choose a layout</h3>
                <p className="mt-0.5 text-sm text-zinc-400">Pick how your article will look. You can&apos;t change this later.</p>
              </div>
              <button onClick={() => setShowLayoutPicker(false)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"><X size={18} /></button>
            </div>
            <div className="border-b border-zinc-800 px-6 pt-4">
              <div className="flex gap-6 text-xs font-medium">
                <span className="border-b-2 border-teal-400 pb-2 text-white">1. Layout</span>
                <span className="pb-2 text-zinc-500">2. Content</span>
                <span className="pb-2 text-zinc-500">3. SEO & review</span>
              </div>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
              {ARTICLE_LAYOUTS.map((l) => {
                const active = pickedLayout === l.value;
                return (
                  <button
                    key={l.value}
                    onClick={() => setPickedLayout(l.value)}
                    className={`rounded-xl border p-3 text-left transition-colors ${active ? "border-teal-400 bg-teal-400/10" : "border-zinc-700 bg-zinc-800/60 hover:border-zinc-500"}`}
                  >
                    <div className="relative mb-3 overflow-hidden rounded-lg bg-zinc-800 p-3">
                      {active && <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-teal-400 text-zinc-900"><Check size={12} /></span>}
                      <LayoutThumb kind={l.thumb} />
                    </div>
                    <p className="text-sm font-semibold text-white">{l.name}</p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-400">{l.desc}</p>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end border-t border-zinc-800 p-4">
              <button onClick={handleLayoutContinue} className="rounded-lg bg-teal-500 px-8 py-2.5 text-sm font-semibold text-white hover:bg-teal-400">Continue</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function LayoutThumb({ kind }: { kind: string }) {
  const bar = "h-1.5 rounded-full bg-zinc-500/70";
  const teal = "bg-teal-200/90";
  if (kind === "hero") {
    return <div className="space-y-2"><div className={`h-14 rounded ${teal}`} /><div className={`${bar} w-3/4 bg-zinc-400`} /><div className={`${bar} w-full bg-zinc-400`} /><div className={`${bar} w-2/3 bg-zinc-400`} /></div>;
  }
  if (kind === "steps") {
    return <div className="space-y-2">{[0, 1, 2].map((i) => (<div key={i} className="flex items-center gap-2"><span className={`h-3.5 w-3.5 shrink-0 rounded-full ${teal}`} /><div className={`${bar} flex-1 bg-zinc-400`} /></div>))}<div className={`${bar} w-full bg-zinc-400`} /></div>;
  }
  if (kind === "guide") {
    return <div className="space-y-2"><div className={`h-8 rounded ${teal}`} /><div className={`${bar} w-full bg-zinc-400`} /><div className="flex items-center gap-2"><span className={`h-3 w-3 shrink-0 rounded-full ${teal}`} /><div className={`${bar} flex-1 bg-zinc-400`} /></div><div className="flex items-center gap-2"><span className={`h-3 w-3 shrink-0 rounded-full ${teal}`} /><div className={`${bar} flex-1 bg-zinc-400`} /></div></div>;
  }
  if (kind === "chart") {
    return <div className="space-y-2"><div className={`${bar} w-1/2 bg-zinc-400`} /><div className="flex h-12 items-end gap-1.5">{[40, 70, 55, 90, 65].map((h, i) => (<div key={i} className={`flex-1 rounded-sm ${teal}`} style={{ height: `${h}%` }} />))}</div><div className={`${bar} w-2/3 bg-zinc-400`} /></div>;
  }
  if (kind === "story") {
    return <div className="space-y-2"><div className={`h-12 rounded ${teal}`} /><div className="grid grid-cols-2 items-center gap-2"><div className={`${bar} w-full bg-zinc-400`} /><div className={`h-8 rounded ${teal}`} /></div><div className="grid grid-cols-2 items-center gap-2"><div className={`h-8 rounded ${teal}`} /><div className={`${bar} w-full bg-zinc-400`} /></div></div>;
  }
  if (kind === "split") {
    return <div className="space-y-2"><div className="grid grid-cols-2 gap-2"><div className={`h-12 rounded ${teal}`} /><div className={`h-12 rounded ${teal}`} /></div><div className={`${bar} w-3/4 bg-zinc-400`} /><div className={`${bar} w-full bg-zinc-400`} /></div>;
  }
  return <div className="space-y-2"><div className={`${bar} w-1/2 bg-zinc-400`} /><div className={`${bar} w-full bg-zinc-400`} /><div className={`${bar} w-5/6 bg-zinc-400`} /><div className={`${bar} w-2/3 bg-zinc-400`} /><div className={`${bar} w-3/4 bg-zinc-400`} /></div>;
}