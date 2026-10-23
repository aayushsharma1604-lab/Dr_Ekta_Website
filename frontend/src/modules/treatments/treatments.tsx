"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTreatments } from "@/lib/api/services/treatments";
import type { Treatment } from "@/lib/api/types";
import { resolveMediaUrl } from "@/lib/media";
import BookAppointment from "@/shared/components/cta/BookAppointment";
import ImageCard from "@/shared/components/cards/ImageCard";
import { EmptyState } from "@/shared/components/EmptyState";
import { PAGE_VIDEO } from "@/shared/media/pageVideos";
import { CTASection, PageHero, SectionHeading } from "@/shared/components/layout";

const TREATMENT_FALLBACK_IMAGES = [
  "/dental/service-checkup.jpg",
  "/dental/service-cleaning.jpg",
  "/dental/service-veneers.jpg",
  "/dental/clinic-room.jpg",
];

function mapApiTreatment(t: Treatment, index: number) {
  return {
    id: t.slug,
    title: t.title,
    description: t.sections?.what?.slice(0, 120) || t.sections?.who?.slice(0, 120) || "Expert dental care",
    icon: "medical_services",
    image: resolveMediaUrl(t.heroImage) || TREATMENT_FALLBACK_IMAGES[index % TREATMENT_FALLBACK_IMAGES.length],
  };
}

export function Treatments() {
  const [treatments, setTreatments] = useState<ReturnType<typeof mapApiTreatment>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getTreatments({ page: 1, limit: 20 })
      .then((res) => {
        if (!mounted) return;
        setTreatments((res.items || []).map(mapApiTreatment));
      })
      .catch((e) => {
        if (mounted) setError((e as Error).message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col bg-[#dbeafe]">
      <PageHero
        eyebrow="Our Treatments"
        title={
          <>
            Comprehensive <span className="text-slate-500">Dental Care</span>
          </>
        }
        description="From routine check-ups to advanced procedures, Dr. Ekta Narula and her team provide complete dental care using the latest technology and techniques."
        image="/dental/service-checkup.jpg"
        imageAlt="Dental team treating a patient"
        backgroundImage={PAGE_VIDEO.treatments.poster}
        backgroundVideo={PAGE_VIDEO.treatments.src}
      >
        <BookAppointment variant="secondary" size="lg" label="Book Appointment" />
        <Link href="/contact" className="btn-sanctuary-ghost">
          Ask a Question
        </Link>
      </PageHero>

      <section className="bg-[#eff6ff] px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1400px]">
          <SectionHeading
            eyebrow="Treatment Menu / Full-service dentistry"
            title="Care for every stage of your smile"
            description="Each treatment is planned around your comfort, your goals, and the long-term health of your teeth and gums."
          />

          {loading ? (
            <p className="mt-12 text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
              Loading treatments...
            </p>
          ) : error ? (
            <div className="mt-12">
              <EmptyState moduleName="Treatments" message={error} onRetry={() => window.location.reload()} />
            </div>
          ) : treatments.length === 0 ? (
            <div className="mt-12">
              <EmptyState moduleName="Treatments" />
            </div>
          ) : (
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {treatments.map((treatment) => (
                <ImageCard
                  key={treatment.id}
                  href={`/treatments/${treatment.id}`}
                  image={treatment.image}
                  alt={treatment.title}
                  icon={treatment.icon}
                  eyebrow="Treatment"
                  title={treatment.title}
                  description={treatment.description}
                  className="min-h-[320px]"
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Why Dr. Ekta / A considered standard"
              title="Why choose Dr. Ekta for your treatment?"
              description="Dr. Ekta combines advanced technology with compassionate care to deliver exceptional results for every patient."
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
            {[
              { icon: "verified", title: "15+ Years Experience", desc: "Extensive experience in treating complex dental cases.", image: "/clinic-team.jpg" },
              { icon: "precision_manufacturing", title: "Advanced Technology", desc: "State-of-the-art equipment for precise, comfortable treatment.", image: "/dental/service-checkup.jpg" },
              { icon: "favorite", title: "Patient-Centric Care", desc: "Your comfort and satisfaction are our top priorities.", image: "/dental/service-cleaning.jpg" },
              { icon: "emoji_events", title: "Gold Medalist", desc: "Award-winning expertise in cosmetic and prosthetic dentistry.", image: "/doctor-certificates.jpg" },
            ].map((item) => (
              <ImageCard
                key={item.title}
                image={item.image}
                alt={item.title}
                icon={item.icon}
                title={item.title}
                description={item.desc}
                className="min-h-[220px]"
                imageClassName="object-center"
              />
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to start your treatment?"
        description="Schedule a consultation with Dr. Ekta to discuss your treatment options."
      />
    </div>
  );
}
