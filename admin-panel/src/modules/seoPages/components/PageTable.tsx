"use client";

export type PageStatus = "Draft" | "Published" | "Rejected";

export interface CategoryPage {
  id: string;
  pageTitle: string;
  shortDescription: string;
  url: string;
  publishDate: string;
  postedBy: string;
  createdBy: string;
  updatedBy: string;
  updatedAt: string;
  status: PageStatus;
}

const statusStyles: Record<PageStatus, string> = {
  Draft: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Published: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function PageTable({ pages, onSelect, onStatusChange, onCreate }: {
  pages: CategoryPage[];
  onSelect: (id: string) => void;
  onStatusChange: (id: string, status: PageStatus) => void;
  onCreate: () => void;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Category Page</h2>
        <button onClick={onCreate} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Create New Page
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
              <th className="px-3 py-3 font-medium text-zinc-500">Page Title</th>
              <th className="px-3 py-3 font-medium text-zinc-500">Short Description</th>
              <th className="px-3 py-3 font-medium text-zinc-500">URL</th>
              <th className="px-3 py-3 font-medium text-zinc-500">Publish Date</th>
              <th className="px-3 py-3 font-medium text-zinc-500">Posted By</th>
              <th className="px-3 py-3 font-medium text-zinc-500">Created By</th>
              <th className="px-3 py-3 font-medium text-zinc-500">Updated By</th>
              <th className="px-3 py-3 font-medium text-zinc-500">Updated At</th>
              <th className="px-3 py-3 font-medium text-zinc-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/30 cursor-pointer" onClick={() => onSelect(page.id)}>
                <td className="px-3 py-2.5 font-medium text-blue-600">{page.pageTitle}</td>
                <td className="px-3 py-2.5 text-zinc-600 dark:text-zinc-400">{page.shortDescription}</td>
                <td className="px-3 py-2.5 text-blue-600">{page.url}</td>
                <td className="px-3 py-2.5 text-zinc-600 dark:text-zinc-400">{page.publishDate}</td>
                <td className="px-3 py-2.5 text-zinc-600 dark:text-zinc-400">{page.postedBy}</td>
                <td className="px-3 py-2.5 text-zinc-600 dark:text-zinc-400">{page.createdBy}</td>
                <td className="px-3 py-2.5 text-zinc-600 dark:text-zinc-400">{page.updatedBy}</td>
                <td className="px-3 py-2.5 text-zinc-600 dark:text-zinc-400">{page.updatedAt}</td>
                <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={page.status}
                    onChange={(e) => onStatusChange(page.id, e.target.value as PageStatus)}
                    className={`rounded-full border-0 px-2 py-1 text-xs font-medium ${statusStyles[page.status]}`}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
