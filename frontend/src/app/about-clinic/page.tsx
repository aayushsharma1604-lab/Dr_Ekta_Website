import type { Metadata } from "next";
import { AboutClinic } from "@/modules";

export const metadata: Metadata = {
  title: "About Our Clinic | Dr. Ekta Narula Dental Care",
  description:
    "Take a look inside Dr. Ekta Narula Dental Care in New Rajinder Nagar, New Delhi — accessibility, patient amenities, seamless payments, and appointment-first planning for a zero-wait experience.",
};

export default function AboutClinicPage() {
  return <AboutClinic />;
}
