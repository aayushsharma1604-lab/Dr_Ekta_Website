"use client";

interface HeroBannerSettingsProps {
  data: { heading: string; description: string; ctaText: string; ctaUrl: string; image: string };
  onChange: (data: HeroBannerSettingsProps["data"]) => void;
}

export function HeroBannerSettings({ data, onChange }: HeroBannerSettingsProps) {
  const update = (field: keyof typeof data, value: string) => onChange({ ...data, [field]: value });

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Hero Banner Settings</h3>
          <button className="rounded-lg border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400">Manage Banner Image</button>
        </div>
        <p className="mb-3 text-xs text-zinc-500">Background Image</p>
        <div className="mb-4 aspect-[3/1] overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
          {data.image ? (
            <img src={data.image} alt="Hero" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-zinc-400">No image selected</div>
          )}
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Heading</label>
            <input value={data.heading} onChange={(e) => update("heading", e.target.value)} placeholder="Expert Healthcare for Modern Lives" className="w-full rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Description</label>
            <textarea value={data.description} onChange={(e) => update("description", e.target.value)} rows={3} placeholder="Empowering patients through cutting-edge technology..." className="w-full rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">CTA Button Text</label>
              <input value={data.ctaText} onChange={(e) => update("ctaText", e.target.value)} placeholder="Book Consultation" className="w-full rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">CTA URL</label>
              <input value={data.ctaUrl} onChange={(e) => update("ctaUrl", e.target.value)} placeholder="/appointment" className="w-full rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
