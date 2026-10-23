import { Metadata } from "next";
import { SITE_CONFIG } from "@/shared/constants";
import { AboutDrEkta } from "@/modules";

export const metadata: Metadata = {
  title: "About Dr. Ekta Narula",
  description:
    "Dr. Ekta Narula is a Gold Medalist dentist with 15+ years of experience in cosmetic dentistry, implants, and smile makeovers in New Delhi.",
};

export default function AboutPage() {
  return <AboutDrEkta />;
}
