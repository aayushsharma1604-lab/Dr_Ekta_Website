"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SITE_CONFIG as FB, teamCategoryLabel } from "@/shared/constants";
import { getTeamMemberBySlugSafe } from "@/lib/api/services/team";
import { getTestimonials } from "@/lib/api/services/testimonials";
import type { TeamMember, Testimonial } from "@/lib/api/types";
import { resolveMediaUrl } from "@/lib/media";
import { EmptyState } from "@/shared/components/EmptyState";
import { CTASection, SectionHeading } from "@/shared/components/layout";

const TIME_SLOTS = ["10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];

function nextDays(n: number): { label: string; sub: string }[] {
  const out: { label: string; sub: string }[] = [];
  const t = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(t);
    d.setDate(t.getDate() + i);
    out.push({
      label: i === 0 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short" }),
      sub: d.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
    });
  }
  return out;
}

function useReviews() {
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  useEffect(() => {
    let mounted = true;
    getTestimonials({ page: 1, limit: 2 })
      .then((res) => {
        if (mounted) setReviews(res.items || []);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);
  return reviews;
}

function initialsOf(name: string): string {
  return name
    .replace(/^Dr\.?\s*/i, "")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

const TEAM_HERO_VIDEO = "/dental/videos/team.mp4";
const TEAM_HERO_POSTER = "/clinic-team.jpg";

function TeamHeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <video
        className="h-full w-full object-cover motion-reduce:hidden"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={TEAM_HERO_POSTER}
      >
        <source src={TEAM_HERO_VIDEO} type="video/mp4" />
      </video>
      <img
        src={TEAM_HERO_POSTER}
        alt=""
        className="hidden h-full w-full object-cover motion-reduce:block"
      />
      <div className="absolute inset-0 bg-slate-950/45" />
      <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-slate-950/90 via-slate-950/50 to-transparent" />
    </div>
  );
}

function MemberReviews({ member, fallback }: { member: TeamMember; fallback: Testimonial[] }) {
  const own = (member.reviews || []).filter((r) => r.text || r.patientName);
  if (own.length) {
    return (
      <div className="space-y-6">
        {own.map((r, i) => (
          <div key={i} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
            <div className="mb-2 flex gap-0.5">
              {[...Array(Math.min(5, Math.max(1, r.rating || 5)))].map((_, s) => (
                <span key={s} className="material-icons text-base text-amber-500">
                  star
                </span>
              ))}
            </div>
            {r.text ? <p className="body-md">&ldquo;{r.text}&rdquo;</p> : null}
            <p className="body-sm mt-2 text-slate-500">{r.patientName || "Patient"}</p>
          </div>
        ))}
      </div>
    );
  }
  return <ReviewsBlock reviews={fallback} />;
}

function ReviewsBlock({ reviews }: { reviews: Testimonial[] }) {
  if (!reviews.length) return <p className="body-sm italic text-slate-400">Patient reviews will appear here soon.</p>;
  return (
    <div className="space-y-6">
      {reviews.map((r) => (
        <div key={r._id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
          <div className="mb-2 flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="material-icons text-base text-amber-500">
                star
              </span>
            ))}
          </div>
          <p className="body-md">&ldquo;{r.content}&rdquo;</p>
          <p className="body-sm mt-2 text-slate-500">{r.patientDisplayName}</p>
        </div>
      ))}
    </div>
  );
}

function QualCards({ member }: { member: TeamMember }) {
  if (!member.qualifications?.length) return null;
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {member.qualifications.map((q, i) => (
        <div key={i} className="card-hover">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#eff6ff]">
            <span className="material-icons text-2xl text-slate-700">school</span>
          </div>
          <h3 className="heading-sm">{q.degree || "Qualification"}</h3>
          <p className="body-sm mt-2">{[q.institution, q.year ? `Year: ${q.year}` : ""].filter(Boolean).join(" â€” ")}</p>
        </div>
      ))}
    </div>
  );
}

function BookingSidebar({ member }: { member: TeamMember }) {
  const [day, setDay] = useState(0);
  const [time, setTime] = useState(1);
  const days = nextDays(5);
  return (
    <div className="card">
      <h3 className="heading-sm">Book an appointment</h3>
      <p className="body-sm mt-1">
        {member.consultationFee != null ? `â‚¹${member.consultationFee} per consultation` : "Fee on request"}
      </p>
      <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">Choose a day</p>
      <div className="grid grid-cols-5 gap-1.5">
        {days.map((d, i) => (
          <button
            key={i}
            onClick={() => setDay(i)}
            className={`rounded-lg border px-1 py-2 text-center transition-colors ${
              day === i
                ? "border-slate-900 bg-slate-900 font-semibold text-white"
                : "border-slate-200 text-slate-500 hover:border-slate-400"
            }`}
          >
            <span className="block text-xs">{d.label}</span>
            <span className="block text-[10px]">{d.sub}</span>
          </button>
        ))}
      </div>
      <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">Choose a time</p>
      <div className="grid grid-cols-3 gap-1.5">
        {TIME_SLOTS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTime(i)}
            className={`rounded-lg border px-1 py-2 text-center text-xs transition-colors ${
              time === i
                ? "border-slate-900 bg-slate-900 font-semibold text-white"
                : "border-slate-200 text-slate-500 hover:border-slate-400"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <a href={FB.Practo} rel="noopener noreferrer" className="btn-sanctuary mt-5 w-full">
        Confirm booking
      </a>
    </div>
  );
}

function ProfileHero({ member }: { member: TeamMember }) {
  const photo = resolveMediaUrl(member.photo);
  const shortName = member.name.replace(/^Dr\.\s*/i, "");
  return (
    <section className="relative overflow-hidden bg-slate-950">
      <TeamHeroBackdrop />
      <div className="relative mx-auto max-w-[1500px] px-6 pb-16 pt-32 sm:px-10 lg:px-16 lg:pb-24 lg:pt-40">
        <nav className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60" aria-label="Breadcrumb">
          <Link href="/" className="transition-colors hover:text-white">Home</Link>
          <span className="text-white/30">/</span>
          <Link href="/team" className="transition-colors hover:text-white">Our Team</Link>
          <span className="text-white/30">/</span>
          <span className="text-white">Dr. {shortName}</span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-[#eff6ff] ring-1 ring-white/20">
              {photo ? (
                <img src={photo} alt={member.name} className="h-full w-full object-cover" />
              ) : (
                <div className="relative h-full w-full">
                  <img src="/dental/clinic-room.jpg" alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-slate-950/35" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl font-bold tracking-[-0.04em] text-white">{initialsOf(member.name)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">{teamCategoryLabel(member.category)}</p>
            <h1 className="mt-3 heading-xl hero-dark-title text-white!">{member.name}</h1>
            <p className="mt-2 text-lg font-medium text-white/75">{member.role}</p>
            {member.bio && <p className="body-lg hero-dark-body mt-5 line-clamp-4">{member.bio}</p>}

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/20 pt-6 sm:grid-cols-4">
              {[
                ["Experience", member.experienceYears != null ? `${member.experienceYears} years` : "â€”"],
                ["Languages", member.languages?.length ? member.languages.join(", ") : "â€”"],
                ["Location", member.location || "â€”"],
                ["Consultation fee", member.consultationFee != null ? `â‚¹${member.consultationFee}` : "On request"],
              ].map(([k, v]) => (
                <div key={k} className="border-l-2 border-white/40 pl-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">{k}</p>
                  <p className="mt-1 truncate text-sm font-bold text-white">{v}</p>
                </div>
              ))}
            </div>

            <div className="hero-dark-actions mt-7 flex flex-wrap gap-3">
              <a href={FB.Practo} rel="noopener noreferrer" className="btn-sanctuary">
                Book appointment
              </a>
              <a
                href={`https://wa.me/${FB.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-sanctuary-ghost"
              >
                WhatsApp
              </a>
              <Link href="/team" className="btn-sanctuary-ghost">
                All doctors
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ClassicProfile({ member, reviews }: { member: TeamMember; reviews: Testimonial[] }) {
  const [tab, setTab] = useState("About");
  return (
    <div className="flex flex-col bg-[#dbeafe]">
      <ProfileHero member={member} />

      <section className="bg-white px-4 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto grid max-w-[1400px] gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="flex gap-6 overflow-x-auto border-b border-slate-200 text-sm font-semibold">
              {["About", "Experience", "Services", "Reviews"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`shrink-0 pb-3 transition-colors ${
                    tab === t ? "border-b-2 border-slate-900 text-slate-900" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === "About" && (
              <div className="card mt-6">
                <h2 className="heading-sm">About</h2>
                <p className="body-md mt-3">{member.bio || "Profile details will be added soon."}</p>
              </div>
            )}
            {tab === "Experience" && (
              <div className="card mt-6">
                <h2 className="heading-sm">Education and experience</h2>
                <div className="mt-4 space-y-4">
                  {member.qualifications?.length ? (
                    member.qualifications.map((q, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-slate-900" />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{q.degree || "Degree"}</p>
                          <p className="text-xs text-slate-500">
                            {[q.institution, q.year ? String(q.year) : ""].filter(Boolean).join(" Â· ")}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="body-sm italic text-slate-400">No qualifications listed yet.</p>
                  )}
                </div>
              </div>
            )}
            {tab === "Services" && (
              <div className="card mt-6">
                <h2 className="heading-sm">Conditions and services</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {member.services?.length ? (
                    member.services.map((s) => (
                      <span key={s} className="rounded-full bg-[#eff6ff] px-3 py-1.5 text-xs font-medium text-slate-700">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="body-sm italic text-slate-400">Services will be added soon.</span>
                  )}
                </div>
              </div>
            )}
            {tab === "Reviews" && (
              <div className="card mt-6">
                <h2 className="heading-sm">Patient reviews</h2>
                <div className="mt-4">
                  <MemberReviews member={member} fallback={reviews} />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 lg:col-span-4">
            <div className="rounded-2xl bg-[#eff6ff] p-6 ring-1 ring-slate-200/80">
              <h3 className="heading-sm">Clinic details</h3>
              <p className="body-sm mt-3">{member.location || "New Rajinder Nagar, New Delhi"}</p>
              <p className="body-sm">{FB.phone}</p>
              <p className="body-sm">{FB.clinicTimings.morning}</p>
            </div>
            <div className="rounded-2xl bg-slate-950 p-6 text-white">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">Private consultation</p>
              <h3 className="mt-2 font-heading text-2xl font-bold uppercase tracking-[-0.02em] [word-spacing:0.12em]">
                Book with Dr. {member.name.replace(/^Dr\.\s*/i, "")}
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/70">
                A consultation is the best way to understand your options and plan your care.
              </p>
              <a
                href={FB.Practo}
                rel="noopener noreferrer"
                className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-900 transition-colors hover:bg-slate-100"
              >
                Book appointment
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SanctuaryEditorial({ member, reviews }: { member: TeamMember; reviews: Testimonial[] }) {
  return (
    <div className="flex flex-col bg-[#dbeafe]">
      <ProfileHero member={member} />
      {!!member.qualifications?.length && (
        <section className="bg-[#eff6ff] px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-[1400px]">
            <SectionHeading eyebrow="Credentials" title="Education & experience" />
            <div className="mt-10">
              <QualCards member={member} />
            </div>
          </div>
        </section>
      )}
      {!!reviews.length && (
        <section className="bg-white px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-3xl">
            <SectionHeading eyebrow="Kind words" title="Patient reviews" align="center" />
            <div className="card mt-8">
              <MemberReviews member={member} fallback={reviews} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function CompactCard({ member }: { member: TeamMember }) {
  const photo = resolveMediaUrl(member.photo);
  return (
    <div className="relative overflow-hidden bg-slate-950 px-4 pb-16 pt-32 sm:px-8 lg:px-12 lg:pb-24 lg:pt-40">
      <TeamHeroBackdrop />
      <div className="relative mx-auto max-w-xl rounded-[28px] bg-white p-8 text-center ring-1 ring-slate-200/80 sm:p-10">
        <div className="mx-auto h-32 w-32 overflow-hidden rounded-full bg-[#eff6ff] ring-4 ring-[#eff6ff]">
          {photo ? (
            <img src={photo} alt={member.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-3xl font-bold text-slate-300">
              {initialsOf(member.name)}
            </div>
          )}
        </div>
        <p className="eyebrow mt-6">{teamCategoryLabel(member.category)}</p>
        <h1 className="heading-lg mt-2">{member.name}</h1>
        <p className="mt-2 text-sm font-medium text-slate-600">{member.role}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-500">
          {member.experienceYears != null && <span>{member.experienceYears}+ yrs experience</span>}
          {!!member.languages?.length && <span>{member.languages.join(", ")}</span>}
          {member.consultationFee != null && <span>â‚¹{member.consultationFee} / visit</span>}
        </div>
        {member.bio && <p className="body-md mt-5">{member.bio}</p>}
        {!!member.services?.length && (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {member.services.map((s) => (
              <span key={s} className="rounded-full bg-[#eff6ff] px-3 py-1.5 text-xs font-medium text-slate-700">
                {s}
              </span>
            ))}
          </div>
        )}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a href={FB.Practo} rel="noopener noreferrer" className="btn-sanctuary">
            Book appointment
          </a>
          <Link href="/team" className="btn-sanctuary-ghost">
            All doctors
          </Link>
        </div>
      </div>
    </div>
  );
}

function Timeline({ member }: { member: TeamMember }) {
  const photo = resolveMediaUrl(member.photo);
  return (
    <div className="relative overflow-hidden bg-slate-950 px-4 pb-16 pt-32 sm:px-8 lg:px-12 lg:pb-24 lg:pt-40">
      <TeamHeroBackdrop />
      <div className="relative mx-auto max-w-3xl">
        <Link
          href="/team"
          className="mb-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70 transition-colors hover:text-white"
        >
          <span className="material-icons text-base">arrow_back</span>Back to Our Team
        </Link>
        <div className="rounded-[28px] bg-white p-6 ring-1 ring-slate-200/80 sm:p-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#eff6ff]">
              {photo ? (
                <img src={photo} alt={member.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xl font-bold text-slate-300">
                  {initialsOf(member.name)}
                </div>
              )}
            </div>
            <div>
              <p className="eyebrow">{teamCategoryLabel(member.category)}</p>
              <h1 className="heading-lg mt-1">{member.name}</h1>
              <p className="body-sm mt-1 text-slate-600">
                {member.role}
                {member.experienceYears != null ? ` Â· ${member.experienceYears}+ years` : ""}
              </p>
            </div>
          </div>

          <h2 className="heading-md mt-10">Career journey</h2>
          <div className="relative ml-2 mt-6 space-y-8 border-l-2 border-slate-200 pl-8">
            {member.qualifications?.length ? (
              member.qualifications.map((q, i) => (
                <div key={i} className="relative">
                  <span className="absolute -left-[41px] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                    {i + 1}
                  </span>
                  <p className="font-heading text-lg font-semibold text-slate-900">{q.degree || "Milestone"}</p>
                  <p className="body-sm">{[q.institution, q.year ? String(q.year) : ""].filter(Boolean).join(" Â· ")}</p>
                </div>
              ))
            ) : (
              <p className="body-sm italic text-slate-400">Qualifications will appear here once added.</p>
            )}
          </div>

          {member.bio && (
            <div className="mt-8 rounded-2xl bg-[#eff6ff] p-5">
              <h3 className="heading-sm">About</h3>
              <p className="body-md mt-2">{member.bio}</p>
            </div>
          )}
          <div className="mt-6">
            <a href={FB.Practo} rel="noopener noreferrer" className="btn-sanctuary">
              Book appointment
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function GallerySpotlight({ member, reviews }: { member: TeamMember; reviews: Testimonial[] }) {
  return (
    <div className="flex flex-col bg-[#dbeafe]">
      <section className="relative overflow-hidden bg-slate-950 px-4 pb-16 pt-32 sm:px-8 lg:px-12 lg:pb-24 lg:pt-40">
        <TeamHeroBackdrop />
        <div className="relative mx-auto max-w-3xl rounded-2xl bg-white p-6 text-center ring-1 ring-slate-200/80 sm:p-8">
          <p className="eyebrow">{teamCategoryLabel(member.category)}</p>
          <h1 className="heading-lg mt-2">{member.name}</h1>
          <p className="body-md mt-2 text-slate-600">{member.role}</p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-left sm:grid-cols-4">
            {[
              ["Experience", member.experienceYears != null ? `${member.experienceYears} yrs` : "â€”"],
              ["Fee", member.consultationFee != null ? `â‚¹${member.consultationFee}` : "â€”"],
              ["Languages", member.languages?.slice(0, 2).join(", ") || "â€”"],
              ["Location", member.location || "â€”"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-[#eff6ff] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{k}</p>
                <p className="mt-1 truncate text-sm font-semibold text-slate-900">{v}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href={FB.Practo} rel="noopener noreferrer" className="btn-sanctuary">
              Book appointment
            </a>
            <a
              href={`https://wa.me/${FB.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-sanctuary-ghost"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-2">
          {member.bio && (
            <div className="card-hover">
              <h3 className="heading-sm">About</h3>
              <p className="body-md mt-3">{member.bio}</p>
            </div>
          )}
          {!!member.services?.length && (
            <div className="card-hover">
              <h3 className="heading-sm">Services</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {member.services.map((s) => (
                  <span key={s} className="rounded-full bg-[#eff6ff] px-3 py-1.5 text-xs font-medium text-slate-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        {!!(member.reviews?.length || reviews.length) && (
          <div className="mx-auto mt-4 max-w-5xl card">
            <h3 className="heading-sm">Patient reviews</h3>
            <div className="mt-4">
              <MemberReviews member={member} fallback={reviews} />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export function TeamDetail({ slug }: { slug: string }) {
  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const reviews = useReviews();

  useEffect(() => {
    let mounted = true;
    getTeamMemberBySlugSafe(slug)
      .then((api) => {
        if (!mounted) return;
        if (api) setMember(api);
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
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (notFound || !member) {
    return (
      <div className="bg-[#dbeafe] px-4 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px] rounded-2xl bg-white p-8 ring-1 ring-slate-200/80">
          <EmptyState moduleName="Team" />
          <div className="mt-6 text-center">
            <Link href="/team" className="btn-sanctuary-ghost">
              Back to Our Team
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const layout = member.layout || "classic-profile";

  return (
    <div className="flex flex-col bg-[#dbeafe]">
      {layout === "classic-profile" && <ClassicProfile member={member} reviews={reviews} />}
      {layout === "sanctuary-editorial" && <SanctuaryEditorial member={member} reviews={reviews} />}
      {layout === "compact-card" && <CompactCard member={member} />}
      {layout === "timeline" && <Timeline member={member} />}
      {layout === "gallery-spotlight" && <GallerySpotlight member={member} reviews={reviews} />}
      <CTASection
        title={`Ready to meet ${member.name}?`}
        description="Schedule a consultation and experience expert dental care firsthand."
      />
    </div>
  );
}
