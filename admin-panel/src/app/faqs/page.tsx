"use client";

import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { TREATMENT_LIST } from "@/lib/constants";
import { toast } from "sonner";

const PAGE_OPTIONS = [
  "Homepage",
  "About Us",
  "Contact",
  "Book Appointment",
  "Privacy Policy",
  "Terms of Use",
  "Disclaimer",
  ...TREATMENT_LIST,
];

const initialFAQs = [
  { id: 1, question: "Are dental implants safe?", answer: "Yes, dental implants have a success rate of over 95%.", page: "Dental Implants", order: 1 },
  { id: 2, question: "How long do implants last?", answer: "With proper care, dental implants can last a lifetime.", page: "Dental Implants", order: 2 },
  { id: 3, question: "Does a root canal hurt?", answer: "No, modern root canal treatment is virtually painless.", page: "Root Canal Treatment", order: 1 },
  { id: 4, question: "How long does a root canal last?", answer: "With proper care and a crown, a root canal treated tooth can last a lifetime.", page: "Root Canal Treatment", order: 2 },
  { id: 5, question: "Is whitening safe?", answer: "Yes, professional whitening supervised by Dr. Ekta is very safe.", page: "Teeth Whitening", order: 1 },
  { id: 6, question: "How often should I visit the dentist?", answer: "Every 6 months for most patients, or as recommended by Dr. Ekta.", page: "Homepage", order: 1 },
  { id: 7, question: "Where is the clinic located?", answer: "Our clinic is in Gurgaon, easily accessible from Delhi NCR.", page: "Contact", order: 1 },
  { id: 8, question: "What are your clinic timings?", answer: "We are open Monday to Saturday, 10 AM to 7 PM.", page: "Contact", order: 2 },
  { id: 9, question: "How do I book an appointment?", answer: "You can book online or call us directly.", page: "Homepage", order: 2 },
  { id: 10, question: "What qualifications does Dr. Ekta hold?", answer: "Dr. Ekta is a BDS Gold Medalist with 10+ years of experience.", page: "About Us", order: 1 },
];

export default function FAQsPage() {
  const [faqs, setFaqs] = useState(initialFAQs);
  const [showForm, setShowForm] = useState(false);
  const [filterPage, setFilterPage] = useState("All Pages");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formPage, setFormPage] = useState(PAGE_OPTIONS[0]);
  const [formQuestion, setFormQuestion] = useState("");
  const [formAnswer, setFormAnswer] = useState("");
  const [formOrder, setFormOrder] = useState("1");

  const filtered = useMemo(() => {
    return faqs.filter((faq) => {
      if (filterPage !== "All Pages" && faq.page !== filterPage) return false;
      if (search && !faq.question.toLowerCase().includes(search.toLowerCase()) && !faq.answer.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [faqs, filterPage, search]);

  const grouped = useMemo(() => {
    if (filterPage !== "All Pages") return null;
    const map: Record<string, typeof faqs> = {};
    filtered.forEach((faq) => {
      if (!map[faq.page]) map[faq.page] = [];
      map[faq.page].push(faq);
    });
    return map;
  }, [filtered, filterPage]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    faqs.forEach((f) => { c[f.page] = (c[f.page] || 0) + 1; });
    return c;
  }, [faqs]);

  const handleSave = () => {
    if (!formQuestion.trim() || !formAnswer.trim()) { toast.error("Question and Answer are required"); return; }
    if (editingId) {
      setFaqs((prev) => prev.map((f) => f.id === editingId ? { ...f, question: formQuestion, answer: formAnswer, page: formPage, order: Number(formOrder) || 1 } : f));
      toast.success("FAQ updated");
    } else {
      setFaqs((prev) => [...prev, { id: Date.now(), question: formQuestion, answer: formAnswer, page: formPage, order: Number(formOrder) || 1 }]);
      toast.success("FAQ added");
    }
    setShowForm(false); setEditingId(null); setFormQuestion(""); setFormAnswer(""); setFormOrder("1");
  };

  const handleEdit = (faq: typeof faqs[number]) => {
    setEditingId(faq.id); setFormPage(faq.page); setFormQuestion(faq.question); setFormAnswer(faq.answer); setFormOrder(String(faq.order)); setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    toast.success("FAQ deleted");
  };

  const handleCancel = () => { setShowForm(false); setEditingId(null); setFormQuestion(""); setFormAnswer(""); };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">FAQs</h2>
            <p className="text-sm text-zinc-500">Manage FAQs for every page on the website</p>
          </div>
          <button onClick={() => (showForm ? handleCancel() : setShowForm(true))} className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
            <Plus size={16} />
            {showForm ? "Cancel" : "Add FAQ"}
          </button>
        </div>

        {showForm && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 font-semibold text-zinc-900 dark:text-white">{editingId ? "Edit FAQ" : "Add FAQ"}</h3>
            <div className="grid gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Page *</label>
                <select value={formPage} onChange={(e) => setFormPage(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                  {PAGE_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-zinc-400">Select which page this FAQ will appear on</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Question *</label>
                <input value={formQuestion} onChange={(e) => setFormQuestion(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" placeholder="e.g. Are dental implants safe?" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Answer *</label>
                <textarea rows={3} value={formAnswer} onChange={(e) => setFormAnswer(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" placeholder="Write the answer..." />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Display Order</label>
                <input type="number" value={formOrder} onChange={(e) => setFormOrder(e.target.value)} className="w-32 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" placeholder="1" />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={handleSave} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">{editingId ? "Update FAQ" : "Save FAQ"}</button>
              <button onClick={handleCancel} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400">Cancel</button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search question or answer..." className="w-full rounded-lg border border-zinc-300 py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
          </div>
          <select value={filterPage} onChange={(e) => setFilterPage(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white sm:w-56">
            <option value="All Pages">All Pages ({faqs.length})</option>
            {PAGE_OPTIONS.filter((p) => counts[p]).map((p) => (
              <option key={p} value={p}>{p} ({counts[p]})</option>
            ))}
            {PAGE_OPTIONS.filter((p) => !counts[p]).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Grouped view when All Pages, flat table when filtered */}
        {grouped ? (
          <div className="space-y-4">
            {Object.entries(grouped).map(([page, faqs]) => (
              <div key={page} className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between bg-zinc-50 px-4 py-2.5 dark:bg-zinc-800/50">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{page}</h3>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{faqs.length} FAQs</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-t border-zinc-200 dark:border-zinc-800">
                        <th className="px-4 py-2 font-medium text-zinc-500">#</th>
                        <th className="px-4 py-2 font-medium text-zinc-500">Question</th>
                        <th className="px-4 py-2 font-medium text-zinc-500">Answer</th>
                        <th className="px-4 py-2 font-medium text-zinc-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {faqs.map((faq) => (
                        <tr key={faq.id} className="border-t border-zinc-50 dark:border-zinc-800">
                          <td className="px-4 py-3 text-zinc-500">{faq.order}</td>
                          <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">{faq.question}</td>
                          <td className="max-w-[360px] truncate px-4 py-3 text-zinc-600 dark:text-zinc-400">{faq.answer}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button onClick={() => handleEdit(faq)} className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"><Pencil size={14} /></button>
                              <button onClick={() => handleDelete(faq.id)} className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p className="py-10 text-center text-sm text-zinc-500">No FAQs found.</p>}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-4 py-3 font-medium text-zinc-500">#</th>
                  <th className="px-4 py-3 font-medium text-zinc-500">Question</th>
                  <th className="px-4 py-3 font-medium text-zinc-500">Answer</th>
                  <th className="px-4 py-3 font-medium text-zinc-500">Page</th>
                  <th className="px-4 py-3 font-medium text-zinc-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((faq) => (
                  <tr key={faq.id} className="border-b border-zinc-50 last:border-0 dark:border-zinc-800">
                    <td className="px-4 py-3 text-zinc-500">{faq.order}</td>
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">{faq.question}</td>
                    <td className="max-w-[300px] truncate px-4 py-3 text-zinc-600 dark:text-zinc-400">{faq.answer}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{faq.page}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(faq)} className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(faq.id)} className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="py-10 text-center text-sm text-zinc-500">No FAQs found.</p>}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
