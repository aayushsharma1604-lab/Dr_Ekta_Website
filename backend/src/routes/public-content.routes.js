/**
 * Public routes for Treatment and Article
 * Pagination caps enforced on list endpoints (F16)
 */
const express = require('express');
const { publicReadLimiter } = require('../middlewares/rateLimit.middleware');
const { validators } = require('../middlewares/validate.middleware');

const treatmentController = require('../controllers/treatmentController');
const articleController = require('../controllers/articleController');
const teamController = require('../controllers/teamController');

const router = express.Router();

// Apply rate limiting to all public routes
router.use(publicReadLimiter);

// Treatment routes
router.get('/treatments', validators.pagination, treatmentController.getPublishedTreatments);
router.get('/treatments/:slug', treatmentController.getPublishedTreatment);

// Article routes
router.get('/articles', validators.pagination, articleController.getPublishedArticles);
router.get('/articles/:slug', articleController.getPublishedArticle);

// Team routes
router.get('/team', validators.pagination, teamController.getPublishedTeam);
router.get('/team/:slug', teamController.getPublishedTeamMember);

module.exports = router;
