/**
 * SEO Service - Sitemap, robots.txt, JSON-LD generation
 */
const { Treatment, Article, Video } = require('../models');
const { AppError } = require('../middlewares/errorHandler.middleware');

/**
 * Generate sitemap.xml
 * @returns {Promise<string>} XML string
 */
async function generateSitemap() {
  const baseUrl = process.env.FRONTEND_URL || 'https://drekta.com';
  
  const [treatments, articles, videos] = await Promise.all([
    Treatment.find({ status: 'published' }, 'slug updatedAt').lean(),
    Article.find({ status: 'published' }, 'slug updatedAt').lean(),
    Video.find({ status: 'published' }, 'updatedAt').lean()
  ]);
  
  const urls = [
    { url: baseUrl, changefreq: 'daily', priority: 1.0 },
    { url: `${baseUrl}/treatments`, changefreq: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/articles`, changefreq: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/videos`, changefreq: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/gallery`, changefreq: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/testimonials`, changefreq: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/about`, changefreq: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact`, changefreq: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/booking`, changefreq: 'monthly', priority: 0.5 },
  ];
  
  // Add treatments
  treatments.forEach(t => {
    urls.push({
      url: `${baseUrl}/treatments/${t.slug}`,
      lastmod: t.updatedAt.toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: 0.8
    });
  });
  
  // Add articles
  articles.forEach(a => {
    urls.push({
      url: `${baseUrl}/articles/${a.slug}`,
      lastmod: a.updatedAt.toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: 0.7
    });
  });
  
  // Add videos (Video has no slug field - link by id)
  videos.forEach(v => {
    urls.push({
      url: `${baseUrl}/videos/${v._id}`,
      lastmod: v.updatedAt.toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: 0.6
    });
  });
  
  // Build XML
  const urlElements = urls.map(u => `
  <url>
    <loc>${escapeXml(u.url)}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}

/**
 * Generate robots.txt
 * @returns {Promise<string>} robots.txt content
 */
async function generateRobotsTxt() {
  const baseUrl = process.env.FRONTEND_URL || 'https://drekta.com';
  const sitemapUrl = `${baseUrl}/sitemap.xml`;
  
  return `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${sitemapUrl}

# Disallow admin and API routes
Disallow: /api/
Disallow: /admin/
`;
}

/**
 * Get redirect for a path
 * @param {string} fromPath - Source path
 * @returns {Promise<RedirectMap|null>}
 */
async function getRedirect(fromPath) {
  const { RedirectMap } = require('../models');
  return RedirectMap.findByFromPath(fromPath);
}

/**
 * Escape XML special chars (F17: previously a no-op that re-emitted raw chars)
 * @param {string} str - Raw string
 * @returns {string} Escaped string
 */
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

module.exports = {
  generateSitemap,
  generateRobotsTxt,
  getRedirect
};