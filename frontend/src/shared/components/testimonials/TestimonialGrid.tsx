"use client";

import { useEffect, useState } from "react";
import { getTestimonials } from "@/lib/api/services/testimonials";
import { EmptyState } from "@/shared/components/EmptyState";
import { resolveTestimonialImage, stripUrls } from "@/lib/media";

export default function TestimonialGrid() {
  const [testimonials, setTestimonials] = useState<{ id: string; name: string; role: string; text: string; rating: number; photo: string | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTestimonials({ page: 1, limit: 9 })
      .then((res) => {
        setTestimonials(
          (res.items || []).map((t) => ({
            id: String(t._id),
            name: t.patientDisplayName,
            role: (t.treatmentTag as { title?: string })?.title || t.type,
            text: stripUrls(t.content || "") || t.content,
            rating: 5,
            photo: resolveTestimonialImage(t),
          }))
        );
      })
      .catch(() => setTestimonials([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="body-lg text-center text-zinc-400">Loading testimonials...</p>;
  if (testimonials.length === 0) return <EmptyState moduleName="Testimonials" />;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {testimonials.map((testimonial) => (
        <div key={testimonial.id} className="card-hover">
          <div className="mb-4 flex gap-1">{[...Array(testimonial.rating ?? 5)].map((_, i) => (<span key={i} className="material-icons text-amber-400">star</span>))}</div>
          <p className="body-md mb-6 line-clamp-4">&ldquo;{testimonial.text}&rdquo;</p>
          <div className="flex items-center gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            {testimonial.photo ? (
              <img src={testimonial.photo} alt={testimonial.name} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/30"><span className="material-icons text-sky-600">person</span></div>
            )}
            <div><p className="font-semibold text-zinc-900 dark:text-white">{testimonial.name}</p><p className="text-sm text-zinc-500">{testimonial.role}</p></div>
          </div>
        </div>
      ))}
    </div>
  );
}
