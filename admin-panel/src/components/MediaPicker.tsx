"use client";

import { useEffect, useState } from "react";
import { X, Check, Image as ImageIcon, Video, FileText } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchListRequest } from "@/modules/media/media.slice";
import type { LibraryAsset } from "@/lib/uploadMedia";

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: LibraryAsset) => void;
  mimePrefix?: string; // e.g. "image/" to show images only
  title?: string;
}

type AssetRow = LibraryAsset & { createdAt?: string };

export function MediaPicker({ open, onClose, onSelect, mimePrefix = "image/", title = "Pick from Media Library" }: MediaPickerProps) {
  const dispatch = useAppDispatch();
  const { items, loading, pagination } = useAppSelector(
    (s) => (s as unknown as { media: { items: never[]; loading: boolean; pagination: { page: number; limit: number; total: number; pages: number } | null } }).media ?? { items: [], loading: false, pagination: null }
  );
  const [page, setPage] = useState(1);
  const limit = 12;

  useEffect(() => {
    if (open) {
      setPage(1);
      dispatch(fetchListRequest({ page: 1, limit } as never));
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (open) dispatch(fetchListRequest({ page, limit } as never));
  }, [open, page, dispatch]);

  if (!open) return null;

  const list = ((items as unknown as AssetRow[]) || []).filter((a) => !mimePrefix || (a.mimeType || "").startsWith(mimePrefix));
  const pag = pagination as unknown as { page: number; limit: number; total: number; pages: number } | null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"><X size={16} /></button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5">
          {loading && <p className="py-8 text-center text-sm text-zinc-500">Loading library…</p>}
          {!loading && list.length === 0 && <p className="py-8 text-center text-sm text-zinc-500">No media in the library. Upload files from the Media page first.</p>}
          <div className="grid gap-3 sm:grid-cols-3">
            {list.map((a) => {
              const isImage = (a.mimeType || "").startsWith("image/");
              const isVideo = (a.mimeType || "").startsWith("video/");
              const preview = a.optimizedUrl || a.url || "";
              return (
                <button
                  key={a._id}
                  onClick={() => { onSelect(a); onClose(); }}
                  className="group overflow-hidden rounded-xl border border-zinc-200 text-left transition hover:border-blue-400 hover:ring-2 hover:ring-blue-500/20 dark:border-zinc-700"
                >
                  <div className="relative flex aspect-video items-center justify-center bg-zinc-50 dark:bg-zinc-800">
                    {isImage ? (
                      <img src={preview} alt={a.filename} className="h-full w-full object-cover" loading="lazy" />
                    ) : isVideo ? (
                      <div className="flex flex-col items-center gap-1 text-zinc-500"><Video size={24} /><span className="max-w-full truncate px-2 text-[10px]">{a.filename}</span></div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-zinc-500"><FileText size={24} /><span className="max-w-full truncate px-2 text-[10px]">{a.filename}</span></div>
                    )}
                    <span className="absolute right-2 top-2 hidden rounded-full bg-blue-600 p-1 text-white group-hover:block"><Check size={12} /></span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate px-2.5 py-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <ImageIcon size={12} className="shrink-0 text-zinc-400" />
                    <span className="truncate" title={a.filename}>{a.filename}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {pag && pag.pages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-200 px-5 py-3 dark:border-zinc-800">
            <p className="text-xs text-zinc-500">Page {pag.page} of {pag.pages} • {pag.total} items</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium disabled:opacity-50 dark:border-zinc-700">Previous</button>
              <button onClick={() => setPage((p) => Math.min(pag.pages, p + 1))} disabled={page >= pag.pages} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
