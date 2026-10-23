/**
 * Media service - Handles signed direct-to-Cloudinary uploads
 * Browser uploads directly to Cloudinary, backend manages metadata
 */
const crypto = require('crypto');
const { MediaAsset } = require('../models');
const { cloudinary } = require('../config/integrations.config');
const cloudinaryLib = require('cloudinary').v2;
const { AppError } = require('../middlewares/errorHandler.middleware');

/**
 * Configure Cloudinary
 */
function initCloudinary() {
  cloudinaryLib.config({
    cloud_name: cloudinary.cloudName,
    api_key: cloudinary.apiKey,
    api_secret: cloudinary.apiSecret,
    secure: true
  });
}

/**
 * Generate a unique public ID for Cloudinary (no extension, no leading folder
 * duplication — Cloudinary appends the format itself and the folder path is
 * part of the ID, so no separate `folder` upload param is needed)
 * @param {string} originalName - Original filename (unused, kept for signature)
 * @returns {string} Public ID
 */
function generatePublicId(originalName) {
  const random = crypto.randomBytes(16).toString('hex');
  const date = new Date().toISOString().split('T')[0];
  return `dr-ekta/${date}/${random}`;
}

/**
 * Responsive image widths generated for every image upload (pipeline)
 * Thumb for cards/carousels, medium for content, large for fullscreen/gallery
 */
const IMAGE_VARIANT_WIDTHS = [400, 800, 1600];

/**
 * Build deterministic optimized delivery URLs from a Cloudinary public ID (pipeline)
 * No API call needed: Cloudinary applies f_auto/q_auto + width limits on delivery.
 * @param {string} publicId - Cloudinary public ID
 * @param {string} mimeType - File MIME type
 * @returns {Object} { optimizedUrl, variants } (variants empty for non-images)
 */
function buildVariantUrls(publicId, mimeType) {
  const base = `https://res.cloudinary.com/${cloudinary.cloudName}/${mimeType.startsWith('video/') ? 'video' : mimeType.startsWith('image/') ? 'image' : 'raw'}/upload`;

  if (!mimeType.startsWith('image/')) {
    return { optimizedUrl: null, variants: [] };
  }

  const variants = IMAGE_VARIANT_WIDTHS.map(width => ({
    name: width <= 400 ? 'thumb' : width <= 800 ? 'medium' : 'large',
    width,
    url: `${base}/w_${width},c_limit,f_auto,q_auto/${publicId}`
  }));

  return {
    optimizedUrl: `${base}/f_auto,q_auto/${publicId}`,
    variants
  };
}

/**
 * Validate file type and size
 * @param {string} mimeType - MIME type
 * @param {number} size - File size in bytes
 * @returns {Object} Validation result
 */
function validateFile(mimeType, size) {
  return MediaAsset.validateFile(mimeType, size);
}

/**
 * Generate signed upload URL for Cloudinary
 * @param {string} filename - Original filename
 * @param {string} mimeType - MIME type
 * @param {number} size - File size
 * @returns {Promise<Object>} Signed URL and metadata
 */
async function generateSignedUrlCloudinary(filename, mimeType, size) {
  const validation = validateFile(mimeType, size);
  if (!validation.valid) {
    throw new AppError(validation.error, 422, 'VALIDATION_ERROR');
  }

  initCloudinary();

  const publicId = generatePublicId(filename);
  const timestamp = Math.floor(Date.now() / 1000);

  // Determine resource type
  const resourceType = mimeType.startsWith('video/') ? 'video' : mimeType.startsWith('image/') ? 'image' : 'raw';

  // Eager transformations so responsive renditions exist at upload time (pipeline, images only).
  // Must be Cloudinary's pipe-delimited string format (NOT a JSON array): the exact
  // same string is signed here and sent by the browser, otherwise Cloudinary
  // rejects it ("Invalid transformation component") and the signature mismatches.
  const eager = mimeType.startsWith('image/')
    ? IMAGE_VARIANT_WIDTHS.map(width => `w_${width},c_limit/f_auto,q_auto`).join('|')
    : '';

  // Create upload parameters. NOTE: resource_type must NOT be part of the
  // signature (Cloudinary excludes it from the string-to-sign); it only
  // selects the upload endpoint and is returned separately for reference.
  const paramsToSign = {
    public_id: publicId,
    timestamp,
    overwrite: false,
    unique_filename: true,
    use_filename: false
  };
  if (eager) {
    paramsToSign.eager = eager;
  }

  // Generate signature
  const signature = cloudinaryLib.utils.api_sign_request(paramsToSign, cloudinary.apiSecret);

  // Build upload URL
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/${resourceType}/upload`;

  // Public URL after upload (+ deterministic optimized variants, pipeline)
  const publicUrl = cloudinaryLib.url(publicId, {
    resource_type: resourceType,
    secure: true
  });
  const { optimizedUrl, variants } = buildVariantUrls(publicId, mimeType);

  return {
    uploadUrl,
    publicUrl,
    optimizedUrl,
    variants,
    publicId,
    signature,
    timestamp,
    apiKey: cloudinary.apiKey,
    cloudName: cloudinary.cloudName,
    resourceType,
    paramsToSign,
    expiresIn: 3600
  };
}

/**
 * Generate signed upload URL (Cloudinary only)
 * @param {string} filename - Original filename
 * @param {string} mimeType - MIME type
 * @param {number} size - File size
 * @returns {Promise<Object>} Signed URL and metadata
 */
async function generateSignedUrl(filename, mimeType, size) {
  return generateSignedUrlCloudinary(filename, mimeType, size);
}

/**
 * Confirm upload and create MediaAsset record
 * Re-validates type/size AND requires a well-formed storage reference (F18).
 * Duplicate guard: when the client sends a SHA-256 `fileHash` of the bytes and
 * an asset with the same hash + mimeType already exists, the just-uploaded
 * Cloudinary duplicate is deleted and the existing asset is reused (returned
 * with `reused: true`) instead of creating a second record.
 * @param {ObjectId} userId - Uploading user ID
 * @param {Object} uploadData - Upload confirmation data
 * @returns {Promise<MediaAsset>} Created (or reused) media asset
 */
async function confirmUpload(userId, uploadData) {
  const { filename, mimeType, size, publicId, url, fileHash } = uploadData;

  const validation = validateFile(mimeType, size);
  if (!validation.valid) {
    throw new AppError(validation.error, 422, 'VALIDATION_ERROR');
  }

  if (!publicId || typeof publicId !== 'string' || !publicId.trim()) {
    throw new AppError('Upload confirmation requires a storage publicId', 422, 'VALIDATION_ERROR');
  }
  if (!url || typeof url !== 'string' || !/^https?:\/\/.+/i.test(url.trim())) {
    throw new AppError('Upload confirmation requires a valid http(s) URL', 422, 'VALIDATION_ERROR');
  }

  const cleanHash = typeof fileHash === 'string' && /^[a-f0-9]{64}$/i.test(fileHash.trim())
    ? fileHash.trim().toLowerCase()
    : null;

  if (cleanHash) {
    const existing = await MediaAsset.findOne({ fileHash: cleanHash, mimeType });
    if (existing) {
      // Remove the just-uploaded Cloudinary duplicate so storage doesn't fill
      // with copies; failure is non-fatal (orphan cleanup can handle it later).
      initCloudinary();
      try {
        await cloudinaryLib.uploader.destroy(publicId.trim(), {
          resource_type: mimeType.startsWith('video/') ? 'video' : mimeType.startsWith('image/') ? 'image' : 'raw'
        });
      } catch (err) {
        console.warn('Cloudinary duplicate cleanup warning:', err.message);
      }
      return { ...existing.toObject(), reused: true };
    }
  }

  // Optimized delivery URLs are derived server-side from the public ID (pipeline)
  const { optimizedUrl, variants } = buildVariantUrls(publicId, mimeType);

  const asset = await MediaAsset.create({
    filename,
    originalName: filename,
    storageKey: publicId,
    url,
    optimizedUrl,
    variants,
    mimeType,
    size,
    fileHash: cleanHash,
    uploadedBy: userId
  });

  return asset;
}

/**
 * Delete media asset (if not in use)
 * @param {ObjectId} mediaId - Media asset ID
 * @param {ObjectId} userId - Requesting user ID
 * @returns {Promise<boolean>} Success
 */
async function deleteMedia(mediaId, userId) {
  const asset = await MediaAsset.findById(mediaId);
  if (!asset) {
    throw new AppError('Media asset not found', 404, 'NOT_FOUND');
  }

  // Check if asset is in use
  const inUse = await MediaAsset.isInUse(mediaId);
  if (inUse) {
    throw new AppError('Cannot delete: media asset is in use', 409, 'CONFLICT_ERROR');
  }

  // Delete from Cloudinary
  initCloudinary();
  try {
    await cloudinaryLib.uploader.destroy(asset.storageKey, {
      resource_type: asset.mimeType.startsWith('video/') ? 'video' : 'image'
    });
  } catch (err) {
    // Log but don't fail - asset might already be deleted
    console.warn('Cloudinary delete warning:', err.message);
  }

  await asset.deleteOne();
  return true;
}

/**
 * List media assets with pagination
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated results
 */
async function listMedia(options = {}) {
  const { page = 1, limit = 20, userId, mimeType } = options;
  const query = {};

  if (userId) query.uploadedBy = userId;
  if (mimeType) query.mimeType = mimeType;

  const [items, total] = await Promise.all([
    MediaAsset.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('uploadedBy', 'name email'),
    MediaAsset.countDocuments(query)
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

module.exports = {
  generateSignedUrl,
  confirmUpload,
  deleteMedia,
  listMedia,
  validateFile
};