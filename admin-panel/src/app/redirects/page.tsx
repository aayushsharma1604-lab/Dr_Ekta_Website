"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchListRequest,
  createRequest,
  updateRequest,
  deleteRequest,
  fetchOneRequest,
} from "@/modules/redirects/redirects.slice";
import { SpinnerCustom } from "@/components/ui/spinner";

export default function RedirectsPage() {
  const dispatch = useAppDispatch();
  // store not yet registered — cast via unknown
  const { items, loading, item, pagination } = useAppSelector(
    (s) => (s as unknown as { redirects: { items: never[]; loading: boolean; item: unknown; pagination: { page: number; limit: number; total: number; pages: number } | null } }).redirects ?? { items: [], loading: false, item: null, pagination: null }
  ) as { items: never[]; loading: boolean; item: unknown; pagination: { page: number; limit: number; total: number; pages: number } | null };

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fromPath, setFromPath] = useState("");
  const [toPath, setToPath] = useState("");
  const [statusCode, setStatusCode] = useState<301 | 302>(301);

  useEffect(() => {
    dispatch(fetchListRequest({ page, limit, search: search || undefined } as never));
  }, [dispatch, page, limit, search]);

  // reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (!item) return;
    const r = item as unknown as { _id: string; fromPath: string; toPath: string; statusCode: number };
    // do not auto-populate if item is not a redirect (e.g., after list fetch the item may be stale)
    if (!r.fromPath && !r.toPath) return;
    setEditingId(r._id);
    setFromPath(r.fromPath || "");
    setToPath(r.toPath || "");
    setStatusCode((r.statusCode as 301 | 302) || 301);
    setShowForm(true);
  }, [item]);

  const handleSave = () => {
    if (editingId) {
      // edit: only toPath and statusCode (fromPath immutable, disabled)
      if (!toPath.trim()) return;
      dispatch(updateRequest({ id: editingId, toPath: toPath.trim(), statusCode } as never));
    } else {
      if (!fromPath.trim() || !toPath.trim()) return;
      dispatch(createRequest({ fromPath: fromPath.trim(), toPath: toPath.trim(), statusCode } as never));
    }
  };

  const handleEdit = (id: string) => {
    dispatch(fetchOneRequest(id as never));
  };

  // also allow quick edit from row data without extra fetch
  const handleEditInline = (r: { _id: string; fromPath: string; toPath: string; statusCode: number }) => {
    setEditingId(r._id);
    setFromPath(r.fromPath);
    setToPath(r.toPath);
    setStatusCode((r.statusCode as 301 | 302) || 301);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    dispatch(deleteRequest(id as never));
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFromPath("");
    setToPath("");
    setStatusCode(301);
  };

  const list = (items as unknown as { _id: string; fromPath: string; toPath: string; statusCode: number; createdAt?: string }[]) || [];
  const paginationData = pagination as unknown as { page: number; limit: number; total: number; pages: number } | null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Redirects</h2>
            <p className="text-sm text-zinc-500">Manage legacy URL redirects</p>
          </div>
          <button
            onClick={() => (showForm ? handleCancel() : setShowForm(true))}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} />
            {showForm ? "Cancel" : "Add Redirect"}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search from / to URL..."
              className="w-72 rounded-lg border border-zinc-300 py-2 pl-10 pr-4 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>
          <span className="text-xs text-zinc-500">{paginationData ? `${paginationData.total} total` : `${list.length} items`}</span>
        </div>

        {showForm && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 font-semibold text-zinc-900 dark:text-white">{editingId ? "Edit Redirect" : "Add Redirect"}</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">From Path *</label>
                <input
                  value={fromPath}
                  onChange={(e) => setFromPath(e.target.value)}
                  disabled={!!editingId}
                  placeholder="e.g. /old-page or old-page"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100 disabled:text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:disabled:bg-zinc-800/50"
                />
                {editingId && <p className="mt-1 text-xs text-zinc-500">The from URL cannot be changed after a redirect is created</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">To Path *</label>
                <input
                  value={toPath}
                  onChange={(e) => setToPath(e.target.value)}
                  placeholder="e.g. /new-page"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Status Code</label>
                <select
                  value={statusCode}
                  onChange={(e) => setStatusCode(Number(e.target.value) as 301 | 302)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  <option value={301}>301 — Permanent</option>
                  <option value={302}>302 — Temporary</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleSave}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                {editingId ? "Update" : "Create"} Redirect
              </button>
              <button
                onClick={handleCancel}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-4 py-3 font-medium text-zinc-500">From Path</th>
                <th className="px-4 py-3 font-medium text-zinc-500">To Path</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Status</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center">
                    <SpinnerCustom />
                  </td>
                </tr>
              )}
              {!loading && list.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-zinc-500">
                    No redirects — add one to map a legacy URL.
                  </td>
                </tr>
              )}
              {list.map((r) => (
                <tr key={r._id} className="border-b border-zinc-50 last:border-0 dark:border-zinc-800">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-zinc-900 dark:text-white">{r.fromPath}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-400">{r.toPath}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {r.statusCode}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditInline(r)}
                        className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
                        title="Edit (toPath, statusCode only)"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleEdit(r._id)}
                        className="rounded px-1.5 py-0.5 text-[10px] text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
                        title="Fetch via GET /:id"
                      >
                        fetch
                      </button>
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginationData && paginationData.pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">
              Page {paginationData.page} of {paginationData.pages} • {paginationData.total} total
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-400"
              >
                Previous
              </button>
              <button
                disabled={page >= paginationData.pages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-400"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
