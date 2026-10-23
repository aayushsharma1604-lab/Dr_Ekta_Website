"use client";

interface ImageSettingsProps {
  data: { image: string; alt: string };
  onChange: (data: ImageSettingsProps["data"]) => void;
}

export function ImageSettings({ data, onChange }: ImageSettingsProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Hero Banner Settings</h3>
        <button className="rounded-lg border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400">Manage Banner Image</button>
      </div>
      <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Image</label>
      <div className="aspect-[16/6] overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
        {data.image ? (
          <img src={data.image} alt={data.alt || "Banner"} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-xs text-zinc-400">
            <span className="text-2xl">🖼️</span> No image uploaded
          </div>
        )}
      </div>
      <input value={data.image} onChange={(e) => onChange({ ...data, image: e.target.value })} placeholder="Paste image URL or upload" className="mt-3 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
      <div className="mt-3">
        <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Alt Text</label>
        <input value={data.alt} onChange={(e) => onChange({ ...data, alt: e.target.value })} placeholder="Descriptive alt text" className="w-full rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white" />
      </div>
    </div>
  );
}
