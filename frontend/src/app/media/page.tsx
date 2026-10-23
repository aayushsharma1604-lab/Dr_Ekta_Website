import type { Metadata } from "next";
import { MediaPage } from "@/modules";
import { SITE_CONFIG } from "@/shared/constants";

export const metadata: Metadata = {
  title: "In the Media",
  description:
    "Press mentions for Dr. Ekta Narula: articles, podcasts, magazine features, TV interviews and awards covering cosmetic dentistry and oral health in New Delhi.",
  alternates: { canonical: `${SITE_CONFIG.url}/media` },
  openGraph: {
    title: "In the Media | Dr. Ekta Narula Dental Care",
    description:
      "Articles, podcasts, magazine features, TV interviews and awards featuring Dr. Ekta Narula and her clinic in New Delhi.",
    url: `${SITE_CONFIG.url}/media`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "In the Media | Dr. Ekta Narula Dental Care",
    description:
      "Articles, podcasts, magazine features, TV interviews and awards featuring Dr. Ekta Narula.",
  },
};

export default function MediaRoute() {
  return <MediaPage />;
}
