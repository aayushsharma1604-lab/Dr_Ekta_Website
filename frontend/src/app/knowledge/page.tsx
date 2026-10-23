import { Metadata } from "next";
import { KnowledgeCentre } from "@/modules";

export const metadata: Metadata = {
  title: "Dental Knowledge Centre",
  description:
    "Evidence-based dental articles by Dr. Ekta Narula covering dental care, oral health, implants, cosmetic dentistry, children's dental health, and more.",
};

export default function KnowledgePage() {
  return <KnowledgeCentre />;
}
