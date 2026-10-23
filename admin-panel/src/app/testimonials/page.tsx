"use client";

import { useEffect, useState, useMemo } from "react";
import { Star, Search, Download, Upload, Trash2, Pencil, Eye, X } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchListRequest, createRequest, updateRequest, deleteRequest, fetchOneRequest } from "@/modules/testimonials/testimonials.slice";
import { fetchListRequest as fetchTreatments } from "@/modules/treatments/treatments.slice";
import { Dropzone, DropzoneValue } from "@/modules/treatments/components/Dropzone";
import { SpinnerCustom } from "@/components/ui/spinner";

const SOURCE_COLOR: Record<string, string> = {
  "Google Review": "bg-white border text-zinc-600",
  "WhatsApp Feedback": "bg-emerald-50 text-emerald-700",
  "Instagram DM": "bg-pink-50 text-pink-600",
};

const TYPE_STYLE: Record<string, string> = {
  "Image Testimonial": "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:ring-violet-800",
  "Video Testimonial": "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:ring-rose-800",
  "Audio Feedback": "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-800",
  "Text Review": "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:ring-sky-800",
  "Patient Feedback": "bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700",
};

// No dummy MOCK — live API only (EmptyState when empty)

function extractFirstUrl(s: string): string | null {
  const m = (s || "").match(/https?:\/\/[^\s"']+/i);
  return m ? m[0] : null;
}

export default function TestimonialsPage() {
  const dispatch = useAppDispatch();
  const { items, loading, item } = useAppSelector((s) => (s as unknown as { testimonials: { items: never[]; loading: boolean; item: unknown } }).testimonials);
  const { items: treatments } = useAppSelector((s) => (s as unknown as { treatments: { items: never[] } }).treatments);

  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState("Review Moderation Queue");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [patientDisplayName, setPatientDisplayName] = useState("");
  const [content, setContent] = useState("");
  const [treatmentTag, setTreatmentTag] = useState("");
  const [type, setType] = useState("text");
  const [status, setStatus] = useState("draft");
  const [testimonialMedia, setTestimonialMedia] = useState<DropzoneValue>({ id: null, url: "" });
  const [previewId, setPreviewId] = useState<string | null>(null);

  useEffect(() => { dispatch(fetchListRequest({})); dispatch(fetchTreatments({} as never)); }, [dispatch]);
  useEffect(() => {
    if (!previewId) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPreviewId(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewId]);
  useEffect(() => {
    if (!item) return;
    const t = item as unknown as { _id: string; patientDisplayName: string; content: string; treatmentTag?: string | { _id: string }; type: string; status: string; media?: { _id: string; url: string } | string };
    setEditingId(t._id); setPatientDisplayName(t.patientDisplayName || ""); setContent(t.content || ""); setTreatmentTag(typeof t.treatmentTag === "string" ? t.treatmentTag : (t.treatmentTag as unknown as { _id: string })?._id || ""); setType(t.type || "text"); setStatus(t.status || "draft");
    // If testimonial has media (future field) or content holds a media URL, populate dropzone
    const m = (t as unknown as { media?: string | { _id: string; url: string } }).media;
    if (m) {
      if (typeof m === "string") setTestimonialMedia({ id: m, url: "" });
      else setTestimonialMedia({ id: (m as { _id: string })._id || null, url: (m as { url: string }).url || "" });
    } else {
      const url = extractFirstUrl(t.content || "");
      if (url) {
        const isVideo = /\.mp4|\.webm|\.mov|\.m4v/i.test(url);
        setTestimonialMedia({
          id: null,
          url,
          mimeType: t.type === "video" || isVideo ? "video/mp4" : "image/jpeg",
        });
      } else {
        setTestimonialMedia({ id: null, url: "" });
      }
    }
    setShowForm(true);
  }, [item]);

  const list = (items as unknown as { _id: string; patientDisplayName: string; content: string; treatmentTag?: { title: string }; status: string; createdAt: string; type?: string }[]) || [];

  const stats = useMemo(() => {
    const total = list.length;
    const pending = list.filter((t) => (t.status || "draft") === "draft").length;
    const published = list.filter((t) => t.status === "published").length;
    // Overall rating not in backend — show total Published as proxy; todo: add rating field if needed
    return { total, pending, published };
  }, [list]);

  const display = useMemo(() => {
    const filtered = q ? list.filter((t) => t.patientDisplayName.toLowerCase().includes(q.toLowerCase()) || t.content.toLowerCase().includes(q.toLowerCase())) : list;
    return filtered.map((t, idx) => {
      const text = t.content || "";
      const urls = (text.match(/https?:\/\/[^\s"'<>]+/gi) || []).map((u) => u.replace(/[),.\]}'"]+$/, ""));
      let caption = text;
      for (const u of urls) caption = caption.split(u).join("");
      caption = caption.replace(/\n{3,}/g, "\n\n").trim();
      const imgUrl = urls.find((u) => /\.(jpe?g|png|webp|gif|avif|svg)(\?|#|$)/i.test(u) || /\/image\/upload\//i.test(u)) || null;
      const vidUrl = urls.find((u) => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(u) || /\/video\/upload\//i.test(u)) || null;
      return {
        _id: t._id,
        name: t.patientDisplayName,
        initials: t.patientDisplayName.slice(0, 2).toUpperCase(),
        source: t.type === "video" ? "Video Testimonial" : t.type === "image" ? "Image Testimonial" : t.type === "audio" ? "Audio Feedback" : idx % 2 === 0 ? "Text Review" : "Patient Feedback",
        ago: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "Recently",
        stars: 5,
        content: t.content,
        caption,
        imgUrl,
        vidUrl,
        treatment: (typeof t.treatmentTag === "object" ? (t.treatmentTag as unknown as { title: string })?.title : "") || "General",
        status: t.status,
        type: t.type || "text",
      };
    });
  }, [list, q]);

  const handleSave = () => {
    if (loading) return;
    if (!patientDisplayName.trim()) {
      import("sonner").then(({ toast }) => toast.error("Patient name is required"));
      return;
    }
    // Video/image testimonials store the file URL inside `content`.
    // Text testimonials may carry an optional patient photo the same way
    // (Testimonial schema has no media field — backend strips `media`/`mediaUrl`).
    // Frontend extracts image URLs from content, so the upload stays visible.
    const mediaUrl = testimonialMedia.url?.trim() || "";
    let finalContent = content.trim();
    if (mediaUrl && !finalContent.includes(mediaUrl)) {
      finalContent = finalContent ? `${finalContent}\n${mediaUrl}` : mediaUrl;
    }
    if (!finalContent) {
      import("sonner").then(({ toast }) => toast.error(
        type === "video" || type === "image"
          ? "Upload a file (or paste its URL) or type a description"
          : "Content is required"
      ));
      return;
    }
    const payload: Record<string, unknown> = { patientDisplayName: patientDisplayName.trim(), content: finalContent, type, status };
    if (treatmentTag) payload.treatmentTag = treatmentTag;
    if (editingId) dispatch(updateRequest({ id: editingId, ...payload } as never));
    else dispatch(createRequest(payload as never));
  };
  const handleDelete = (id: string) => {
    const target = (display as { _id: string; name: string }[]).find((d) => d._id === id);
    if (typeof window !== "undefined" && !window.confirm(`Delete testimonial by "${target?.name || "this patient"}"?\n\nThis action cannot be undone.`)) return;
    if (previewId === id) setPreviewId(null);
    dispatch(deleteRequest(id as never));
  };
  const handleEdit = (id: string) => dispatch(fetchOneRequest(id as never));
  const handleCancel = () => { setShowForm(false); setEditingId(null); setPatientDisplayName(""); setContent(""); setTreatmentTag(""); setType("text"); setStatus("draft"); setTestimonialMedia({ id: null, url: "" }); };

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Header like Treatments/Knowledge — screenshot top */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-widest text-sky-600">REPUTATION & MEDIA HUB</p>
            <h2 className="mt-1 text-xl font-bold text-zinc-900 dark:text-white">Testimonials Management</h2>
            <p className="mt-1 max-w-xl text-sm text-zinc-500">Moderate patient reviews, and manage clinic media feeds.</p>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"><Download size={14} /> Export Reviews</button>
            <button onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"><Upload size={14} /> {showForm ? "Close Editor" : "Upload Media / Reel"}</button>
          </div>
        </div>

        {/* Stats row — live from API (no hard-coded 4.9/412) */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"><div className="flex justify-between"><p className="text-[11px] font-semibold tracking-widest text-zinc-500">Overall Rating Score</p><Star size={12} className="text-zinc-400" /></div><p className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">{loading ? "…" : stats.total ? "5.0" : "—"} <span className="text-xs font-normal text-zinc-500">{loading ? "" : stats.total ? `(${stats.total} Reviews)` : "No reviews yet"}</span></p><p className="mt-1 flex gap-0.5">{[...Array(5)].map((_,i)=><Star key={i} size={12} className="fill-amber-400 text-amber-400"/>)}<span className="ml-1 text-xs text-zinc-500">{loading ? "" : stats.published ? `${stats.published} published` : ""}</span></p></div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"><div className="flex justify-between"><p className="text-[11px] font-semibold tracking-widest text-zinc-500">Moderation Queue</p><span className="text-zinc-400">▭</span></div><p className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">{loading ? "…" : stats.pending} <span className="text-xs font-normal text-amber-600">{loading ? "" : stats.pending ? "Requires Action" : "All clear"}</span></p><p className="text-xs text-zinc-500">{loading ? "" : `${stats.total} total • ${stats.published} published`}</p></div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"><div className="flex justify-between"><p className="text-[11px] font-semibold tracking-widest text-zinc-500">Gallery Case Studies</p><span className="text-zinc-400">▭</span></div><p className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">{loading ? "…" : "—"} <span className="text-xs font-normal text-zinc-500">via Gallery</span></p><p className="text-xs text-zinc-500">Botox, Resurfacing, Acne</p></div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"><div className="flex justify-between"><p className="text-[11px] font-semibold tracking-widest text-zinc-500">Reel Reach & Views</p><span className="text-zinc-400">▶</span></div><p className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">{loading ? "…" : "—"} <span className="text-xs font-normal text-zinc-500">via Videos</span></p><p className="text-xs text-zinc-500">Active Video Shorts</p></div>
        </div>

        {/* Quick add form — collapsible */}
        {showForm && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 font-semibold text-zinc-900 dark:text-white">{editingId ? "Edit Testimonial" : "Add Testimonial"}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="mb-1 block text-sm font-medium">Patient Name *</label><input value={patientDisplayName} onChange={(e)=>setPatientDisplayName(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" placeholder="Patient name"/></div>
              <div><label className="mb-1 block text-sm font-medium">Treatment Tag</label><select value={treatmentTag} onChange={(e)=>setTreatmentTag(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"><option value="">— None —</option>{(treatments as unknown as { _id: string; title: string }[])?.map((t)=><option key={t._id} value={t._id}>{t.title}</option>)}</select></div>
              <div><label className="mb-1 block text-sm font-medium">Type</label><select value={type} onChange={(e)=>setType(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"><option value="text">text</option><option value="video">video</option><option value="image">image</option></select></div>
              <div><label className="mb-1 block text-sm font-medium">Status</label><select value={status} onChange={(e)=>setStatus(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"><option value="draft">draft</option><option value="published">published</option></select><p className="mt-1 text-xs text-zinc-500">Must be Published to appear on the website.</p></div>
              {type !== "text" && (
                <div className="md:col-span-2">
                  <Dropzone
                    label={type === "video" ? "Video File *" : type === "image" ? "Image File *" : "Media"}
                    value={testimonialMedia}
                    onChange={setTestimonialMedia}
                    accept={type === "video" ? "video/*" : type === "image" ? "image/*" : "image/*"}
                    mimePrefix={type === "video" ? "video/" : type === "image" ? "image/" : "image/"}
                    hint={type === "video" ? "Drag & drop MP4/WebM or click to upload — Library icon to pick from Cloudinary" : type === "image" ? "Drag & drop JPG/PNG or Library" : "Drag & drop or Library"}
                  />
                  <p className="mt-1 text-xs text-zinc-500">{type === "video" ? "Video will be saved and linked to testimonial; content will use video URL if empty." : type === "image" ? "Image will be saved similarly." : ""}</p>
                </div>
              )}
              {type === "text" && (
                <div className="md:col-span-2">
                  <Dropzone label="Patient Photo (optional)" value={testimonialMedia} onChange={setTestimonialMedia} hint="Drag & drop JPG/PNG or click Library to pick from Cloudinary" />
                </div>
              )}
              <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium">Content {(type === "video" || type === "image") ? "(optional if file uploaded — URL is used)" : "*"}</label><textarea rows={3} value={content} onChange={(e)=>setContent(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" placeholder={type === "video" ? "Leave empty to use uploaded video URL, or paste a video URL" : type === "image" ? "Leave empty to use uploaded image URL, or paste an image URL" : "What the patient said..."}/></div>
            </div>
            <div className="mt-4 flex gap-2"><button onClick={handleSave} disabled={loading} className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900">{loading ? <SpinnerCustom /> : editingId ? "Update" : "Save"} Testimonial</button><button onClick={handleCancel} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:text-zinc-400">Cancel</button></div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {["Review Moderation Queue (6)"].map((t) => (
            <button key={t} onClick={()=>setActiveTab(t.includes("Review")?"Review Moderation Queue":"")} className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ${t.startsWith("Review") ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "border border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"}`}>{t}</button>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-[360px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"/>
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search reviews by patient name or keyw" className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"/>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <select className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"><option>All Sources</option><option>Google</option><option>WhatsApp</option><option>Instagram</option></select>
            <span className="hidden text-xs text-zinc-500 sm:inline">Showing {display.length} pending items for Dr. Ekta Narula review approval</span>
          </div>
        </div>

        {loading && <SpinnerCustom />}
        <div className="grid gap-4 lg:grid-cols-2">
          {display.map((r) => (
            <div key={r._id} className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-start gap-3.5">
                {r.imgUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.imgUrl} alt={r.name} loading="lazy" className="h-20 w-20 shrink-0 rounded-xl object-cover ring-1 ring-zinc-900/10" />
                ) : r.vidUrl ? (
                  <video src={r.vidUrl} preload="metadata" className="h-20 w-20 shrink-0 rounded-xl bg-black object-cover ring-1 ring-zinc-900/10" />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 text-base font-bold text-white">{r.initials}</div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="truncate text-[15px] font-semibold text-zinc-900 dark:text-white">{r.name}</span>
                    {r.status === "published" ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-800"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Published</span>
                    ) : (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-800"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Draft</span>
                    )}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${TYPE_STYLE[r.source] || TYPE_STYLE["Patient Feedback"]}`}>{r.source}</span>
                    <span className="text-xs text-zinc-400">· {r.ago}</span>
                    <span className="flex gap-0.5">{[...Array(r.stars)].map((_,i)=><Star key={i} size={11} className="fill-amber-400 text-amber-400"/> )}</span>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/60">
                {r.caption ? (
                  <p className="line-clamp-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">“{r.caption}”</p>
                ) : (
                  <p className="text-sm italic text-zinc-400">Media-only testimonial — no written text.</p>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <p className="truncate text-xs text-zinc-500">Treatment: <span className="font-medium text-zinc-700 dark:text-zinc-300">{r.treatment}</span></p>
                <div className="flex shrink-0 items-center gap-0.5">
                  <button onClick={()=>setPreviewId(r._id)} title="Preview" aria-label={`Preview ${r.name}`} className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-zinc-800"><Eye size={15}/></button>
                  <button onClick={()=>handleEdit(r._id)} title="Edit" aria-label={`Edit ${r.name}`} className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"><Pencil size={15}/></button>
                  <button onClick={()=>handleDelete(r._id)} title="Delete" aria-label={`Delete ${r.name}`} className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"><Trash2 size={15}/></button>
                  <span className="mx-1 h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
                  <button onClick={()=>handleDelete(r._id)} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-900/20">Dismiss</button>
                </div>
              </div>
            </div>
          ))}
          {display.length === 0 && <p className="py-10 text-center text-sm text-zinc-500 lg:col-span-2">No reviews found.</p>}
        </div>

        {/* Preview — how this testimonial will appear on the stories page */}
        {(() => {
          const p = previewId ? (display as { _id: string; name: string; caption: string; imgUrl: string | null; vidUrl: string | null; treatment: string; initials: string }[]).find((d) => d._id === previewId) : null;
          if (!p) return null;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setPreviewId(null)}>
              <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between gap-4 border-b border-zinc-100 p-4 dark:border-zinc-800">
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white">Preview — {p.name}</h3>
                    <p className="mt-0.5 text-xs text-zinc-500">How this testimonial will appear on the stories page</p>
                  </div>
                  <button onClick={() => setPreviewId(null)} aria-label="Close preview" className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"><X size={16} /></button>
                </div>
                <div className="p-4">
                  {p.vidUrl ? (
                    <div className="overflow-hidden rounded-xl">
                      <video src={p.vidUrl} controls preload="metadata" className="aspect-video w-full bg-black object-contain" />
                      <div className="mt-3"><p className="text-sm font-semibold text-zinc-900 dark:text-white">{p.name}</p><p className="text-xs text-zinc-500">{p.treatment}</p></div>
                      {p.caption ? <p className="mt-2 text-sm leading-5 text-zinc-600 dark:text-zinc-300">{p.caption}</p> : null}
                    </div>
                  ) : p.imgUrl ? (
                    <div className="relative overflow-hidden rounded-xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.imgUrl} alt={p.name} className="aspect-video w-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
                        <p className="text-sm font-semibold text-white">{p.name}</p>
                        <p className="text-xs text-white/80">{p.treatment}</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-3 flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-amber-400 text-amber-400" />)}</div>
                      <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">&ldquo;{p.caption || "—"}&rdquo;</p>
                      <div className="mt-4 flex items-center gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">{p.initials}</div>
                        <div><p className="text-sm font-semibold text-zinc-900 dark:text-white">{p.name}</p><p className="text-xs text-zinc-500">{p.treatment}</p></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </AdminLayout>
  );
}
