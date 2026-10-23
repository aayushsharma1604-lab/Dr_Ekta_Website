"use client";

interface TextSettingsProps {
  data: { content: string };
  onChange: (data: TextSettingsProps["data"]) => void;
}

export function TextSettings({ data, onChange }: TextSettingsProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Hero Banner Settings</h3>
        <span className="text-xs text-zinc-500">Text</span>
      </div>
      <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Text Content</label>
      {/* Simple toolbar */}
      <div className="mb-1 flex gap-1 rounded-t-lg border border-b-0 border-zinc-200 bg-zinc-50 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800">
        <button className="rounded px-2 py-1 font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700">B</button>
        <button className="rounded px-2 py-1 italic hover:bg-zinc-200 dark:hover:bg-zinc-700">I</button>
        <button className="rounded px-2 py-1 underline hover:bg-zinc-200 dark:hover:bg-zinc-700">U</button>
        <span className="mx-1 border-l border-zinc-300 dark:border-zinc-600" />
        <button className="rounded px-2 py-1 hover:bg-zinc-200 dark:hover:bg-zinc-700">≡</button>
        <button className="rounded px-2 py-1 hover:bg-zinc-200 dark:hover:bg-zinc-700">≡</button>
        <button className="rounded px-2 py-1 hover:bg-zinc-200 dark:hover:bg-zinc-700">🔗</button>
      </div>
      <textarea value={data.content} onChange={(e) => onChange({ content: e.target.value })} rows={8} placeholder="Write your content here..." className="w-full rounded-b-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
    </div>
  );
}
