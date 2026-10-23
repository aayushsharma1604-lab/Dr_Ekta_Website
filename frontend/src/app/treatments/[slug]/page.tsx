import { Metadata } from "next";
import { TreatmentDetail } from "@/modules";
import { getTreatmentBySlugSafe, getTreatments } from "@/lib/api/services/treatments";

export async function generateStaticParams() {
  try {
    const res = await getTreatments({ page: 1, limit: 50 });
    if (res.items?.length) {
      return res.items.map((treatment) => ({ slug: treatment.slug }));
    }
  } catch {}
  // No dummy fallback — live API only; if empty, no static pages (dynamic handles 404 via EmptyState)
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const api = await getTreatmentBySlugSafe(slug);
    if (api) {
      return {
        title: api.title,
        description: api.sections?.what?.slice(0, 160) || api.title,
      };
    }
  } catch {}
  return { title: "Treatment Not Found" };
}

export default async function TreatmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Live-only: detail component will show EmptyState if not found (No Treatments data found)
  return <TreatmentDetail slug={slug} />;
}
