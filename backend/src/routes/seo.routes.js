/**
 * Public SEO routes
 */
const express = require('express');
const { publicReadLimiter } = require('../middlewares/rateLimit.middleware');
const seoController = require('../controllers/seoController');

const router = express.Router();

router.get('/sitemap.xml', publicReadLimiter, seoController.getSitemap);
router.get('/robots.txt', publicReadLimiter, seoController.getRobotsTxt);
router.get('/redirect/:path(*)', seoController.handleRedirect);

module.exports = router;