"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Upload, Trash2, Search, Image as ImageIcon, FileText } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchListRequest, deleteRequest } from "@/modules/media/media.slice";
import { Dropzone, DropzoneValue } from "@/modules/treatments/components/Dropzone";
import { SpinnerCustom } from "@/components/ui/spinner";
import { toast } from "sonner";

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function MediaPage() {
  const dispatch = useAppDispatch();
  const { items, loading, pagination } = useAppSelector(
    (s) => (s as unknown as { media: { items: never[]; loading: boolean; pagination: { page: number; limit: number; total: number; pages: number } | null } }).media ?? { items: [], loading: false, pagination: null }
  );

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [mimeType, setMimeType] = useState("");
  const [dropzoneValue, setDropzoneValue] = useState<DropzoneValue>({ id: null, url: "" });

  // fetch list on mount and when page/mimeType changes
  useEffect(() => {
    dispatch(fetchListRequest({ page, limit, mimeType: mimeType || undefined } as never));
  }, [dispatch, page, limit, mimeType]);

  const handleMimeFilter = (v: string) => {
    setMimeType(v);
    setPage(1);
  };

  const handleDropzoneChange = (v: DropzoneValue) => {
    setDropzoneValue(v);
    // Dropzone handles upload to Media Library via uploadFileToLibrary; when a new asset is created it returns {id, url}
    if (v.id) {
      toast.success("Media uploaded to Library");
      dispatch(fetchListRequest({ page, limit, mimeType: mimeType || undefined } as never));
      // clear preview after 2s to allow next upload
      setTimeout(() => setDropzoneValue({ id: null, url: "" }), 2000);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this media asset?")) return;
    dispatch(deleteRequest(id as never));
  };

  const list = (items as unknown as { _id: string; filename: string; url: string; mimeType: string; size: number; optimizedUrl?: string; createdAt?: string }[]) || [];
  const pag = pagination as unknown as { page: number; limit: number; total: number; pages: number } | null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Media Library</h2>
            <p className="text-sm text-zinc-500">Upload and manage images, videos, and files</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <select
                value={mimeType}
                onChange={(e) => handleMimeFilter(e.target.value)}
                className="rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-8 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              >
                <option value="">All types</option>
                <option value="image/jpeg">image/jpeg</option>
                <option value="image/png">image/png</option>
                <option value="image/webp">image/webp</option>
                <option value="image/gif">image/gif</option>
                <option value="video/mp4">video/mp4</option>
                <option value="video/webm">video/webm</option>
                <option value="application/pdf">application/pdf</option>
                <option value="text/vtt">text/vtt</option>
              </select>
            </div>
          </div>
        </div>

        {/* Upload form — now Dropzone with drag-drop + Library picker (Cloudinary) */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-zinc-900 dark:text-white">
            <Upload size={16} className="text-blue-600" /> Upload Media
          </h3>
          <Dropzone
            label="File"
            value={dropzoneValue}
            onChange={handleDropzoneChange}
            accept="image/*,video/*,application/pdf,.vtt"
            mimePrefix=""
            urlPlaceholder="Or paste file URL https://..."
            hint="Images (JPG/PNG/WEBP/GIF, ≤5MB), Videos (MP4/WebM, ≤50MB), PDF (≤10MB) — goes to the Media Library"
          />
          {dropzoneValue.id && <p className="mt-2 text-xs text-emerald-600">Uploaded to Library — refreshing grid...</p>}
        </div>

        {/* Grid */}
        {loading && <SpinnerCustom />}
        {!loading && list.length === 0 && <p className="py-8 text-center text-sm text-zinc-500">No media — upload a file to get started.</p>}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((asset) => {
            const isImage = asset.mimeType?.startsWith("image/");
            const isVideo = asset.mimeType?.startsWith("video/");
            const preview = asset.url || asset.optimizedUrl || "";
            return (
              <div key={asset._id} className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <div className="relative flex aspect-square items-center justify-center bg-zinc-50 dark:bg-zinc-800">
                  {isImage ? (
                    <img src={preview || "https://via.placeholder.com/600?text=image"} alt={asset.filename} className="h-full w-full object-cover" />
                  ) : isVideo ? (
                    <video
                      src={preview}
                      controls
                      preload="metadata"
                      className="h-full w-full bg-black object-contain"
                    />
                  ) : asset.mimeType === "application/pdf" ? (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-red-50 p-4 dark:bg-red-900/10">
                      <FileText size={28} className="text-red-600" />
                      <span className="break-all text-center text-xs text-zinc-600 dark:text-zinc-400">{asset.filename}</span>
                    </div>
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4">
                      <ImageIcon size={28} className="text-zinc-400" />
                      <span className="break-all text-center text-xs text-zinc-500">{asset.filename}</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-white" title={asset.filename}>
                    {asset.filename}
                  </p>
                  <p className="truncate text-xs text-zinc-500">{asset.mimeType} • {formatBytes(asset.size)}</p>
                  {asset.url && (
                    <a href={asset.url} target="_blank" rel="noreferrer" className="mt-1 block truncate text-xs text-blue-600 hover:underline dark:text-blue-400">
                      {asset.url}
                    </a>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleDelete(asset._id)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-zinc-700 dark:hover:bg-red-900/20"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {pag && pag.pages > 1 && (
          <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs text-zinc-500">
              Page {pag.page} of {pag.pages} • {pag.total} items
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pag.pages, p + 1))}
                disabled={page >= pag.pages}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
