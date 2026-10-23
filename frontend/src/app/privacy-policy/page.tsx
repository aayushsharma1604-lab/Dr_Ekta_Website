import { Metadata } from "next";
import { SITE_CONFIG } from "@/shared/constants";
import { PrivacyPolicy } from "@/modules";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy policy for ${SITE_CONFIG.name}. Learn how we collect, use, and protect your personal information.`,
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicy />;
}
