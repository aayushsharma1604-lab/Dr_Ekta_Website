/**
 * MediaAsset model - Tracks uploaded files (images, videos, documents)
 * References storage keys/URLs, tracks usage for orphan cleanup
 */
const mongoose = require('mongoose');

const mediaAssetSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  storageKey: {
    type: String,
    required: true,
    index: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  optimizedUrl: {
    type: String,
    trim: true,
    default: null
  },
  variants: [{
    name: { type: String, trim: true },
    width: { type: Number },
    url: { type: String, trim: true }
  }],
  mimeType: {
    type: String,
    required: true,
    enum: [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/webm',
      'application/pdf',
      'text/vtt'
    ]
  },
  size: {
    type: Number,
    required: true,
    min: 0
  },
  fileHash: {
    type: String,
    trim: true,
    default: null,
    index: true,
    maxlength: 128
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  usedIn: [{
    collection: {
      type: String,
      required: true
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    field: {
      type: String,
      required: true
    }
  }],
  altText: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Compound index for usage tracking queries
mediaAssetSchema.index({ 'usedIn.collection': 1, 'usedIn.documentId': 1 });
mediaAssetSchema.index({ uploadedBy: 1, createdAt: -1 });

// Allowed mime types and max sizes
const ALLOWED_TYPES = {
  'image/jpeg': 5 * 1024 * 1024,   // 5MB
  'image/png': 5 * 1024 * 1024,
  'image/webp': 5 * 1024 * 1024,
  'image/gif': 3 * 1024 * 1024,    // 3MB
  'video/mp4': 50 * 1024 * 1024,   // 50MB
  'video/webm': 50 * 1024 * 1024,
  'application/pdf': 10 * 1024 * 1024, // 10MB
  'text/vtt': 1 * 1024 * 1024 // 1MB
};

/**
 * Validate file type and size
 * @param {string} mimeType - File MIME type
 * @param {number} size - File size in bytes
 * @returns {Object} Validation result
 */
mediaAssetSchema.statics.validateFile = function(mimeType, size) {
  const maxSize = ALLOWED_TYPES[mimeType];
  if (!maxSize) {
    return { valid: false, error: 'File type not allowed' };
  }
  if (size > maxSize) {
    return { valid: false, error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit` };
  }
  return { valid: true };
};

/**
 * Check if media is in use
 * @param {ObjectId} mediaId - Media asset ID
 * @returns {Promise<boolean>}
 */
mediaAssetSchema.statics.isInUse = async function(mediaId) {
  const asset = await this.findById(mediaId).select('usedIn');
  return asset && asset.usedIn && asset.usedIn.length > 0;
};

module.exports = mongoose.model('MediaAsset', mediaAssetSchema);