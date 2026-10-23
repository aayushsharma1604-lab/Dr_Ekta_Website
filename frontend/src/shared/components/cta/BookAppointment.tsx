"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SITE_CONFIG as FB } from "@/shared/constants";
import { getBookingCTA, logPractoClick } from "@/lib/api/services/booking";

interface BookAppointmentProps {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  showIcon?: boolean;
  label?: string;
}

export default function BookAppointment({
  variant = "primary",
  size = "md",
  className = "",
  showIcon = true,
  label = "Book Appointment",
}: BookAppointmentProps) {
  const [providerUrl, setProviderUrl] = useState<string>("");

  useEffect(() => {
    getBookingCTA()
      .then((cta) => {
        if (cta.bookingUrl) setProviderUrl(cta.bookingUrl);
        else if (cta.profileUrl) setProviderUrl(cta.profileUrl);
      })
      .catch(() => {});
  }, []);

  // CMS provider (admin → Booking Provider) wins, then the config slot.
  const bookingUrl = providerUrl || FB.Practo || "/#book-appointment";

  const isInternal = bookingUrl.startsWith("/") || bookingUrl.startsWith("#");

  const handleClick = () => {
    // Only external provider clicks count as a practo-click; internal jumps
    // land on the enquiry form, which creates its own lead.
    if (!isInternal) logPractoClick().catch(() => {});
  };

  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all";

  const variants = {
    primary: "bg-sky-600 text-white hover:bg-sky-700",
    secondary: "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100",
    outline: "border-2 border-sky-600 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <a
      href={bookingUrl}
      {...(isInternal ? {} : { target: "_blank", rel: "noopener noreferrer" })}
      onClick={handleClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {showIcon && <span className="material-icons text-base">calendar_month</span>}
      {label}
      {showIcon && <span className="material-icons text-base">arrow_forward</span>}
    </a>
  );
}

export function BookAppointmentLink({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/#book-appointment"
      className={`inline-flex items-center gap-2 rounded-full bg-sky-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-sky-700 ${className}`}
    >
      <span className="material-icons text-base">calendar_month</span>
      Request an Appointment
      <span className="material-icons text-base">arrow_forward</span>
    </Link>
  );
}
