import { Metadata } from "next";
import { Home } from "@/modules";

export const metadata: Metadata = {
  title: "Dr. Ekta Narula Dental Care",
  description:
    "Expert dental care by Dr. Ekta Narula with 15+ years of experience in New Delhi. Dental implants, root canal, cosmetic dentistry, and smile makeovers.",
};

export default function HomePage() {
  return <Home />;
}
