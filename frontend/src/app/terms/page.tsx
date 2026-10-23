import { Metadata } from "next";
import { SITE_CONFIG } from "@/shared/constants";
import { TermsOfUse } from "@/modules";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `Terms of use for ${SITE_CONFIG.name}. Please read these terms carefully before using our website and services.`,
};

export default function TermsPage() {
  return <TermsOfUse />;
}
