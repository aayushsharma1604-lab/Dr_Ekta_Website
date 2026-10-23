/**
 * Treatment model - Dynamic treatment pages with sections, FAQs, SEO
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

const sectionsSchema = new mongoose.Schema({
  what: {
    type: String,
    trim: true
  },
  who: {
    type: String,
    trim: true
  },
  procedure: {
    type: String,
    trim: true
  },
  pain: {
    type: String,
    trim: true
  },
  recovery: {
    type: String,
    trim: true
  },
  risks: {
    type: String,
    trim: true
  },
  duration: {
    type: String,
    trim: true
  },
  expectations: {
    type: String,
    trim: true
  },
  whyDrEkta: {
    type: String,
    trim: true
  }
}, { _id: false });

const treatmentSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  icon: {
    type: String,
    trim: true,
    maxlength: 100
  },
  problems: [{
    type: String,
    trim: true,
    maxlength: 300
  }],
  benefits: [{
    type: String,
    trim: true,
    maxlength: 300
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
  sections: {
    type: sectionsSchema,
    default: {}
  },
  faqs: [faqSchema],
  heroImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MediaAsset'
  },
  gallery: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MediaAsset'
  }],
  relatedTreatments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Treatment'
  }],
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
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Text index for search
treatmentSchema.index({ title: 'text', 'sections.what': 'text', 'sections.who': 'text' });

/**
 * Get published treatments for public API (internal fields excluded - F8)
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated results
 */
treatmentSchema.statics.getPublished = async function(options = {}) {
  const { page = 1, limit = 20, search } = options;
  const query = { status: 'published' };
  
  if (search) {
    query.$text = { $search: search };
  }
  
  const [items, total] = await Promise.all([
    this.find(query)
      .sort({ title: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-createdBy')
      .populate('heroImage')
      .populate('gallery')
      .populate('relatedTreatments', 'title slug')
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
 * Get published treatment by slug
 * @param {string} slug - Treatment slug
 * @returns {Promise<Treatment|null>}
 */
treatmentSchema.statics.getBySlug = async function(slug) {
  return this.findOne({ slug, status: 'published' })
    .select('-createdBy')
    .populate('heroImage')
    .populate('gallery')
    .populate('relatedTreatments', 'title slug')
    .populate('seo.ogImage')
    .lean();
};

/**
 * Get all treatments for admin (all statuses)
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated results
 */
treatmentSchema.statics.getAllForAdmin = async function(options = {}) {
  const { page = 1, limit = 20, status, search } = options;
  const query = {};
  
  if (status) query.status = status;
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
      .populate('heroImage')
      .populate('createdBy', 'name email'),
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
 * @param {Object} doc - Treatment document (mutated)
 */
treatmentSchema.statics.stampPublishedAt = function(doc) {
  if (doc.status === 'published' && !doc.publishedAt) {
    doc.publishedAt = new Date();
  }
};

module.exports = mongoose.model('Treatment', treatmentSchema);