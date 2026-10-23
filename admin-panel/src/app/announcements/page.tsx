"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const initialAnnouncements = [
  { id: 1, title: "Holiday Hours: Closed on Diwali", content: "We will be closed on Oct 31 and Nov 1 for Diwali. Happy Diwali!", type: "info", active: true, date: "2024-10-25" },
  { id: 2, title: "New Service: Clear Aligners", content: "We now offer Clear Aligner treatment with Dr. Ekta. Book your consultation today!", type: "promo", active: true, date: "2024-10-20" },
  { id: 3, title: "Free Dental Check-up Camp", content: "Join us for a free dental check-up camp on Nov 15. No appointment needed.", type: "event", active: false, date: "2024-10-18" },
];

const typeColors: Record<string, string> = {
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  promo: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  event: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("info");
  const [active, setActive] = useState("Active");

  const handleSave = () => {
    if (!title.trim() || !content.trim()) { toast.error("Title and Content are required"); return; }
    if (editingId) {
      setAnnouncements((prev) => prev.map((a) => a.id === editingId ? { ...a, title, content, type, active: active === "Active" } : a));
      toast.success("Announcement updated");
    } else {
      setAnnouncements((prev) => [...prev, { id: Date.now(), title, content, type, active: active === "Active", date: new Date().toISOString().slice(0, 10) }]);
      toast.success("Announcement created");
    }
    setShowForm(false); setEditingId(null); setTitle(""); setContent(""); setType("info"); setActive("Active");
  };

  const handleEdit = (a: typeof initialAnnouncements[number]) => {
    setEditingId(a.id); setTitle(a.title); setContent(a.content); setType(a.type); setActive(a.active ? "Active" : "Inactive"); setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    toast.success("Announcement deleted");
  };

  const handleCancel = () => { setShowForm(false); setEditingId(null); setTitle(""); setContent(""); };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Announcements</h2>
            <p className="text-sm text-zinc-500">Display banners and notices on the website</p>
          </div>
          <button onClick={() => (showForm ? handleCancel() : setShowForm(true))} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
            <Plus size={16} />
            {showForm ? "Cancel" : "New Announcement"}
          </button>
        </div>

        {showForm && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 font-semibold text-zinc-900 dark:text-white">{editingId ? "Edit Announcement" : "New Announcement"}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Title *</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" placeholder="Announcement title" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Content *</label>
                <textarea rows={3} value={content} onChange={(e) => setContent(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" placeholder="Write the announcement message..." />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                  <option value="info">Info</option>
                  <option value="promo">Promotion</option>
                  <option value="event">Event</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Status</label>
                <select value={active} onChange={(e) => setActive(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={handleSave} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">{editingId ? "Update" : "Save"} Announcement</button>
              <button onClick={handleCancel} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <span className={`mt-0.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[a.type]}`}>{a.type}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-zinc-900 dark:text-white">{a.title}</h4>
                  {!a.active && (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800">Inactive</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{a.content}</p>
                <p className="mt-1 text-xs text-zinc-400">{a.date}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(a)} className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(a.id)} className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
