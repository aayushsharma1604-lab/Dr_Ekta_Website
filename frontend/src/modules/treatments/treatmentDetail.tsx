"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTreatmentBySlugSafe } from "@/lib/api/services/treatments";
import type { Treatment } from "@/lib/api/types";
import BookAppointment from "@/shared/components/cta/BookAppointment";
import WhatsAppButton from "@/shared/components/cta/WhatsAppButton";
import { FAQSection } from "@/shared/components/faq/FAQSection";
import { EmptyState, getEmptyMessage } from "@/shared/components/EmptyState";
import { PAGE_VIDEO } from "@/shared/media/pageVideos";
import { CTASection, PageHero, SectionHeading } from "@/shared/components/layout";

function truncateAtWord(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 80 ? lastSpace : max).trim()}…`;
}

export function TreatmentDetail({ slug }: { slug: string }) {
  const [treatment, setTreatment] = useState<Treatment | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const getNoData = (m: string) => getEmptyMessage(m);

  useEffect(() => {
    let mounted = true;
    getTreatmentBySlugSafe(slug)
      .then((api) => {
        if (!mounted) return;
        if (api) setTreatment(api);
        else setNotFound(true);
      })
      .catch(() => {
        if (mounted) setNotFound(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-[#dbeafe] px-4 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Loading treatment...</p>
        </div>
      </div>
    );
  }

  if (notFound || !treatment) {
    return (
      <div className="bg-[#dbeafe] px-4 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px] rounded-2xl bg-white p-8 ring-1 ring-slate-200/80">
          <EmptyState moduleName="Treatments" />
          <p className="mt-4 text-center text-sm text-slate-500">Slug: {slug}</p>
          <div className="mt-6 text-center">
            <Link href="/treatments" className="btn-sanctuary-ghost">
              Back to Treatments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const faqs = treatment.faqs || [];

  const resolveAssetUrl = (input: unknown): string | null => {
    if (!input) return null;
    if (typeof input === "string") return input.startsWith("data:") ? null : input;
    if (typeof input === "object") {
      const o = input as Record<string, unknown>;
      const url = o.optimizedUrl || o.url;
      return typeof url === "string" && url ? url : null;
    }
    return null;
  };

  const heroUrl = resolveAssetUrl(treatment.heroImage);
  const coverUrl = resolveAssetUrl(Array.isArray(treatment.gallery) ? treatment.gallery[0] : null);
  const displayImage = coverUrl || heroUrl || "/dental/service-checkup.jpg";

  return (
    <div className="flex flex-col bg-[#dbeafe]">
      <PageHero
        breadcrumb={[{ label: "Treatments", href: "/treatments" }, { label: treatment.title }]}
        eyebrow="Treatment"
        title={treatment.title}
        description={treatment.sections?.what ? truncateAtWord(treatment.sections.what, 180) : getNoData("Treatments")}
        image={displayImage}
        imageAlt={`${treatment.title} at Dr. Ekta Narula Dental Care`}
        backgroundImage={PAGE_VIDEO.treatmentDetail.poster}
        backgroundVideo={PAGE_VIDEO.treatmentDetail.src}
      >
        <BookAppointment variant="secondary" size="lg" label="Book Appointment" />
        <WhatsAppButton message={`Hi, I would like to know more about ${treatment.title}.`} />
      </PageHero>

      <section className="bg-white px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading eyebrow="Overview / What it is" title={`What is ${treatment.title}?`} />
            <div className="body-lg mt-6 whitespace-pre-line">{treatment.sections?.what || getNoData("Treatments")}</div>
          </div>
          <div>
            <SectionHeading eyebrow="Suitability / Who it is for" title="Who needs it?" />
            <div className="body-lg mt-6 whitespace-pre-line">{treatment.sections?.who || getNoData("Treatments")}</div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#eff6ff] px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <img
          src="/dental/clinic-room.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-[#eff6ff]/85" />
        <div className="relative mx-auto max-w-[1400px]">
          <SectionHeading
            eyebrow="Concerns / What we address"
            title="Problems we address"
            description="If any of these sound familiar, a consultation can help you understand the right next step."
          />
          {treatment.problems && treatment.problems.length > 0 ? (
            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {treatment.problems.map((p, i) => (
                <div key={i} className="flex items-start gap-3 rounded-2xl bg-white p-5 ring-1 ring-slate-200/80">
                  <span className="material-icons mt-0.5 text-lg text-slate-700">check_circle</span>
                  <span className="text-sm font-medium leading-6 text-slate-800">{p}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-12">
              <EmptyState moduleName="Problems" />
            </div>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden bg-white px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <img
          src={displayImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-white/85" />
        <div className="relative mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Advantages / Why it helps"
              title={`Benefits of ${treatment.title}`}
              description="A treatment plan is always tailored to your anatomy, goals, and comfort."
            />
          </div>
          <div className="lg:col-span-7">
            {treatment.benefits && treatment.benefits.length > 0 ? (
              <div className="divide-y divide-slate-200 border-y border-slate-200">
                {treatment.benefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-4 py-5">
                    <span className="material-icons mt-0.5 text-lg text-slate-700">verified</span>
                    <span className="body-md">{b}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState moduleName="Benefits" />
            )}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#eff6ff] px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <img
          src="/dental/service-checkup.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-[#eff6ff]/88" />
        <div className="relative mx-auto max-w-[1400px]">
          <SectionHeading
            eyebrow="The details / Before you decide"
            title="Procedure & details"
            description="What to expect, how long it takes, and how to plan your recovery."
          />
          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            <div className="card-hover bg-white/90">
              <h3 className="heading-sm">The Procedure</h3>
              <div className="body-sm mt-3 whitespace-pre-line">{treatment.sections?.procedure || getNoData("Treatments")}</div>
            </div>
            <div className="card-hover bg-white/90">
              <h3 className="heading-sm">Is It Painful?</h3>
              <div className="body-sm mt-3 whitespace-pre-line">{treatment.sections?.pain || getNoData("Treatments")}</div>
            </div>
            <div className="card-hover bg-white/90">
              <h3 className="heading-sm">Duration</h3>
              <div className="body-sm mt-3 whitespace-pre-line">{treatment.sections?.duration || getNoData("Duration")}</div>
            </div>
            <div className="card-hover bg-white/90">
              <h3 className="heading-sm">Recovery</h3>
              <div className="body-sm mt-3 whitespace-pre-line">{treatment.sections?.recovery || getNoData("Recovery")}</div>
            </div>
            <div className="card-hover bg-white/90 lg:col-span-2">
              <h3 className="heading-sm">Risks & Limitations</h3>
              <div className="body-sm mt-3 whitespace-pre-line">{treatment.sections?.risks || getNoData("Risks")}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-slate-950 px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <img
          src={displayImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="relative mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/65">
              Patient journey / What to expect
            </p>
            <h2 className="mt-3 heading-lg text-white!">What to expect</h2>
          </div>
          <div className="lg:col-span-8">
            {treatment.sections?.expectations ? (
              <div className="body-lg whitespace-pre-line text-white/85!">{treatment.sections.expectations}</div>
            ) : (
              <div className="rounded-2xl bg-white/95">
                <EmptyState moduleName="Expectations" />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-slate-950 px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <img
          src="/hero-dr-ekta.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center opacity-35"
        />
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="relative mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/65">
              The difference / Why Dr. Ekta
            </p>
            <h2 className="mt-3 heading-lg text-white!">Why Dr. Ekta?</h2>
          </div>
          <div className="lg:col-span-8">
            {treatment.sections?.whyDrEkta ? (
              <div className="body-lg whitespace-pre-line text-white/85!">{treatment.sections.whyDrEkta}</div>
            ) : (
              <div className="rounded-2xl bg-white/95">
                <EmptyState moduleName="Why Dr. Ekta" />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1400px]">
          {faqs.length === 0 ? <EmptyState moduleName="FAQs" /> : <FAQSection title="Frequently Asked *Questions*" faqs={faqs} />}
        </div>
      </section>

      <CTASection
        title={`Ready to book your ${treatment.title}?`}
        description="Schedule a consultation with Dr. Ekta to discuss your treatment options and get a personalised care plan."
      />
    </div>
  );
}
