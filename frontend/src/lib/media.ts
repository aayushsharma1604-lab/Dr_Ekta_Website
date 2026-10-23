/**
 * Media URL helpers — resolve uploaded images stored as MediaAsset refs.
 *
 * Backend returns images in several shapes:
 * - populated MediaAsset object: { url, optimizedUrl, variants?, secure_url? }
 * - plain http(s) URL string (Cloudinary / external)
 * - relative path string ("/uploads/..." or "uploads/...")
 * - raw ObjectId string (unpopulated ref) — NOT renderable, must be ignored
 *
 * These helpers centralise that logic so admin uploads always win over
 * placeholder/default imagery.
 */

import { API_ROOT } from "@/lib/config";

const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;

function isObjectIdLike(s: string): boolean {
  return OBJECT_ID_RE.test(s.trim());
}

function absolutize(url: string): string {
  const t = url.trim();
  if (/^https?:\/\//i.test(t) || /^data:/i.test(t) || /^blob:/i.test(t)) return t;
  if (t.startsWith("//")) return `https:${t}`;
  if (t.startsWith("/")) return `${API_ROOT.replace(/\/$/, "")}${t}`;
  // bare relative path (e.g. "uploads/x.jpg")
  return `${API_ROOT.replace(/\/$/, "")}/${t}`;
}

/**
 * Resolve any single media value to a renderable absolute URL, or null.
 */
export function resolveMediaUrl(value: unknown): string | null {
  if (!value) return null;

  if (typeof value === "string") {
    const t = value.trim();
    if (!t || isObjectIdLike(t)) return null;
    if (/^https?:\/\//i.test(t) || t.startsWith("/") || t.startsWith("data:") || t.startsWith("blob:")) {
      return absolutize(t);
    }
    // strings like "uploads/..." without leading slash
    if (/^(uploads|media|files|images?)\//i.test(t)) return absolutize(t);
    // Cloudinary public-id-ish values can't be rendered without a cloud name
    return null;
  }

  if (typeof value === "object") {
    const o = value as Record<string, unknown>;
    const candidates = [o.optimizedUrl, o.url, o.secure_url, o.src];
    for (const c of candidates) {
      if (typeof c === "string" && c.trim() && !isObjectIdLike(c.trim())) {
        return absolutize(c);
      }
    }
    const variants = o.variants;
    if (Array.isArray(variants)) {
      for (const v of variants) {
        const u =
          typeof v === "string"
            ? v
            : (v as Record<string, unknown> | null)?.url;
        if (typeof u === "string" && u.trim() && !isObjectIdLike(u.trim())) {
          return absolutize(u);
        }
      }
    }
  }

  return null;
}

/**
 * Resolve an article's cover image, checking every shape the API may return:
 * seo.ogImage (object | url string | ObjectId), plus legacy coverImage /
 * heroImage / image / thumbnail fields.
 */
export function resolveArticleImage(article: unknown): string | null {
  if (!article || typeof article !== "object") return null;
  const a = article as Record<string, unknown>;

  const seo = a.seo as Record<string, unknown> | null | undefined;
  const fromSeo = resolveMediaUrl(seo?.ogImage ?? null);
  if (fromSeo) return fromSeo;

  for (const key of ["coverImage", "heroImage", "image", "thumbnail", "banner"]) {
    const hit = resolveMediaUrl(a[key]);
    if (hit) return hit;
  }

  const images = a.images;
  if (Array.isArray(images)) {
    for (const img of images) {
      const hit = resolveMediaUrl(img);
      if (hit) return hit;
    }
  }

  return null;
}

const URL_RE = /https?:\/\/[^\s"'<>]+/gi;
const IMAGE_EXT_RE = /\.(jpe?g|png|webp|gif|avif|svg)(\?|#|$)/i;

function cleanUrl(u: string): string {
  // strip trailing punctuation the regex may swallow (.,)]} etc.)
  return u.replace(/[),.\]}'"]+$/, "");
}

/** All http(s) URLs embedded in a text blob (e.g. testimonial content). */
export function extractUrls(text: string): string[] {
  if (!text) return [];
  const matches = text.match(URL_RE) || [];
  return matches.map(cleanUrl).filter(Boolean);
}

/** First image-like URL (by extension or /image/upload Cloudinary path). */
export function extractImageUrl(text: string): string | null {
  const urls = extractUrls(text);
  for (const u of urls) {
    if (IMAGE_EXT_RE.test(u)) return u;
  }
  // Cloudinary image URLs without extension (e.g. /image/upload/...)
  const cloud = urls.find((u) => /\/image\/upload\//i.test(u));
  if (cloud) return cloud;
  return null;
}

const VIDEO_EXT_RE = /\.(mp4|webm|mov|m4v)(\?|#|$)/i;

/** First video-like URL in a text blob. */
export function extractVideoUrl(text: string): string | null {
  const urls = extractUrls(text);
  for (const u of urls) {
    if (VIDEO_EXT_RE.test(u)) return u;
  }
  const cloud = urls.find((u) => /\/video\/upload\//i.test(u));
  if (cloud) return cloud;
  return null;
}

/** Remove embedded URLs from display text (keeps the human-readable caption). */
export function stripUrls(text: string): string {
  if (!text) return "";
  return text
    .replace(URL_RE, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Resolve a testimonial's display image:
 * 1. explicit photo/media fields if a future backend adds them
 * 2. image URL embedded in `content` (how the admin panel stores uploads today)
 */
export function resolveTestimonialImage(t: unknown): string | null {
  if (!t || typeof t !== "object") return null;
  const o = t as Record<string, unknown>;
  for (const key of ["photo", "avatar", "image", "media", "mediaUrl", "patientPhoto"]) {
    const hit = resolveMediaUrl(o[key]);
    if (hit) return hit;
  }
  if (typeof o.content === "string") {
    return extractImageUrl(o.content);
  }
  return null;
}
