"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchListRequest, createRequest, updateRequest, deleteRequest, fetchOneRequest } from "@/modules/instagramPosts/instagramPosts.slice";
import { Dropzone, DropzoneValue } from "@/modules/treatments/components/Dropzone";
import { SpinnerCustom } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function InstagramPostsPage() {
  const dispatch = useAppDispatch();
  const { items, loading, item } = useAppSelector((s) => (s as unknown as { instagramPosts: { items: never[]; loading: boolean; item: unknown } }).instagramPosts);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [permalink, setPermalink] = useState("");
  const [caption, setCaption] = useState("");
  const [order, setOrder] = useState(0);
  const [image, setImage] = useState<DropzoneValue>({ id: null, url: "" });

  useEffect(() => { dispatch(fetchListRequest({})); }, [dispatch]);

  useEffect(() => {
    if (!item) return;
    const p = item as unknown as { _id: string; permalink: string; caption?: string; order: number; image?: { _id: string; url: string; optimizedUrl?: string } | string };
    setEditingId(p._id);
    setPermalink(p.permalink || "");
    setCaption(p.caption || "");
    setOrder(p.order || 0);
    if (p.image) {
      if (typeof p.image === "string") setImage({ id: p.image, url: "" });
      else setImage({ id: (p.image as { _id: string })._id || null, url: (p.image as { url: string }).url || (p.image as { optimizedUrl: string }).optimizedUrl || "" });
    }
    setShowForm(true);
  }, [item]);

  const handleSave = async () => {
    if (!permalink.trim()) { toast.error('Permalink is required'); return; }
    if (!image.id) { toast.error('Image is required — upload or pick from Library'); return; }
    try {
      const payload: Record<string, unknown> = { permalink: permalink.trim(), caption: caption.trim() || undefined, order: Number(order) || 0, image: image.id };
      if (editingId) dispatch(updateRequest({ id: editingId, ...payload } as never));
      else dispatch(createRequest(payload as never));
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error || (e as Error).message;
      toast.error(msg);
    }
  };

  const handleEdit = (id: string) => dispatch(fetchOneRequest(id as never));
  const handleDelete = (id: string) => dispatch(deleteRequest(id as never));
  const handleCancel = () => { setShowForm(false); setEditingId(null); setPermalink(""); setCaption(""); setOrder(0); setImage({ id: null, url: "" }); };

  const list = (items as unknown as { _id: string; image?: { url: string }; permalink: string; caption?: string; order: number }[]) || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Instagram Posts</h2>
            <p className="text-sm text-zinc-500">Curate Instagram posts shown on the website</p>
          </div>
          <button onClick={() => (showForm ? handleCancel() : setShowForm(true))} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
            <Plus size={16} />{showForm ? "Cancel" : "Add Post"}
          </button>
        </div>

        {showForm && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 font-semibold text-zinc-900 dark:text-white">{editingId ? "Edit Post" : "Add Post"}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Permalink * (must be URL)</label>
                <input value={permalink} onChange={(e) => setPermalink(e.target.value)} placeholder="https://www.instagram.com/p/..." className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Caption</label>
                <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Order</label>
                <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
              </div>
              <div className="md:col-span-2">
                <Dropzone label="Image *" value={image} onChange={setImage} hint="Drag & drop or click to upload — uses Media Library, Library icon to pick from Cloudinary" />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={handleSave} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">{editingId ? "Update" : "Save"} Post</button>
              <button onClick={handleCancel} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400">Cancel</button>
            </div>
          </div>
        )}

        {loading && <SpinnerCustom />}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <div key={p._id} className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
              <img src={p.image?.url || "https://via.placeholder.com/400?text=instagram"} alt="ig" className="aspect-square rounded-lg object-cover" />
              <p className="mt-2 truncate text-xs text-blue-600">{p.permalink}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{p.caption || "—"}</p>
              <div className="mt-2 flex gap-1">
                <button onClick={() => handleEdit(p._id)} className="flex-1 rounded-lg border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400">Edit</button>
                <button onClick={() => handleDelete(p._id)} className="flex-1 rounded-lg border border-zinc-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-zinc-700 dark:hover:bg-red-900/20">Delete</button>
              </div>
            </div>
          ))}
        </div>
        {!loading && list.length === 0 && <p className="py-8 text-center text-sm text-zinc-500">No posts — add one.</p>}
      </div>
    </AdminLayout>
  );
}
