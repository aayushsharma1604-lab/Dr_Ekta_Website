/**
 * Public SEO controller - Sitemap, robots.txt, redirects
 */
const { asyncHandler } = require('../middlewares/errorHandler.middleware');
const { NotFoundError } = require('../middlewares/errorHandler.middleware');
const seoService = require('../services/seoService');

/**
 * GET /sitemap.xml
 */
const getSitemap = asyncHandler(async (req, res) => {
  const xml = await seoService.generateSitemap();
  res.set('Content-Type', 'application/xml');
  res.send(xml);
});

/**
 * GET /robots.txt
 */
const getRobotsTxt = asyncHandler(async (req, res) => {
  const txt = await seoService.generateRobotsTxt();
  res.set('Content-Type', 'text/plain');
  res.send(txt);
});

/**
 * GET /api/public/redirect/:path(*) - Handle redirects
 */
const handleRedirect = asyncHandler(async (req, res) => {
  const fromPath = '/' + (req.params[0] || '');
  const redirect = await seoService.getRedirect(fromPath);
  
  if (!redirect) {
    throw new NotFoundError('Redirect not found');
  }
  
  res.redirect(redirect.statusCode, redirect.toPath);
});

module.exports = {
  getSitemap,
  getRobotsTxt,
  handleRedirect
};