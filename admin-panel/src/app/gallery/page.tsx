"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchListRequest, createRequest, updateRequest, deleteRequest, fetchOneRequest } from "@/modules/gallery/gallery.slice";
import { fetchListRequest as fetchTreatments } from "@/modules/treatments/treatments.slice";
import { Dropzone, DropzoneValue } from "@/modules/treatments/components/Dropzone";
import { SpinnerCustom } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function GalleryPage() {
  const dispatch = useAppDispatch();
  const { items, loading, item } = useAppSelector((s) => (s as unknown as { gallery: { items: never[]; loading: boolean; item: unknown } }).gallery);
  const { items: treatments } = useAppSelector((s) => (s as unknown as { treatments: { items: never[] } }).treatments);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [treatmentTag, setTreatmentTag] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("draft");
  const [beforeImage, setBeforeImage] = useState<DropzoneValue>({ id: null, url: "" });
  const [afterImage, setAfterImage] = useState<DropzoneValue>({ id: null, url: "" });

  useEffect(() => { dispatch(fetchListRequest({} as never)); dispatch(fetchTreatments({} as never)); }, [dispatch]);

  useEffect(() => {
    if (!item) return;
    const g = item as unknown as { _id: string; treatmentTag?: string | { _id: string }; content?: string; status: string; beforeImg?: { _id: string; url: string; optimizedUrl?: string } | string; afterImg?: { _id: string; url: string; optimizedUrl?: string } | string };
    setEditingId(g._id);
    setTreatmentTag(typeof g.treatmentTag === "string" ? g.treatmentTag : (g.treatmentTag as unknown as { _id: string })?._id || "");
    setContent(g.content || "");
    setStatus(g.status || "draft");
    if (g.beforeImg) {
      if (typeof g.beforeImg === "string") setBeforeImage({ id: g.beforeImg, url: "" });
      else setBeforeImage({ id: (g.beforeImg as { _id: string })._id || null, url: (g.beforeImg as { url: string }).url || (g.beforeImg as { optimizedUrl: string }).optimizedUrl || "" });
    }
    if (g.afterImg) {
      if (typeof g.afterImg === "string") setAfterImage({ id: g.afterImg, url: "" });
      else setAfterImage({ id: (g.afterImg as { _id: string })._id || null, url: (g.afterImg as { url: string }).url || (g.afterImg as { optimizedUrl: string }).optimizedUrl || "" });
    }
    setShowForm(true);
  }, [item]);

  const handleSave = async () => {
    try {
      const beforeId = beforeImage.id;
      const afterId = afterImage.id;

      if (!beforeId || !afterId) {
        toast.error('Both before and after images are required — upload or pick from Library');
        return;
      }

      const payload: Record<string, unknown> = {
        beforeImg: beforeId,
        afterImg: afterId,
        content: content.trim() || undefined,
        status,
      };
      if (treatmentTag) payload.treatmentTag = treatmentTag;

      if (editingId) dispatch(updateRequest({ id: editingId, ...payload } as never));
      else dispatch(createRequest(payload as never));
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error || (e as Error).message;
      toast.error(msg);
    }
  };

  const handleEdit = (id: string) => dispatch(fetchOneRequest(id as never));
  const handleDelete = (id: string) => dispatch(deleteRequest(id as never));
  const handleCancel = () => { setShowForm(false); setEditingId(null); setBeforeImage({ id: null, url: "" }); setAfterImage({ id: null, url: "" }); setContent(""); setStatus("draft"); setTreatmentTag(""); };

  const list = (items as unknown as { _id: string; beforeImg?: { url: string }; afterImg?: { url: string }; treatmentTag?: { title: string }; content?: string; status: string }[]) || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Gallery</h2>
            <p className="text-sm text-zinc-500">Before and after photo pairs</p>
          </div>
          <button onClick={() => (showForm ? handleCancel() : setShowForm(true))} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
            <Plus size={16} />
            {showForm ? "Cancel" : "Add Pair"}
          </button>
        </div>

        {showForm && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 font-semibold text-zinc-900 dark:text-white">{editingId ? "Edit Pair" : "Add Before/After Pair"}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Treatment Tag</label>
                <select value={treatmentTag} onChange={(e) => setTreatmentTag(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                  <option value="">— None —</option>
                  {(treatments as unknown as { _id: string; title: string }[])?.map((t) => <option key={t._id} value={t._id}>{t.title}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                  <option value="draft">draft</option><option value="published">published</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Caption (content)</label>
                <input value={content} onChange={(e) => setContent(e.target.value)} placeholder="e.g. Veneers — before & after" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
              </div>
              <div>
                <Dropzone label="Before Image *" value={beforeImage} onChange={setBeforeImage} hint="Drag & drop or click to upload — Library icon to pick from Cloudinary" />
              </div>
              <div>
                <Dropzone label="After Image *" value={afterImage} onChange={setAfterImage} hint="Drag & drop or click to upload — Library icon to pick from Cloudinary" />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={handleSave} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">{editingId ? "Update" : "Save"} Pair</button>
              <button onClick={handleCancel} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400">Cancel</button>
            </div>
          </div>
        )}

        {loading && <SpinnerCustom />}
        {!loading && list.length === 0 && <p className="py-8 text-center text-sm text-zinc-500">No gallery items — add a before/after pair.</p>}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((g) => (
            <div key={g._id} className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="grid grid-cols-2 gap-2">
                <img src={g.beforeImg?.url || "https://via.placeholder.com/300?text=before"} alt="before" className="aspect-square rounded-lg object-cover" />
                <img src={g.afterImg?.url || "https://via.placeholder.com/300?text=after"} alt="after" className="aspect-square rounded-lg object-cover" />
              </div>
              <p className="mt-2 text-sm font-medium text-zinc-900 dark:text-white">{g.content || "—"}</p>
              <p className="text-xs text-zinc-500">{typeof g.treatmentTag === "object" ? (g.treatmentTag as unknown as { title: string })?.title : ""} • {g.status}</p>
              <div className="mt-2 flex gap-1">
                <button onClick={() => handleEdit(g._id)} className="flex-1 rounded-lg border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400">Edit</button>
                <button onClick={() => handleDelete(g._id)} className="flex-1 rounded-lg border border-zinc-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-zinc-700 dark:hover:bg-red-900/20">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
