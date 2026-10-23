"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { UserPlus, Search, Eye, Pencil, User } from "lucide-react";
import { toast } from "sonner";

const mockPatients = [
  { id: 1, name: "Priya Sharma", phone: "+91 98765 43210", email: "priya@email.com", lastVisit: "2024-10-20", treatments: 3, totalSpent: "₹45,000" },
  { id: 2, name: "Rahul Mehra", phone: "+91 98765 43211", email: "rahul@email.com", lastVisit: "2024-10-18", treatments: 5, totalSpent: "₹1,20,000" },
  { id: 3, name: "Anjali Gupta", phone: "+91 98765 43212", email: "anjali@email.com", lastVisit: "2024-10-15", treatments: 2, totalSpent: "₹15,000" },
  { id: 4, name: "Vikram Singh", phone: "+91 98765 43213", email: "vikram@email.com", lastVisit: "2024-10-12", treatments: 7, totalSpent: "₹2,50,000" },
  { id: 5, name: "Meera Joshi", phone: "+91 98765 43214", email: "meera@email.com", lastVisit: "2024-10-10", treatments: 1, totalSpent: "₹5,000" },
  { id: 6, name: "Amit Verma", phone: "+91 98765 43215", email: "amit@email.com", lastVisit: "2024-10-08", treatments: 4, totalSpent: "₹85,000" },
  { id: 7, name: "Neha Kapoor", phone: "+91 98765 43216", email: "neha@email.com", lastVisit: "2024-10-05", treatments: 2, totalSpent: "₹35,000" },
  { id: 8, name: "Sanjay Patel", phone: "+91 98765 43217", email: "sanjay@email.com", lastVisit: "2024-09-28", treatments: 6, totalSpent: "₹1,80,000" },
];

export default function PatientsPage() {
  const [search, setSearch] = useState("");

  const filtered = mockPatients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Patients
            </h2>
            <p className="text-sm text-zinc-500">
              {mockPatients.length} total patients
            </p>
          </div>
          <button onClick={() => toast.info("Patients are managed via Leads — use /leads for CRM")} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
            <UserPlus size={16} />
            Add Patient
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search patients by name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-4 py-3 font-medium text-zinc-500">Patient</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Contact</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Last Visit</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Treatments</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Total Spent</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((patient) => (
                <tr
                  key={patient.id}
                  className="border-b border-zinc-50 last:border-0 dark:border-zinc-800"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <User size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-white">
                          {patient.name}
                        </p>
                        <p className="text-xs text-zinc-500">{patient.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {patient.phone}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {patient.lastVisit}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {patient.treatments}
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">
                    {patient.totalSpent}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => toast.success("View Patient — use Leads for details")} className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => toast.success("Edit Patient — use Leads for CRM updates")} className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800">
                        <Pencil size={14} />
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
