import { SITE_CONFIG } from "@/shared/constants";
import { PAGE_VIDEO } from "@/shared/media/pageVideos";
import { PageHero } from "@/shared/components/layout";

const FACILITIES = [
  {
    icon: "accessible",
    image: "/dental/service-checkup.jpg",
    imageAlt: "Wheelchair-accessible dental operatory",
    title: "Accessibility",
    points: [
      "Wheelchair-accessible entrance",
      "Wheelchair-accessible seating",
    ],
  },
  {
    icon: "wc",
    image: "/dental/clinic-room.jpg",
    imageAlt: "Clean and comfortable clinic interior",
    title: "Patient Amenities",
    points: ["Clean, easily accessible restrooms", "Unisex restrooms available"],
  },
  {
    icon: "diversity_3",
    image: "/clinic-team.jpg",
    imageAlt: "The welcoming clinic team",
    title: "Inclusivity",
    points: [
      "A welcoming, LGBTQ+ friendly environment",
      "Care that respects every patient, every background",
    ],
  },
  {
    icon: "medical_services",
    image: "/dental/service-veneers.jpg",
    imageAlt: "Comprehensive on-site dental care",
    title: "Clinic Services & Planning",
    points: [
      "Comprehensive on-site dental services",
      "Advanced cosmetic dentistry offered",
      "Prior appointments required to ensure zero wait time",
    ],
  },
  {
    icon: "payments",
    image: "/dental/service-cleaning.jpg",
    imageAlt: "Simple, modern payment options",
    title: "Seamless Payments",
    points: [
      "Debit cards accepted",
      "Mobile payments and UPI (Google Pay, Tez) accepted",
    ],
  },
  {
    icon: "forum",
    image: "/doctor-desk.jpg",
    imageAlt: "Quick support over WhatsApp",
    title: "Easy Contact",
    points: [
      "WhatsApp messaging enabled for quick support and appointment booking",
    ],
  },
] as const;

const HIGHLIGHTS = [
  {
    icon: "schedule",
    title: "By appointment only",
    text: `Morning ${SITE_CONFIG.clinicTimings.morning} · Evening ${SITE_CONFIG.clinicTimings.evening}`,
  },
  {
    icon: "location_on",
    title: "Easy to reach",
    text: `${SITE_CONFIG.address.street}, ${SITE_CONFIG.address.area}, ${SITE_CONFIG.address.city}`,
  },
  {
    icon: "verified",
    title: "25th year of care",
    text: "Gold Medalist dentist, MAMC New Delhi — cosmetic & prosthetic dentistry",
  },
];

export function AboutClinic() {
  const whatsapp = SITE_CONFIG.whatsapp;

  return (
    <div className="flex flex-col bg-[#dbeafe]">
      {/* Full-bleed video hero */}
      <PageHero
        eyebrow="About the Clinic"
        title={
          <>
            Step Inside
            <br />
            <span className="text-slate-500">Dr. Ekta Narula Dental Care</span>
          </>
        }
        description="A modern, single-doctor practice in New Rajinder Nagar designed around one idea — your comfort. From barrier-free access to zero-wait appointments, every detail of the clinic is planned for a calm, unhurried dental experience."
        backgroundImage={PAGE_VIDEO.aboutClinic.poster}
        backgroundVideo={PAGE_VIDEO.aboutClinic.src}
        breadcrumb={[{ label: "About Clinic" }]}
      >
        <a
          href={`https://wa.me/${whatsapp}?text=Hi%2C%20I%20would%20like%20to%20book%20an%20appointment.`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-sanctuary bg-sky-600 hover:bg-sky-500"
        >
          <span className="material-icons text-base">chat</span>
          Book on WhatsApp
        </a>
        <a href={`tel:${SITE_CONFIG.phone}`} className="btn-sanctuary-ghost">
          <span className="material-icons text-base">call</span>
          {SITE_CONFIG.phone}
        </a>
      </PageHero>

      {/* Welcome / overview */}
      <section className="section-padding bg-white">
        <div className="container-custom grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <p className="eyebrow">Welcome to our clinic</p>
            <h2 className="heading-lg mt-3">
              A clinic built around
              <span className="text-slate-500"> your comfort</span>
            </h2>
            <p className="body-lg mt-5 max-w-2xl">
              {SITE_CONFIG.name} is a boutique dental practice led by{" "}
              <span className="font-semibold text-slate-900">
                Dr. Ekta Narula, BDS (Gold Medalist)
              </span>
              , now in her 25th year of experience in cosmetic and prosthetic
              dentistry. We keep our schedule deliberately light — treatment
              rooms are prepared for you alone, instruments are sterilised in
              view, and Dr. Ekta personally oversees every step of your care.
            </p>
            <p className="body-md mt-4 max-w-2xl">
              Whether you are here for a routine cleaning, a single implant, or
              a complete smile makeover, you can expect the same standard:
              honest diagnosis, transparent pricing, and world-class
              craftsmanship delivered gently.
            </p>
          </div>
          <div className="lg:col-span-5" data-reveal>
            <div className="media-card aspect-[4/3] rounded-2xl bg-[#eff6ff]">
              <img
                src="/dental/clinic-room.jpg"
                alt="Interior of the treatment room at Dr. Ekta Narula Dental Care"
                className="media-drift h-full w-full object-cover"
              />
              <span className="media-badge">
                <span className="material-icons text-sm">photo_camera</span>
                Our treatment suite
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities & amenities */}
      <section className="section-padding bg-[#f8fbff]">
        <div className="container-custom">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">Clinic facilities / Amenities</p>
              <h2 className="heading-lg mt-3">
                Clinic facilities
                <span className="text-slate-500"> &amp; amenities</span>
              </h2>
            </div>
            <p className="body-md max-w-sm">
              Ensuring a comfortable, accessible, and inclusive experience for
              all our patients.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {FACILITIES.map((facility) => {
              const isContactCard = facility.title === "Easy Contact";
              return (
                <article
                  key={facility.title}
                  className="card-hover flex flex-col overflow-hidden !p-0"
                >
                  <div className="media-card aspect-[16/9] bg-[#eff6ff]">
                    <img
                      src={facility.image}
                      alt={facility.imageAlt}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute left-4 bottom-4 z-[2] inline-flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
                      <span className="material-icons text-xl text-slate-900">
                        {facility.icon}
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="heading-sm">{facility.title}</h3>
                    <ul className="mt-4 space-y-3">
                      {facility.points.map((point) => (
                        <li key={point} className="flex items-start gap-2.5">
                          <span
                            className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                              isContactCard ? "bg-sky-600" : "bg-slate-300"
                            }`}
                          >
                            <span className="material-icons text-[13px] text-white">
                              check
                            </span>
                          </span>
                          <span className="body-sm text-slate-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                    {isContactCard && (
                      <a
                        href={`https://wa.me/${whatsapp}?text=Hi%2C%20I%20have%20a%20question%20about%20the%20clinic.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="body-sm mt-4 inline-flex items-center gap-1.5 font-semibold text-sky-700 hover:text-sky-600"
                      >
                        Chat with us now
                        <span className="material-icons text-sm">open_in_new</span>
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick facts strip */}
      <section className="bg-white py-14 sm:py-16">
        <div className="container-custom grid gap-6 md:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <div key={item.title} className="flex items-start gap-4">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eff6ff]">
                <span className="material-icons text-xl text-slate-900">
                  {item.icon}
                </span>
              </span>
              <div>
                <h3 className="heading-sm">{item.title}</h3>
                <p className="body-sm mt-1">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-slate-900">
        <div className="container-custom flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
              Plan your visit
            </p>
            <h2 className="heading-lg mt-3 text-white!">
              Come see the clinic
              <span className="text-slate-400"> for yourself</span>
            </h2>
            <p className="body-md mt-4 text-slate-300">
              Appointments are required so your chair is always ready when you
              arrive — no waiting rooms full of patients, no rushed visits.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`https://wa.me/${whatsapp}?text=Hi%2C%20I%20would%20like%20to%20book%20an%20appointment.`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-sanctuary bg-white text-slate-900 hover:bg-slate-100"
            >
              <span className="material-icons text-base">chat</span>
              Book on WhatsApp
            </a>
            <a
              href={`tel:${SITE_CONFIG.phone}`}
              className="btn-sanctuary-ghost bg-transparent text-white ring-white/40 hover:bg-white/10"
            >
              <span className="material-icons text-base">call</span>
              Call the clinic
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
