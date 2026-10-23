"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchConfigRequest,
  updateConfigRequest,
} from "@/modules/homepage/homepage.slice";
import { fetchListRequest as fetchTreatmentsList } from "@/modules/treatments/treatments.slice";
import { fetchListRequest as fetchArticlesList } from "@/modules/articles/articles.slice";
import { fetchListRequest as fetchVideosList } from "@/modules/videos/videos.slice";
import { fetchListRequest as fetchTestimonialsList } from "@/modules/testimonials/testimonials.slice";
import { SpinnerCustom } from "@/components/ui/spinner";

type IdItem = { _id: string; title?: string; slug?: string; patientDisplayName?: string; content?: string; category?: string; status?: string };

export default function HomepageConfigPage() {
  const dispatch = useAppDispatch();

  const homepage = useAppSelector((s) => (s as unknown as { homepage?: { config: Record<string, unknown> | null; loading: boolean; error: string | null } }).homepage);
  const config = homepage?.config as unknown as {
    featuredTreatments?: string[];
    featuredArticles?: string[];
    featuredVideos?: string[];
    featuredTestimonials?: string[];
  } | null | undefined;
  const loading = homepage?.loading ?? false;

  const treatments = useAppSelector((s) => (s as unknown as { treatments: { items: IdItem[] } }).treatments?.items || []) as IdItem[];
  const articles = useAppSelector((s) => (s as unknown as { articles: { items: IdItem[] } }).articles?.items || []) as IdItem[];
  const videos = useAppSelector((s) => (s as unknown as { videos: { items: IdItem[] } }).videos?.items || []) as IdItem[];
  const testimonials = useAppSelector((s) => (s as unknown as { testimonials: { items: IdItem[] } }).testimonials?.items || []) as IdItem[];

  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [selectedTestimonials, setSelectedTestimonials] = useState<string[]>([]);

  const [searchTreatment, setSearchTreatment] = useState("");
  const [searchArticle, setSearchArticle] = useState("");
  const [searchVideo, setSearchVideo] = useState("");
  const [searchTestimonial, setSearchTestimonial] = useState("");

  useEffect(() => {
    dispatch(fetchConfigRequest());
    dispatch(fetchTreatmentsList({ limit: 100, page: 1 } as never));
    dispatch(fetchArticlesList({ limit: 100, page: 1 } as never));
    dispatch(fetchVideosList({ limit: 100, page: 1 } as never));
    dispatch(fetchTestimonialsList({ limit: 100, page: 1 } as never));
  }, [dispatch]);

  useEffect(() => {
    if (!config) return;
    setSelectedTreatments((config.featuredTreatments || []).map(String));
    setSelectedArticles((config.featuredArticles || []).map(String));
    setSelectedVideos((config.featuredVideos || []).map(String));
    setSelectedTestimonials((config.featuredTestimonials || []).map(String));
  }, [config]);

  const toggle = (current: string[], id: string, setter: (v: string[]) => void) => {
    if (current.includes(id)) setter(current.filter((x) => x !== id));
    else setter([...current, id]);
  };

  const handleSave = () => {
    dispatch(
      updateConfigRequest({
        featuredTreatments: selectedTreatments,
        featuredArticles: selectedArticles,
        featuredVideos: selectedVideos,
        featuredTestimonials: selectedTestimonials,
      } as never)
    );
  };

  const isSaving = loading;

  const filterItems = (items: IdItem[], q: string) => {
    if (!q.trim()) return items;
    const lower = q.toLowerCase();
    return items.filter((it) => {
      const label = (it.title || it.patientDisplayName || it.slug || "").toLowerCase();
      const content = (it.content || it.category || "").toLowerCase();
      return label.includes(lower) || content.includes(lower);
    });
  };

  const renderMultiSelect = (
    title: string,
    description: string,
    items: IdItem[],
    selected: string[],
    setter: (v: string[]) => void,
    search: string,
    setSearch: (v: string) => void,
    getLabel: (it: IdItem) => string,
    getSub?: (it: IdItem) => string | undefined
  ) => {
    const filtered = filterItems(items, search);
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white">{title}</h3>
            <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
          </div>
          <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            {selected.length} selected
          </span>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${title.toLowerCase()}...`}
          className="mb-3 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        />
        <div className="max-h-64 overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          {filtered.length === 0 ? (
            <p className="p-4 text-center text-sm text-zinc-500">No items — try adjusting search or add content.</p>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.map((it) => {
                const id = String(it._id);
                const checked = selected.includes(id);
                const label = getLabel(it);
                const sub = getSub?.(it);
                return (
                  <label
                    key={id}
                    className={`flex cursor-pointer items-start gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60 ${checked ? "bg-blue-50/70 dark:bg-blue-900/20" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(selected, id, setter)}
                      className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-medium ${checked ? "text-blue-700 dark:text-blue-300" : "text-zinc-900 dark:text-zinc-100"}`}>{label}</p>
                      {sub && <p className="truncate text-xs text-zinc-500">{sub}</p>}
                      <p className="truncate text-[11px] text-zinc-400">{id}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>
        {selected.length > 0 && (
          <button
            onClick={() => setter([])}
            className="mt-2 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
          >
            Clear selection
          </button>
        )}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Homepage Configuration</h2>
            <p className="mt-1 max-w-2xl text-sm text-zinc-500">
              Pin featured content that appears first on the public homepage. Featured items are shown before latest — up to 6 treatments, 4 articles, 4 videos, and 3 testimonials.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isSaving ? <SpinnerCustom /> : "Save Configuration"}
          </button>
        </div>

        {loading && !config && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"><SpinnerCustom /></div>
        )}

        <div className="grid gap-5 lg:grid-cols-2">
          {renderMultiSelect(
            "Featured Treatments",
            "Pinned treatments shown first (max 6 on homepage)",
            treatments,
            selectedTreatments,
            setSelectedTreatments,
            searchTreatment,
            setSearchTreatment,
            (it) => it.title || it.slug || String(it._id),
            (it) => it.slug || it.status
          )}
          {renderMultiSelect(
            "Featured Articles",
            "Pinned articles shown first (max 4 on homepage)",
            articles,
            selectedArticles,
            setSelectedArticles,
            searchArticle,
            setSearchArticle,
            (it) => it.title || String(it._id),
            (it) => it.category
          )}
          {renderMultiSelect(
            "Featured Videos",
            "Pinned videos shown first (max 4 on homepage)",
            videos,
            selectedVideos,
            setSelectedVideos,
            searchVideo,
            setSearchVideo,
            (it) => it.title || String(it._id),
            (it) => it.category
          )}
          {renderMultiSelect(
            "Featured Testimonials",
            "Pinned testimonials shown first (max 3 on homepage)",
            testimonials,
            selectedTestimonials,
            setSelectedTestimonials,
            searchTestimonial,
            setSearchTestimonial,
            (it) => it.patientDisplayName || it.title || String(it._id),
            (it) => (it.content ? it.content.slice(0, 60) + (it.content.length > 60 ? "..." : "") : it.category)
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isSaving ? <SpinnerCustom /> : "Save Configuration"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
