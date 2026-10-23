/**
 * Video controller - YouTube videos with accessibility fields
 */
const { asyncHandler } = require('../middlewares/errorHandler.middleware');
const { validators, sanitizeRichText } = require('../middlewares/validate.middleware');
const { AppError, NotFoundError } = require('../middlewares/errorHandler.middleware');
const { Video, MediaAsset } = require('../models');

/**
 * GET /api/public/videos - Published videos (filter by category)
 */
const getPublicVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category } = req.query;
  const result = await Video.getPublished({
    page: parseInt(page),
    limit: parseInt(limit),
    category
  });
  res.json(result);
});

/**
 * GET /api/admin/videos - All videos (admin)
 */
const getAdminVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, category } = req.query;
  const result = await Video.getAllForAdmin({
    page: parseInt(page),
    limit: parseInt(limit),
    status,
    category
  });
  res.json(result);
});

/**
 * GET /api/admin/videos/:id - Single video (admin)
 */
const getVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate('captionsUrl');
  
  if (!video) {
    throw new NotFoundError('Video not found');
  }
  
  res.json(video);
});

/**
 * POST /api/admin/videos - Create video (admin)
 */
const createVideo = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (typeof data.transcript === 'string') {
    data.transcript = sanitizeRichText(data.transcript); // XSS guard - F7
  }
  const video = await Video.create({
    ...data,
    createdBy: req.user._id
  });
  
  // Populate captionsUrl for response
  const populated = await Video.findById(video._id).populate('captionsUrl');
  
  res.status(201).json(populated);
});

/**
 * PUT /api/admin/videos/:id - Update video (admin)
 */
const updateVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  
  if (!video) {
    throw new NotFoundError('Video not found');
  }
  
  const allowedFields = ['url', 'title', 'category', 'thumbnail', 'order', 'status', 'transcript', 'captionsUrl'];
  
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      video[field] = field === 'transcript' && typeof req.body[field] === 'string'
        ? sanitizeRichText(req.body[field]) // XSS guard - F7
        : req.body[field];
    }
  }
  
  const updated = await video.save();
  
  res.json(updated);
});

/**
 * DELETE /api/admin/videos/:id - Delete video (admin)
 */
const deleteVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  
  if (!video) {
    throw new NotFoundError('Video not found');
  }
  
  await video.deleteOne();
  
  res.json({ message: 'Video deleted successfully' });
});

module.exports = {
  getPublicVideos: [
    validators.pagination,
    getPublicVideos
  ],
  getAdminVideos,
  getVideo: [
    validators.objectId(),
    getVideo
  ],
  createVideo: [
    validators.video,
    createVideo
  ],
  updateVideo: [
    validators.objectId(),
    validators.videoUpdate,
    updateVideo
  ],
  deleteVideo: [
    validators.objectId(),
    deleteVideo
  ]
};