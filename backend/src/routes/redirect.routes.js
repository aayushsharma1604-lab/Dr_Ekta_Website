/**
 * Admin redirect routes
 */
const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validators } = require('../middlewares/validate.middleware');
const redirectController = require('../controllers/redirectController');

const router = express.Router();

router.use(authMiddleware);
router.get('/', validators.pagination, redirectController.getRedirects);
router.get('/:id', redirectController.getRedirect);
router.post('/', validators.redirect, redirectController.createRedirect);
router.put('/:id', validators.redirectUpdate, redirectController.updateRedirect);
router.delete('/:id', redirectController.deleteRedirect);

module.exports = router;