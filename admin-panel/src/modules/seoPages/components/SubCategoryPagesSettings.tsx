"use client";

import { Plus, Pencil, Trash2 } from "lucide-react";

interface SubCategoryPagesSettingsProps {
  data: { sectionHeading: string; shortHeading: string; description: string; pages: { id: string; title: string; category: string }[] };
  onChange: (data: SubCategoryPagesSettingsProps["data"]) => void;
}

export function SubCategoryPagesSettings({ data, onChange }: SubCategoryPagesSettingsProps) {
  const update = (field: keyof typeof data, value: string) => onChange({ ...data, [field]: value as never });

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-white">Sub Category Pages Settings</h3>
      <p className="mb-4 text-xs text-zinc-500">Configure and manage medical test related pages to boost SEO and user navigation.</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Section Short Heading *</label>
          <input value={data.shortHeading} onChange={(e) => update("shortHeading", e.target.value)} placeholder="Report types we analyse" className="w-full rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Section Main Heading *</label>
          <input value={data.sectionHeading} onChange={(e) => update("sectionHeading", e.target.value)} placeholder="Supported Medical Reports" className="w-full rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Section Description</label>
          <textarea value={data.description} onChange={(e) => update("description", e.target.value)} rows={2} placeholder="Our AI system can analyse multiple types..." className="w-full rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white" />
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">Related Pages</p>
        <div className="space-y-2">
          {data.pages.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700">
              <div>
                <p className="font-medium text-zinc-900 dark:text-white">{p.title}</p>
                <p className="text-xs text-zinc-500">{p.category}</p>
              </div>
              <div className="flex gap-1">
                <button className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"><Pencil size={12} /></button>
                <button className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
        <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-blue-300 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400">
          <Plus size={14} /> Add Related Page
        </button>
      </div>

      <div className="mt-4 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
        <p className="mb-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">Layout & Interactions</p>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-zinc-500">Cards Per Row</label>
            <select className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-1.5 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white">
              <option>2 Columns</option><option>3 Columns</option><option>4 Columns</option>
            </select>
          </div>
          <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded" /> Show CTA Arrow</label>
          <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /> Enable Hover Effect</label>
        </div>
      </div>
    </div>
  );
}
