"use client";

import { useEffect, useState } from "react";
import { getGallery } from "@/lib/api/services/gallery";
import type { GalleryItem } from "@/lib/api/types";
import { EmptyState } from "@/shared/components/EmptyState";
import { resolveMediaUrl } from "@/lib/media";
import { PAGE_VIDEO } from "@/shared/media/pageVideos";
import { CTASection, PageHero, SectionHeading } from "@/shared/components/layout";

const filters = ["All", "Dental Implants", "Teeth Whitening", "Smile Makeover", "Clear Aligners", "Crowns & Bridges", "Cosmetic Dentistry"];

export function Gallery() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGallery({ page: 1, limit: 12 })
      .then((res) => setItems(res.items || []))
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeFilter === "All" ? items : items.filter((it) => (it.treatmentTag as { title?: string })?.title === activeFilter);

  return (
    <div className="flex flex-col bg-[#dbeafe]">
      <PageHero
        eyebrow="Smile Gallery"
        title={
          <>
            Our <span className="text-slate-500">Smile Gallery</span>
          </>
        }
        description="See the transformations achieved by Dr. Ekta Narula and her team. All cases are shared with patient consent."
        image="/dental/service-veneers.jpg"
        imageAlt="Patient smiling after dental treatment"
        backgroundImage={PAGE_VIDEO.gallery.poster}
        backgroundVideo={PAGE_VIDEO.gallery.src}
      >
        <a href="#gallery" className="btn-sanctuary">View Cases</a>
        <a href="/contact" className="btn-sanctuary-ghost">Ask About Your Smile</a>
      </PageHero>

      <section id="gallery" className="bg-[#eff6ff] px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Before & After / Real results"
              title="A closer look at the work"
              description="Browse cases by treatment. Every image is published only with appropriate consent."
            />
            <div className="flex max-w-[760px] flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                    activeFilter === filter
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="mt-12 text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Loading gallery...</p>
          ) : error ? (
            <div className="mt-12">
              <EmptyState moduleName="Gallery" message={error} onRetry={() => window.location.reload()} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-12">
              <EmptyState moduleName={activeFilter === "All" ? "Gallery" : activeFilter} />
            </div>
          ) : (
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => {
                const beforeUrl = resolveMediaUrl(item.beforeImg);
                const afterUrl = resolveMediaUrl(item.afterImg);
                const treatment = (item.treatmentTag as { title?: string })?.title || "Smile Transformation";
                return (
                  <div key={item._id} className="card-hover group">
                    <div className="mb-5 grid grid-cols-2 gap-2">
                      <div className="media-card aspect-square rounded-xl bg-[#eff6ff]">
                        {beforeUrl ? (
                          <img src={beforeUrl} alt="Before treatment" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center"><span className="material-icons text-3xl text-slate-300">image</span></div>
                        )}
                        <span className="media-badge">Before</span>
                      </div>
                      <div className="media-card aspect-square rounded-xl bg-[#eff6ff]">
                        {afterUrl ? (
                          <img src={afterUrl} alt="After treatment" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center"><span className="material-icons text-3xl text-slate-300">image</span></div>
                        )}
                        <span className="media-badge">After</span>
                      </div>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Before & After</p>
                        <h3 className="heading-sm mt-1">{treatment}</h3>
                        <p className="body-sm mt-1 line-clamp-2">{item.content}</p>
                      </div>
                      <span className="material-icons text-slate-400 transition-colors group-hover:text-slate-900">zoom_in</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-[1400px] gap-8 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eff6ff]">
              <span className="material-icons text-2xl text-slate-700">info</span>
            </div>
          </div>
          <div className="lg:col-span-8">
            <h2 className="heading-lg">A note on results</h2>
            <p className="body-lg mt-4 max-w-3xl">All patient photographs and cases shown here are shared with appropriate consent. Individual results may vary. A consultation is the best way to understand what is realistic for your smile.</p>
          </div>
        </div>
      </section>

      <CTASection
        title="Want a similar transformation?"
        description="Schedule a consultation with Dr. Ekta to discuss how we can help you achieve your dream smile."
      />
    </div>
  );
}
