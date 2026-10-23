import { publicApi, adminApi, serverFetch, ApiClientError } from "../client";
import type { Article, ArticleListItem, PagedResponse, ArticleListParams } from "../types";

/**
 * Public
 *  GET /api/public/articles?page&limit&category&tags&search  (body omitted)
 *  GET /api/public/articles/:slug  (full body; BUG: 500 on unknown slug)
 * Admin
 *  GET /api/admin/articles?page&limit&status&category&search
 *  GET|PUT|DELETE /api/admin/articles/:id
 *  POST /api/admin/articles
 *  POST /api/admin/articles/:id/submit|approve|reject|publish
 */

export function getArticles(params?: ArticleListParams): Promise<PagedResponse<ArticleListItem>> {
  return publicApi.get<PagedResponse<ArticleListItem>>("/articles", {
    params: params as unknown as Record<string, string | number | boolean | undefined | string[]>,
  });
}

export function getArticleBySlug(slug: string): Promise<Article> {
  return publicApi.get<Article>(`/articles/${encodeURIComponent(slug)}`);
}

export function getArticlesServer(params?: ArticleListParams): Promise<PagedResponse<ArticleListItem>> {
  return serverFetch<PagedResponse<ArticleListItem>>(`/public/articles`, {
    params: params as unknown as Record<string, string | number | boolean | undefined | string[]>,
    revalidate: 300,
    tags: ["articles"],
  });
}

export function getArticleBySlugServer(slug: string): Promise<Article> {
  return serverFetch<Article>(`/public/articles/${encodeURIComponent(slug)}`, {
    revalidate: 300,
    tags: ["articles", `article:${slug}`],
  });
}

// 500-as-404 handling for unknown slug bug
export async function getArticleBySlugSafe(slug: string): Promise<Article | null> {
  try {
    return await getArticleBySlug(slug);
  } catch (e) {
    if (e instanceof ApiClientError && (e.status === 404 || e.status === 500)) return null;
    throw e;
  }
}

// ─── Admin ─────────────────────────────────────────────────────────

export function getAdminArticles(params?: ArticleListParams & { status?: string }): Promise<PagedResponse<Article>> {
  return adminApi.get<PagedResponse<Article>>("/articles", {
    params: params as unknown as Record<string, string | number | boolean | undefined | string[]>,
  });
}

export function getAdminArticleById(id: string): Promise<Article> {
  return adminApi.get<Article>(`/articles/${id}`);
}

export function createArticle(data: Partial<Article> & { title: string; category: string; body: string; author: string }): Promise<Article> {
  return adminApi.post<Article>("/articles", data);
}

export function updateArticle(id: string, data: Partial<Article>): Promise<Article> {
  return adminApi.put<Article>(`/articles/${id}`, data);
}

export function deleteArticle(id: string): Promise<{ message: string }> {
  return adminApi.delete<{ message: string }>(`/articles/${id}`);
}

export function submitArticle(id: string): Promise<{ message: string }> {
  return adminApi.post<{ message: string }>(`/articles/${id}/submit`, {});
}

export function approveArticle(id: string, reviewNote?: string): Promise<{ message: string }> {
  return adminApi.post<{ message: string }>(`/articles/${id}/approve`, reviewNote ? { reviewNote } : {});
}

export function rejectArticle(id: string, reviewNote: string): Promise<{ message: string }> {
  return adminApi.post<{ message: string }>(`/articles/${id}/reject`, { reviewNote });
}

export function publishArticle(id: string): Promise<{ message: string }> {
  return adminApi.post<{ message: string }>(`/articles/${id}/publish`, {});
}
