import { Metadata } from "next";
import { Treatments } from "@/modules";

export const metadata: Metadata = {
  title: "Treatments",
  description:
    "Comprehensive dental treatments by Dr. Ekta Narula in New Delhi - dental implants, root canal, cosmetic dentistry, smile makeovers, and more.",
};

export default function TreatmentsPage() {
  return <Treatments />;
}
