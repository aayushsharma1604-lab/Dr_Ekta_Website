"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NAVIGATION, SITE_CONFIG as FB, TREATMENTS } from "@/shared/constants";
import { getClinicInfo } from "@/lib/api/services/clinic";
import type { ClinicInfo } from "@/lib/api/types";
import { getTreatments } from "@/lib/api/services/treatments";

/* Brand marks — inline SVG so no icon font dependency for these four. */
const SOCIAL_ICONS = [
  {
    key: "instagram",
    label: "Instagram",
    path: "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm7.846-10.405a1.441 1.441 0 01-2.88 0 1.44 1.44 0 012.88 0z",
  },
  {
    key: "youtube",
    label: "YouTube",
    path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
  {
    key: "facebook",
    label: "Facebook",
    path: "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.859-.036 3.18 3.18 0 0 0-1.64.451 3.28 3.28 0 0 0-.881 1.06c-.234.333-.374.751-.374 1.487v1.393h3.318l-.354 3.667H9.101v7.98H9.101z",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z",
  },
] as const;

export default function Footer() {
  const [clinic, setClinic] = useState<ClinicInfo | null>(null);
  const [footerTreatments, setFooterTreatments] = useState(TREATMENTS.slice(0, 6));

  useEffect(() => {
    getClinicInfo().then(setClinic).catch(() => {});
    getTreatments({ page: 1, limit: 6 })
      .then((res) => {
        if (res.items?.length) {
          setFooterTreatments(
            res.items.slice(0, 6).map((t) => ({
              id: t.slug,
              title: t.title,
              description: "",
              icon: "medical_services",
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const phone = clinic?.phones?.[0] || FB.phone;
  const address = clinic?.address?.street
    ? `${clinic.address.street}, ${clinic.address.city} - ${clinic.address.pincode}`
    : `${FB.address.street}, ${FB.address.area}, ${FB.address.city} - ${FB.address.pincode}`;
  const timing = clinic?.timings?.[0]?.open ? `${clinic.timings[0].open} - ${clinic.timings[0].close}` : FB.clinicTimings.morning;
  const socials = clinic?.socialLinks?.length ? clinic.socialLinks : [{ platform: "instagram", url: FB.social.instagram }, { platform: "youtube", url: FB.social.youtube }];

  /* CMS socialLinks win; the config is the fallback; empty means "not set yet". */
  const socialUrl = (key: string) => socials.find((s) => s.platform === key)?.url || FB.social[key as keyof typeof FB.social] || "";

  return (
    <footer className="bg-zinc-900 text-zinc-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Dr. Ekta Narula logo" className="h-9 w-9 shrink-0 object-contain" />
              <span className="text-lg font-bold text-white">Dr. Ekta Narula</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400">Providing modern, pain-free dental care with a focus on your comfort and well-being. 15+ years of trusted dental excellence in New Delhi.</p>
            <div className="mt-4 flex gap-3">
              {SOCIAL_ICONS.map((social) => {
                const url = socialUrl(social.key);
                return (
                  <a
                    key={social.key}
                    href={url || "#"}
                    aria-label={social.label}
                    title={url ? `${social.label} — ${url}` : `${social.label} — link to be added`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition-colors hover:bg-sky-600 hover:text-white"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                      <path d={social.path} />
                    </svg>
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Treatments</h3>
            <ul className="mt-4 space-y-2">
              {footerTreatments.map((treatment) => (
                <li key={treatment.id}><Link href={`/treatments/${treatment.id}`} className="text-sm text-zinc-400 transition-colors hover:text-sky-400">{treatment.title}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              {NAVIGATION.map((item) => (
                <li key={item.href}><Link href={item.href} className="text-sm text-zinc-400 transition-colors hover:text-sky-400">{item.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Contact Us</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2"><span className="material-icons mt-0.5 text-sm text-sky-500">location_on</span><span className="text-sm text-zinc-400">{address}</span></li>
              <li className="flex items-center gap-2"><span className="material-icons text-sm text-sky-500">call</span><a href={`tel:${phone}`} className="text-sm text-zinc-400 hover:text-sky-400">{phone}</a></li>
              <li className="flex items-center gap-2"><span className="material-icons text-sm text-sky-500">chat</span><a href={`https://wa.me/${FB.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-400 hover:text-sky-400">WhatsApp Us</a></li>
              <li className="flex items-center gap-2"><span className="material-icons text-sm text-sky-500">schedule</span><span className="text-sm text-zinc-400">{timing}</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-800 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-zinc-500">&copy; {new Date().getFullYear()} Dr. Ekta Narula Dental Care. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/privacy-policy" className="text-xs text-zinc-500 hover:text-zinc-300">Privacy Policy</Link>
              <Link href="/terms" className="text-xs text-zinc-500 hover:text-zinc-300">Terms of Use</Link>
              <Link href="/disclaimer" className="text-xs text-zinc-500 hover:text-zinc-300">Disclaimer</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
