/**
 * Lead admin routes
 */
const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validators } = require('../middlewares/validate.middleware');
const leadController = require('../controllers/leadController');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Lead stats (must come before /:id)
router.get('/stats', leadController.getLeadStats);
router.get('/export', leadController.exportLeads);

// Lead CRUD (pagination capped at 100 - F16)
router.get('/', validators.pagination, leadController.getLeads);
router.get('/:id', leadController.getLead);
router.put('/:id', validators.leadUpdate, leadController.updateLead);
router.delete('/:id', leadController.deleteLead);

module.exports = router;