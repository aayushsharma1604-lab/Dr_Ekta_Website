"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { Pencil, Trash2, Search, Plus, X, Eye, Check } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchListRequest, createRequest, updateRequest, deleteRequest, fetchOneRequest } from "@/modules/team/team.slice";
import { Dropzone, DropzoneValue } from "@/modules/treatments/components/Dropzone";
import { SpinnerCustom } from "@/components/ui/spinner";
import { TeamPreviewModal, TeamPreviewData } from "@/modules/team/TeamPreview";

const TEAM_CATEGORIES = [
  { value: "general", label: "General Dentistry" },
  { value: "orthodontics", label: "Orthodontics" },
  { value: "endodontics", label: "Endodontics" },
  { value: "oral-surgery", label: "Oral Surgery" },
  { value: "periodontics", label: "Periodontics" },
  { value: "implantology", label: "Implantology" },
  { value: "prosthodontics", label: "Prosthodontics" },
  { value: "cosmetic", label: "Cosmetic Dentistry" },
  { value: "pediatric", label: "Pediatric Dentistry" },
];

function categoryLabel(cat: string): string {
  return TEAM_CATEGORIES.find((c) => c.value === cat)?.label || cat;
}

type TeamMember = {
  _id: string;
  name: string;
  slug: string;
  role: string;
  category: string;
  photo?: { _id?: string; url?: string; optimizedUrl?: string } | string | null;
  bio?: string;
  qualifications?: { degree?: string; institution?: string; year?: number }[];
  reviews?: { patientName?: string; rating?: number; text?: string }[];
  experienceYears?: number | null;
  order?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

function photoUrlOf(m: TeamMember): string | null {
  const p = m.photo;
  if (!p) return null;
  if (typeof p === "string") {
    return /^https?:\/\//i.test(p) || p.startsWith("/") ? p : null;
  }
  return p.optimizedUrl || p.url || null;
}

export default function TeamPage() {
  const dispatch = useAppDispatch();
  const { items, loading, item, error } = useAppSelector(
    (s) => (s as unknown as { team: { items: unknown[]; loading: boolean; item: unknown; error?: unknown } }).team
  );

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [category, setCategory] = useState("general");
  const [photo, setPhoto] = useState<DropzoneValue>({ id: null, url: "" });
  const [bio, setBio] = useState("");
  const [qualifications, setQualifications] = useState<{ degree: string; institution: string; year: string }[]>([]);
  const [reviews, setReviews] = useState<{ patientName: string; rating: string; text: string }[]>([]);
  const [experienceYears, setExperienceYears] = useState("");
  const [order, setOrder] = useState("0");
  // profile fields for the classic layout + variants
  const [layout, setLayout] = useState<string>("classic-profile");
  const [languagesInput, setLanguagesInput] = useState("");
  const [consultationFee, setConsultationFee] = useState("");
  const [location, setLocation] = useState("");
  const [servicesInput, setServicesInput] = useState("");
  // layout picker dialog
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const [pickedLayout, setPickedLayout] = useState<string>("classic-profile");
  const [showPreview, setShowPreview] = useState(false);

const TEAM_LAYOUTS = [
  { value: "classic-profile", name: "Classic profile", desc: "Photo, stats strip, tabs, booking sidebar. The flagship doctor page.", thumb: "profile" },
] as const;

function layoutName(v: string): string {
  return TEAM_LAYOUTS.find((l) => l.value === v)?.name || v;
}

  const [saveStatus, setSaveStatus] = useState<"idle" | "waiting" | "saving">("idle");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchListRequest({}));
  }, [dispatch]);

  useEffect(() => {
    if (saveStatus === "waiting" && loading) setSaveStatus("saving");
    if (saveStatus === "saving" && !loading) {
      setSaveStatus("idle");
      if (error) {
        setMessage({ type: "error", text: "Could not save the team member. Please try again." });
      } else {
        setMessage({ type: "success", text: "Team member saved successfully." });
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
    const m = item as unknown as TeamMember & { layout?: string; languages?: string[]; consultationFee?: number | null; location?: string; services?: string[] };
    setEditingId(m._id);
    setName(m.name || "");
    setRole(m.role || "");
    setCategory(m.category || "general");
    setBio(m.bio || "");
    setQualifications((m.qualifications || []).map((q) => ({ degree: q.degree || "", institution: q.institution || "", year: q.year ? String(q.year) : "" })));
    setReviews(((m as unknown as { reviews?: { patientName?: string; rating?: number; text?: string }[] }).reviews || []).map((r) => ({ patientName: r.patientName || "", rating: r.rating != null ? String(r.rating) : "5", text: r.text || "" })));
    setExperienceYears(m.experienceYears != null ? String(m.experienceYears) : "");
    setOrder(m.order != null ? String(m.order) : "0");
    setLayout(m.layout || "classic-profile");
    setLanguagesInput((m.languages || []).join(", "));
    setConsultationFee(m.consultationFee != null ? String(m.consultationFee) : "");
    setLocation(m.location || "");
    setServicesInput((m.services || []).join(", "));
    const p = m.photo;
    if (p && typeof p === "object") {
      setPhoto({ id: p._id || null, url: p.optimizedUrl || p.url || "" });
    } else {
      setPhoto({ id: null, url: "" });
    }
  }, [item]);

  const list = useMemo(() => (Array.isArray(items) ? (items as unknown as TeamMember[]) : []), [items]);

  const filtered = useMemo(() => {
    let r = list;
    if (activeCategory !== "All") r = r.filter((m) => m.category === activeCategory);
    const q = search.trim().toLowerCase();
    if (q) r = r.filter((m) => (m.name || "").toLowerCase().includes(q) || (m.role || "").toLowerCase().includes(q));
    return r;
  }, [list, activeCategory, search]);

  const resetEditor = () => {
    setEditingId(null);
    setShowEditor(false);
    setName("");
    setRole("");
    setCategory("general");
    setPhoto({ id: null, url: "" });
    setBio("");
    setQualifications([]);
    setReviews([]);
    setExperienceYears("");
    setOrder("0");
    setLayout("classic-profile");
    setLanguagesInput("");
    setConsultationFee("");
    setLocation("");
    setServicesInput("");
  };

  const handleAddNew = () => {
    resetEditor();
    setPickedLayout("classic-profile");
    setShowLayoutPicker(true);
    setMessage(null);
  };

  const handleLayoutContinue = () => {
    setLayout(pickedLayout);
    setShowLayoutPicker(false);
    setShowEditor(true);
    setTimeout(() => {
      editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      nameRef.current?.focus();
    }, 250);
  };

  const handleSave = (publish: boolean) => {
    if (!name.trim() || !role.trim() || saveStatus !== "idle") return;
    if (photo.url && !photo.id) {
      setMessage({ type: "error", text: "Photo is an external URL — upload or pick from Media Library to save it." });
      return;
    }
    const slug =
      name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100) ||
      `member-${Date.now()}`;
    const cleanedQuals = qualifications
      .filter((q) => q.degree.trim() || q.institution.trim())
      .map((q) => ({
        degree: q.degree.trim() || undefined,
        institution: q.institution.trim() || undefined,
        year: q.year.trim() ? parseInt(q.year.trim(), 10) : undefined,
      }));
    const cleanedReviews = reviews
      .filter((r) => r.patientName.trim() || r.text.trim())
      .map((r) => ({
        patientName: r.patientName.trim() || undefined,
        rating: r.rating.trim() ? Math.min(5, Math.max(1, parseInt(r.rating.trim(), 10) || 5)) : 5,
        text: r.text.trim() || undefined,
      }));
    const payload: Record<string, unknown> = {
      name: name.trim(),
      slug,
      role: role.trim(),
      category,
      bio: bio.trim() || undefined,
      qualifications: cleanedQuals.length ? cleanedQuals : undefined,
      reviews: cleanedReviews.length ? cleanedReviews : undefined,
      experienceYears: experienceYears.trim() ? parseInt(experienceYears.trim(), 10) : undefined,
      order: order.trim() ? parseInt(order.trim(), 10) : 0,
      status: publish ? "published" : "draft",
      layout,
      languages: languagesInput.split(",").map((l) => l.trim()).filter(Boolean).slice(0, 20),
      consultationFee: consultationFee.trim() ? parseFloat(consultationFee.trim()) : undefined,
      location: location.trim() || undefined,
      services: servicesInput.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 30),
    };
    if (photo.id) payload.photo = photo.id;
    else if (editingId) payload.photo = null;
    setMessage(null);
    setSaveStatus("waiting");
    if (editingId) {
      dispatch(updateRequest({ id: editingId, ...payload } as never));
    } else {
      dispatch(createRequest(payload as never));
    }
  };

  const previewData: TeamPreviewData = {
    name,
    slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100),
    role,
    category,
    bio,
    layout,
    photoUrl: photo.url,
    qualifications: qualifications.filter((q) => q.degree.trim() || q.institution.trim()).map((q) => ({ degree: q.degree.trim(), institution: q.institution.trim(), year: q.year.trim() ? parseInt(q.year.trim(), 10) : undefined })),
    experienceYears: experienceYears.trim() ? parseInt(experienceYears.trim(), 10) : null,
    languages: languagesInput.split(",").map((l) => l.trim()).filter(Boolean),
    consultationFee: consultationFee.trim() ? parseFloat(consultationFee.trim()) : null,
    location: location.trim(),
    services: servicesInput.split(",").map((s) => s.trim()).filter(Boolean),
    reviews: reviews.filter((r) => r.patientName.trim() || r.text.trim()).map((r) => ({ patientName: r.patientName.trim(), rating: r.rating.trim() ? Math.min(5, Math.max(1, parseInt(r.rating.trim(), 10) || 5)) : 5, text: r.text.trim() })),
  };

  const handleEdit = (id: string) => {
    setShowEditor(true);
    dispatch(fetchOneRequest(id as never));
  };

  const handleDelete = (id: string, memberName: string) => {
    if (typeof window !== "undefined" && !window.confirm(`Delete "${memberName}"?\n\nThis action cannot be undone.`)) return;
    setDeletingId(id);
    dispatch(deleteRequest(id as never));
  };

  useEffect(() => {
    if (deletingId && !loading) {
      const t = setTimeout(() => setDeletingId(null), 500);
      return () => clearTimeout(t);
    }
  }, [loading, deletingId]);

  return (
    <AdminLayout>
      <div className="min-w-0 flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Our Team</h2>
            <p className="mt-0.5 text-xs text-zinc-500">Doctors listed on the website — only Published members appear.</p>
          </div>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            <Plus size={16} /> Add Member
          </button>
        </div>

        {showEditor && (
          <div ref={editorRef} className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{editingId ? "Edit Member" : "Add Member"}</h3>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">{layoutName(layout)}</span>
                <button onClick={resetEditor} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"><X size={16} /></button>
              </div>
            </div>
            {message && <div className={`mb-3 rounded-lg px-3 py-2 text-sm ${message.type === "success" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20" : "bg-red-50 text-red-700 dark:bg-red-900/20"}`}>{message.text}</div>}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Name *</label>
                <input ref={nameRef} value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Jane Doe" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Role *</label>
                <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Orthodontist" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Category *</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                  {TEAM_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Experience (years)</label>
                  <input value={experienceYears} onChange={(e) => setExperienceYears(e.target.value.replace(/[^0-9]/g, ""))} placeholder="10" inputMode="numeric" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Sort order</label>
                  <input value={order} onChange={(e) => setOrder(e.target.value.replace(/[^0-9]/g, ""))} placeholder="0" inputMode="numeric" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Languages (comma-separated)</label>
                <input value={languagesInput} onChange={(e) => setLanguagesInput(e.target.value)} placeholder="English, Hindi" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Consultation fee (₹)</label>
                  <input value={consultationFee} onChange={(e) => setConsultationFee(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="800" inputMode="decimal" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Clinic location</label>
                  <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="New Rajinder Nagar, New Delhi" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Services & conditions (comma-separated)</label>
                <input value={servicesInput} onChange={(e) => setServicesInput(e.target.value)} placeholder="Braces, Clear Aligners, Root Canals" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
              </div>
              <div className="md:col-span-2">
                <Dropzone label="Photo" value={photo} onChange={setPhoto} hint="Drag & drop or Library — shown on team cards and profile" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder="Short professional bio..." className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Qualifications</label>
                <div className="space-y-2">
                  {qualifications.map((q, idx) => (
                    <div key={idx} className="grid gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700 md:grid-cols-3">
                      <input value={q.degree} onChange={(e) => { const n = [...qualifications]; n[idx].degree = e.target.value; setQualifications(n); }} placeholder="Degree (e.g. MDS)" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                      <input value={q.institution} onChange={(e) => { const n = [...qualifications]; n[idx].institution = e.target.value; setQualifications(n); }} placeholder="Institution" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                      <input value={q.year} onChange={(e) => { const n = [...qualifications]; n[idx].year = e.target.value.replace(/[^0-9]/g, ""); setQualifications(n); }} placeholder="Year" inputMode="numeric" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                      <button onClick={() => setQualifications(qualifications.filter((_, i) => i !== idx))} className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-800 md:col-span-3">Remove</button>
                    </div>
                  ))}
                  <button onClick={() => setQualifications([...qualifications, { degree: "", institution: "", year: "" }])} className="w-full rounded-lg border border-dashed border-zinc-300 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400">+ Add Qualification</button>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Patient Reviews (shown on the Reviews tab)</label>
                <div className="space-y-2">
                  {reviews.map((r, idx) => (
                    <div key={idx} className="grid gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700 md:grid-cols-3">
                      <input value={r.patientName} onChange={(e) => { const n = [...reviews]; n[idx].patientName = e.target.value; setReviews(n); }} placeholder="Patient name" maxLength={100} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                      <select value={r.rating} onChange={(e) => { const n = [...reviews]; n[idx].rating = e.target.value; setReviews(n); }} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                        {[5, 4, 3, 2, 1].map((n) => <option key={n} value={String(n)}>{n} star{n > 1 ? "s" : ""}</option>)}
                      </select>
                      <input value={r.text} onChange={(e) => { const n = [...reviews]; n[idx].text = e.target.value; setReviews(n); }} placeholder="Review text" maxLength={1000} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white md:col-span-3" />
                      <button onClick={() => setReviews(reviews.filter((_, i) => i !== idx))} className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-800 md:col-span-3">Remove review</button>
                    </div>
                  ))}
                  <button onClick={() => setReviews([...reviews, { patientName: "", rating: "5", text: "" }])} className="w-full rounded-lg border border-dashed border-zinc-300 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400">+ Add Review</button>
                </div>
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

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1 overflow-x-auto rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
            {["All", ...TEAM_CATEGORIES.map((c) => c.value)].map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition ${activeCategory === c ? "bg-zinc-900 text-white shadow dark:bg-white dark:text-zinc-900" : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"}`}
              >
                {c === "All" ? "All" : categoryLabel(c)}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search team"
              className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {loading && <SpinnerCustom />}
          {!loading && !!error && (
            <p className="py-8 text-center text-sm text-red-500 md:col-span-2">Failed to load team. Please try again.</p>
          )}
          {!loading && !error && filtered.map((m) => {
            const img = photoUrlOf(m);
            return (
              <div key={m._id} className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt={m.name} className="h-16 w-16 shrink-0 rounded-xl object-cover ring-1 ring-zinc-900/10" />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-lg font-bold text-sky-600 dark:bg-sky-900/30">
                    {m.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-white">{m.name}</span>
                    {m.status === "draft" && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">Draft</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-sky-600">{m.role} · {categoryLabel(m.category)}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">
                    {m.experienceYears != null ? `${m.experienceYears}+ yrs` : ""}{m.experienceYears != null && m.bio ? " · " : ""}{m.bio || ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-start gap-1">
                  <button onClick={() => handleEdit(m._id)} title="Edit member" aria-label={`Edit ${m.name}`} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800">
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(m._id, m.name)}
                    disabled={deletingId === m._id && loading}
                    title="Delete member"
                    aria-label={`Delete ${m.name}`}
                    className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
          {!loading && !error && filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-zinc-500 md:col-span-2">
              {list.length === 0 ? "No team members yet — click “Add Member” to create the first one." : "No members match your filter or search."}
            </p>
          )}
        </div>
      </div>

      {/* Choose a layout dialog */}
      {showLayoutPicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={() => setShowLayoutPicker(false)}>
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between p-6 pb-0">
              <div>
                <h3 className="text-lg font-semibold text-white">Choose a layout</h3>
                <p className="mt-0.5 text-sm text-zinc-400">Pick how this doctor&apos;s profile will look. You can&apos;t change this later.</p>
              </div>
              <button onClick={() => setShowLayoutPicker(false)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"><X size={18} /></button>
            </div>
            <div className="border-b border-zinc-800 px-6 pt-4">
              <div className="flex gap-6 text-xs font-medium">
                <span className="border-b-2 border-teal-400 pb-2 text-white">1. Layout</span>
                <span className="pb-2 text-zinc-500">2. Content</span>
                <span className="pb-2 text-zinc-500">3. Review</span>
              </div>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
              {TEAM_LAYOUTS.map((l) => {
                const active = pickedLayout === l.value;
                return (
                  <button
                    key={l.value}
                    onClick={() => setPickedLayout(l.value)}
                    className={`rounded-xl border p-3 text-left transition-colors ${active ? "border-teal-400 bg-teal-400/10" : "border-zinc-700 bg-zinc-800/60 hover:border-zinc-500"}`}
                  >
                    <div className="relative mb-3 overflow-hidden rounded-lg bg-zinc-800 p-3">
                      {active && <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-teal-400 text-zinc-900"><Check size={12} /></span>}
                      <TeamLayoutThumb kind={l.value} />
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
      {showPreview && <TeamPreviewModal data={previewData} onClose={() => setShowPreview(false)} />}
    </AdminLayout>
  );
}

function TeamLayoutThumb({ kind }: { kind: string }) {
  const bar = "h-1.5 rounded-full bg-zinc-500/70";
  const teal = "bg-teal-200/90";
  if (kind === "classic-profile") {
    return <div className="space-y-2"><div className="flex gap-2"><div className={`h-12 w-12 shrink-0 rounded-lg ${teal}`} /><div className="flex-1 space-y-1.5"><div className={`${bar} w-3/4 bg-zinc-400`} /><div className={`${bar} w-full bg-zinc-400`} /></div></div><div className="grid grid-cols-4 gap-1">{[0, 1, 2, 3].map((i) => (<div key={i} className={`${bar} bg-zinc-600`} />))}</div><div className="grid grid-cols-2 gap-2"><div className="h-10 rounded bg-zinc-700" /><div className="h-10 rounded bg-zinc-700" /></div></div>;
  }
  if (kind === "sanctuary-editorial") {
    return <div className="space-y-2"><div className={`${bar} w-1/3 bg-teal-200/70`} /><div className={`${bar} w-full bg-zinc-400`} /><div className={`h-14 rounded ${teal}`} /><div className={`${bar} w-5/6 bg-zinc-400`} /></div>;
  }
  if (kind === "compact-card") {
    return <div className="flex flex-col items-center space-y-2"><div className={`h-10 w-10 rounded-full ${teal}`} /><div className={`${bar} w-1/2 bg-zinc-400`} /><div className={`${bar} w-2/3 bg-zinc-600`} /></div>;
  }
  if (kind === "timeline") {
    return <div className="space-y-2">{[0, 1, 2].map((i) => (<div key={i} className="flex items-center gap-2"><span className={`h-3 w-3 shrink-0 rounded-full ${teal}`} /><div className={`${bar} flex-1 bg-zinc-400`} /></div>))}</div>;
  }
  return <div className="space-y-2"><div className={`h-14 rounded ${teal}`} /><div className="flex gap-1">{[0, 1, 2].map((i) => (<div key={i} className="h-4 flex-1 rounded-full bg-zinc-600" />))}</div><div className={`${bar} w-2/3 bg-zinc-400`} /></div>;
}
