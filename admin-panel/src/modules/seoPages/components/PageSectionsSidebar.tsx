"use client";

import { GripVertical, Trash2, LayoutPanelTop, Layers, ListOrdered, Grid3x3, FileText, HelpCircle, Image, Type, Settings } from "lucide-react";

export type SectionType = "pageSettings" | "heroBanner" | "subCategory" | "stepper" | "featureCards" | "supportingPages" | "faq" | "image" | "text";

export interface PageSection {
  id: string;
  type: SectionType;
  label: string;
  subLabel?: string;
}

const sectionIcons: Record<SectionType, React.ReactNode> = {
  pageSettings: <Settings size={14} />,
  heroBanner: <LayoutPanelTop size={14} />,
  subCategory: <Layers size={14} />,
  stepper: <ListOrdered size={14} />,
  featureCards: <Grid3x3 size={14} />,
  supportingPages: <FileText size={14} />,
  faq: <HelpCircle size={14} />,
  image: <Image size={14} />,
  text: <Type size={14} />,
};

export function PageSectionsSidebar({
  sections,
  activeId,
  onSelect,
  onDelete,
  onAddSection,
  status,
  onStatusChange,
}: {
  sections: PageSection[];
  activeId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onAddSection: () => void;
  status: string;
  onStatusChange: (s: string) => void;
}) {
  return (
    <div className="w-64 shrink-0 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-100 text-blue-600 dark:bg-blue-900/30">▦</span>
          Page Sections
        </h3>
        <select value={status} onChange={(e) => onStatusChange(e.target.value)} className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          <option>Published</option>
          <option>Draft</option>
          <option>Rejected</option>
        </select>
      </div>

      <div className="space-y-1">
        {sections.map((section) => (
          <div
            key={section.id}
            onClick={() => onSelect(section.id)}
            className={`group flex items-center gap-2 rounded-lg px-2 py-2.5 text-xs cursor-pointer ${activeId === section.id ? "bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-600" : "hover:bg-zinc-50 dark:hover:bg-zinc-800 border-l-2 border-transparent"}`}
          >
            <span className="text-zinc-400 cursor-grab"><GripVertical size={12} /></span>
            <span className={`flex h-6 w-6 items-center justify-center rounded ${activeId === section.id ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"}`}>
              {sectionIcons[section.type]}
            </span>
            <div className="flex-1">
              <p className="font-medium text-zinc-900 dark:text-white">{section.label}</p>
              {section.subLabel && <p className="text-[10px] text-zinc-500">{section.subLabel}</p>}
            </div>
            {section.type !== "pageSettings" && (
              <button onClick={(e) => { e.stopPropagation(); onDelete(section.id); }} className="opacity-0 group-hover:opacity-100 rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600">
                <Trash2 size={12} />
              </button>
            )}
          </div>
        ))}
      </div>

      <button onClick={onAddSection} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 py-2 text-xs font-medium text-zinc-600 hover:border-blue-400 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-400">
        + Add Section
      </button>
    </div>
  );
}
