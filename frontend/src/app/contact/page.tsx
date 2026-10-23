import { Metadata } from "next";
import { SITE_CONFIG } from "@/shared/constants";
import { Contact } from "@/modules";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with ${SITE_CONFIG.name}. Visit us at ${SITE_CONFIG.address.area}, ${SITE_CONFIG.address.city} or call ${SITE_CONFIG.phone}.`,
};

export default function ContactPage() {
  return <Contact />;
}
