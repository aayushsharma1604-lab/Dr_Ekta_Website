"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SITE_CONFIG as FB } from "@/shared/constants";
import { getClinicInfo } from "@/lib/api/services/clinic";
import type { ClinicInfo } from "@/lib/api/types";
import BookAppointment from "@/shared/components/cta/BookAppointment";
import WhatsAppButton from "@/shared/components/cta/WhatsAppButton";
import EnquiryForm from "@/shared/components/EnquiryForm";
import { PAGE_VIDEO } from "@/shared/media/pageVideos";
import { CTASection, PageHero, SectionHeading } from "@/shared/components/layout";

export function Contact() {
  const [clinic, setClinic] = useState<ClinicInfo | null>(null);

  useEffect(() => {
    getClinicInfo().then(setClinic).catch(() => {});
  }, []);

  const addressStreet = clinic?.address?.street || FB.address.street;
  const addressArea = FB.address.area;
  const city = clinic?.address?.city || FB.address.city;
  const pincode = clinic?.address?.pincode || FB.address.pincode;
  const phone = clinic?.phones?.[0] || FB.phone;
  const email = clinic?.email || FB.email;
  const timingWeek = clinic?.timings?.length ? clinic.timings.filter((t) => !t.isClosed).map((t) => `${t.day}: ${t.open}-${t.close}`).slice(0, 1).join(" ") : FB.clinicTimings.morning;
  const mapsUrl = FB.googleMaps;

  return (
    <div className="flex flex-col bg-[#dbeafe]">
      <PageHero
        eyebrow="Contact"
        title={
          <>
            We&apos;d love to <span className="text-slate-500">hear from you</span>
          </>
        }
        description="Have a question or want to book an appointment? Reach out and our team will get back to you as soon as possible."
        image="/dental/clinic-room.jpg"
        imageAlt="Dr. Ekta Narula dental clinic treatment room"
        backgroundImage={PAGE_VIDEO.contact.poster}
        backgroundVideo={PAGE_VIDEO.contact.src}
      >
        <BookAppointment variant="secondary" size="lg" label="Book Appointment" />
        <a href={`tel:${phone}`} className="btn-sanctuary-ghost">Call the Clinic</a>
      </PageHero>

      <section className="bg-white px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Clinic information / New Rajinder Nagar"
              title="Visit us in New Delhi"
              description="We are easily accessible by metro and road, with parking available nearby."
            />

            <div className="mt-10 space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eff6ff]">
                  <span className="material-icons text-xl text-slate-700">location_on</span>
                </div>
                <div>
                  <h3 className="heading-sm">Address</h3>
                  <p className="body-sm mt-1">{addressStreet}<br />{addressArea}<br />{city} - {pincode}</p>
                  <p className="body-sm mt-1 text-slate-500">Landmark: Near Rajender Nagar Part 1</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eff6ff]">
                  <span className="material-icons text-xl text-slate-700">call</span>
                </div>
                <div>
                  <h3 className="heading-sm">Phone</h3>
                  <a href={`tel:${phone}`} className="body-sm mt-1 inline-block text-slate-700 hover:text-slate-900">{phone}</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eff6ff]">
                  <span className="material-icons text-xl text-slate-700">chat</span>
                </div>
                <div>
                  <h3 className="heading-sm">WhatsApp</h3>
                  <a href={`https://wa.me/${FB.whatsapp}`} target="_blank" rel="noopener noreferrer" className="body-sm mt-1 inline-block text-slate-700 hover:text-slate-900">Chat with us on WhatsApp</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eff6ff]">
                  <span className="material-icons text-xl text-slate-700">email</span>
                </div>
                <div>
                  <h3 className="heading-sm">Email</h3>
                  <a href={`mailto:${email}`} className="body-sm mt-1 inline-block text-slate-700 hover:text-slate-900">{email}</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eff6ff]">
                  <span className="material-icons text-xl text-slate-700">schedule</span>
                </div>
                <div>
                  <h3 className="heading-sm">Clinic Timings</h3>
                  <div className="body-sm mt-1 space-y-1">
                    <p><span className="font-medium text-slate-800">Monday – Saturday:</span> {timingWeek}</p>
                    <p><span className="font-medium text-slate-800">Sunday:</span> {FB.clinicTimings.sunday}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <BookAppointment variant="secondary" size="lg" label="Book Appointment" />
              <WhatsAppButton />
            </div>
          </div>

          <div className="lg:col-span-7">
            <div id="enquiry" className="rounded-2xl bg-[#eff6ff] p-5 sm:p-8">
              <h2 className="heading-lg">Send an enquiry</h2>
              <p className="body-md mt-3">Tell us what you need and our team will get back to you.</p>
              <div className="mt-8">
                <EnquiryForm />
              </div>
            </div>

            <div className="mt-6 aspect-[4/3] overflow-hidden rounded-2xl bg-slate-200">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.673!2d77.1867!3d28.6386!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sNew%20Rajinder%20Nagar%2C%20New%20Delhi!5e0!3m2!1sen!2sin!4v1" width="100%" height="100%" style={{ border: 0, minHeight: "320px" }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Dr. Ekta Narula Dental Care Location" />
            </div>

            <div className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-slate-200/80">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eff6ff]">
                  <span className="material-icons text-xl text-slate-700">directions</span>
                </div>
                <div>
                  <h3 className="heading-sm">How to reach us</h3>
                  <div className="body-sm mt-3 space-y-2">
                    <div className="flex items-start gap-2"><span className="material-icons mt-0.5 text-sm text-slate-500">train</span><p><span className="font-medium text-slate-800">Metro:</span> Rajender Nagar Metro Station (Yellow Line) — 5 min walk</p></div>
                    <div className="flex items-start gap-2"><span className="material-icons mt-0.5 text-sm text-slate-500">directions_car</span><p><span className="font-medium text-slate-800">Parking:</span> Available nearby at Rajender Nagar market</p></div>
                    <div className="flex items-start gap-2"><span className="material-icons mt-0.5 text-sm text-slate-500">directions_bus</span><p><span className="font-medium text-slate-800">Bus:</span> Multiple DTC bus routes pass through Rajender Nagar</p></div>
                  </div>
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-900 hover:text-slate-600">
                    <span className="material-icons text-base">open_in_new</span>Get directions
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#eff6ff] px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1400px]">
          <SectionHeading
            align="center"
            eyebrow="Quick contact / Choose your channel"
            title="The easiest way to reach us"
            description="Call, message, email, or book online. We will guide you from there."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a href={`tel:${phone}`} className="card-hover group text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#eff6ff] transition-colors group-hover:bg-slate-900">
                <span className="material-icons text-2xl text-slate-700 transition-colors group-hover:text-white">call</span>
              </div>
              <h3 className="heading-sm">Call Us</h3>
              <p className="body-sm mt-2">{phone}</p>
            </a>
            <a href={`https://wa.me/${FB.whatsapp}?text=Hi%2C%20I%20would%20like%20to%20book%20an%20appointment.`} target="_blank" rel="noopener noreferrer" className="card-hover group text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#eff6ff] transition-colors group-hover:bg-slate-900">
                <span className="material-icons text-2xl text-slate-700 transition-colors group-hover:text-white">chat</span>
              </div>
              <h3 className="heading-sm">WhatsApp</h3>
              <p className="body-sm mt-2">Chat with us</p>
            </a>
            <a href={`mailto:${email}`} className="card-hover group text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#eff6ff] transition-colors group-hover:bg-slate-900">
                <span className="material-icons text-2xl text-slate-700 transition-colors group-hover:text-white">email</span>
              </div>
              <h3 className="heading-sm">Email</h3>
              <p className="body-sm mt-2">{email}</p>
            </a>
            <Link href="#enquiry" className="card-hover group text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#eff6ff] transition-colors group-hover:bg-slate-900">
                <span className="material-icons text-2xl text-slate-700 transition-colors group-hover:text-white">calendar_month</span>
              </div>
              <h3 className="heading-sm">Enquiry Form</h3>
              <p className="body-sm mt-2">Send us a message</p>
            </Link>
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to visit us?"
        description="Schedule your appointment today and experience expert dental care at our clinic in New Delhi."
      />
    </div>
  );
}
