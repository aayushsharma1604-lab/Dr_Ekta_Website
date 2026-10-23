"use client";

import { CalendarPlus, UserPlus, FileText, TrendingUp, Users, Eye, Globe } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { StatsCard } from "@/components/shared/StatsCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const stats = [
  { title: "Total Patients", value: "1,247", icon: "users", change: "+12% this month", changeType: "positive" as const },
  { title: "Appointments Today", value: "8", icon: "calendar", change: "2 pending confirmation", changeType: "neutral" as const },
  { title: "Treatments Completed", value: "89", icon: "check", change: "+5% vs last month", changeType: "positive" as const },
  { title: "Revenue This Month", value: "₹4,85,000", icon: "rupee", change: "+8% vs last month", changeType: "positive" as const },
];

const appointmentTrend = [
  { name: "Mon", appointments: 5 },
  { name: "Tue", appointments: 8 },
  { name: "Wed", appointments: 6 },
  { name: "Thu", appointments: 10 },
  { name: "Fri", appointments: 7 },
  { name: "Sat", appointments: 9 },
  { name: "Sun", appointments: 3 },
];

const reviewData = [
  { name: "Google", value: 142 },
  { name: "Instagram", value: 68 },
  { name: "Facebook", value: 45 },
  { name: "Justdial", value: 31 },
];

// Mock GA data
const gaStats = [
  { title: "Total Users", value: "8,432", change: "+18% vs last month", changeType: "positive" as const, icon: Users },
  { title: "Sessions", value: "12,104", change: "+14% vs last month", changeType: "positive" as const, icon: Globe },
  { title: "Page Views", value: "34,521", change: "+22% vs last month", changeType: "positive" as const, icon: Eye },
  { title: "Avg. Session", value: "2m 34s", change: "+5% vs last month", changeType: "positive" as const, icon: TrendingUp },
];

const gaTrend = [
  { name: "Mon", users: 820, sessions: 1100 },
  { name: "Tue", users: 1050, sessions: 1420 },
  { name: "Wed", users: 980, sessions: 1300 },
  { name: "Thu", users: 1240, sessions: 1680 },
  { name: "Fri", users: 1100, sessions: 1520 },
  { name: "Sat", users: 890, sessions: 1200 },
  { name: "Sun", users: 760, sessions: 980 },
];

const gaSource = [
  { name: "Organic Search", value: 4820 },
  { name: "Direct", value: 2140 },
  { name: "Social", value: 1680 },
  { name: "Referral", value: 792 },
];

const topPages = [
  { page: "/", views: 8420, users: 5210 },
  { page: "/treatments/dental-implants", views: 4120, users: 2980 },
  { page: "/treatments/root-canal", views: 3890, users: 2710 },
  { page: "/about", views: 2450, users: 1820 },
  { page: "/contact", views: 1980, users: 1430 },
];

const PIE_COLORS = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"];

const recentAppointments = [
  { id: 1, patient: "Priya Sharma", treatment: "Teeth Whitening", date: "2024-10-25", time: "10:00 AM", status: "Confirmed" },
  { id: 2, patient: "Rahul Mehra", treatment: "Root Canal", date: "2024-10-25", time: "11:30 AM", status: "Pending" },
  { id: 3, patient: "Anjali Gupta", treatment: "Check-up", date: "2024-10-25", time: "02:00 PM", status: "Confirmed" },
  { id: 4, patient: "Vikram Singh", treatment: "Crown Fitting", date: "2024-10-26", time: "10:00 AM", status: "Pending" },
  { id: 5, patient: "Meera Joshi", treatment: "Consultation", date: "2024-10-26", time: "03:00 PM", status: "Confirmed" },
];

const statusColors: Record<string, string> = {
  Confirmed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function DashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Welcome back, Dr. Ekta
          </h2>
          <p className="text-sm text-zinc-500">
            Here&apos;s what&apos;s happening at your clinic today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-5">
          {/* Appointments Line Chart */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-3">
            <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-white">
              Appointments This Week
            </h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={appointmentTrend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#71717a" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#71717a" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid #e4e4e7", fontSize: 12 }}
                  />
                  <Line type="monotone" dataKey="appointments" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: "#2563eb" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Reviews Pie Chart */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2">
            <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-white">
              Reviews by Platform
            </h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reviewData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {reviewData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e4e4e7", fontSize: 12 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Google Analytics — Mock */}
        <div className="rounded-xl border border-blue-200 bg-white p-5 dark:border-blue-900/30 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Google Analytics</h3>
              <p className="text-xs text-zinc-500">Website traffic</p>
            </div>
            <span className="text-xs text-zinc-400">Last 7 days</span>
          </div>

          {/* GA Stats */}
          <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {gaStats.map((s) => (
              <div key={s.title} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-zinc-500">{s.title}</p>
                  <s.icon size={16} className="text-blue-600" />
                </div>
                <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-white">{s.value}</p>
                <p className="mt-1 text-xs font-medium text-green-600">{s.change}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-3">
              <h4 className="mb-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300">Users & Sessions (7 days)</h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gaTrend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#71717a" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#71717a" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e4e4e7", fontSize: 12 }} />
                    <Line type="monotone" dataKey="users" stroke="#2563eb" strokeWidth={2} dot={{ r: 3, fill: "#2563eb" }} name="Users" />
                    <Line type="monotone" dataKey="sessions" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3, fill: "#60a5fa" }} name="Sessions" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex justify-center gap-4 text-xs">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-600" /> Users</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-400" /> Sessions</span>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2">
              <h4 className="mb-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300">Traffic Source</h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={gaSource} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2} dataKey="value">
                      {gaSource.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e4e4e7", fontSize: 12 }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <th className="px-4 py-2 font-medium text-zinc-500">Top Pages</th>
                  <th className="px-4 py-2 font-medium text-zinc-500">Views</th>
                  <th className="px-4 py-2 font-medium text-zinc-500">Users</th>
                </tr>
              </thead>
              <tbody>
                {topPages.map((p) => (
                  <tr key={p.page} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                    <td className="px-4 py-2 font-medium text-blue-600">{p.page}</td>
                    <td className="px-4 py-2 text-zinc-700 dark:text-zinc-300">{p.views.toLocaleString()}</td>
                    <td className="px-4 py-2 text-zinc-700 dark:text-zinc-300">{p.users.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <h3 className="font-semibold text-zinc-900 dark:text-white">
              Upcoming Appointments
            </h3>
            <a
              href="/appointments"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View All
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <th className="px-6 py-3 font-medium text-zinc-500">Patient</th>
                  <th className="px-6 py-3 font-medium text-zinc-500">Treatment</th>
                  <th className="px-6 py-3 font-medium text-zinc-500">Date</th>
                  <th className="px-6 py-3 font-medium text-zinc-500">Time</th>
                  <th className="px-6 py-3 font-medium text-zinc-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map((apt) => (
                  <tr
                    key={apt.id}
                    className="border-b border-zinc-50 last:border-0 dark:border-zinc-800"
                  >
                    <td className="px-6 py-3 font-medium text-zinc-900 dark:text-white">
                      {apt.patient}
                    </td>
                    <td className="px-6 py-3 text-zinc-600 dark:text-zinc-400">
                      {apt.treatment}
                    </td>
                    <td className="px-6 py-3 text-zinc-600 dark:text-zinc-400">
                      {apt.date}
                    </td>
                    <td className="px-6 py-3 text-zinc-600 dark:text-zinc-400">
                      {apt.time}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[apt.status] || ""}`}
                      >
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-3">
          <a
            href="/appointments"
            className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700"
          >
            <CalendarPlus size={20} className="text-blue-600" />
            <div>
              <p className="font-medium text-zinc-900 dark:text-white">New Appointment</p>
              <p className="text-xs text-zinc-500">Schedule a patient visit</p>
            </div>
          </a>
          <a
            href="/patients"
            className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700"
          >
            <UserPlus size={20} className="text-blue-600" />
            <div>
              <p className="font-medium text-zinc-900 dark:text-white">Add Patient</p>
              <p className="text-xs text-zinc-500">Register a new patient</p>
            </div>
          </a>
          <a
            href="/knowledge"
            className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700"
          >
            <FileText size={20} className="text-blue-600" />
            <div>
              <p className="font-medium text-zinc-900 dark:text-white">New Article</p>
              <p className="text-xs text-zinc-500">Publish knowledge content</p>
            </div>
          </a>
        </div>
      </div>
    </AdminLayout>
  );
}
