"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchRequest,
  updateRequest,
  fetchClicksRequest,
} from "@/modules/bookingProvider/bookingProvider.slice";
import { SpinnerCustom } from "@/components/ui/spinner";

type BookingProvider = {
  providerName: string;
  profileUrl: string;
  bookingUrl: string;
  isActive: boolean;
};

type ClicksData = {
  totalClicks: number;
  dailyStats: { _id: string; count: number }[];
};

export default function BookingProviderPage() {
  const dispatch = useAppDispatch();
  // optional selector — safe if reducer not yet wired
  const bookingState = useAppSelector((s: any) => s.bookingProvider as
    | { data: BookingProvider | null; loading: boolean; error: string | null; clicks: ClicksData | null; clicksLoading: boolean }
    | undefined);

  const [providerName] = useState("practo");
  const [profileUrl, setProfileUrl] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);

  const [clicks, setClicks] = useState<ClicksData | null>(null);
  const [clicksLoading, setClicksLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // prefer Redux state if available, otherwise local
  const reduxData = bookingState?.data;
  const reduxLoading = bookingState?.loading;
  const reduxClicks = bookingState?.clicks;

  const fetchConfig = async () => {
    setLoading(true);
    setNotConfigured(false);
    // also dispatch redux action for saga wiring (no-op if saga not registered)
    try {
      dispatch(fetchRequest());
    } catch {}
    try {
      const res = await api.get("/api/booking-provider");
      const data: BookingProvider = res.data?.data ?? res.data;
      if (data) {
        setProfileUrl(data.profileUrl || "");
        setBookingUrl(data.bookingUrl || "");
        setIsActive(data.isActive ?? true);
        setNotConfigured(false);
      } else {
        setNotConfigured(true);
      }
    } catch (e: any) {
      const status = e.response?.status;
      if (status === 404) {
        setNotConfigured(true);
        // keep defaults empty
      } else {
        const msg = e.response?.data?.error || e.response?.data?.message || e.message || "Failed to fetch booking provider";
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchClicks = async (params?: { startDate?: string; endDate?: string }) => {
    setClicksLoading(true);
    const p: Record<string, string> = {};
    if (params?.startDate || startDate) p.startDate = params?.startDate ?? startDate;
    if (params?.endDate || endDate) p.endDate = params?.endDate ?? endDate;
    // also dispatch redux
    try {
      dispatch(fetchClicksRequest(p as any));
    } catch {}
    try {
      const res = await api.get("/api/practo-clicks", { params: p });
      const data: ClicksData = res.data?.data ?? res.data;
      setClicks(data);
    } catch (e: any) {
      const msg = e.response?.data?.error || e.response?.data?.message || e.message || "Failed to fetch clicks";
      toast.error(msg);
    } finally {
      setClicksLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchClicks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sync from redux when available (overrides local after saga success)
  useEffect(() => {
    if (reduxData !== undefined && reduxData !== null) {
      setProfileUrl(reduxData.profileUrl || "");
      setBookingUrl(reduxData.bookingUrl || "");
      setIsActive(reduxData.isActive ?? true);
      setNotConfigured(false);
      setLoading(false);
    }
    if (reduxData === null && reduxLoading === false) {
      // handled as not configured
      setNotConfigured(true);
    }
  }, [reduxData, reduxLoading]);

  useEffect(() => {
    if (reduxClicks) {
      setClicks(reduxClicks);
      setClicksLoading(false);
    }
  }, [reduxClicks]);

  const handleSave = async () => {
    setSaving(true);
    const payload: BookingProvider = {
      providerName: "practo",
      profileUrl: profileUrl.trim(),
      bookingUrl: bookingUrl.trim(),
      isActive,
    };
    // dispatch redux update
    try {
      dispatch(updateRequest(payload as any));
    } catch {}
    try {
      const res = await api.put("/api/booking-provider", payload);
      const data: BookingProvider = res.data?.data ?? res.data;
      if (data) {
        setProfileUrl(data.profileUrl || payload.profileUrl);
        setBookingUrl(data.bookingUrl || payload.bookingUrl);
        setIsActive(data.isActive ?? payload.isActive);
      }
      setNotConfigured(false);
      toast.success("Booking provider saved");
    } catch (e: any) {
      const msg = e.response?.data?.error || e.response?.data?.message || e.message;
      const details = e.response?.data?.details ? `: ${e.response.data.details.map((d: any) => `${d.field}: ${d.message}`).join(", ")}` : "";
      toast.error(msg + details);
    } finally {
      setSaving(false);
    }
  };

  const handleRefreshClicks = () => {
    fetchClicks({ startDate: startDate || undefined, endDate: endDate || undefined });
  };

  if ((loading || reduxLoading) && !notConfigured && !profileUrl && !bookingUrl) {
    return (
      <AdminLayout>
        <div className="p-6"><SpinnerCustom /></div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Booking Provider</h2>
          <p className="text-sm text-zinc-500">Manage Practo booking links and click stats</p>
        </div>

        {notConfigured && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/30 dark:text-amber-300">
            No booking provider configured yet. Fill the form below and save to create the Practo provider.
          </div>
        )}

        {/* Config Form */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 font-semibold text-zinc-900 dark:text-white">Practo Configuration</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Provider Name</label>
              <input
                value={providerName}
                readOnly
                disabled
                className="w-full rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
              />
              <p className="mt-1 text-xs text-zinc-400">This value cannot be changed</p>
            </div>
            <div className="flex items-end">
              <label className="flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-800/50">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Active</span>
                <span className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="peer sr-only"
                  />
                  <span
                    onClick={() => setIsActive(!isActive)}
                    className={`inline-flex h-6 w-11 cursor-pointer items-center rounded-full p-1 transition-colors ${
                      isActive ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${isActive ? "translate-x-5" : "translate-x-0"}`}
                    />
                  </span>
                </span>
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Profile URL</label>
              <input
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                placeholder="https://www.practo.com/.../profile"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              <p className="mt-1 text-xs text-zinc-400">Public Practo profile link</p>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Booking URL</label>
              <input
                value={bookingUrl}
                onChange={(e) => setBookingUrl(e.target.value)}
                placeholder="https://www.practo.com/.../book"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              <p className="mt-1 text-xs text-zinc-400">Direct booking / appointment link</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-6 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Provider"}
          </button>
        </div>

        {/* Clicks Stats */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white">Practo Click Analytics</h3>
              <p className="text-xs text-zinc-500">Last 30 days — total and daily breakdown</p>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-lg border border-zinc-300 px-2.5 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-lg border border-zinc-300 px-2.5 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>
              <button
                onClick={handleRefreshClicks}
                disabled={clicksLoading}
                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50 dark:border-blue-900/30 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
              >
                {clicksLoading ? <SpinnerCustom /> : "Refresh"}
              </button>
            </div>
          </div>

          {/* Total Clicks */}
          <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Total Clicks</p>
            <p className="mt-1 text-3xl font-bold text-blue-900 dark:text-blue-100">
              {clicksLoading ? "—" : (clicks?.totalClicks ?? 0).toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-blue-600/70 dark:text-blue-400/70">
              {clicks?.dailyStats?.length ? `${clicks.dailyStats.length} days with activity` : "No activity yet"}
            </p>
          </div>

          {/* Daily Stats Table */}
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <th className="px-4 py-2.5 text-xs font-medium text-zinc-500">Date</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-zinc-500">Count</th>
                </tr>
              </thead>
              <tbody>
                {clicksLoading ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-sm text-zinc-500">
                      Loading click statistics...
                    </td>
                  </tr>
                ) : !clicks?.dailyStats?.length ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-sm text-zinc-500">
                      No click data available for the selected range.
                    </td>
                  </tr>
                ) : (
                  clicks.dailyStats.map((row) => (
                    <tr key={row._id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50">
                      <td className="px-4 py-2.5 font-medium text-zinc-900 dark:text-white">{row._id}</td>
                      <td className="px-4 py-2.5 text-zinc-700 dark:text-zinc-300">{row.count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
