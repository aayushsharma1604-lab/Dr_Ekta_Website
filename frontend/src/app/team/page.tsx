import { Metadata } from "next";
import { TeamList } from "@/modules";

export const metadata: Metadata = {
  title: "Our Team",
  description:
    "Meet the experienced dental specialists at Dr. Ekta Narula Dental Care — orthodontists, endodontists, oral surgeons, implantologists and more in New Delhi.",
};

export default function TeamPage() {
  return <TeamList />;
}
