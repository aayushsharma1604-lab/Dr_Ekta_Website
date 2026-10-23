/**
 * Testimonial controller - Patient stories
 * Single-admin draft/published model (R1+R3): no consent gate, no review workflow
 */
const { asyncHandler, NotFoundError } = require('../middlewares/errorHandler.middleware');
const { validators, sanitizeRichText } = require('../middlewares/validate.middleware');
const { Testimonial } = require('../models');

// Fields the single admin may set (mass-assignment guard - F3)
const WRITABLE_FIELDS = [
  'patientDisplayName', 'treatmentTag', 'type', 'content', 'status', 'locationId'
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
 * GET /api/public/testimonials - Published testimonials (filter by treatment)
 */
const getPublicTestimonials = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, treatmentTag } = req.query;
  const result = await Testimonial.getPublished({
    page: parseInt(page),
    limit: parseInt(limit),
    treatmentTag
  });
  res.json(result);
});

/**
 * GET /api/admin/testimonials - All testimonials (admin)
 */
const getAdminTestimonials = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, treatmentTag } = req.query;
  const result = await Testimonial.getAllForAdmin({
    page: parseInt(page),
    limit: parseInt(limit),
    status,
    treatmentTag
  });
  res.json(result);
});

/**
 * GET /api/admin/testimonials/:id - Single testimonial (admin)
 */
const getTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const testimonial = await Testimonial.findById(id)
    .populate('treatmentTag', 'title slug');

  if (!testimonial) {
    throw new NotFoundError('Testimonial not found');
  }

  res.json(testimonial);
});

/**
 * POST /api/admin/testimonials - Create testimonial (draft or published)
 */
const createTestimonial = asyncHandler(async (req, res) => {
  const data = pickWritable(req.body);
  if (typeof data.content === 'string') {
    data.content = sanitizeRichText(data.content); // XSS guard - F7
  }

  const testimonial = await Testimonial.create(data);
  Testimonial.stampPublishedAt(testimonial);
  if (testimonial.isModified('publishedAt')) {
    await testimonial.save();
  }

  res.status(201).json(testimonial);
});

/**
 * PUT /api/admin/testimonials/:id - Update testimonial (status set directly)
 */
const updateTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const testimonial = await Testimonial.findById(id);

  if (!testimonial) {
    throw new NotFoundError('Testimonial not found');
  }

  const data = pickWritable(req.body);
  if (typeof data.content === 'string') {
    data.content = sanitizeRichText(data.content); // XSS guard - F7
  }

  Object.assign(testimonial, data);
  Testimonial.stampPublishedAt(testimonial);
  const updated = await testimonial.save();

  res.json(updated);
});

/**
 * DELETE /api/admin/testimonials/:id - Delete testimonial
 */
const deleteTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const testimonial = await Testimonial.findById(id);

  if (!testimonial) {
    throw new NotFoundError('Testimonial not found');
  }

  await testimonial.deleteOne();

  res.json({ message: 'Testimonial deleted successfully' });
});

module.exports = {
  getPublicTestimonials: [
    validators.pagination,
    getPublicTestimonials
  ],
  getAdminTestimonials,
  getTestimonial: [
    validators.objectId(),
    getTestimonial
  ],
  createTestimonial: [
    validators.testimonial,
    createTestimonial
  ],
  updateTestimonial: [
    validators.objectId(),
    validators.testimonialUpdate,
    updateTestimonial
  ],
  deleteTestimonial: [
    validators.objectId(),
    deleteTestimonial
  ]
};
