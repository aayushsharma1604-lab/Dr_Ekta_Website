import { Metadata } from "next";
import { SITE_CONFIG } from "@/shared/constants";
import { Disclaimer } from "@/modules";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: `Disclaimer for ${SITE_CONFIG.name}. Important information about the content and services on our website.`,
};

export default function DisclaimerPage() {
  return <Disclaimer />;
}
