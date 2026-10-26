"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SITE_CONFIG, GALLERY_ITEMS, TEAM } from "@/shared/constants";
import { getHome } from "@/lib/api/services/home";
import { getClinicInfo } from "@/lib/api/services/clinic";
import { getGallery } from "@/lib/api/services/gallery";
import { getInstagramPosts } from "@/lib/api/services/instagram";
import type { HomepageAggregate, ClinicInfo, GalleryItem, CuratedPost, Treatment } from "@/lib/api/types";
import BookAppointment from "@/shared/components/cta/BookAppointment";
import EnquiryForm from "@/shared/components/EnquiryForm";
import WhatsAppButton from "@/shared/components/cta/WhatsAppButton";
import { BeforeAfterSlider } from "@/shared/components/gallery";
import { BookingChat } from "@/shared/components/chat/BookingChat";
import { EmptyState } from "@/shared/components/EmptyState";
import { StatsStrip } from "@/shared/components/layout";
import { resolveArticleImage, resolveTestimonialImage, resolveMediaUrl, stripUrls } from "@/lib/media";

/* ponytail: swap this file for the client's portrait — no code change needed. */
const HERO_DOCTOR_IMAGE = "/hero-dr-ekta-portrait.jpg";

const SERVICE_IMAGES = [
  "/dental/service-cleaning.jpg",
  "/dental/service-checkup.jpg",
  "/dental/service-veneers.jpg",
  "/dental/clinic-room.jpg",
  "/doctor-desk.jpg",
  "/doctor-desk-2.jpg",
];

const FACILITIES: { title: string; icon: string; image: string; items: { label: string; href?: string }[] }[] = [
  {
    title: "Accessibility",
    icon: "accessible_forward",
    image: "/dental/clinic-room.jpg",
    items: [
      { label: "Wheelchair-accessible entrance" },
      { label: "Wheelchair-accessible seating" },
    ],
  },
  {
    title: "Patient Amenities",
    icon: "wc",
    image: "/dental/service-cleaning.jpg",
    items: [
      { label: "Clean, easily accessible restrooms" },
      { label: "Unisex restrooms available" },
    ],
  },
  {
    title: "Inclusivity",
    icon: "diversity_1",
    image: "/clinic-team.jpg",
    items: [{ label: "A welcoming, LGBTQ+ friendly environment" }],
  },
  {
    title: "Clinic Services & Planning",
    icon: "medical_services",
    image: "/dental/service-checkup.jpg",
    items: [
      { label: "Comprehensive on-site dental services" },
      { label: "Advanced cosmetic dentistry offered" },
      { label: "Prior appointments required to ensure zero wait time" },
    ],
  },
  {
    title: "Seamless Payments",
    icon: "payments",
    image: "/doctor-desk.jpg",
    items: [
      { label: "Debit cards accepted" },
      { label: "Mobile payments and UPI (Google Pay, Tez) accepted" },
    ],
  },
  {
    title: "Easy Contact",
    icon: "chat",
    image: "/doctor-desk-2.jpg",
    items: [
      {
        label: "WhatsApp messaging enabled for quick support and appointment booking",
        href: "https://wa.me/919811013519",
      },
    ],
  },
];

function treatmentImage(treatment: Treatment, index: number) {
  return resolveMediaUrl(treatment.heroImage) || SERVICE_IMAGES[index % SERVICE_IMAGES.length];
}

export function Home() {
  const [home, setHome] = useState<HomepageAggregate | null>(null);
  const [clinic, setClinic] = useState<ClinicInfo | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [instagramPosts, setInstagramPosts] = useState<CuratedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([getHome(), getClinicInfo(), getGallery({ page: 1, limit: 6 }), getInstagramPosts({ page: 1, limit: 6 })])
      .then(([homeRes, clinicRes, galleryRes, instaRes]) => {
        if (!mounted) return;
        if (homeRes.status === "fulfilled" && homeRes.value) {
          setHome(homeRes.value);
        } else if (homeRes.status === "rejected") {
          setError((homeRes.reason as Error)?.message || "Failed to load homepage");
        }
        if (clinicRes.status === "fulfilled" && clinicRes.value) {
          setClinic(clinicRes.value);
        }
        if (galleryRes.status === "fulfilled" && galleryRes.value?.items?.length) {
          setGalleryItems(galleryRes.value.items);
        }
        if (instaRes.status === "fulfilled" && instaRes.value?.items?.length) {
          setInstagramPosts(instaRes.value.items);
        }
        setLoading(false);
      })
      .catch((e) => {
        if (mounted) {
          setError((e as Error).message);
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const treatments = home?.treatments ?? [];
  const testimonials = home?.testimonials ?? [];
  const videos = home?.videos ?? [];
  const articles = home?.articles ?? [];

  const sitePhone = clinic?.phones?.[0] || SITE_CONFIG.phone;
  const siteAddress = clinic?.address?.street ? `${clinic.address.street}, ${clinic.address.city} - ${clinic.address.pincode}` : `${SITE_CONFIG.address.street}, ${SITE_CONFIG.address.area}, ${SITE_CONFIG.address.city} - ${SITE_CONFIG.address.pincode}`;
  const mondayTiming = clinic?.timings?.find((t) => t.day === "monday");
  const clinicTiming = mondayTiming ? `${mondayTiming.open} - ${mondayTiming.close}` : SITE_CONFIG.clinicTimings.morning;

  if (loading) {
    return (
      <div className="bg-[#dbeafe] px-3 py-3 sm:px-4 sm:py-4">
        <div className="rounded-[28px] bg-white px-6 py-24 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-600">Loading homepage...</p>
        </div>
      </div>
    );
  }

  if (error && !home) {
    return (
      <div className="bg-[#dbeafe] px-3 py-3 sm:px-4 sm:py-4">
        <div className="rounded-[28px] bg-white px-6 py-24">
          <EmptyState moduleName="Homepage" message={error} onRetry={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  return (
    <div className="home-shell min-h-screen bg-[#dbeafe]">
      {/* Hero */}
      <section className="px-2 pt-2 sm:px-3 sm:pt-3">
        <div className="relative mx-auto max-w-[1600px] overflow-hidden rounded-[28px] bg-slate-950">
          <img
            src="/dental/service-checkup.jpg"
            alt="Modern dental care at Dr. Ekta Narula Dental Care"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-slate-950/75" />

          <div className="relative z-10 mx-auto flex min-h-[620px] max-w-[1560px] flex-col px-5 pb-10 pt-28 sm:px-8 lg:min-h-[760px] lg:px-10 lg:pb-12 lg:pt-32">
            <div className="grid flex-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-4">
                <div className="home-rise mb-6 flex items-center gap-4 sm:mb-8 sm:gap-5">
                  <img
                    src="/logo.png"
                    alt="Dr. Ekta Narula Dental Care"
                    className="h-24 w-24 shrink-0 object-contain sm:h-28 sm:w-28"
                  />
                  <div className="min-w-0">
                    <p className="font-heading text-[28px] font-bold leading-[1.1] tracking-[-0.025em] text-white sm:text-[40px]">
                      Dr. Ekta Narula
                    </p>
                    <p className="text-xl leading-[1.2] text-white">Dental Care Centre</p>
                  </div>
                </div>
                <h1 className="home-rise max-w-[720px] text-[34px] font-bold uppercase leading-[0.92] tracking-[-0.02em] [word-spacing:0.12em] text-white sm:text-[52px] lg:text-[52px] xl:text-[56px]">
                  Modern dentistry
                  <br />
                  with gentle care.
                </h1>
                <p className="home-rise home-rise-delay-1 mt-6 max-w-[430px] text-base leading-7 text-white/85">
                  Expert dental care for healthy, confident smiles at every age—delivered with comfort, precision, and trust.
                </p>
                <div className="home-rise home-rise-delay-2 mt-8 flex max-w-[560px] flex-wrap items-center gap-2">
                  {treatments.slice(0, 4).map((treatment, index) => (
                    <Link
                      key={treatment.slug}
                      href={`/treatments/${treatment.slug}`}
                      className={`inline-flex items-center rounded-full px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors sm:text-xs ${
                        index === 0
                          ? "bg-white text-slate-900 hover:bg-slate-100"
                          : "bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20"
                      }`}
                    >
                      {treatment.title}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="grid flex-1 grid-cols-1 items-stretch gap-3 sm:gap-6 lg:col-span-8 lg:grid-cols-8">
                <div className="home-rise home-rise-delay-1 relative order-1 lg:order-none lg:col-span-5">
                  <div className="overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-white/20">
                    <img
                      src={HERO_DOCTOR_IMAGE}
                      alt="Dr. Ekta Narula, dental surgeon in New Delhi"
                      className="h-56 w-full object-cover object-center sm:h-[400px] lg:h-[560px]"
                    />
                  </div>
                </div>

                <div className="home-rise home-rise-delay-2 order-2 lg:order-none lg:col-span-3">
                  <div id="book-appointment" className="scroll-mt-24 rounded-2xl bg-white p-4 sm:p-6">
                    <h2 className="heading-sm">Book an appointment</h2>
                    <p className="mt-1.5 text-[13px] leading-5 text-slate-600">
                      Leave your number — we call back within one working day.
                    </p>
                    <div className="mt-4">
                      <EnquiryForm compact />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signature services */}
      <section className="home-reveal bg-white px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[680px]">
              <p className="text-sm font-medium text-slate-600">
                <span className="font-semibold text-slate-900">Our Features</span> / Discover our signature
              </p>
              <h2 className="mt-3 text-[40px] font-bold uppercase leading-[0.92] tracking-[-0.02em] [word-spacing:0.14em] text-slate-900 sm:text-[56px] lg:text-[70px]">
                Dental services
              </h2>
            </div>
          </div>

          <div className="mt-12">
            {treatments.length === 0 ? (
              <EmptyState moduleName="Treatments" />
            ) : (
              <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
                {treatments.slice(0, 4).map((treatment, index) => (
                  /* ponytail: 4th card only fills the 2x2 on phones; from sm up the row stays 3 up. */
                  <Link
                    key={treatment.slug}
                    href={`/treatments/${treatment.slug}`}
                    className={`group relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-200 transition-transform duration-300 active:scale-[1.04] ${index === 3 ? "sm:hidden" : ""}`}
                  >
                    <img
                      src={treatmentImage(treatment, index)}
                      alt={treatment.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 group-active:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent" />
                    <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-1 text-white sm:inset-x-4 sm:bottom-4">
                      <span className="max-w-[85%] text-base font-semibold leading-tight sm:text-xl">{treatment.title}</span>
                      <span className="material-icons text-lg transition-transform group-hover:translate-x-1 group-active:translate-x-1 sm:text-xl">arrow_forward</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Facilities & amenities */}
      <section className="home-reveal relative overflow-hidden bg-white px-4 pb-8 pt-16 sm:px-8 sm:pb-10 sm:pt-16 lg:px-12 lg:pb-8 lg:pt-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <img src="/dental/clinic-room.jpg" alt="" className="h-full w-full scale-110 object-cover opacity-40 blur-[6px]" />
        </div>
        <div className="relative mx-auto max-w-[1400px]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                <span className="font-semibold text-slate-900">Clinic facilities</span> / Amenities
              </p>
              <h2 className="mt-3 text-[38px] font-bold uppercase leading-[0.94] tracking-[-0.02em] [word-spacing:0.14em] text-slate-900 sm:text-[50px] lg:text-[58px]">
                Clinic facilities &amp; amenities
              </h2>
            </div>
            <p className="max-w-[420px] text-sm leading-6 text-slate-700">Ensuring a comfortable, accessible, and inclusive experience for all our patients.</p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">
            {FACILITIES.map((group) => (
              <div key={group.title} className="group overflow-hidden rounded-2xl bg-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.45)] ring-1 ring-slate-900/5">
                <div className="relative h-32 w-full overflow-hidden sm:h-40">
                  <img src={group.image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-slate-950/10" />
                  <div className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-white sm:bottom-4 sm:left-4 sm:h-10 sm:w-10">
                    <span className="material-icons text-base text-slate-700 sm:text-lg">{group.icon}</span>
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <h3 className="text-[13px] font-semibold text-slate-900 sm:text-[15px]">{group.title}</h3>
                  <ul className="mt-2 space-y-1.5">
                    {group.items.map((item) => (
                      <li key={item.label} className="flex items-start gap-1.5 text-[11px] leading-4 text-slate-600 sm:gap-2 sm:text-xs sm:leading-5">
                        <span className="material-icons mt-0.5 text-xs text-slate-400 sm:text-sm">check_circle</span>
                        {item.href ? (
                          <a href={item.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-slate-900 hover:text-slate-700">
                            {item.label}
                            <span className="material-icons text-sm">open_in_new</span>
                          </a>
                        ) : (
                          <span>{item.label}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="https://wa.me/919811013519" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800">
              <span className="material-icons text-base">chat</span>Chat on WhatsApp
            </a>
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50">
              <span className="material-icons text-base">contact_mail</span>Contact us
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <StatsStrip />

      {/* Excellence */}
      <section className="home-reveal bg-white px-4 pb-16 pt-16 sm:px-8 sm:pt-16 lg:px-12 lg:pb-24 lg:pt-16">
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-2xl bg-slate-200">
              <img
                src="/dental/clinic-room.jpg"
                alt="Dr. Ekta Narula dental clinic"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-6">
            <p className="text-sm font-medium text-slate-600">
              <span className="font-semibold text-slate-900">About Clinic</span> /
            </p>
            <h2 className="mt-3 max-w-[680px] text-[34px] font-bold uppercase leading-[0.94] tracking-[-0.02em] [word-spacing:0.14em] text-slate-900 sm:text-[44px] lg:text-[52px]">
              Excellence in dentistry with compassionate care
            </h2>
            <p className="mt-5 max-w-[520px] text-sm leading-6 text-slate-700 sm:text-base sm:leading-7">
              Discover delighted patient reviews about their comforting and satisfying dental care experience. Every visit is planned around your comfort, from the first conversation to the final smile.
            </p>
            <Link href="/about" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-slate-700">
              Read more <span className="material-icons text-base">arrow_outward</span>
            </Link>

            <div className="mt-10 grid grid-cols-3 gap-4 pt-6">
              <div>
                <p className="text-3xl font-bold tracking-[-0.02em] [word-spacing:0.14em] text-slate-900 sm:text-4xl">98%</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">Satisfaction rate</p>
              </div>
              <div>
                <p className="text-3xl font-bold tracking-[-0.02em] [word-spacing:0.14em] text-slate-900 sm:text-4xl">15k+</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">Smiles transformed</p>
              </div>
              <div>
                <p className="text-3xl font-bold tracking-[-0.02em] [word-spacing:0.14em] text-slate-900 sm:text-4xl">4.9</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">Customers rating</p>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl bg-[#eff6ff] p-3">
                <img src="/hero-dr-ekta.jpg" alt={TEAM[0].name} className="h-14 w-12 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{TEAM[0].name}</p>
                  <p className="truncate text-[11px] text-slate-600">{TEAM[0].role}</p>
                </div>
              </div>
              <Link href="/team" className="flex items-center gap-3 rounded-2xl bg-[#eff6ff] p-3 transition-colors hover:bg-[#e3efff]">
                <img src="/clinic-team.jpg" alt="Our specialist team" className="h-14 w-12 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">Our specialist team</p>
                  <p className="truncate text-[11px] text-slate-600">Meet the doctors</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Dr. Ekta */}
      <section className="home-reveal bg-[#eff6ff] px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-6">
            <p className="text-sm font-medium text-slate-600">
              <span className="font-semibold text-slate-900">Why choose us</span> / Gold standard care
            </p>
            <h2 className="mt-3 text-[38px] font-bold uppercase leading-[0.94] tracking-[-0.02em] [word-spacing:0.14em] text-slate-900 sm:text-[50px] lg:text-[58px]">
              Why Dr. Ekta?
            </h2>
            <p className="mt-5 max-w-[520px] text-sm leading-6 text-slate-700 sm:text-base sm:leading-7">
              A clinical sanctuary where expertise meets a compassionate, hospitality-grade approach.
            </p>
            <div className="mt-8 space-y-5">
              {[
                { icon: "emoji_events", title: "Gold Medalist", desc: "Topper from V.S. Dental College, Bangalore - one of India's best dental colleges" },
                { icon: "local_hospital", title: "MAMC Residency", desc: "Junior residency from Maulana Azad Medical College, New Delhi" },
                { icon: "school", title: "Advanced Training", desc: "Prosthetic dentistry from Smile India, New Delhi" },
                { icon: "workspace_premium", title: "Asia Book of Records", desc: "Maximum Children Screened in Dentist-Led Oral Health Camps" },
                { icon: "groups", title: "Team of Specialists", desc: "Orthodontist, endodontist, oral surgeon, and periodontist on staff" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
                    <span className="material-icons text-lg text-slate-700">{item.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-0.5 text-xs leading-5 text-slate-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/about" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-slate-700">
              Learn more about Dr. Ekta <span className="material-icons text-base">arrow_forward</span>
            </Link>
          </div>
          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-2xl bg-slate-200">
              <img src="/doctor-certificates.jpg" alt="Dr. Ekta Narula" className="aspect-[4/5] w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Videos */}
      <section className="home-reveal bg-white px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                <span className="font-semibold text-slate-900">The Atelier Journey</span> / Patient education
              </p>
              <h2 className="mt-3 text-[38px] font-bold uppercase leading-[0.94] tracking-[-0.02em] [word-spacing:0.14em] text-slate-900 sm:text-[50px] lg:text-[58px]">
                Dr. Ekta explains
              </h2>
            </div>
            <p className="max-w-[420px] text-sm leading-6 text-slate-700">Watch our educational videos about dental health and treatments.</p>
          </div>

          {videos.length === 0 ? (
            <div className="mt-10"><EmptyState moduleName="Videos" /></div>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {videos.slice(0, 6).map((video) => {
                const ytId = extractYoutubeId(video.url);
                const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : "";
                const href = getCleanYoutubeUrl(video.url);
                return (
                  <a key={video._id} href={href} target="_blank" rel="noopener noreferrer" className="group block no-underline">
                    <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-100">
                      {thumb ? <img src={thumb} alt={video.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center"><span className="material-icons text-4xl text-slate-300">play_circle</span></div>}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-slate-900 transition-transform group-hover:scale-110">
                          <span className="material-icons text-3xl">play_arrow</span>
                        </div>
                      </div>
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-slate-900">{video.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{video.transcript?.slice(0, 80) || video.category}</p>
                    {video.transcript && <details className="mt-2 text-xs text-slate-600"><summary className="cursor-pointer">Transcript</summary><p className="mt-1 whitespace-pre-line">{video.transcript}</p></details>}
                  </a>
                );
              })}
            </div>
          )}
          <div className="mt-8">
            <a href={SITE_CONFIG.social.youtube} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-slate-700">
              Subscribe on YouTube <span className="material-icons text-base">open_in_new</span>
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="home-reveal bg-[#eff6ff] px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                <span className="font-semibold text-slate-900">Patient stories</span> / Real experiences
              </p>
              <h2 className="mt-3 text-[38px] font-bold uppercase leading-[0.94] tracking-[-0.02em] [word-spacing:0.14em] text-slate-900 sm:text-[50px] lg:text-[58px]">
                Patient stories
              </h2>
            </div>
            <p className="max-w-[420px] text-sm leading-6 text-slate-700">Real stories from our patients about their experiences.</p>
          </div>

          {testimonials.length === 0 ? (
            <div className="mt-10"><EmptyState moduleName="Testimonials" /></div>
          ) : (
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.slice(0, 6).map((t) => {
                const photo = resolveTestimonialImage(t);
                const text = stripUrls(t.content || "") || t.content;
                return (
                  <div key={t._id} className="rounded-2xl bg-white p-5">
                    <div className="mb-4 flex gap-1">
                      {[...Array(5)].map((_, i) => (<span key={i} className="material-icons text-base text-amber-700">star</span>))}
                    </div>
                    <p className="break-words text-sm leading-6 text-slate-700">&ldquo;{text}&rdquo;</p>
                    <div className="mt-5 flex items-center gap-3">
                      {photo ? (
                        <img src={photo} alt={t.patientDisplayName} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dbeafe]"><span className="material-icons text-slate-700">person</span></div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{t.patientDisplayName}</p>
                        <p className="text-xs text-slate-600">{(t.treatmentTag as { title?: string })?.title || "Patient"}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-8">
            <Link href="/testimonials" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-slate-700">
              Read more stories <span className="material-icons text-base">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Smile gallery */}
      <section className="home-reveal bg-white px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                <span className="font-semibold text-slate-900">Natural results</span> / Before & after
              </p>
              <h2 className="mt-3 text-[38px] font-bold uppercase leading-[0.94] tracking-[-0.02em] [word-spacing:0.14em] text-slate-900 sm:text-[50px] lg:text-[58px]">
                Smile gallery
              </h2>
            </div>
            <p className="max-w-[420px] text-sm leading-6 text-slate-700">See the amazing transformations achieved by Dr. Ekta and her team.</p>
          </div>

          {galleryItems.length === 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {GALLERY_ITEMS.slice(0, 2).map((item) => (
                <div key={item.id} className="overflow-hidden rounded-2xl bg-[#eff6ff] p-4">
                  <BeforeAfterSlider before={(item as unknown as { before: string }).before} after={(item as unknown as { after: string }).after} beforeLabel="Before" afterLabel="After" />
                  <div className="mt-4 flex items-center justify-between">
                    <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">Before & After</p><h3 className="mt-1 text-base font-semibold text-slate-900">{item.treatment}</h3></div>
                    <span className="material-icons text-slate-600">zoom_in</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {galleryItems.slice(0, 6).map((item) => {
                const beforeUrl = resolveMediaUrl(item.beforeImg);
                const afterUrl = resolveMediaUrl(item.afterImg);
                const treatment = (item.treatmentTag as { title?: string })?.title || "Smile Transformation";
                return (
                  <div key={item._id} className="overflow-hidden rounded-2xl bg-[#eff6ff] p-4">
                    {beforeUrl && afterUrl ? (
                      <BeforeAfterSlider before={beforeUrl} after={afterUrl} beforeLabel="Before" afterLabel="After" />
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="aspect-square overflow-hidden rounded-xl bg-white">{beforeUrl ? <img src={beforeUrl} alt="Before" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><span className="material-icons text-3xl text-slate-300">image</span></div>}</div>
                        <div className="aspect-square overflow-hidden rounded-xl bg-white">{afterUrl ? <img src={afterUrl} alt="After" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><span className="material-icons text-3xl text-slate-300">image</span></div>}</div>
                      </div>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">Before & After</p><h3 className="mt-1 text-base font-semibold text-slate-900">{treatment}</h3></div>
                      <span className="material-icons text-slate-600">zoom_in</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-8">
            <Link href="/gallery" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-slate-700">
              View full gallery <span className="material-icons text-base">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Knowledge */}
      <section className="home-reveal bg-[#eff6ff] px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                <span className="font-semibold text-slate-900">Knowledge centre</span> / Dental insights
              </p>
              <h2 className="mt-3 text-[38px] font-bold uppercase leading-[0.94] tracking-[-0.02em] [word-spacing:0.14em] text-slate-900 sm:text-[50px] lg:text-[58px]">
                Dental knowledge
              </h2>
            </div>
            <p className="max-w-[420px] text-sm leading-6 text-slate-700">Read our latest articles about dental health and care.</p>
          </div>

          {articles.length === 0 ? (
            <div className="mt-10"><EmptyState moduleName="Articles" /></div>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.slice(0, 3).map((article) => {
                const cover = resolveArticleImage(article);
                return (
                  <Link key={article._id} href={`/knowledge/${article.slug}`} className="group block">
                    <div className="aspect-video overflow-hidden rounded-2xl bg-white">
                      {cover ? <img src={cover} alt={article.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center"><span className="material-icons text-4xl text-slate-300">article</span></div>}
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-600"><span className="material-icons text-sm">calendar_today</span><span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ""}</span></div>
                    <h3 className="mt-1 text-base font-semibold text-slate-900 group-hover:text-slate-700">{article.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{article.seo?.metaDescription || ""}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Instagram */}
      <section className="home-reveal bg-white px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                <span className="font-semibold text-slate-900">Atelier sanctuary</span> / Social
              </p>
              <h2 className="mt-3 text-[38px] font-bold uppercase leading-[0.94] tracking-[-0.02em] [word-spacing:0.14em] text-slate-900 sm:text-[50px] lg:text-[58px]">
                Follow us on Instagram
              </h2>
            </div>
            <p className="max-w-[420px] text-sm leading-6 text-slate-700">Stay connected for dental tips, patient stories, and behind-the-scenes content.</p>
          </div>

          {instagramPosts.length === 0 ? (
            <div className="mt-10"><EmptyState moduleName="Instagram Posts" /></div>
          ) : (
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {instagramPosts.map((post) => {
                const imgUrl = resolveMediaUrl(post.image);
                const href = post.permalink;
                return (
                  <a key={post._id} href={href} target="_blank" rel="noopener noreferrer" className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
                    {imgUrl ? <img src={imgUrl} alt={post.caption || "Instagram post"} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center"><span className="material-icons text-3xl text-slate-300">photo_camera</span></div>}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
                      <span className="material-icons text-2xl text-white opacity-0 transition-opacity group-hover:opacity-100">open_in_new</span>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
          <div className="mt-8">
            <a href={SITE_CONFIG.social.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-slate-700">
              Follow @drektanarula <span className="material-icons text-base">open_in_new</span>
            </a>
          </div>
        </div>
      </section>

      {/* Clinic */}
      <section className="home-reveal bg-[#eff6ff] px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <p className="text-sm font-medium text-slate-600">
              <span className="font-semibold text-slate-900">Visit our clinic</span> / New Delhi
            </p>
            <h2 className="mt-3 text-[38px] font-bold uppercase leading-[0.94] tracking-[-0.02em] [word-spacing:0.14em] text-slate-900 sm:text-[50px] lg:text-[58px]">
              A calm space for care
            </h2>
            <p className="mt-5 max-w-[520px] text-sm leading-6 text-slate-700 sm:text-base sm:leading-7">A tranquil sanctuary in New Rajinder Nagar, New Delhi.</p>
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-4"><span className="material-icons text-slate-700">location_on</span><div><p className="text-sm font-semibold text-slate-900">Address</p><p className="text-xs leading-5 text-slate-600">{siteAddress}</p></div></div>
              <div className="flex items-start gap-4"><span className="material-icons text-slate-700">schedule</span><div><p className="text-sm font-semibold text-slate-900">Clinic timings</p><p className="text-xs leading-5 text-slate-600">Monday - Saturday: {clinicTiming}</p><p className="text-xs leading-5 text-slate-600">Sunday: {SITE_CONFIG.clinicTimings.sunday}</p></div></div>
              <div className="flex items-start gap-4"><span className="material-icons text-slate-700">call</span><div><p className="text-sm font-semibold text-slate-900">Contact</p><p className="text-xs leading-5 text-slate-600">{sitePhone}</p></div></div>
              <div className="flex items-start gap-4"><span className="material-icons text-slate-700">train</span><div><p className="text-sm font-semibold text-slate-900">How to reach</p><p className="text-xs leading-5 text-slate-600">Rajender Nagar Metro Station (Yellow Line) - 5 min walk</p></div></div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={SITE_CONFIG.googleMaps} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"><span className="material-icons text-base">map</span>Get directions</a>
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"><span className="material-icons text-base">contact_mail</span>Contact us</Link>
            </div>
          </div>
          <div className="aspect-square overflow-hidden rounded-2xl bg-slate-200">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.673!2d77.1867!3d28.6386!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sNew%20Rajinder%20Nagar%2C%20New%20Delhi!5e0!3m2!1sen!2sin!4v1" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Dr. Ekta Narula Dental Care Location" />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="home-reveal bg-slate-950 px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1100px] text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">Private reservation</p>
          <h2 className="mt-3 text-[40px] font-bold uppercase leading-[0.94] tracking-[-0.02em] [word-spacing:0.14em] text-white sm:text-[56px] lg:text-[68px]">
            Begin your smile journey
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-white/70 sm:text-base sm:leading-7">Schedule your appointment today and experience sanctuary-grade dental care by Dr. Ekta Narula in New Delhi.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <BookAppointment variant="secondary" size="lg" label="Book Appointment" className="bg-white! text-slate-900! hover:bg-slate-100!" />
            <WhatsAppButton className="bg-white/10! text-white! hover:bg-white/20!" />
          </div>
        </div>
      </section>

      <BookingChat />
    </div>
  );
}

function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  try {
    const decoded = decodeURIComponent(url);
    if (decoded !== url) {
      const m = decoded.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
      if (m) return m[1];
      if (/^[a-zA-Z0-9_-]{11}$/.test(decoded.trim())) return decoded.trim();
    }
  } catch {}
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.slice(1).split("?")[0];
      if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }
    const v = u.searchParams.get("v");
    if (v) {
      if (v.includes("http")) {
        const m2 = v.match(/[?&]v=([a-zA-Z0-9_-]{11})/) || v.match(/([a-zA-Z0-9_-]{11})/);
        if (m2) return m2[1] || m2[0];
      }
      if (/^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
      const m3 = v.match(/([a-zA-Z0-9_-]{11})/);
      if (m3) return m3[1];
      return null;
    }
    const parts = u.pathname.split("/");
    const last = parts.pop() || "";
    if (/^[a-zA-Z0-9_-]{11}$/.test(last)) return last;
    return null;
  } catch {
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
    const m = url.match(/([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  }
}

function getCleanYoutubeUrl(url: string): string {
  const id = extractYoutubeId(url);
  if (id) return `https://www.youtube.com/watch?v=${id}`;
  return url;
}
