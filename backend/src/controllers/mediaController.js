/**
 * Media controller - Handles signed upload URLs and media library
 * Client uploads directly to storage, backend only manages metadata
 */
const { asyncHandler } = require('../middlewares/errorHandler.middleware');
const { validators } = require('../middlewares/validate.middleware');
const { NotFoundError } = require('../middlewares/errorHandler.middleware');
const mediaService = require('../services/mediaService');
const { MediaAsset } = require('../models');

/**
 * POST /api/admin/media/upload
 * Get signed upload URL for direct-to-storage upload
 */
const getUploadUrl = asyncHandler(async (req, res) => {
  const { filename, mimeType, size } = req.body;
  
  const result = await mediaService.generateSignedUrl(filename, mimeType, size);
  res.json(result);
});

/**
 * POST /api/admin/media/confirm
 * Confirm upload and create MediaAsset record
 */
const confirmUpload = asyncHandler(async (req, res) => {
  const uploadData = req.body;
  
  // Validate required fields
  if (!uploadData.key || !uploadData.url || !uploadData.filename || !uploadData.mimeType || !uploadData.size) {
    return res.status(400).json({ error: 'Missing required upload confirmation fields' });
  }

  const asset = await mediaService.confirmUpload(req.user._id, uploadData);

  res.status(201).json(asset);
});

/**
 * DELETE /api/admin/media/:id
 * Delete media asset (blocked if in use)
 */
const deleteMedia = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const asset = await MediaAsset.findById(id);
  if (!asset) {
    throw new NotFoundError('Media asset not found');
  }

  // Check if in use
  const inUse = await MediaAsset.isInUse(id);
  if (inUse) {
    return res.status(409).json({ 
      error: 'Cannot delete: media asset is referenced by other content',
      inUse: true
    });
  }

  await mediaService.deleteMedia(id, req.user._id);

  res.json({ message: 'Media asset deleted successfully' });
});

/**
 * GET /api/admin/media
 * List media assets with pagination
 */
const listMedia = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, mimeType } = req.query;
  
  const result = await mediaService.listMedia({
    page: parseInt(page),
    limit: parseInt(limit),
    userId: req.user._id,
    mimeType
  });

  res.json(result);
});

/**
 * GET /api/admin/media/:id
 * Get single media asset
 */
const getMedia = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const asset = await MediaAsset.findById(id).populate('uploadedBy', 'name email');
  if (!asset) {
    throw new NotFoundError('Media asset not found');
  }

  res.json(asset);
});

module.exports = {
  getUploadUrl: [validators.mediaUpload, getUploadUrl],
  confirmUpload,
  deleteMedia: [validators.objectId(), deleteMedia],
  listMedia: [validators.pagination, listMedia],
  getMedia: [validators.objectId(), getMedia]
};