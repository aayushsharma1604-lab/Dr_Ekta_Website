"use client";

import { X, LayoutPanelTop, Layers, ListOrdered, Grid3x3, FileText, Image, Type, HelpCircle } from "lucide-react";

const SECTION_TYPES = [
  { id: "heroBanner", label: "Hero Banner", icon: LayoutPanelTop, desc: "Large banner with image and CTA" },
  { id: "subCategory", label: "Sub Category Pages", icon: Layers, desc: "Grid of linked sub pages" },
  { id: "stepper", label: "Stepper", icon: ListOrdered, desc: "Step-by-step visual flow" },
  { id: "featureCards", label: "Feature Cards", icon: Grid3x3, desc: "Cards highlighting features" },
  { id: "supportingPages", label: "Supporting Pages", icon: FileText, desc: "Related articles / pages" },
  { id: "faq", label: "FAQ", icon: HelpCircle, desc: "Frequently asked questions" },
  { id: "image", label: "Image", icon: Image, desc: "Single image block" },
  { id: "text", label: "Text", icon: Type, desc: "Rich text content" },
] as const;

export function AddSectionModal({ onClose, onSelect }: { onClose: () => void; onSelect: (type: string) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-xl bg-white p-6 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Add New Section</h3>
            <p className="text-xs text-zinc-500">Choose a section to add to your page</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"><X size={16} /></button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SECTION_TYPES.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className="rounded-xl border border-zinc-200 p-4 text-left hover:border-blue-400 hover:bg-blue-50 dark:border-zinc-700 dark:hover:border-blue-600 dark:hover:bg-blue-900/20"
            >
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30">
                <s.icon size={18} />
              </div>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">{s.label}</p>
              <p className="mt-1 text-xs text-zinc-500">{s.desc}</p>
              <span className="mt-3 inline-block rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white">Add Section</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
