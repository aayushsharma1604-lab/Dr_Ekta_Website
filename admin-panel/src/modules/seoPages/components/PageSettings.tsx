"use client";

interface PageSettingsProps {
  data: {
    pageTitle: string;
    pageUrl: string;
    metaTitle: string;
    metaDescription: string;
    shortDescription: string;
  };
  onChange: (data: PageSettingsProps["data"]) => void;
}

export function PageSettings({ data, onChange }: PageSettingsProps) {
  const update = (field: keyof typeof data, value: string) =>
    onChange({ ...data, [field]: value });

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-white">Page Settings</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Page Title</label>
          <input value={data.pageTitle} onChange={(e) => update("pageTitle", e.target.value)} placeholder="Expert Healthcare for Modern Lives" className="w-full rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Page URL</label>
          <input value={data.pageUrl} onChange={(e) => update("pageUrl", e.target.value)} placeholder="/category/page" className="w-full rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Meta Title</label>
          <input value={data.metaTitle} onChange={(e) => update("metaTitle", e.target.value)} placeholder="Empowering patients through cutting-edge" className="w-full rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Meta Description</label>
          <textarea value={data.metaDescription} onChange={(e) => update("metaDescription", e.target.value)} rows={3} placeholder="Empowering patients through cutting-edge technology and compassionate clinical guidance..." className="w-full rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Short Description</label>
          <input value={data.shortDescription} onChange={(e) => update("shortDescription", e.target.value)} placeholder="Book Consultation" className="w-full rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white" />
        </div>
      </div>
    </div>
  );
}
