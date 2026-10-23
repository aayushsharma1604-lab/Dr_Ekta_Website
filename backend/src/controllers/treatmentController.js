/**
 * Treatment controller - Handles treatment endpoints
 * Single-admin draft/published model (R3): status is set directly, no review workflow
 */
const { asyncHandler, NotFoundError } = require('../middlewares/errorHandler.middleware');
const { sanitizeRichText } = require('../middlewares/validate.middleware');
const { Treatment } = require('../models');

// Fields the single admin may set (mass-assignment guard - F3)
const WRITABLE_FIELDS = [
  'title', 'slug', 'status', 'icon', 'problems', 'benefits',
  'sections', 'faqs',
  'heroImage', 'gallery', 'relatedTreatments', 'seo', 'locationId'
];

/**
 * Sanitize rich-text treatment fields with the shared allowlist (XSS guard - F7)
 * @param {Object} data - Treatment write payload (mutated)
 */
function sanitizeTreatmentFields(data) {
  if (data.sections && typeof data.sections === 'object') {
    for (const key of Object.keys(data.sections)) {
      if (typeof data.sections[key] === 'string') {
        data.sections[key] = sanitizeRichText(data.sections[key]);
      }
    }
  }
  if (Array.isArray(data.faqs)) {
    for (const faq of data.faqs) {
      if (faq && typeof faq.answer === 'string') {
        faq.answer = sanitizeRichText(faq.answer);
      }
    }
  }
}

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
 * GET /api/public/treatments - List published treatments
 */
const getPublishedTreatments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const result = await Treatment.getPublished({
      page: parseInt(page),
      limit: parseInt(limit),
      search
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/public/treatments/:slug - Get published treatment by slug
 */
const getPublishedTreatment = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;

  const treatment = await Treatment.getBySlug(slug);
  if (!treatment) {
    throw new NotFoundError('Treatment not found');
  }

  res.json(treatment);
});

/**
 * GET /api/admin/treatments - List all treatments (admin)
 */
const getAllTreatments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    const result = await Treatment.getAllForAdmin({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      search
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/treatments/:id - Get treatment by ID (admin)
 */
const getTreatmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const treatment = await Treatment.findById(id)
      .populate('heroImage')
      .populate('gallery')
      .populate('relatedTreatments', 'title slug')
      .populate('createdBy', 'name email');

    if (!treatment) {
      throw new NotFoundError('Treatment not found');
    }

    res.json(treatment);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/treatments - Create new treatment (draft or published)
 */
const createTreatment = async (req, res, next) => {
  try {
    const treatmentData = {
      ...pickWritable(req.body),
      createdBy: req.user._id
    };
    sanitizeTreatmentFields(treatmentData);

    const treatment = await Treatment.create(treatmentData);
    Treatment.stampPublishedAt(treatment);
    if (treatment.isModified('publishedAt')) {
      await treatment.save();
    }

    res.status(201).json(treatment);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/treatments/:id - Update treatment (status set directly)
 */
const updateTreatment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const treatment = await Treatment.findById(id);
    if (!treatment) {
      throw new NotFoundError('Treatment not found');
    }

    const updateData = pickWritable(req.body);
    sanitizeTreatmentFields(updateData);

    Object.assign(treatment, updateData);
    Treatment.stampPublishedAt(treatment);
    await treatment.save();

    res.json(treatment);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/treatments/:id - Delete treatment
 */
const deleteTreatment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const treatment = await Treatment.findById(id);
    if (!treatment) {
      throw new NotFoundError('Treatment not found');
    }

    await treatment.deleteOne();

    res.json({ message: 'Treatment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublishedTreatments,
  getPublishedTreatment,
  getAllTreatments,
  getTreatmentById,
  createTreatment,
  updateTreatment,
  deleteTreatment
};
