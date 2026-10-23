"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { APPOINTMENT_STATUS } from "@/lib/constants";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const mockAppointments = [
  { id: 1, patient: "Priya Sharma", phone: "+91 98765 43210", treatment: "Teeth Whitening", date: "2024-10-25", time: "10:00 AM", status: "Confirmed", notes: "First-time whitening patient" },
  { id: 2, patient: "Rahul Mehra", phone: "+91 98765 43211", treatment: "Root Canal", date: "2024-10-25", time: "11:30 AM", status: "Pending", notes: "Upper left molar" },
  { id: 3, patient: "Anjali Gupta", phone: "+91 98765 43212", treatment: "Check-up & Cleaning", date: "2024-10-25", time: "02:00 PM", status: "Confirmed", notes: "" },
  { id: 4, patient: "Vikram Singh", phone: "+91 98765 43213", treatment: "Crown Fitting", date: "2024-10-26", time: "10:00 AM", status: "Pending", notes: "Zirconia crown" },
  { id: 5, patient: "Meera Joshi", phone: "+91 98765 43214", treatment: "Consultation", date: "2024-10-26", time: "03:00 PM", status: "Confirmed", notes: "Interested in aligners" },
  { id: 6, patient: "Amit Verma", phone: "+91 98765 43215", treatment: "Dental Implant", date: "2024-10-24", time: "11:00 AM", status: "Completed", notes: "Phase 2 - Crown placement" },
  { id: 7, patient: "Neha Kapoor", phone: "+91 98765 43216", treatment: "Wisdom Tooth Extraction", date: "2024-10-23", time: "10:30 AM", status: "Completed", notes: "Lower right, surgical" },
  { id: 8, patient: "Sanjay Patel", phone: "+91 98765 43217", treatment: "Smile Makeover", date: "2024-10-22", time: "02:00 PM", status: "Cancelled", notes: "Rescheduled to November" },
];

const statusColors: Record<string, string> = {
  Confirmed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "No Show": "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
};

export default function AppointmentsPage() {
  const [filter, setFilter] = useState("All");
  const filtered =
    filter === "All"
      ? mockAppointments
      : mockAppointments.filter((a) => a.status === filter);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Appointments
            </h2>
            <p className="text-sm text-zinc-500">Manage patient appointments</p>
          </div>
          <button onClick={() => toast.info("Appointments now managed via Leads — see /leads")} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
            <Plus size={16} />
            New Appointment
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {["All", ...APPOINTMENT_STATUS].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === s
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-4 py-3 font-medium text-zinc-500">Patient</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Phone</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Treatment</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Date</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Time</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Status</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Notes</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((apt) => (
                <tr
                  key={apt.id}
                  className="border-b border-zinc-50 last:border-0 dark:border-zinc-800"
                >
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">
                    {apt.patient}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {apt.phone}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {apt.treatment}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {apt.date}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {apt.time}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[apt.status] || ""}`}
                    >
                      {apt.status}
                    </span>
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-zinc-500">
                    {apt.notes}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => toast.success("Edit Appointment — use Leads for CRM updates")} className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => toast.success("Appointment deleted")} className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
