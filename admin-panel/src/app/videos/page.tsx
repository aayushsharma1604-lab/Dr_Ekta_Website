"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchListRequest, createRequest, updateRequest, deleteRequest, fetchOneRequest } from "@/modules/videos/videos.slice";
import { SpinnerCustom } from "@/components/ui/spinner";

export default function VideosPage() {
  const dispatch = useAppDispatch();
  const { items, loading, item } = useAppSelector((s) => (s as unknown as { videos: { items: never[]; loading: boolean; item: unknown } }).videos);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("youtube");
  const [videoId, setVideoId] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("published");
  const [transcript, setTranscript] = useState("");

  useEffect(() => { dispatch(fetchListRequest({})); }, [dispatch]);

  useEffect(() => {
    if (!item) return;
    const v = item as unknown as { _id: string; title: string; url: string; category: string; status: string; transcript?: string };
    setEditingId(v._id);
    setTitle(v.title || "");
    // try to extract videoId from url
    if (v.url.includes("youtube") || v.url.includes("youtu.be")) {
      setPlatform("youtube");
      const m = v.url.match(/(?:v=|youtu\.be\/)([^&]+)/);
      setVideoId(m ? m[1] : "");
    } else if (v.url.includes("instagram")) {
      setPlatform("instagram");
      const m = v.url.match(/\/p\/([^/]+)/);
      setVideoId(m ? m[1] : "");
    } else {
      setVideoId("");
    }
    setCategory(v.category || "");
    setStatus(v.status || "published");
    setTranscript(v.transcript || "");
    setShowForm(true);
  }, [item]);

  const handleSave = () => {
    const url = platform === "youtube"
      ? `https://www.youtube.com/watch?v=${videoId.trim()}`
      : `https://www.instagram.com/p/${videoId.trim()}/`;
    const thumbnail = platform === "youtube" ? `https://img.youtube.com/vi/${videoId.trim()}/mqdefault.jpg` : undefined;
    const payload: Record<string, unknown> = {
      url,
      title: title.trim(),
      category: category.trim() || "general",
      status,
      transcript: transcript.trim() || undefined,
    };
    if (thumbnail) payload.thumbnail = thumbnail;
    if (editingId) dispatch(updateRequest({ id: editingId, ...payload } as never));
    else dispatch(createRequest(payload as never));
  };

  const handleEdit = (id: string) => dispatch(fetchOneRequest(id as never));
  const handleDelete = (id: string) => dispatch(deleteRequest(id as never));
  const handleCancel = () => { setShowForm(false); setEditingId(null); setTitle(""); setVideoId(""); setCategory(""); setStatus("published"); setTranscript(""); };

  const list = (items as unknown as { _id: string; title: string; url: string; category: string; status: string; thumbnail?: string }[]) || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Videos</h2>
            <p className="text-sm text-zinc-500">Manage YouTube and Instagram videos</p>
          </div>
          <button onClick={() => (showForm ? handleCancel() : setShowForm(true))} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
            <Plus size={16} />
            {showForm ? "Cancel" : "Add Video"}
          </button>
        </div>

        {showForm && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 font-semibold text-zinc-900 dark:text-white">{editingId ? "Edit Video" : "Add Video"}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Video Title *</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" placeholder="e.g. What is a Dental Implant?" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Platform</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                  <option value="youtube">YouTube</option>
                  <option value="instagram">Instagram</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {platform === "youtube" ? "YouTube Video ID *" : "Instagram Post/Reel ID *"}
                </label>
                <input value={videoId} onChange={(e) => setVideoId(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" placeholder={platform === "youtube" ? "e.g. dQw4w9WgXcQ" : "e.g. DExample123"} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Category *</label>
                <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" placeholder="e.g. Dental Implants" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                  <option value="published">published</option>
                  <option value="hidden">hidden</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Transcript (accessibility)</label>
                <input value={transcript} onChange={(e) => setTranscript(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" placeholder="Short description / transcript" />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={handleSave} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">{editingId ? "Update" : "Save"} Video</button>
              <button onClick={handleCancel} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400">Cancel</button>
            </div>
          </div>
        )}

        {loading && <SpinnerCustom />}
        {!loading && list.length === 0 && <p className="py-8 text-center text-sm text-zinc-500">No videos — add one.</p>}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((video) => {
            const isYt = video.url.includes("youtube") || video.url.includes("youtu.be");
            const vid = isYt ? (video.url.match(/(?:v=|youtu\.be\/)([^&]+)/)?.[1] || "") : "";
            return (
              <div key={video._id} className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-800">
                  {isYt && vid ? (
                    <img src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`} alt={video.title} className="h-full w-full object-cover" />
                  ) : isYt ? (
                    <img src={video.thumbnail || `https://via.placeholder.com/320x180?text=video`} alt={video.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-sm font-medium text-white">
                      Instagram — {video.url}
                    </div>
                  )}
                  <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-medium text-white ${isYt ? "bg-red-600" : "bg-gradient-to-r from-purple-500 to-pink-500"}`}>
                    {isYt ? "YouTube" : "Instagram"}
                  </span>
                  <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-medium ${video.status === "published" ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-600"}`}>{video.status}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-zinc-900 dark:text-white">{video.title}</h3>
                  <p className="mt-1 text-xs text-zinc-500">{video.category}</p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => handleEdit(video._id)} className="flex-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400">Edit</button>
                    <button onClick={() => handleDelete(video._id)} className="flex-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-zinc-700 dark:hover:bg-red-900/20">Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
