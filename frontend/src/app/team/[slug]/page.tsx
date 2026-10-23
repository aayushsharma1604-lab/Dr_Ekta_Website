import { Metadata } from "next";
import { TeamDetail } from "@/modules";
import { getTeamMemberBySlugSafe, getTeam } from "@/lib/api/services/team";

export async function generateStaticParams() {
  try {
    const res = await getTeam({ page: 1, limit: 50 });
    if (res.items?.length) {
      return res.items.map((m) => ({ slug: m.slug }));
    }
  } catch {}
  // No dummy fallback — live API only; if empty, no static pages (dynamic handles 404 via EmptyState)
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const api = await getTeamMemberBySlugSafe(slug);
    if (api) {
      return {
        title: `${api.name} — ${api.role}`,
        description: api.bio?.slice(0, 160) || `${api.name}, ${api.role} at Dr. Ekta Narula Dental Care.`,
      };
    }
  } catch {}
  return { title: "Team Member Not Found" };
}

export default async function TeamMemberPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Live-only: detail component will show EmptyState if not found
  return <TeamDetail slug={slug} />;
}
