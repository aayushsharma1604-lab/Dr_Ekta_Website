"use client";

import { GripVertical, Trash2, Settings, Sparkles, Info, Users, AlertCircle, CheckCircle2, ClipboardList, Smile, Timer, HeartPulse, ShieldAlert, Lightbulb, Award, HelpCircle } from "lucide-react";

export type TreatmentSectionType =
  | "pageSettings"
  | "hero"
  | "whatIs"
  | "whoNeeds"
  | "problems"
  | "benefits"
  | "procedure"
  | "painful"
  | "duration"
  | "recovery"
  | "risks"
  | "expectations"
  | "whyDrEkta"
  | "faqs";

export interface TreatmentSection {
  id: string;
  type: TreatmentSectionType;
  label: string;
}

const icons: Record<TreatmentSectionType, React.ReactNode> = {
  pageSettings: <Settings size={14} />,
  hero: <Sparkles size={14} />,
  whatIs: <Info size={14} />,
  whoNeeds: <Users size={14} />,
  problems: <AlertCircle size={14} />,
  benefits: <CheckCircle2 size={14} />,
  procedure: <ClipboardList size={14} />,
  painful: <Smile size={14} />,
  duration: <Timer size={14} />,
  recovery: <HeartPulse size={14} />,
  risks: <ShieldAlert size={14} />,
  expectations: <Lightbulb size={14} />,
  whyDrEkta: <Award size={14} />,
  faqs: <HelpCircle size={14} />,
};

export function TreatmentSectionsSidebar({
  sections,
  activeId,
  onSelect,
  onDelete,
  status,
  onStatusChange,
}: {
  sections: TreatmentSection[];
  activeId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  status: string;
  onStatusChange: (s: string) => void;
}) {
  return (
    <div className="w-60 shrink-0 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-100 text-blue-600 dark:bg-blue-900/30">▦</span>
          Sections
        </h3>
        <select value={status} onChange={(e) => onStatusChange(e.target.value)} className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          <option>Published</option>
          <option>Draft</option>
        </select>
      </div>
      <div className="space-y-1">
        {sections.map((s) => (
          <div
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`group flex items-center gap-2 rounded-lg px-2 py-2 text-xs cursor-pointer ${activeId === s.id ? "bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-600" : "hover:bg-zinc-50 dark:hover:bg-zinc-800 border-l-2 border-transparent"}`}
          >
            <GripVertical size={12} className="text-zinc-400" />
            <span className={`flex h-6 w-6 items-center justify-center rounded ${activeId === s.id ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"}`}>{icons[s.type]}</span>
            <span className="flex-1 font-medium text-zinc-900 dark:text-white">{s.label}</span>
            {s.type !== "pageSettings" && (
              <button onClick={(e) => { e.stopPropagation(); onDelete(s.id); }} className="opacity-0 group-hover:opacity-100 rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={12} /></button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
