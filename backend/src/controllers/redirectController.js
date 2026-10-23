/**
 * Admin SEO controller - Redirect management
 */
const { asyncHandler } = require('../middlewares/errorHandler.middleware');
const { AppError, NotFoundError } = require('../middlewares/errorHandler.middleware');
const { RedirectMap } = require('../models');

/**
 * GET /api/admin/redirects - List redirects
 */
const getRedirects = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;

  const result = await RedirectMap.getAllForAdmin({
    page: parseInt(page),
    limit: parseInt(limit),
    search
  });

  res.json(result);
});

/**
 * GET /api/admin/redirects/:id - Single redirect
 */
const getRedirect = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const redirect = await RedirectMap.findById(id);

  if (!redirect) {
    throw new NotFoundError('Redirect not found');
  }

  res.json(redirect);
});

/**
 * POST /api/admin/redirects - Create redirect
 */
const createRedirect = asyncHandler(async (req, res) => {
  const { fromPath, toPath, statusCode = 301 } = req.body;

  // Check if fromPath already exists
  const existing = await RedirectMap.findByFromPath(fromPath);
  if (existing) {
    throw new AppError('Redirect for this path already exists', 409, 'DUPLICATE_REDIRECT');
  }

  const redirect = await RedirectMap.create({
    fromPath: fromPath.startsWith('/') ? fromPath : '/' + fromPath,
    toPath,
    statusCode
  });

  res.status(201).json(redirect);
});

/**
 * PUT /api/admin/redirects/:id - Update redirect
 */
const updateRedirect = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { toPath, statusCode } = req.body;

  const redirect = await RedirectMap.findById(id);
  if (!redirect) {
    throw new NotFoundError('Redirect not found');
  }

  if (toPath !== undefined) redirect.toPath = toPath;
  if (statusCode !== undefined) redirect.statusCode = statusCode;

  await redirect.save();

  res.json(redirect);
});

/**
 * DELETE /api/admin/redirects/:id - Delete redirect
 */
const deleteRedirect = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const redirect = await RedirectMap.findById(id);

  if (!redirect) {
    throw new NotFoundError('Redirect not found');
  }

  await redirect.deleteOne();

  res.json({ message: 'Redirect deleted successfully' });
});

module.exports = {
  getRedirects: [getRedirects],
  getRedirect: [getRedirect],
  createRedirect: [createRedirect],
  updateRedirect: [updateRedirect],
  deleteRedirect: [deleteRedirect]
};