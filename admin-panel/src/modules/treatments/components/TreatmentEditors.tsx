"use client";

export function RichTextBlock({ title, subtitle, value, onChange, placeholder, rows = 5 }: { title: string; subtitle?: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</h3>
      {subtitle && <p className="mb-3 text-xs text-zinc-500">{subtitle}</p>}
      {!subtitle && <div className="mb-3" />}
      <div className="mb-1 flex gap-1 rounded-t-lg border border-b-0 border-zinc-200 bg-zinc-50 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800">
        <button className="rounded px-2 py-1 font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700">B</button>
        <button className="rounded px-2 py-1 italic hover:bg-zinc-200 dark:hover:bg-zinc-700">I</button>
        <button className="rounded px-2 py-1 underline hover:bg-zinc-200 dark:hover:bg-zinc-700">U</button>
        <span className="mx-1 border-l border-zinc-300 dark:border-zinc-600" />
        <button className="rounded px-2 py-1 hover:bg-zinc-200 dark:hover:bg-zinc-700">≡</button>
        <button className="rounded px-2 py-1 hover:bg-zinc-200 dark:hover:bg-zinc-700">🔗</button>
      </div>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} className="w-full rounded-b-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
    </div>
  );
}

export function ListEditor({ title, subtitle, items, onChange, placeholder }: { title: string; subtitle?: string; items: string[]; onChange: (items: string[]) => void; placeholder?: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</h3>
      {subtitle && <p className="mb-3 text-xs text-zinc-500">{subtitle}</p>}
      {!subtitle && <div className="mb-3" />}
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">{idx + 1}.</span>
            <input value={item} onChange={(e) => { const n = [...items]; n[idx] = e.target.value; onChange(n); }} placeholder={placeholder} className="flex-1 rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white" />
            <button onClick={() => onChange(items.filter((_, i) => i !== idx))} className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600">✕</button>
          </div>
        ))}
      </div>
      <button onClick={() => onChange([...items, ""])} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-blue-300 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400">+ Add Item</button>
    </div>
  );
}
