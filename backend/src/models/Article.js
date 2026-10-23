/**
 * Article model - Dental Knowledge Centre articles
 */
const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  answer: {
    type: String,
    required: true,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  }
}, { _id: false });

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
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
  category: {
    type: String,
    required: true,
    trim: true,
    enum: [
      'preventive-care',
      'restorative',
      'cosmetic',
      'orthodontics',
      'oral-surgery',
      'pediatric',
      'emergency',
      'technology',
      'patient-education'
    ],
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  body: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: 300
  },
  coverImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MediaAsset',
    default: null
  },
  layout: {
    type: String,
    enum: [
      'standard', 'hero-feature', 'step-guide', 'faq', 'before-after',
      'editorial', 'medical-guide', 'research', 'storytelling', 'step-by-step',
      'health-guide', 'report-analysis', 'symptoms', 'clinical-deep-dive'
    ],
    default: 'standard',
    index: true
  },
  beforeImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MediaAsset',
    default: null
  },
  afterImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MediaAsset',
    default: null
  },
  keyPoints: [{
    type: String,
    trim: true,
    maxlength: 300
  }],
  faqs: [faqSchema],
  ctaBox: {
    title: { type: String, trim: true, maxlength: 120 },
    subtitle: { type: String, trim: true, maxlength: 300 },
    buttonLabel: { type: String, trim: true, maxlength: 60 }
  },
  quickSummary: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  pullQuote: {
    type: String,
    trim: true,
    maxlength: 500
  },
  warnings: [{
    type: String,
    trim: true,
    maxlength: 300
  }],
  checklist: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  pros: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  cons: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  whenToConsult: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  chartData: {
    title: { type: String, trim: true, maxlength: 120 },
    labels: [{ type: String, trim: true, maxlength: 60 }],
    values: [{ type: Number }]
  },
  galleryImages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MediaAsset'
  }],
  disclaimer: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  abstract: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  audience: {
    type: String,
    trim: true,
    maxlength: 500
  },
  preparation: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  keyFindings: [{
    type: String,
    trim: true,
    maxlength: 300
  }],
  dos: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  donts: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  symptoms: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  causes: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  riskFactors: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  warningSigns: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  markers: [{
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000 },
    unit: { type: String, trim: true, maxlength: 60 },
    range: { type: String, trim: true, maxlength: 200 },
    interpretation: { type: String, trim: true, maxlength: 1000 },
    factors: { type: String, trim: true, maxlength: 500 }
  }],
  author: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  credentialsDisplay: {
    type: String,
    trim: true,
    maxlength: 500
  },
  sources: [{
    title: { type: String, trim: true },
    url: { type: String, trim: true },
    authors: { type: String, trim: true },
    publishedDate: { type: Date }
  }],
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
  },
  seo: {
    metaTitle: {
      type: String,
      trim: true,
      maxlength: 60
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: 160
    },
    ogImage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MediaAsset'
    }
  }
}, {
  timestamps: true
});

// Text index for search
articleSchema.index({ title: 'text', body: 'text', tags: 'text' });
articleSchema.index({ category: 1, status: 1 });
articleSchema.index({ status: 1, publishedAt: -1 });

/**
 * Get published articles for public API
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated results
 */
articleSchema.statics.getPublished = async function(options = {}) {
  const { page = 1, limit = 20, category, tags, search } = options;
  const query = { status: 'published' };
  
  if (category) query.category = category;
  if (tags && tags.length) query.tags = { $in: tags };
  if (search) query.$text = { $search: search };
  
  const [items, total] = await Promise.all([
    this.find(query)
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-body')
      .populate('reviewer', 'name')
      .populate('coverImage')
      .populate('beforeImage')
      .populate('afterImage')
      .populate('galleryImages')
      .populate('seo.ogImage')
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
 * Get published article by slug
 * @param {string} slug - Article slug
 * @returns {Promise<Article|null>}
 */
articleSchema.statics.getBySlug = async function(slug) {
  return this.findOne({ slug, status: 'published' })
    .populate('reviewer', 'name')
    .populate('coverImage')
    .populate('beforeImage')
    .populate('afterImage')
    .populate('galleryImages')
    .populate('seo.ogImage')
    .lean();
};

/**
 * Get all articles for admin (all statuses)
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated results
 */
articleSchema.statics.getAllForAdmin = async function(options = {}) {
  const { page = 1, limit = 20, status, category, search } = options;
  const query = {};
  
  if (status) query.status = status;
  if (category) query.category = category;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } }
    ];
  }
  
  const [items, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('reviewer', 'name email')
      .populate('coverImage')
      .populate('beforeImage')
      .populate('afterImage')
      .populate('galleryImages')
      .populate('seo.ogImage'),
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
 * @param {Object} doc - Article document (mutated)
 */
articleSchema.statics.stampPublishedAt = function(doc) {
  if (doc.status === 'published' && !doc.publishedAt) {
    doc.publishedAt = new Date();
  }
};

module.exports = mongoose.model('Article', articleSchema);