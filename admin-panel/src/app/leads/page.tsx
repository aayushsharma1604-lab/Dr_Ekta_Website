"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Search, Download, Pencil, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchListRequest, fetchStatsRequest, updateRequest, deleteRequest } from "@/modules/leads/leads.slice";
import { api } from "@/lib/api";
import { SpinnerCustom } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function LeadsPage() {
  const dispatch = useAppDispatch();
  const { items, loading, stats } = useAppSelector((s) => (s as unknown as { leads: { items: never[]; loading: boolean; stats: unknown } }).leads);
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<null | { _id: string; leadStatus: string; appointmentStatus: string; notes: string }>(null);
  const [editLeadStatus, setEditLeadStatus] = useState("new");
  const [editAppointmentStatus, setEditAppointmentStatus] = useState("none");
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => { dispatch(fetchListRequest({ status: status || undefined, source: source || undefined, search: search || undefined } as never)); }, [dispatch, status, source, search]);
  useEffect(() => { dispatch(fetchStatsRequest({} as never)); }, [dispatch]);

  const handleExport = async () => {
    try {
      const res = await api.get('/api/leads/export', { params: { status: status || undefined, source: source || undefined }, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `leads-${new Date().toISOString().slice(0,10)}.csv`; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
      toast.success('CSV downloaded');
    } catch (e: unknown) { toast.error((e as { response?: { data?: { error?: string } } })?.response?.data?.error || (e as Error).message); }
  };

  const openEdit = (lead: { _id: string; leadStatus: string; appointmentStatus: string; notes: string }) => {
    setEditing(lead);
    setEditLeadStatus(lead.leadStatus || "new");
    setEditAppointmentStatus(lead.appointmentStatus || "none");
    setEditNotes(lead.notes || "");
  };

  const handleUpdate = () => {
    if (!editing) return;
    dispatch(updateRequest({ id: editing._id, leadStatus: editLeadStatus, appointmentStatus: editAppointmentStatus, notes: editNotes } as never));
    setEditing(null);
  };

  const list = (items as unknown as { _id: string; name: string; phone: string; treatmentInterest?: { title: string }; source: string; date: string; leadStatus: string; appointmentStatus: string; notes: string }[]) || [];
  const statData = stats as unknown as { total?: number; byStatus?: Record<string, number>; bySource?: Record<string, number>; last7Days?: number } | null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Leads</h2>
            <p className="text-sm text-zinc-500">Enquiries and booking clicks from the website</p>
          </div>
          <button onClick={handleExport} className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
            <Download size={16} /> Export CSV
          </button>
        </div>

        {statData && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"><p className="text-xs text-zinc-500">Total</p><p className="text-xl font-bold text-zinc-900 dark:text-white">{statData.total ?? "-"}</p></div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"><p className="text-xs text-zinc-500">Last 7 Days</p><p className="text-xl font-bold text-zinc-900 dark:text-white">{statData.last7Days ?? "-"}</p></div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"><p className="text-xs text-zinc-500">By Status</p><p className="text-xs text-zinc-600 dark:text-zinc-400">{statData.byStatus ? Object.entries(statData.byStatus).map(([k,v])=>`${k}:${v}`).join(" • ") : "-"}</p></div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"><p className="text-xs text-zinc-500">By Source</p><p className="text-xs text-zinc-600 dark:text-zinc-400">{statData.bySource ? Object.entries(statData.bySource).map(([k,v])=>`${k}:${v}`).join(" • ") : "-"}</p></div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name/phone..." className="w-64 rounded-lg border border-zinc-300 py-2 pl-10 pr-4 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
            <option value="">All Status</option><option value="new">new</option><option value="contacted">contacted</option><option value="scheduled">scheduled</option><option value="completed">completed</option><option value="lost">lost</option>
          </select>
          <select value={source} onChange={(e) => setSource(e.target.value)} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
            <option value="">All Sources</option><option value="enquiry_form">enquiry_form</option><option value="practo_click">practo_click</option><option value="phone_click">phone_click</option>
          </select>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-4 py-3 font-medium text-zinc-500">Name</th><th className="px-4 py-3 font-medium text-zinc-500">Phone</th><th className="px-4 py-3 font-medium text-zinc-500">Treatment</th><th className="px-4 py-3 font-medium text-zinc-500">Source</th><th className="px-4 py-3 font-medium text-zinc-500">Lead Status</th><th className="px-4 py-3 font-medium text-zinc-500">Appointment</th><th className="px-4 py-3 font-medium text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="px-4 py-8 text-center"><SpinnerCustom /></td></tr>}
              {!loading && list.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-zinc-500">No leads — submit an enquiry form to create one.</td></tr>}
              {list.map((lead) => (
                <tr key={lead._id} className="border-b border-zinc-50 last:border-0 dark:border-zinc-800">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">{lead.name}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{lead.phone}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{lead.treatmentInterest?.title || "-"}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{lead.source}</span></td>
                  <td className="px-4 py-3 text-xs">{lead.leadStatus}</td>
                  <td className="px-4 py-3 text-xs">{lead.appointmentStatus}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(lead as unknown as never)} className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"><Pencil size={14} /></button>
                      <button onClick={() => dispatch(deleteRequest(lead._id as never))} className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-zinc-900">
              <h3 className="mb-4 font-semibold text-zinc-900 dark:text-white">Edit Lead — {editing._id}</h3>
              <div className="grid gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Lead Status</label>
                  <select value={editLeadStatus} onChange={(e) => setEditLeadStatus(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                    <option value="new">new</option><option value="contacted">contacted</option><option value="scheduled">scheduled</option><option value="completed">completed</option><option value="lost">lost</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Appointment Status</label>
                  <select value={editAppointmentStatus} onChange={(e) => setEditAppointmentStatus(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                    <option value="none">none</option><option value="booked">booked</option><option value="completed">completed</option><option value="cancelled">cancelled</option><option value="no_show">no_show</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Notes (max 1000)</label>
                  <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={handleUpdate} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save</button>
                <button onClick={() => setEditing(null)} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
