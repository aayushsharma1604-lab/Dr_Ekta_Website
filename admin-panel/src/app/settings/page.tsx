"use client";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { toast } from "sonner";

export default function SettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Settings</h2>
          <p className="text-sm text-zinc-500">Manage admin account and site settings</p>
        </div>

        {/* Profile */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 font-semibold text-zinc-900 dark:text-white">Admin Profile</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Full Name</label>
              <input defaultValue="Dr. Ekta Narula" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
              <input defaultValue="admin@drektanarula.com" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
            </div>
          </div>
          <button onClick={() => toast.success("Profile saved")} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save Profile</button>
        </div>

        {/* Change Password */}
        {/* <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 font-semibold text-zinc-900 dark:text-white">Change Password</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Current Password</label>
              <input type="password" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
            </div>
            <div />
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">New Password</label>
              <input type="password" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Confirm New Password</label>
              <input type="password" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
            </div>
          </div>
          <button onClick={() => toast.success("Password updated")} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Update Password</button>
        </div> */}

        {/* Website Info */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 font-semibold text-zinc-900 dark:text-white">Website Information</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Clinic Name</label>
              <input defaultValue="Dr. Ekta Narula Dental Care" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Tagline</label>
              <input defaultValue="Where Healthy Smiles Begin" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">About (Short)</label>
              <textarea rows={3} defaultValue="Dr. Ekta Narula — BDS (Gold Medalist), 10+ years of experience in Gurgaon. Trusted by 10,000+ families." className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
            </div>
          </div>
          <button onClick={() => toast.success("Website info saved")} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save Information</button>
        </div>
      </div>
    </AdminLayout>
  );
}
