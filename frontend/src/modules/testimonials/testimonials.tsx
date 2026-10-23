"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTestimonials } from "@/lib/api/services/testimonials";
import type { Testimonial } from "@/lib/api/types";
import { EmptyState } from "@/shared/components/EmptyState";
import type { GalleryItem } from "@/lib/api/types";
import { GALLERY_ITEMS } from "@/shared/constants";
import { extractImageUrl, extractVideoUrl, resolveTestimonialImage, stripUrls } from "@/lib/media";
import { PAGE_VIDEO } from "@/shared/media/pageVideos";
import { CTASection, PageHero, SectionHeading } from "@/shared/components/layout";

function extractFirstUrl(s: string): string | null {
  const m = (s || "").match(/https?:\/\/[^\s"']+/i);
  return m ? m[0].replace(/[),.\]}'"]+$/, "") : null;
}

function mediaUrlOf(t: Testimonial): string | null {
  if (t.type === "video") return extractVideoUrl(t.content || "") || extractFirstUrl(t.content || "");
  if (t.type === "audio") return extractFirstUrl(t.content || "");
  return extractFirstUrl(t.content || "");
}

function isVideoUrl(t: Testimonial) {
  return t.type === "video" && !!mediaUrlOf(t);
}

function isAudioUrl(t: Testimonial) {
  return t.type === "audio" && !!mediaUrlOf(t);
}

function captionOf(t: Testimonial): string {
  return stripUrls(t.content || "");
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [galleryItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    getTestimonials({ page: 1, limit: 12 })
      .then((res) => setTestimonials(res.items || []))
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const videoTestimonials = testimonials.filter(isVideoUrl);
  const photoTestimonials = testimonials.filter(
    (t) => t.type === "image" || !!extractImageUrl(t.content || "") || !!resolveTestimonialImage(t)
  );
  const textTestimonials = testimonials.filter(
    (t) => !isVideoUrl(t) && !isAudioUrl(t) && t.type !== "image" && !extractImageUrl(t.content || "")
  );
  const latestPhotos = [...photoTestimonials]
    .sort((a, b) => +new Date(b.createdAt || 0) - +new Date(a.createdAt || 0))
    .slice(0, 10);

  return (
    <div className="flex flex-col bg-[#dbeafe]">
      <PageHero
        eyebrow="Patient Stories"
        title={
          <>
            Find out what <span className="text-slate-500">patients are saying</span>
          </>
        }
        description="Real stories from our patients about their experiences with our modern dental care."
        image="/dental/service-veneers.jpg"
        imageAlt="Happy dental patient"
        backgroundImage={PAGE_VIDEO.testimonials.poster}
        backgroundVideo={PAGE_VIDEO.testimonials.src}
      >
        <Link href="/gallery" className="btn-sanctuary">
          View Smile Gallery
        </Link>
        <Link href="/contact" className="btn-sanctuary-ghost">
          Book a Consultation
        </Link>
      </PageHero>

      {loading ? (
        <section className="bg-white px-4 py-24 sm:px-8 lg:px-12">
          <p className="text-center text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
            Loading testimonials...
          </p>
        </section>
      ) : error ? (
        <section className="bg-white px-4 py-24 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1400px]">
            <EmptyState moduleName="Testimonials" message={error} onRetry={() => window.location.reload()} />
          </div>
        </section>
      ) : testimonials.length === 0 ? (
        <section className="bg-white px-4 py-24 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1400px]">
            <EmptyState moduleName="Testimonials" />
          </div>
        </section>
      ) : (
        <>
          <section className="bg-[#eff6ff] px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
            <div className="mx-auto max-w-[1400px]">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <SectionHeading
                  eyebrow="Photo stories / In their own smiles"
                  title="Photo testimonials"
                  description="Real patients, real results, shared with consent."
                />
                <Link href="/gallery" className="btn-sanctuary-ghost shrink-0">
                  Full Gallery
                </Link>
              </div>

              {photoTestimonials.length > 0 ? (
                <div className="marquee mt-12 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
                  <div className="marquee-track flex w-max">
                    {[false, true].map((copy) => (
                      <div key={copy ? "copy" : "orig"} aria-hidden={copy || undefined} className="flex gap-4 pr-4">
                        {latestPhotos.map((t) => {
                          const img = resolveTestimonialImage(t) || extractImageUrl(t.content || "");
                          const caption = captionOf(t);
                          return (
                            <div key={t._id} className="w-64 shrink-0 sm:w-72">
                              <div className="media-card aspect-square rounded-2xl bg-white ring-1 ring-slate-200/80">
                                {img ? (
                                  <img
                                    src={img}
                                    alt={t.patientDisplayName}
                                    loading="lazy"
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center">
                                    <span className="material-icons text-4xl text-slate-300">photo_camera</span>
                                  </div>
                                )}
                                <span className="media-badge">Patient story</span>
                              </div>
                              <p className="mt-3 truncate text-sm font-semibold text-slate-900">
                                {t.patientDisplayName}
                              </p>
                              {caption ? (
                                <p className="body-sm mt-1 line-clamp-2">&ldquo;{caption}&rdquo;</p>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              ) : galleryItems.length === 0 ? (
                <div className="mt-12 grid gap-4 sm:grid-cols-2">
                  {GALLERY_ITEMS.slice(0, 2).map((item) => (
                    <div key={item.id} className="card-hover group">
                      <div className="mb-4 grid grid-cols-2 gap-2">
                        <div className="aspect-square overflow-hidden rounded-xl bg-[#eff6ff]">
                          <img
                            src={(item as unknown as { before: string }).before}
                            alt="Before"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="aspect-square overflow-hidden rounded-xl bg-[#eff6ff]">
                          <img
                            src={(item as unknown as { after: string }).after}
                            alt="After"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Before & After
                          </p>
                          <h3 className="heading-sm mt-1">{item.treatment}</h3>
                        </div>
                        <span className="material-icons text-slate-400 transition-colors group-hover:text-slate-900">
                          zoom_in
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {galleryItems.slice(0, 6).map((item) => {
                    const beforeUrl =
                      typeof item.beforeImg === "string"
                        ? item.beforeImg
                        : (item.beforeImg as { url?: string })?.url;
                    const afterUrl =
                      typeof item.afterImg === "string"
                        ? item.afterImg
                        : (item.afterImg as { url?: string })?.url;
                    const treatment = (item.treatmentTag as { title?: string })?.title || "Smile Transformation";
                    return (
                      <div key={item._id} className="card-hover group">
                        <div className="mb-4 grid grid-cols-2 gap-2">
                          <div className="aspect-square overflow-hidden rounded-xl bg-[#eff6ff]">
                            {beforeUrl ? (
                              <img src={beforeUrl} alt="Before" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <span className="material-icons text-3xl text-slate-300">image</span>
                              </div>
                            )}
                          </div>
                          <div className="aspect-square overflow-hidden rounded-xl bg-[#eff6ff]">
                            {afterUrl ? (
                              <img src={afterUrl} alt="After" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <span className="material-icons text-3xl text-slate-300">image</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                              Before & After
                            </p>
                            <h3 className="heading-sm mt-1">{treatment}</h3>
                            <p className="body-sm mt-1 line-clamp-2">{item.content}</p>
                          </div>
                          <span className="material-icons text-slate-400 transition-colors group-hover:text-slate-900">
                            zoom_in
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="bg-white px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
            <div className="mx-auto max-w-[1400px]">
              <SectionHeading
                eyebrow="In their words / Written reviews"
                title="More patient stories"
                description="Unedited feedback from people who trusted us with their smiles."
              />
              {textTestimonials.length === 0 ? (
                <div className="mt-12">
                  <EmptyState moduleName="Testimonials" />
                </div>
              ) : (
                <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {textTestimonials.slice(0, 6).map((t) => {
                    const photo = resolveTestimonialImage(t);
                    const text = captionOf(t) || t.content;
                    return (
                      <div key={t._id} className="card-hover flex flex-col">
                        <div className="mb-5 flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="material-icons text-lg text-amber-500">
                              star
                            </span>
                          ))}
                        </div>
                        <p className="body-md flex-1 line-clamp-4">&ldquo;{text}&rdquo;</p>
                        <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                          {photo ? (
                            <img
                              src={photo}
                              alt={t.patientDisplayName}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eff6ff]">
                              <span className="material-icons text-lg text-slate-600">person</span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{t.patientDisplayName}</p>
                            <p className="text-xs text-slate-500">
                              {(t.treatmentTag as { title?: string })?.title || "Patient"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="bg-[#eff6ff] px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
            <div className="mx-auto max-w-[1400px]">
              <SectionHeading
                eyebrow="On camera / Video reviews"
                title="Video testimonials"
                description="Watch our patients share their experiences in their own words."
              />
              {videoTestimonials.length === 0 ? (
                <div className="mt-12">
                  <EmptyState moduleName="Video Testimonials" />
                </div>
              ) : (
                <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {videoTestimonials.map((t) => {
                    const photo = resolveTestimonialImage(t);
                    return (
                      <div key={t._id} className="card-hover">
                        <video
                          src={mediaUrlOf(t) as string}
                          controls
                          preload="metadata"
                          className="aspect-video w-full rounded-xl bg-black object-contain"
                        />
                        {captionOf(t) ? <p className="body-sm mt-4 line-clamp-3">{captionOf(t)}</p> : null}
                        <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
                          {photo ? (
                            <img
                              src={photo}
                              alt={t.patientDisplayName}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eff6ff]">
                              <span className="material-icons text-lg text-slate-600">person</span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{t.patientDisplayName}</p>
                            <p className="text-xs text-slate-500">
                              {(t.treatmentTag as { title?: string })?.title || "Patient"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      <CTASection
        title="Ready to share your story?"
        description="Join our happy patients and experience the difference at Dr. Ekta Narula Dental Care."
      />
    </div>
  );
}
