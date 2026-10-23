/**
 * TeamMember model - "Our Team" doctors listing
 * Single-admin draft/published model (R3): status is set directly, no review workflow
 */
const mongoose = require('mongoose');

const TEAM_CATEGORIES = [
  'general',
  'orthodontics',
  'endodontics',
  'oral-surgery',
  'periodontics',
  'implantology',
  'prosthodontics',
  'cosmetic',
  'pediatric'
];

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-z0-9-]+$/,
    maxlength: 100,
    index: true
  },
  role: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  category: {
    type: String,
    required: true,
    trim: true,
    enum: TEAM_CATEGORIES,
    index: true
  },
  photo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MediaAsset',
    default: null
  },
  bio: {
    type: String,
    trim: true,
    default: ''
  },
  qualifications: [{
    degree: { type: String, trim: true },
    institution: { type: String, trim: true },
    year: { type: Number }
  }],
  experienceYears: {
    type: Number,
    min: 0,
    max: 80,
    default: null
  },
  layout: {
    type: String,
    enum: ['classic-profile', 'sanctuary-editorial', 'compact-card', 'timeline', 'gallery-spotlight'],
    default: 'classic-profile',
    index: true
  },
  languages: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  consultationFee: {
    type: Number,
    min: 0,
    max: 1000000,
    default: null
  },
  location: {
    type: String,
    trim: true,
    maxlength: 200
  },
  services: [{
    type: String,
    trim: true,
    maxlength: 100
  }],
  reviews: [{
    patientName: { type: String, trim: true, maxlength: 100 },
    rating: { type: Number, min: 1, max: 5 },
    text: { type: String, trim: true, maxlength: 1000 }
  }],
  order: {
    type: Number,
    default: 0,
    index: true
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
    index: true
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    default: null,
    index: true
  },
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Text index for search
teamMemberSchema.index({ name: 'text', role: 'text', bio: 'text' });
teamMemberSchema.index({ category: 1, status: 1 });
teamMemberSchema.index({ status: 1, order: 1 });

/**
 * Get published team members for public API
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated results
 */
teamMemberSchema.statics.getPublished = async function(options = {}) {
  const { page = 1, limit = 20, category, search } = options;
  const query = { status: 'published' };

  if (category) query.category = category;
  if (search) query.$text = { $search: search };

  const [items, total] = await Promise.all([
    this.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('photo')
      .lean(),
    this.countDocuments(query)
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
};

/**
 * Get published team member by slug
 * @param {string} slug - Team member slug
 * @returns {Promise<TeamMember|null>}
 */
teamMemberSchema.statics.getBySlug = async function(slug) {
  return this.findOne({ slug, status: 'published' })
    .populate('photo')
    .lean();
};

/**
 * Get all team members for admin (all statuses)
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated results
 */
teamMemberSchema.statics.getAllForAdmin = async function(options = {}) {
  const { page = 1, limit = 20, status, category, search } = options;
  const query = {};

  if (status) query.status = status;
  if (category) query.category = category;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } }
    ];
  }

  const [items, total] = await Promise.all([
    this.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('photo'),
    this.countDocuments(query)
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
};

/**
 * Set publishedAt when content transitions to published (single-admin draft/published model - R3)
 * @param {Object} doc - TeamMember document (mutated)
 */
teamMemberSchema.statics.stampPublishedAt = function(doc) {
  if (doc.status === 'published' && !doc.publishedAt) {
    doc.publishedAt = new Date();
  }
};

module.exports = mongoose.model('TeamMember', teamMemberSchema);
module.exports.TEAM_CATEGORIES = TEAM_CATEGORIES;
