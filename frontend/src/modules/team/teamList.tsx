"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TEAM_CATEGORIES, teamCategoryLabel } from "@/shared/constants";
import { getTeam } from "@/lib/api/services/team";
import type { TeamMember } from "@/lib/api/types";
import { resolveMediaUrl } from "@/lib/media";
import { EmptyState } from "@/shared/components/EmptyState";
import { PAGE_VIDEO } from "@/shared/media/pageVideos";
import { CTASection, PageHero, SectionHeading } from "@/shared/components/layout";

export function TeamList() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getTeam({ page: 1, limit: 50 })
      .then((res) => {
        if (mounted) setMembers(res.items || []);
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

  const filtered = activeCategory === "All" ? members : members.filter((m) => m.category === activeCategory);

  return (
    <div className="flex flex-col bg-[#dbeafe]">
      <PageHero
        eyebrow="Our Team"
        title={
          <>
            Meet our <span className="text-slate-500">experts</span>
          </>
        }
        description="A team of experienced specialists working together to provide comprehensive, compassionate dental care."
        image="/clinic-team.jpg"
        imageAlt="Dr. Ekta Narula and the clinic team"
        backgroundImage={PAGE_VIDEO.team.poster}
        backgroundVideo={PAGE_VIDEO.team.src}
      >
        <a href="#team" className="btn-sanctuary">Meet the Team</a>
        <Link href="/contact" className="btn-sanctuary-ghost">Book a Consultation</Link>
      </PageHero>

      <section id="team" className="bg-[#eff6ff] px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Specialists / One standard of care"
              title="The people behind your smile"
              description="Every clinician shares the same comfort-first approach and the same attention to detail."
            />
            <div className="flex max-w-[760px] flex-wrap gap-2">
              {["All", ...TEAM_CATEGORIES.map((c) => c.value)].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                    activeCategory === cat
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {cat === "All" ? "All" : teamCategoryLabel(cat)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="mt-12 text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Loading team...</p>
          ) : error ? (
            <div className="mt-12">
              <EmptyState moduleName="Team" message={error} onRetry={() => window.location.reload()} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-12">
              <EmptyState moduleName="Team" />
            </div>
          ) : (
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((m) => {
                const photo = resolveMediaUrl(m.photo);
                const initials = m.name
                  .replace(/^Dr\.?\s*/i, "")
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2);
                return (
                  <Link key={m._id} href={`/team/${m.slug}`} className="card-hover group flex flex-col">
                    <div className="media-card mb-5 aspect-[4/5] rounded-xl bg-[#eff6ff]">
                      {photo ? (
                        <img src={photo} alt={m.name} loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-5xl font-bold tracking-[-0.04em] text-slate-300">{initials}</span>
                        </div>
                      )}
                      <span className="media-badge">
                        View profile <span className="material-icons text-sm">arrow_outward</span>
                      </span>
                    </div>
                    <h2 className="heading-sm transition-colors group-hover:text-slate-500">{m.name}</h2>
                    <p className="mt-1 text-sm font-medium text-slate-700">{m.role}</p>
                    <p className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      <span className="material-icons text-sm">verified</span>
                      {teamCategoryLabel(m.category)}
                      {m.experienceYears != null ? ` · ${m.experienceYears}+ Years` : ""}
                    </p>
                    {m.qualifications?.length ? (
                      <p className="body-sm mt-3 line-clamp-2">{m.qualifications.map((q) => q.degree).filter(Boolean).join(" · ")}</p>
                    ) : null}
                    <span className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-900">
                      View Profile <span className="material-icons text-base transition-transform group-hover:translate-x-1">arrow_forward</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <CTASection
        title="Not sure who to see?"
        description="Book a consultation and we will match you with the right specialist for your smile."
      />
    </div>
  );
}
