import { Metadata } from "next";
import { ArticleDetail } from "@/modules";
import { getArticleBySlugSafe, getArticles } from "@/lib/api/services/articles";

export async function generateStaticParams() {
  try {
    const res = await getArticles({ page: 1, limit: 50 });
    if (res.items?.length) {
      return res.items.map((article) => ({ slug: article.slug }));
    }
  } catch {}
  // Live-only: no dummy fallback
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const api = await getArticleBySlugSafe(slug);
    if (api) {
      return { title: api.title, description: api.seo?.metaDescription?.slice(0, 160) || api.title };
    }
  } catch {}
  return { title: "Article Not Found" };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Live-only: detail shows EmptyState if not found
  return <ArticleDetail slug={slug} />;
}
