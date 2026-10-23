"use client";

import { Plus, Trash2 } from "lucide-react";

interface StepperData {
  basicSettings: { sectionHeading: string; shortHeading: string; description: string };
  steps: { id: string; title: string; description: string }[];
  layoutSettings: { connectingLine: boolean; centerAlign: boolean };
}

interface StepperSettingsProps {
  data: StepperData;
  onChange: (data: StepperData) => void;
}

export function StepperSettings({ data, onChange }: StepperSettingsProps) {
  const updateStep = (id: string, field: string, value: string) => {
    onChange({ ...data, steps: data.steps.map((s) => (s.id === id ? { ...s, [field]: value } : s)) });
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-white">Stepper</h3>
      <p className="mb-4 text-xs text-zinc-500">Add step-by-step content with title, description and visuals.</p>

      {/* Basic Settings */}
      <div className="mb-4 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
        <p className="mb-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">Basic Settings</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-zinc-500">Section Short Heading *</label>
            <input value={data.basicSettings.shortHeading} onChange={(e) => onChange({ ...data, basicSettings: { ...data.basicSettings, shortHeading: e.target.value } })} placeholder="Report types we analyse" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">Section Main Heading *</label>
            <input value={data.basicSettings.sectionHeading} onChange={(e) => onChange({ ...data, basicSettings: { ...data.basicSettings, sectionHeading: e.target.value } })} placeholder="Supported Medical Reports" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-zinc-500">Section Description</label>
            <textarea value={data.basicSettings.description} onChange={(e) => onChange({ ...data, basicSettings: { ...data.basicSettings, description: e.target.value } })} rows={2} placeholder="Our AI system simplifies complex medical reports..." className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white" />
          </div>
        </div>
      </div>

      {/* Steps List */}
      <p className="mb-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">Steps List</p>
      <div className="space-y-3">
        {data.steps.map((step, idx) => (
          <div key={step.id} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">Step {idx + 1}</span>
              <button onClick={() => onChange({ ...data, steps: data.steps.filter((s) => s.id !== step.id) })} className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={12} /></button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <input value={step.title} onChange={(e) => updateStep(step.id, "title", e.target.value)} placeholder="Upload Your Report" className="rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white" />
              <input value={step.description} onChange={(e) => updateStep(step.id, "description", e.target.value)} placeholder="Upload your blood test, scan report..." className="rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white" />
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => onChange({ ...data, steps: [...data.steps, { id: Date.now().toString(), title: "", description: "" }] })} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-blue-300 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400">
        <Plus size={14} /> Add Step
      </button>

      {/* Layout Settings */}
      <div className="mt-4 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
        <p className="mb-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">Layout Settings</p>
        <div className="flex gap-4 text-xs">
          <label className="flex items-center gap-2"><input type="checkbox" checked={data.layoutSettings.connectingLine} onChange={(e) => onChange({ ...data, layoutSettings: { ...data.layoutSettings, connectingLine: e.target.checked } })} className="rounded" /> Show Connecting Line</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={data.layoutSettings.centerAlign} onChange={(e) => onChange({ ...data, layoutSettings: { ...data.layoutSettings, centerAlign: e.target.checked } })} className="rounded" /> Center Align Content</label>
        </div>
      </div>
    </div>
  );
}
