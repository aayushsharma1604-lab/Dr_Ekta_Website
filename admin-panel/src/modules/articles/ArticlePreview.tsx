"use client";

import { useState } from "react";
import { X, Monitor, Tablet, Smartphone } from "lucide-react";
import { ArticleLayoutRenderer } from "./layouts/ArticleLayoutRenderer";

export type { ArticlePreviewData } from "./layouts/shared";

type Viewport = "desktop" | "tablet" | "mobile";

const VIEWPORT_WIDTH: Record<Viewport, string> = {
  desktop: "max-w-6xl",
  tablet: "max-w-[768px]",
  mobile: "max-w-[375px]",
};

export function ArticlePreviewModal({ data, onClose }: { data: import("./layouts/shared").ArticlePreviewData; onClose: () => void }) {
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const tabs: { id: Viewport; label: string; icon: typeof Monitor }[] = [
    { id: "desktop", label: "Desktop", icon: Monitor },
    { id: "tablet", label: "Tablet", icon: Tablet },
    { id: "mobile", label: "Mobile", icon: Smartphone },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-100 dark:bg-zinc-950">
      <div className="flex flex-wrap items-center gap-3 border-b border-zinc-200 bg-white px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900">
        <button onClick={onClose} className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300">
          <X size={14} /> Close Preview
        </button>
        <span className="hidden h-5 w-px bg-zinc-200 dark:bg-zinc-700 sm:block" />
        <span className="inline-flex items-center gap-2 text-sm">
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700">Live Preview</span>
          <span className="max-w-[280px] truncate font-medium text-zinc-800 dark:text-zinc-100">{data.title || "Untitled"}</span>
          <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-700">{data.layout}</span>
        </span>
        <div className="ml-auto flex items-center gap-1 rounded-full border border-zinc-200 p-1 dark:border-zinc-700">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = viewport === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setViewport(t.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${active ? "bg-emerald-600 text-white" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
              >
                <Icon size={14} />{t.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className={`mx-auto overflow-hidden rounded-2xl border border-zinc-300 bg-white shadow-xl transition-all dark:border-zinc-700 ${VIEWPORT_WIDTH[viewport]}`}>
          <div className="flex items-center gap-1.5 border-b border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="ml-2 truncate text-xs text-zinc-500">/knowledge/{data.slug || "…"}</span>
          </div>
          <ArticleLayoutRenderer data={data} />
        </div>
        <p className="mt-3 text-center text-xs text-zinc-400">Draft preview — nothing is published. Save to persist changes.</p>
      </div>
    </div>
  );
}
