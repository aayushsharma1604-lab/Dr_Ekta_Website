"use client";

import { useEffect, useState } from "react";
import { getTestimonials } from "@/lib/api/services/testimonials";
import type { Testimonial } from "@/lib/api/types";
import { EmptyState } from "@/shared/components/EmptyState";
import { resolveTestimonialImage, stripUrls } from "@/lib/media";

export default function TestimonialCarousel() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTestimonials({ page: 1, limit: 6 })
      .then((res) => setTestimonials(res.items || []))
      .catch(() => setTestimonials([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="body-lg text-center text-zinc-400">Loading testimonials...</p>;
  if (testimonials.length === 0) return <EmptyState moduleName="Testimonials" />;

  const current = testimonials[currentIndex];
  const name = current.patientDisplayName;
  const text = stripUrls(current.content || "") || current.content;
  const role = (current.treatmentTag as { title?: string } | undefined)?.title || current.type;
  const photo = resolveTestimonialImage(current);

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <div className="relative">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="relative">
          <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-gradient-to-br from-sky-100 to-sky-200 dark:from-sky-900/30 dark:to-sky-800/30">
            {photo ? (
              <img src={photo} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center"><span className="material-icons text-[120px] text-sky-300 dark:text-sky-700">person</span></div>
            )}
          </div>
          <div className="absolute -bottom-4 -right-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-600 text-white shadow-lg"><span className="material-icons text-3xl">format_quote</span></div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex gap-1">{[...Array(5)].map((_, i) => (<span key={i} className="material-icons text-amber-400">star</span>))}</div>
          <p className="text-xl italic leading-relaxed text-zinc-600 dark:text-zinc-300">&ldquo;{text}&rdquo;</p>
          <div><p className="text-lg font-bold text-zinc-900 dark:text-white">{name}</p><p className="text-sm text-sky-600">{role}</p></div>
          <div className="flex items-center gap-4 pt-4"><span className="text-4xl font-bold text-zinc-900 dark:text-white">{String(currentIndex + 1).padStart(2, "0")}</span><span className="text-lg text-zinc-400">/{String(testimonials.length).padStart(2, "0")}</span></div>
          <div className="flex gap-3 pt-4">
            <button onClick={prev} className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"><span className="material-icons">chevron_left</span></button>
            <button onClick={next} className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"><span className="material-icons">chevron_right</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}
