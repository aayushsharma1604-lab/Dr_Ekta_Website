"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, X, Loader2, Library } from "lucide-react";
import { uploadFileToLibrary } from "@/lib/uploadMedia";
import { MediaPicker } from "@/components/MediaPicker";
import type { LibraryAsset } from "@/lib/uploadMedia";

export interface DropzoneValue {
  /** MediaAsset _id when the file lives in the Media Library, else null (external URL) */
  id: string | null;
  /** Effective file URL (library URL or pasted URL) */
  url: string;
  /** MIME type of the uploaded/picked asset, when known (used for video preview) */
  mimeType?: string | null;
}

interface DropzoneProps {
  label: string;
  value: DropzoneValue;
  onChange: (v: DropzoneValue) => void;
  hint?: string;
  /** Native file-picker filter. Defaults to "image/*" to preserve existing image-only usages. */
  accept?: string;
  /**
   * Required MIME prefix (e.g. "image/", "video/").
   * Pass "" to allow any type and let the backend (Media Library allowlist) validate.
   * Defaults to "image/" to preserve existing image-only usages.
   */
  mimePrefix?: string;
  /** Placeholder for the paste-URL input. */
  urlPlaceholder?: string;
}

function looksLikeVideo(url: string, mimeType?: string | null) {
  if (mimeType && mimeType.startsWith("video/")) return true;
  return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url || "");
}

export function Dropzone({
  label,
  value,
  onChange,
  hint,
  accept = "image/*",
  mimePrefix = "image/",
  urlPlaceholder,
}: DropzoneProps) {
  const [drag, setDrag] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  // Pasted-URL draft. When an uploaded file exists it stays in the background
  // and the uploaded file wins (priority); removing the file falls back to it.
  const [urlText, setUrlText] = useState(value.id ? "" : value.url || "");
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync when parent loads a value (e.g. editing an existing treatment)
  useEffect(() => {
    if (!value.id) setUrlText(value.url || "");
    else setUrlText((prev) => prev);
  }, [value.id, value.url]);

  const applyAsset = useCallback(
    (asset: LibraryAsset) => {
      setError(null);
      onChange({ id: asset._id, url: asset.optimizedUrl || asset.url, mimeType: asset.mimeType });
    },
    [onChange]
  );

  const onFile = useCallback(
    async (file: File) => {
      setError(null);
      if (mimePrefix && file.type && !file.type.startsWith(mimePrefix)) {
        const kind = mimePrefix.startsWith("video/") ? "video" : mimePrefix.startsWith("image/") ? "image" : mimePrefix;
        setError(`Only ${kind} files are allowed here.`);
        return;
      }
      setUploading(true);
      try {
        const asset = await uploadFileToLibrary(file);
        applyAsset(asset);
      } catch (e) {
        setError((e as Error).message || "Upload failed.");
      } finally {
        setUploading(false);
      }
    },
    [applyAsset, mimePrefix]
  );

  const onUrlChange = (v: string) => {
    setUrlText(v);
    setError(null);
    // Dropzone (uploaded file) wins while present — URL applies only when
    // no library asset is set.
    if (!value.id) {
      onChange({ id: null, url: v, mimeType: null });
    }
  };

  const removeFile = () => {
    // Fall back to whatever URL was typed (dropzone no longer wins)
    onChange({ id: null, url: urlText, mimeType: null });
  };

  const clearAll = () => {
    setUrlText("");
    onChange({ id: null, url: "", mimeType: null });
  };

  const isVideoPreview = looksLikeVideo(value.url, value.mimeType);

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault(); setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) { onFile(f); return; }
          const url = e.dataTransfer.getData("text/plain");
          if (url) onUrlChange(url);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center transition-colors ${drag ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20" : "border-zinc-300 bg-zinc-50 hover:border-blue-300 hover:bg-blue-50/50 dark:border-zinc-700 dark:bg-zinc-800/50"}`}
      >
        <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
        {uploading ? (
          <div className="flex items-center gap-2 py-4 text-sm text-zinc-500"><Loader2 size={18} className="animate-spin" /> Uploading to Media Library…</div>
        ) : value.url ? (
          <div className="relative w-full">
            {isVideoPreview ? (
              <video
                src={value.url}
                controls
                className="mx-auto max-h-36 w-full rounded-lg bg-black"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <img src={value.url} alt={label} className="mx-auto max-h-36 w-full rounded-lg object-cover" />
            )}
            <button type="button" onClick={(e) => { e.stopPropagation(); value.id ? removeFile() : clearAll(); }} className="absolute right-1 top-1 rounded-full bg-white p-1 text-zinc-500 shadow hover:text-red-600 dark:bg-zinc-800" title={value.id ? "Remove uploaded file (fall back to URL)" : "Clear"}>
              <X size={12} />
            </button>
            <p className="mt-2 text-xs text-zinc-500">
              {value.id ? "Using uploaded file from Media Library — click × to fall back to URL" : "Using external URL — drop a file to override"}
            </p>
          </div>
        ) : (
          <>
            <Upload size={20} className="mb-1 text-zinc-400" />
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Drag & drop or click to upload</p>
            <p className="mt-1 text-[10px] text-zinc-400">{hint || "PNG, JPG, WEBP — goes to the Media Library"}</p>
          </>
        )}
      </div>

      <div className="mt-2 flex gap-2">
        <input
          value={value.id ? urlText : value.url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder={urlPlaceholder || "Or paste file URL https://..."}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        />
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          title="Pick from Media Library"
        >
          <Library size={12} /> Library
        </button>
      </div>
      {value.id && urlText && (
        <p className="mt-1 text-[10px] text-amber-600 dark:text-amber-400">A URL is also entered — the uploaded file takes priority until removed.</p>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={applyAsset} mimePrefix={mimePrefix} />
    </div>
  );
}
