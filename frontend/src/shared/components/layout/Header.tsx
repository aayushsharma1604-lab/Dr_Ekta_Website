"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAVIGATION, SITE_CONFIG as FB } from "@/shared/constants";
import { getClinicInfo } from "@/lib/api/services/clinic";
import type { ClinicInfo } from "@/lib/api/types";
import { hasVideoHero } from "@/shared/media/pageVideos";
import BookAppointment from "../cta/BookAppointment";

export default function Header() {
  const pathname = usePathname();
  const isOverlay = pathname === "/" || hasVideoHero(pathname);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clinic, setClinic] = useState<ClinicInfo | null>(null);

  useEffect(() => {
    getClinicInfo()
      .then(setClinic)
      .catch(() => {});
  }, []);

  const phone = clinic?.phones?.[0] || FB.phone;
  const whatsapp = FB.whatsapp; // keep fallback, or derive from phones

  return (
    <header className={isOverlay ? "absolute inset-x-0 top-0 z-50 bg-gradient-to-b from-slate-950/80 via-slate-950/50 to-transparent" : "sticky top-0 z-50 border-b border-zinc-100 bg-white/95 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95"}>
      <div className={isOverlay ? "mx-auto max-w-[1600px] px-5 pt-5 sm:px-8 lg:px-12" : "mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8"}>
        <div className={isOverlay ? "flex h-[64px] items-center justify-between gap-2" : "flex h-[72px] items-center justify-between gap-2"}>
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <img src="/logo.png" alt="Dr. Ekta Narula logo" className={`h-7 w-7 shrink-0 object-contain sm:h-11 sm:w-11 lg:h-12 lg:w-12 ${isOverlay ? "brightness-0 invert" : ""}`} />
            <span className="flex min-w-0 flex-col">
              <span className={`truncate text-[15px] font-bold leading-tight sm:text-lg lg:text-lg 2xl:text-xl ${isOverlay ? "text-white" : "text-zinc-900 dark:text-white"}`}>Dr. Ekta Narula</span>
              <span className={`hidden truncate text-[10px] font-medium uppercase leading-tight tracking-[0.14em] 2xl:block 2xl:text-[11px] 2xl:tracking-[0.18em] ${isOverlay ? "text-white/70" : "text-slate-500 dark:text-slate-400"}`}>Dental Care Clinic</span>
            </span>
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 overflow-hidden xl:flex 2xl:gap-1" aria-label="Primary">
            {NAVIGATION.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative shrink-0 whitespace-nowrap rounded-full px-2 py-2 text-[12px] tracking-wide transition-all 2xl:px-2.5 2xl:text-[13px] 3xl:px-3 3xl:text-sm ${
                  isOverlay
                    ? "font-bold text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.75)] hover:text-white"
                    : "font-semibold text-zinc-600 hover:bg-sky-50 hover:text-sky-700 dark:text-zinc-300 dark:hover:bg-sky-900/30 dark:hover:text-sky-300"
                }`}
              >
                <span className="relative inline-block">
                  {item.label}
                  <span className={`absolute inset-x-0 -bottom-1 h-[2px] origin-left scale-x-0 rounded-full transition-transform duration-200 group-hover:scale-x-100 ${isOverlay ? "bg-white" : "bg-sky-600"}`} />
                </span>
              </Link>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-2 md:flex">
            {isOverlay ? (
              <BookAppointment
                variant="secondary"
                size="sm"
                showIcon={false}
                label="Book an Appointment"
                className="whitespace-nowrap rounded-full! bg-white! px-4! py-2.5! text-[11px]! font-semibold! uppercase! tracking-[0.14em]! text-slate-900! hover:bg-slate-100!"
              />
            ) : (
              <>
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-primary/90 2xl:px-3.5 2xl:text-[13px]">
                  <span className="material-icons text-base">chat</span>WhatsApp
                </a>
                <a href={`tel:${phone}`} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-primary px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-secondary/40 2xl:px-3.5 2xl:text-[13px]">
                  <span className="material-icons text-base">call</span>Call
                </a>
              </>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2 md:hidden">
            <BookAppointment
              variant="secondary"
              size="sm"
              showIcon={false}
              label="Book an Appointment"
              className={`whitespace-nowrap rounded-full! px-3! py-2.5! text-[10px]! font-semibold! uppercase! tracking-[0.06em]! ${
                isOverlay ? "bg-white! text-slate-900! hover:bg-slate-100!" : "bg-primary! text-white! hover:bg-primary/90!"
              }`}
            />
          </div>

          <button className={`shrink-0 xl:hidden ${isOverlay ? "text-white" : ""}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            <span className="material-icons">{mobileMenuOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className={isOverlay ? "border-t border-white/10 bg-slate-950 xl:hidden" : "border-t border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900 xl:hidden"}>
          <nav className="space-y-1.5 px-4 pb-5 pt-3" aria-label="Mobile">
            {NAVIGATION.map((item) => (
              <Link key={item.href} href={item.href} className={`flex items-center justify-between rounded-xl px-4 py-3 text-[15px] font-medium transition-colors ${isOverlay ? "font-semibold text-white hover:bg-white/10 hover:text-white" : "text-zinc-700 hover:bg-sky-50 hover:text-sky-700 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-sky-300"}`} onClick={() => setMobileMenuOpen(false)}>
                {item.label}
                <span className={`material-icons text-base ${isOverlay ? "text-white/30" : "text-zinc-300"}`}>chevron_right</span>
              </Link>
            ))}
          </nav>
          <div className="px-4 pb-5">
            <div className="flex flex-col gap-2">
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-white">
                <span className="material-icons text-base">chat</span>WhatsApp Us
              </a>
              <a href={`tel:${phone}`} className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium ${isOverlay ? "border-white/30 text-white" : "border-primary text-primary"}`}>
                <span className="material-icons text-base">call</span>Call Us
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
