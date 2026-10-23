"use client";

import { Plus, Trash2 } from "lucide-react";

interface FAQItem { id: string; question: string; answer: string; }

interface FAQSettingsProps {
  data: { sectionHeading: string; faqs: FAQItem[] };
  onChange: (data: FAQSettingsProps["data"]) => void;
}

export function FAQSettings({ data, onChange }: FAQSettingsProps) {
  const updateFaq = (id: string, field: keyof FAQItem, value: string) => {
    onChange({ ...data, faqs: data.faqs.map((f) => (f.id === id ? { ...f, [field]: value } : f)) });
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-white">FAQ</h3>
      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">FAQ Section Heading</label>
        <input value={data.sectionHeading} onChange={(e) => onChange({ ...data, sectionHeading: e.target.value })} placeholder="Frequently Asked Questions" className="w-full rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white" />
      </div>

      <p className="mb-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">FAQ List</p>
      <div className="space-y-3">
        {data.faqs.map((faq, idx) => (
          <div key={faq.id} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">Question {idx + 1}</span>
              <button onClick={() => onChange({ ...data, faqs: data.faqs.filter((f) => f.id !== faq.id) })} className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={12} /></button>
            </div>
            <input value={faq.question} onChange={(e) => updateFaq(faq.id, "question", e.target.value)} placeholder="What report types can I upload?" className="mb-2 w-full rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white" />
            <label className="mb-1 block text-xs text-zinc-500">Answer</label>
            <textarea value={faq.answer} onChange={(e) => updateFaq(faq.id, "answer", e.target.value)} rows={3} placeholder="Write the answer..." className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white" />
          </div>
        ))}
      </div>
      <button onClick={() => onChange({ ...data, faqs: [...data.faqs, { id: Date.now().toString(), question: "", answer: "" }] })} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-blue-300 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400">
        <Plus size={14} /> Add FAQ
      </button>
    </div>
  );
}
