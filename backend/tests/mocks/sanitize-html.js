/**
 * Mock for sanitize-html - avoids ESM transformation issues in Jest
 * Mirrors the real allowlist behavior for dangerous input: strips script
 * elements so XSS regression tests (7.2) are meaningful. All other markup
 * passes through; the real library enforces the full allowlist in production.
 */
function sanitizeHtml(html, options) {
  if (!html) return '';
  return String(html).replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '');
}

module.exports = sanitizeHtml;
module.exports.default = sanitizeHtml;
