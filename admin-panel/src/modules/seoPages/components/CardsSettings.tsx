"use client";

import { Plus, Trash2 } from "lucide-react";

interface FeatureCard { id: string; title: string; description: string; icon: string; }

interface FeatureCardsSettingsProps {
  data: { heading: string; description: string; cards: FeatureCard[] };
  onChange: (data: FeatureCardsSettingsProps["data"]) => void;
}

export function FeatureCardsSettings({ data, onChange }: FeatureCardsSettingsProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-white">Feature Cards</h3>
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-zinc-500">Section Heading</label>
          <input value={data.heading} onChange={(e) => onChange({ ...data, heading: e.target.value })} placeholder="Why Choose Us" className="w-full rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-zinc-500">Description</label>
          <textarea value={data.description} onChange={(e) => onChange({ ...data, description: e.target.value })} rows={2} placeholder="Section description..." className="w-full rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white" />
        </div>
      </div>
      <p className="mb-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">Cards</p>
      <div className="space-y-2">
        {data.cards.map((card, idx) => (
          <div key={card.id} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">Card {idx + 1}</span>
              <button onClick={() => onChange({ ...data, cards: data.cards.filter((c) => c.id !== card.id) })} className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={12} /></button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <input value={card.title} onChange={(e) => onChange({ ...data, cards: data.cards.map((c) => c.id === card.id ? { ...c, title: e.target.value } : c) })} placeholder="Card title" className="rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white" />
              <input value={card.icon} onChange={(e) => onChange({ ...data, cards: data.cards.map((c) => c.id === card.id ? { ...c, icon: e.target.value } : c) })} placeholder="Icon name" className="rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white" />
              <input value={card.description} onChange={(e) => onChange({ ...data, cards: data.cards.map((c) => c.id === card.id ? { ...c, description: e.target.value } : c) })} placeholder="Card description" className="sm:col-span-2 rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white" />
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => onChange({ ...data, cards: [...data.cards, { id: Date.now().toString(), title: "", description: "", icon: "" }] })} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-blue-300 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400">
        <Plus size={14} /> Add Card
      </button>
    </div>
  );
}

interface SupportingPagesProps {
  data: { heading: string; pages: { id: string; title: string; url: string }[] };
  onChange: (data: SupportingPagesProps["data"]) => void;
}

export function SupportingPagesSettings({ data, onChange }: SupportingPagesProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-white">Supporting Pages</h3>
      <div className="mb-3">
        <label className="mb-1 block text-xs text-zinc-500">Section Heading</label>
        <input value={data.heading} onChange={(e) => onChange({ ...data, heading: e.target.value })} placeholder="Related Articles" className="w-full rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white" />
      </div>
      <p className="mb-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">Pages</p>
      <div className="space-y-2">
        {data.pages.map((p, idx) => (
          <div key={p.id} className="flex items-center gap-2 rounded-lg border border-zinc-200 p-2 dark:border-zinc-700">
            <span className="text-xs text-zinc-500">{idx + 1}.</span>
            <input value={p.title} onChange={(e) => onChange({ ...data, pages: data.pages.map((x) => x.id === p.id ? { ...x, title: e.target.value } : x) })} placeholder="Page title" className="flex-1 rounded-lg bg-zinc-100 px-2 py-1.5 text-sm dark:bg-zinc-800 dark:text-white" />
            <input value={p.url} onChange={(e) => onChange({ ...data, pages: data.pages.map((x) => x.id === p.id ? { ...x, url: e.target.value } : x) })} placeholder="/url" className="w-32 rounded-lg bg-zinc-100 px-2 py-1.5 text-sm dark:bg-zinc-800 dark:text-white" />
            <button onClick={() => onChange({ ...data, pages: data.pages.filter((x) => x.id !== p.id) })} className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={12} /></button>
          </div>
        ))}
      </div>
      <button onClick={() => onChange({ ...data, pages: [...data.pages, { id: Date.now().toString(), title: "", url: "" }] })} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-blue-300 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400">
        <Plus size={14} /> Add Page
      </button>
    </div>
  );
}
