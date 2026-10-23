"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TEAM as FB_TEAM } from "@/shared/constants";
import { getProfile } from "@/lib/api/services/profile";
import type { Profile } from "@/lib/api/types";
import BookAppointment from "@/shared/components/cta/BookAppointment";
import ImageCard from "@/shared/components/cards/ImageCard";
import { CTASection, PageHero, SectionHeading, StatsStrip } from "@/shared/components/layout";

const QUALIFICATION_IMAGES = [
  "/doctor-certificates.jpg",
  "/doctor-desk.jpg",
  "/doctor-coat.jpg",
];

const EXPERTISE = [
  {
    icon: "auto_awesome",
    title: "Cosmetic Dentistry",
    desc: "Teeth whitening, veneers, smile design, and aesthetic treatments.",
    image: "/dental/service-veneers.jpg",
  },
  {
    icon: "layers",
    title: "Prosthetic Dentistry",
    desc: "Crowns, bridges, implants, and full mouth rehabilitation.",
    image: "/dental/clinic-room.jpg",
  },
  {
    icon: "sentiment_very_satisfied",
    title: "Smile Makeovers",
    desc: "Complete smile transformation using advanced techniques.",
    image: "/dental/service-cleaning.jpg",
  },
  {
    icon: "medical_services",
    title: "Dental Implants",
    desc: "Permanent tooth replacement that looks and feels natural.",
    image: "/dental/service-checkup.jpg",
  },
];

const PHILOSOPHY = [
  {
    icon: "favorite",
    title: "Patient-Centric Care",
    desc: "Every treatment plan is tailored to the individual patient's needs and comfort.",
    image: "/clinic-team.jpg",
  },
  {
    icon: "science",
    title: "Evidence-Based Practice",
    desc: "Treatments backed by the latest research and proven techniques.",
    image: "/doctor-desk-2.jpg",
  },
  {
    icon: "health_and_safety",
    title: "Safety First",
    desc: "Strict sterilization protocols and modern equipment for patient safety.",
    image: "/dental/clinic-room.jpg",
  },
];

const TEAM_IMAGES = [
  "/hero-dr-ekta.jpg",
  "/dental/clinic-room.jpg",
  "/dental/service-checkup.jpg",
  "/dental/service-cleaning.jpg",
  "/dental/service-veneers.jpg",
];

export function AboutDrEkta() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    getProfile().then(setProfile).catch(() => {});
  }, []);

  const team = FB_TEAM;
  const profilePhoto =
    profile?.photo && typeof profile.photo === "object" && (profile.photo as { url?: string }).url
      ? (profile.photo as { url: string }).url
      : "/hero-dr-ekta.jpg";

  const qualifications = profile?.qualifications?.length
    ? profile.qualifications.map((q) => ({
        icon: "school",
        title: `${q.degree} — ${q.institution}`,
        desc: `Year: ${q.year}`,
      }))
    : [
        { icon: "school", title: "BDS (Gold Medalist)", desc: "Graduated from V.S. Dental College, Bangalore - one of the best dental colleges in India." },
        { icon: "local_hospital", title: "MAMC Residency", desc: "Completed junior residency from Maulana Azad Medical College (MAMC), New Delhi for one year." },
        { icon: "workspace_premium", title: "Advanced Training", desc: "Received advanced training in prosthetic dentistry from Smile India, New Delhi." },
      ];

  return (
    <div className="flex flex-col bg-[#dbeafe]">
      <PageHero
        eyebrow="About Dr. Ekta"
        title={
          <>
            Building a legacy of <span className="text-slate-500">healthy smiles</span>
          </>
        }
        description={
          profile?.bio ||
          "Dr. Ekta Narula is a dental surgeon with 15+ years of experience, practising in New Delhi. She is a Gold Medalist and has been providing exceptional dental care with a focus on patient comfort and advanced technology."
        }
        image={profilePhoto}
        imageAlt="Dr. Ekta Narula"
        imageBadge="Our clinic team"
        backgroundImage="/dental/clinic-room.jpg"
        backgroundVideo="/dental/dentalVideo.mp4"
        fullBleed
      >
        <BookAppointment variant="secondary" size="lg" label="Book Appointment" />
        <Link href="/team" className="btn-sanctuary-ghost">
          Meet the Team
        </Link>
      </PageHero>

      <StatsStrip />

      <section className="bg-[#eff6ff] px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1400px]">
          <SectionHeading
            eyebrow="Credentials / A career in care"
            title="Qualifications & experience"
            description="A foundation in rigorous clinical training, continued education, and years of hands-on practice."
          />
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {qualifications.map((item, index) => (
              <ImageCard
                key={item.title}
                image={QUALIFICATION_IMAGES[index % QUALIFICATION_IMAGES.length]}
                alt={item.title}
                icon={item.icon}
                eyebrow="Credential"
                title={item.title}
                description={item.desc}
                className="min-h-[300px]"
              />
            ))}
          </div>
          {profile?.awards?.length ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {profile.awards.map((aw, i) => (
                <ImageCard
                  key={i}
                  image={["/doctor-certificates.jpg", "/doctor-desk-2.jpg", "/clinic-team.jpg"][i % 3]}
                  alt={aw.title}
                  icon="emoji_events"
                  eyebrow="Recognition"
                  title={aw.title}
                  description={`${aw.issuer} — ${aw.year}`}
                  className="min-h-[220px]"
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1400px]">
          <SectionHeading
            eyebrow="Areas of expertise / Focused practice"
            title="What Dr. Ekta does best"
            description="Aesthetic dentistry and complex restorative work, delivered with a comfort-first approach."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {EXPERTISE.map((item) => (
              <ImageCard
                key={item.title}
                image={item.image}
                alt={item.title}
                icon={item.icon}
                eyebrow="Expertise"
                title={item.title}
                description={item.desc}
                className="min-h-[320px]"
                imageClassName="object-center"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#eff6ff] px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <SectionHeading eyebrow="Philosophy / How care should feel" title="Professional philosophy" />
            <div className="mt-6 space-y-4 body-lg">
              <p>
                Dr. Ekta believes that a beautiful smile can transform a person&apos;s confidence and quality of
                life. Her approach combines advanced technology with compassionate care to deliver pain-free,
                comfortable dental experiences.
              </p>
              <p>
                She keeps herself updated with the latest developments and technologies in dentistry, having
                attended many national and international dental conferences since graduation.
              </p>
              <p>
                The dental clinics are highly equipped with modern equipment and follow strict sterilization
                protocols with autoclaves to ensure patient safety.
              </p>
            </div>
          </div>
          <div className="space-y-4 lg:col-span-6 lg:pl-8">
            {PHILOSOPHY.map((item) => (
              <ImageCard
                key={item.title}
                image={item.image}
                alt={item.title}
                icon={item.icon}
                eyebrow="Principle"
                title={item.title}
                description={item.desc}
                className="min-h-[190px]"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Our team / Collaborative care"
              title="A team of specialists"
              description="Experienced consultants across orthodontics, endodontics, and oral surgery."
            />
            <Link href="/team" className="btn-sanctuary-ghost shrink-0">
              View All Profiles
            </Link>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {team.map((member, index) => {
              const initials = member.name
                .replace(/^Dr\.?\s*/i, "")
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2);
              return (
                <ImageCard
                  key={member.name}
                  image={TEAM_IMAGES[index % TEAM_IMAGES.length]}
                  alt={member.name}
                  eyebrow={member.specialization}
                  title={member.name}
                  description={`${member.role} · ${member.experience}`}
                  className="min-h-[380px]"
                  imageClassName="object-center"
                >
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white ring-1 ring-white/20">
                      {initials}
                    </span>
                    <span className="line-clamp-2">{member.qualifications}</span>
                  </div>
                </ImageCard>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#eff6ff] px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1400px]">
          <SectionHeading eyebrow="Recognition / Work that speaks" title="Awards & recognition" />
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            <ImageCard
              image="/doctor-certificates.jpg"
              alt="Gold Medalist recognition"
              icon="emoji_events"
              eyebrow="Recognition"
              title="Gold Medalist"
              description="Topped V.S. Dental College, Bangalore throughout the course."
              className="min-h-[240px]"
              imageClassName="object-center"
            />
            <ImageCard
              image="/clinic-team.jpg"
              alt="Asia Book of Records recognition"
              icon="workspace_premium"
              eyebrow="Recognition"
              title="Asia Book of Records"
              description="Maximum Children Screened in Dentist-Led Oral Health Camps."
              className="min-h-[240px]"
              imageClassName="object-center"
            />
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to meet Dr. Ekta?"
        description="Schedule a consultation and experience expert dental care firsthand."
      />
    </div>
  );
}
