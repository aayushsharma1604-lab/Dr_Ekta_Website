import { get, post, put, del } from './api';

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PagedResponse<T> {
  items: T[];
  pagination: Pagination;
}

// ---------------------------------------------------------------------------
// Article — per openapi.yaml
// ---------------------------------------------------------------------------
export type ArticleCategory =
  | 'preventive-care'
  | 'restorative'
  | 'cosmetic'
  | 'orthodontics'
  | 'oral-surgery'
  | 'pediatric'
  | 'emergency'
  | 'technology'
  | 'patient-education'
  | string;

export interface Article {
  _id: string;
  title: string;
  slug: string;
  category: ArticleCategory;
  tags?: string[];
  body: string;
  author: string;
  reviewer?: string | Record<string, unknown> | null;
  credentialsDisplay?: string;
  sources?: Array<{ title?: string; url?: string; authors?: string; publishedDate?: string; [k: string]: unknown }>;
  status: 'draft' | 'published' | string;
  locationId?: string | null;
  publishedAt?: string | null;
  seo?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ArticleListParams {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  search?: string;
}

export interface CreateArticlePayload {
  title: string;
  category: string; // required per spec — must be one of ArticleCategory values
  body: string; // required
  author: string; // required
  slug?: string;
  tags?: string[];
  reviewer?: string;
  credentialsDisplay?: string;
  sources?: Array<{ title?: string; url?: string; authors?: string; publishedDate?: string }>;
  status?: 'draft' | 'published' | string;
  seo?: Record<string, unknown>;
}

export type UpdateArticlePayload = Partial<CreateArticlePayload>;

// ---------------------------------------------------------------------------
// Endpoints — via Next proxy: /api/articles/* -> /api/admin/articles/*
// ---------------------------------------------------------------------------

/** GET /api/articles?page&limit&status&category&search (list omits body) */
export function getArticles(params?: ArticleListParams) {
  return get<PagedResponse<Article>>('/api/articles', params as Record<string, unknown>);
}

/** GET /api/articles/:id — full article including body */
export function getArticle(id: string) {
  return get<Article>(`/api/articles/${encodeURIComponent(id)}`);
}

/** POST /api/articles — { title, category, body, author } required */
export function createArticle(data: CreateArticlePayload) {
  return post<Article>('/api/articles', data);
}

/** PUT /api/articles/:id */
export function updateArticle(id: string, data: UpdateArticlePayload) {
  return put<Article>(`/api/articles/${encodeURIComponent(id)}`, data);
}

/** DELETE /api/articles/:id */
export function deleteArticle(id: string) {
  return del<{ message?: string }>(`/api/articles/${encodeURIComponent(id)}`);
}

// Aliases
export const fetchArticles = getArticles;
export const fetchArticle = getArticle;
