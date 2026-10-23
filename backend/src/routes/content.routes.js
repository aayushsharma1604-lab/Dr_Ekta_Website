/**
 * Admin routes for Treatment and Article
 * Single-admin draft/published model (R3): no review workflow routes
 */
const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validators } = require('../middlewares/validate.middleware');

const treatmentController = require('../controllers/treatmentController');
const articleController = require('../controllers/articleController');
const teamController = require('../controllers/teamController');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Treatment routes (pagination capped at 100 - F16)
router.get('/treatments', validators.pagination, treatmentController.getAllTreatments);
router.get('/treatments/:id', treatmentController.getTreatmentById);
router.post('/treatments', validators.treatment, treatmentController.createTreatment);
router.put('/treatments/:id', validators.treatmentUpdate, treatmentController.updateTreatment);
router.delete('/treatments/:id', treatmentController.deleteTreatment);

// Article routes
router.get('/articles', validators.pagination, articleController.getAllArticles);
router.get('/articles/:id', articleController.getArticleById);
router.post('/articles', validators.article, articleController.createArticle);
router.put('/articles/:id', validators.articleUpdate, articleController.updateArticle);
router.delete('/articles/:id', articleController.deleteArticle);

// Team routes
router.get('/team', validators.pagination, teamController.getAllTeam);
router.get('/team/:id', teamController.getTeamMemberById);
router.post('/team', validators.team, teamController.createTeamMember);
router.put('/team/:id', validators.teamUpdate, teamController.updateTeamMember);
router.delete('/team/:id', teamController.deleteTeamMember);

module.exports = router;
