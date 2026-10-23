/**
 * Gallery controller - Smile gallery before/after pairs
 * Single-admin draft/published model (R1+R3): no consent gate, no review workflow
 */
const { asyncHandler, NotFoundError } = require('../middlewares/errorHandler.middleware');
const { validators, sanitizeRichText } = require('../middlewares/validate.middleware');
const { GalleryItem } = require('../models');

// Fields the single admin may set (mass-assignment guard - F3)
const WRITABLE_FIELDS = [
  'beforeImg', 'afterImg', 'treatmentTag', 'content', 'status', 'locationId'
];

/**
 * Pick only writable fields from the request body
 * @param {Object} body - Request body
 * @returns {Object} Allowlisted payload
 */
function pickWritable(body) {
  const data = {};
  for (const field of WRITABLE_FIELDS) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }
  return data;
}

/**
 * GET /api/public/gallery - Published gallery items (filter by treatment)
 */
const getPublicGallery = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, treatmentTag } = req.query;
  const result = await GalleryItem.getPublished({
    page: parseInt(page),
    limit: parseInt(limit),
    treatmentTag
  });
  res.json(result);
});

/**
 * GET /api/admin/gallery - All gallery items (admin)
 */
const getAdminGallery = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, treatmentTag } = req.query;
  const result = await GalleryItem.getAllForAdmin({
    page: parseInt(page),
    limit: parseInt(limit),
    status,
    treatmentTag
  });
  res.json(result);
});

/**
 * GET /api/admin/gallery/:id - Single gallery item (admin)
 */
const getGalleryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await GalleryItem.findById(id)
    .populate('beforeImg afterImg')
    .populate('treatmentTag', 'title slug');

  if (!item) {
    throw new NotFoundError('Gallery item not found');
  }

  res.json(item);
});

/**
 * POST /api/admin/gallery - Create gallery item (draft or published)
 */
const createGalleryItem = asyncHandler(async (req, res) => {
  const data = pickWritable(req.body);
  if (typeof data.content === 'string') {
    data.content = sanitizeRichText(data.content); // XSS guard - F7
  }

  const item = await GalleryItem.create(data);
  GalleryItem.stampPublishedAt(item);
  if (item.isModified('publishedAt')) {
    await item.save();
  }

  res.status(201).json(item);
});

/**
 * PUT /api/admin/gallery/:id - Update gallery item (status set directly)
 */
const updateGalleryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await GalleryItem.findById(id);

  if (!item) {
    throw new NotFoundError('Gallery item not found');
  }

  const data = pickWritable(req.body);
  if (typeof data.content === 'string') {
    data.content = sanitizeRichText(data.content); // XSS guard - F7
  }

  Object.assign(item, data);
  GalleryItem.stampPublishedAt(item);
  const updated = await item.save();

  res.json(updated);
});

/**
 * DELETE /api/admin/gallery/:id - Delete gallery item
 */
const deleteGalleryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await GalleryItem.findById(id);

  if (!item) {
    throw new NotFoundError('Gallery item not found');
  }

  await item.deleteOne();

  res.json({ message: 'Gallery item deleted successfully' });
});

module.exports = {
  getPublicGallery: [
    validators.pagination,
    getPublicGallery
  ],
  getAdminGallery,
  getGalleryItem: [
    validators.objectId(),
    getGalleryItem
  ],
  createGalleryItem: [
    validators.galleryItem,
    createGalleryItem
  ],
  updateGalleryItem: [
    validators.objectId(),
    validators.galleryItemUpdate,
    updateGalleryItem
  ],
  deleteGalleryItem: [
    validators.objectId(),
    deleteGalleryItem
  ]
};
