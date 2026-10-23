/**
 * Analytics routes - Admin only
 */
const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validators } = require('../middlewares/validate.middleware');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();

router.use(authMiddleware);
router.get('/reports/monthly', analyticsController.getMonthlyReport);
router.get('/events', validators.pagination, analyticsController.getEvents);

module.exports = router;