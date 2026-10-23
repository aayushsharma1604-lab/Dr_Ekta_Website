/**
 * Announcement controller - Clinic notices and announcements
 * Single-admin draft/published model: status set directly, no review workflow
 */
const { asyncHandler, NotFoundError } = require('../middlewares/errorHandler.middleware');
const { validators, sanitizeRichText } = require('../middlewares/validate.middleware');
const { Announcement } = require('../models');

// Fields the single admin may set (mass-assignment guard)
const WRITABLE_FIELDS = [
  'title', 'body', 'linkUrl', 'status', 'order', 'locationId'
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
 * GET /api/public/announcements - Published announcements (ordered)
 */
const getPublicAnnouncements = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await Announcement.getPublished({
    page: parseInt(page),
    limit: parseInt(limit)
  });
  res.json(result);
});

/**
 * GET /api/admin/announcements - All announcements (admin)
 */
const getAdminAnnouncements = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const result = await Announcement.getAllForAdmin({
    page: parseInt(page),
    limit: parseInt(limit),
    status
  });
  res.json(result);
});

/**
 * GET /api/admin/announcements/:id - Single announcement (admin)
 */
const getAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const announcement = await Announcement.findById(id).lean();

  if (!announcement) {
    throw new NotFoundError('Announcement not found');
  }

  res.json(announcement);
});

/**
 * POST /api/admin/announcements - Create announcement (draft or published)
 */
const createAnnouncement = asyncHandler(async (req, res) => {
  const data = pickWritable(req.body);
  if (typeof data.body === 'string') {
    data.body = sanitizeRichText(data.body); // XSS guard
  }

  const announcement = await Announcement.create(data);
  Announcement.stampPublishedAt(announcement);
  if (announcement.isModified('publishedAt')) {
    await announcement.save();
  }

  res.status(201).json(announcement);
});

/**
 * PUT /api/admin/announcements/:id - Update announcement (status set directly)
 */
const updateAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const announcement = await Announcement.findById(id);

  if (!announcement) {
    throw new NotFoundError('Announcement not found');
  }

  const data = pickWritable(req.body);
  if (typeof data.body === 'string') {
    data.body = sanitizeRichText(data.body); // XSS guard
  }

  Object.assign(announcement, data);
  Announcement.stampPublishedAt(announcement);
  const updated = await announcement.save();

  res.json(updated);
});

/**
 * DELETE /api/admin/announcements/:id - Delete announcement
 */
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const announcement = await Announcement.findById(id);

  if (!announcement) {
    throw new NotFoundError('Announcement not found');
  }

  await announcement.deleteOne();

  res.json({ message: 'Announcement deleted successfully' });
});

module.exports = {
  getPublicAnnouncements: [
    validators.pagination,
    getPublicAnnouncements
  ],
  getAdminAnnouncements,
  getAnnouncement: [
    validators.objectId(),
    getAnnouncement
  ],
  createAnnouncement: [
    validators.announcement,
    createAnnouncement
  ],
  updateAnnouncement: [
    validators.objectId(),
    validators.announcementUpdate,
    updateAnnouncement
  ],
  deleteAnnouncement: [
    validators.objectId(),
    deleteAnnouncement
  ]
};
