/**
 * Validation middleware - express-validator wrapper
 * Provides reusable validation chains for common patterns
 */
const { body, param, query, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');

/**
 * Handle validation errors
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Next middleware
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: 'Validation failed',
      details: errors.array().map(e => ({
        field: e.path,
        message: e.msg,
        value: e.value
      }))
    });
  }
  next();
}

/**
 * Sanitize HTML content - allowlist based
 * @param {string} html - HTML string
 * @returns {string} Sanitized HTML
 */
function sanitizeRichText(html) {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h2', 'h3', 'h4', 'a', 'img'],
    allowedAttributes: {
      'a': ['href', 'title', 'target', 'rel'],
      'img': ['src', 'alt', 'width', 'height'],
      '*': ['class']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {
      'a': ['http', 'https', 'mailto'],
      'img': ['http', 'https']
    }
  });
}

/**
 * Sanitize object keys - strip $ and . prefixes (NoSQL injection prevention)
 * @param {Object} obj - Object to sanitize
 * @returns {Object} Sanitized object
 */
function sanitizeKeys(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Skip keys starting with $ or . (MongoDB operators)
    if (key.startsWith('$') || key.startsWith('.')) continue;
    
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeKeys(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(v => typeof v === 'object' ? sanitizeKeys(v) : v);
    } else if (typeof value === 'string') {
      sanitized[key] = value.trim();
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Middleware to sanitize request body keys
 */
function sanitizeBodyKeys(req, res, next) {
  if (req.body) {
    req.body = sanitizeKeys(req.body);
  }
  if (req.query) {
    req.query = sanitizeKeys(req.query);
  }
  if (req.params) {
    req.params = sanitizeKeys(req.params);
  }
  next();
}

// Common validation chains
const validators = {
  // Auth
  // NOTE: normalizeEmail MUST keep gmail dots (gmail_remove_dots: false).
  // Default normalizeEmail strips dots from gmail addresses, so
  // aayush.sharma1604@gmail.com became aayushsharma1604@gmail.com and
  // never matched the stored email (Mongoose only lowercases+trims) -> 401.
  login: [
    body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail({ gmail_remove_dots: false }),
    body('password').isString().notEmpty().withMessage('Password required'),
    handleValidationErrors
  ],
  
  refreshToken: [
    body('refreshToken').isString().notEmpty().withMessage('Refresh token required'),
    handleValidationErrors
  ],

  // Clinic Info
  clinicInfo: [
    body('practiceName').optional().isString().trim().isLength({ max: 200 }),
    body('address.street').optional().isString().trim(),
    body('address.city').optional().isString().trim(),
    body('address.state').optional().isString().trim(),
    body('address.pincode').optional().isString().trim(),
    body('address.country').optional().isString().trim(),
    body('phones').optional().isArray(),
    body('phones.*').optional().isString().trim().matches(/^[\d\s\-\+\(\)]{10,20}$/),
    body('timings').optional().isArray(),
    body('timings.*.day').optional().isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    body('timings.*.open').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('timings.*.close').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('timings.*.isClosed').optional().isBoolean(),
    body('mapCoordinates.latitude').optional().isFloat({ min: -90, max: 90 }),
    body('mapCoordinates.longitude').optional().isFloat({ min: -180, max: 180 }),
    body('socialLinks').optional().isArray(),
    body('socialLinks.*.platform').optional().isIn(['instagram', 'youtube', 'facebook', 'linkedin', 'twitter']),
    body('socialLinks.*.url').optional().isURL(),
    body('legalEntityName').optional().isString().trim(),
    body('email').optional().trim().isEmail().normalizeEmail({ gmail_remove_dots: false }),
    body('locationId').optional().isMongoId().withMessage('Invalid location ID'),
    handleValidationErrors
  ],

  // Media
  mediaUpload: [
    body('filename').isString().notEmpty().withMessage('Filename required'),
    body('mimeType').isString().notEmpty().withMessage('MIME type required'),
    body('size').isInt({ min: 1 }).withMessage('File size required'),
    handleValidationErrors
  ],

  // Pagination
  pagination: [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    handleValidationErrors
  ],

  // Treatment (single-admin draft/published - R3)
  treatment: [
    body('title').isString().trim().isLength({ min: 1, max: 200 }).withMessage('Title required'),
    body('slug').optional().isString().trim().isLength({ min: 1, max: 100 }).matches(/^[a-z0-9-]+$/).withMessage('Invalid slug format'),
    body('status').optional().isIn(['draft', 'published']).withMessage('Status must be draft or published'),
    body('icon').optional().isString().trim().isLength({ max: 100 }),
    body('problems').optional().isArray(),
    body('problems.*').optional().isString().trim().isLength({ max: 300 }),
    body('benefits').optional().isArray(),
    body('benefits.*').optional().isString().trim().isLength({ max: 300 }),
    body('sections').optional().isObject(),
    body('sections.what').optional().isString().trim(),
    body('sections.who').optional().isString().trim(),
    body('sections.procedure').optional().isString().trim(),
    body('sections.pain').optional().isString().trim(),
    body('sections.recovery').optional().isString().trim(),
    body('sections.risks').optional().isString().trim(),
    body('sections.duration').optional().isString().trim(),
    body('sections.expectations').optional().isString().trim(),
    body('sections.whyDrEkta').optional().isString().trim(),
    body('faqs').optional().isArray(),
    body('faqs.*.question').optional().isString().trim().isLength({ max: 500 }),
    body('faqs.*.answer').optional().isString().trim(),
    body('faqs.*.order').optional().isInt({ min: 0 }),
    body('heroImage').optional().isMongoId().withMessage('Invalid heroImage ID'),
    body('gallery').optional().isArray(),
    body('gallery.*').optional().isMongoId().withMessage('Invalid gallery item ID'),
    body('relatedTreatments').optional().isArray(),
    body('relatedTreatments.*').optional().isMongoId().withMessage('Invalid related treatment ID'),
    body('seo').optional().isObject(),
    body('seo.metaTitle').optional().isString().trim().isLength({ max: 60 }),
    body('seo.metaDescription').optional().isString().trim().isLength({ max: 160 }),
    body('seo.ogImage').optional().isMongoId().withMessage('Invalid ogImage ID'),
    handleValidationErrors
  ],

  // Treatment - partial update (all fields optional)
  treatmentUpdate: [
    body('title').optional().isString().trim().isLength({ min: 1, max: 200 }).withMessage('Invalid title'),
    body('slug').optional().isString().trim().isLength({ min: 1, max: 100 }).matches(/^[a-z0-9-]+$/).withMessage('Invalid slug format'),
    body('status').optional().isIn(['draft', 'published']).withMessage('Status must be draft or published'),
    body('icon').optional().isString().trim().isLength({ max: 100 }),
    body('problems').optional().isArray(),
    body('problems.*').optional().isString().trim().isLength({ max: 300 }),
    body('benefits').optional().isArray(),
    body('benefits.*').optional().isString().trim().isLength({ max: 300 }),
    body('sections').optional().isObject(),
    body('sections.what').optional().isString().trim(),
    body('sections.who').optional().isString().trim(),
    body('sections.procedure').optional().isString().trim(),
    body('sections.pain').optional().isString().trim(),
    body('sections.recovery').optional().isString().trim(),
    body('sections.risks').optional().isString().trim(),
    body('sections.duration').optional().isString().trim(),
    body('sections.expectations').optional().isString().trim(),
    body('sections.whyDrEkta').optional().isString().trim(),
    body('faqs').optional().isArray(),
    body('faqs.*.question').optional().isString().trim().isLength({ max: 500 }),
    body('faqs.*.answer').optional().isString().trim(),
    body('faqs.*.order').optional().isInt({ min: 0 }),
    body('heroImage').optional().isMongoId().withMessage('Invalid heroImage ID'),
    body('gallery').optional().isArray(),
    body('gallery.*').optional().isMongoId().withMessage('Invalid gallery item ID'),
    body('relatedTreatments').optional().isArray(),
    body('relatedTreatments.*').optional().isMongoId().withMessage('Invalid related treatment ID'),
    body('seo').optional().isObject(),
    body('seo.metaTitle').optional().isString().trim().isLength({ max: 60 }),
    body('seo.metaDescription').optional().isString().trim().isLength({ max: 160 }),
    body('seo.ogImage').optional().isMongoId().withMessage('Invalid ogImage ID'),
    handleValidationErrors
  ],
  
  // Article
  article: [
    body('title').isString().trim().isLength({ min: 1, max: 200 }).withMessage('Title required'),
    body('slug').optional().isString().trim().isLength({ min: 1, max: 100 }).matches(/^[a-z0-9-]+$/).withMessage('Invalid slug format'),
    body('category').isIn([
      'preventive-care',
      'restorative',
      'cosmetic',
      'orthodontics',
      'oral-surgery',
      'pediatric',
      'emergency',
      'technology',
      'patient-education'
    ]).withMessage('Invalid category'),
    body('tags').optional().isArray(),
    body('tags.*').optional().isString().trim().toLowerCase(),
    body('body').isString().notEmpty().withMessage('Body content required'),
    body('author').isString().trim().isLength({ max: 100 }).withMessage('Author required'),
    body('reviewer').optional().isMongoId().withMessage('Invalid reviewer ID'),
    body('reviewedAt').optional().isISO8601().withMessage('Invalid reviewed date'),
    body('excerpt').optional().isString().trim().isLength({ max: 300 }).withMessage('Excerpt must be under 300 characters'),
    body('coverImage').optional().isMongoId().withMessage('Invalid cover image ID'),
    body('layout').optional().isIn(['standard', 'hero-feature', 'step-guide', 'faq', 'before-after', 'editorial', 'medical-guide', 'research', 'storytelling', 'step-by-step', 'health-guide', 'report-analysis', 'symptoms', 'clinical-deep-dive']).withMessage('Invalid layout'),
    body('abstract').optional().isString().trim().isLength({ max: 1000 }),
    body('audience').optional().isString().trim().isLength({ max: 500 }),
    body('preparation').optional().isString().trim().isLength({ max: 1000 }),
    body('keyFindings').optional().isArray({ max: 30 }),
    body('keyFindings.*').optional().isString().trim().isLength({ min: 1, max: 300 }),
    body('dos').optional().isArray({ max: 30 }),
    body('dos.*').optional().isString().trim().isLength({ min: 1, max: 200 }),
    body('donts').optional().isArray({ max: 30 }),
    body('donts.*').optional().isString().trim().isLength({ min: 1, max: 200 }),
    body('symptoms').optional().isArray({ max: 40 }),
    body('symptoms.*').optional().isString().trim().isLength({ min: 1, max: 200 }),
    body('causes').optional().isArray({ max: 40 }),
    body('causes.*').optional().isString().trim().isLength({ min: 1, max: 200 }),
    body('riskFactors').optional().isArray({ max: 40 }),
    body('riskFactors.*').optional().isString().trim().isLength({ min: 1, max: 200 }),
    body('warningSigns').optional().isArray({ max: 40 }),
    body('warningSigns.*').optional().isString().trim().isLength({ min: 1, max: 200 }),
    body('markers').optional().isArray({ max: 40 }),
    body('markers.*.name').optional().isString().trim().isLength({ min: 1, max: 120 }),
    body('markers.*.description').optional().isString().trim().isLength({ max: 1000 }),
    body('markers.*.unit').optional().isString().trim().isLength({ max: 60 }),
    body('markers.*.range').optional().isString().trim().isLength({ max: 200 }),
    body('markers.*.interpretation').optional().isString().trim().isLength({ max: 1000 }),
    body('markers.*.factors').optional().isString().trim().isLength({ max: 500 }),
    body('quickSummary').optional().isString().trim().isLength({ max: 1000 }),
    body('pullQuote').optional().isString().trim().isLength({ max: 500 }),
    body('warnings').optional().isArray({ max: 20 }),
    body('warnings.*').optional().isString().trim().isLength({ min: 1, max: 300 }),
    body('checklist').optional().isArray({ max: 30 }),
    body('checklist.*').optional().isString().trim().isLength({ min: 1, max: 200 }),
    body('pros').optional().isArray({ max: 20 }),
    body('pros.*').optional().isString().trim().isLength({ min: 1, max: 200 }),
    body('cons').optional().isArray({ max: 20 }),
    body('cons.*').optional().isString().trim().isLength({ min: 1, max: 200 }),
    body('whenToConsult').optional().isString().trim().isLength({ max: 1000 }),
    body('chartData').optional().isObject(),
    body('chartData.title').optional().isString().trim().isLength({ max: 120 }),
    body('chartData.labels').optional().isArray({ max: 24 }),
    body('chartData.labels.*').optional().isString().trim().isLength({ max: 60 }),
    body('chartData.values').optional().isArray({ max: 24 }),
    body('chartData.values.*').optional().isFloat(),
    body('galleryImages').optional().isArray({ max: 12 }),
    body('galleryImages.*').optional().isMongoId().withMessage('Invalid gallery image ID'),
    body('disclaimer').optional().isString().trim().isLength({ max: 1000 }),
    body('beforeImage').optional().isMongoId().withMessage('Invalid before image ID'),
    body('afterImage').optional().isMongoId().withMessage('Invalid after image ID'),
    body('keyPoints').optional().isArray({ max: 20 }).withMessage('Key points must be an array'),
    body('keyPoints.*').optional().isString().trim().isLength({ min: 1, max: 300 }),
    body('faqs').optional().isArray({ max: 30 }).withMessage('FAQs must be an array'),
    body('faqs.*.question').optional().isString().trim().isLength({ min: 1, max: 500 }),
    body('faqs.*.answer').optional().isString().trim().isLength({ min: 1 }),
    body('faqs.*.order').optional().isInt({ min: 0 }),
    body('ctaBox').optional().isObject(),
    body('ctaBox.title').optional().isString().trim().isLength({ max: 120 }),
    body('ctaBox.subtitle').optional().isString().trim().isLength({ max: 300 }),
    body('ctaBox.buttonLabel').optional().isString().trim().isLength({ max: 60 }),
    body('credentialsDisplay').optional().isString().trim().isLength({ max: 500 }),
    body('sources').optional().isArray(),
    body('sources.*.title').optional().isString().trim(),
    body('sources.*.url').optional().isURL(),
    body('sources.*.authors').optional().isString().trim(),
    body('sources.*.publishedDate').optional().isISO8601(),
    body('status').optional().isIn(['draft', 'published']).withMessage('Status must be draft or published'),
    body('seo').optional().isObject(),
    body('seo.metaTitle').optional().isString().trim().isLength({ max: 60 }),
    body('seo.metaDescription').optional().isString().trim().isLength({ max: 160 }),
    body('seo.ogImage').optional().isMongoId().withMessage('Invalid ogImage ID'),
    handleValidationErrors
  ],

  // Article - partial update (all fields optional)
  articleUpdate: [
    body('title').optional().isString().trim().isLength({ min: 1, max: 200 }).withMessage('Invalid title'),
    body('slug').optional().isString().trim().isLength({ min: 1, max: 100 }).matches(/^[a-z0-9-]+$/).withMessage('Invalid slug format'),
    body('category').optional().isIn([
      'preventive-care',
      'restorative',
      'cosmetic',
      'orthodontics',
      'oral-surgery',
      'pediatric',
      'emergency',
      'technology',
      'patient-education'
    ]).withMessage('Invalid category'),
    body('tags').optional().isArray(),
    body('tags.*').optional().isString().trim().toLowerCase(),
    body('body').optional().isString().notEmpty().withMessage('Invalid body content'),
    body('author').optional().isString().trim().isLength({ min: 1, max: 100 }).withMessage('Invalid author'),
    body('reviewer').optional().isMongoId().withMessage('Invalid reviewer ID'),
    body('reviewedAt').optional().isISO8601().withMessage('Invalid reviewed date'),
    body('excerpt').optional().isString().trim().isLength({ max: 300 }).withMessage('Excerpt must be under 300 characters'),
    body('coverImage').optional().isMongoId().withMessage('Invalid cover image ID'),
    body('layout').optional().isIn(['standard', 'hero-feature', 'step-guide', 'faq', 'before-after', 'editorial', 'medical-guide', 'research', 'storytelling', 'step-by-step', 'health-guide', 'report-analysis', 'symptoms', 'clinical-deep-dive']).withMessage('Invalid layout'),
    body('abstract').optional().isString().trim().isLength({ max: 1000 }),
    body('audience').optional().isString().trim().isLength({ max: 500 }),
    body('preparation').optional().isString().trim().isLength({ max: 1000 }),
    body('keyFindings').optional().isArray({ max: 30 }),
    body('keyFindings.*').optional().isString().trim().isLength({ min: 1, max: 300 }),
    body('dos').optional().isArray({ max: 30 }),
    body('dos.*').optional().isString().trim().isLength({ min: 1, max: 200 }),
    body('donts').optional().isArray({ max: 30 }),
    body('donts.*').optional().isString().trim().isLength({ min: 1, max: 200 }),
    body('symptoms').optional().isArray({ max: 40 }),
    body('symptoms.*').optional().isString().trim().isLength({ min: 1, max: 200 }),
    body('causes').optional().isArray({ max: 40 }),
    body('causes.*').optional().isString().trim().isLength({ min: 1, max: 200 }),
    body('riskFactors').optional().isArray({ max: 40 }),
    body('riskFactors.*').optional().isString().trim().isLength({ min: 1, max: 200 }),
    body('warningSigns').optional().isArray({ max: 40 }),
    body('warningSigns.*').optional().isString().trim().isLength({ min: 1, max: 200 }),
    body('markers').optional().isArray({ max: 40 }),
    body('markers.*.name').optional().isString().trim().isLength({ min: 1, max: 120 }),
    body('markers.*.description').optional().isString().trim().isLength({ max: 1000 }),
    body('markers.*.unit').optional().isString().trim().isLength({ max: 60 }),
    body('markers.*.range').optional().isString().trim().isLength({ max: 200 }),
    body('markers.*.interpretation').optional().isString().trim().isLength({ max: 1000 }),
    body('markers.*.factors').optional().isString().trim().isLength({ max: 500 }),
    body('quickSummary').optional().isString().trim().isLength({ max: 1000 }),
    body('pullQuote').optional().isString().trim().isLength({ max: 500 }),
    body('warnings').optional().isArray({ max: 20 }),
    body('warnings.*').optional().isString().trim().isLength({ min: 1, max: 300 }),
    body('checklist').optional().isArray({ max: 30 }),
    body('checklist.*').optional().isString().trim().isLength({ min: 1, max: 200 }),
    body('pros').optional().isArray({ max: 20 }),
    body('pros.*').optional().isString().trim().isLength({ min: 1, max: 200 }),
    body('cons').optional().isArray({ max: 20 }),
    body('cons.*').optional().isString().trim().isLength({ min: 1, max: 200 }),
    body('whenToConsult').optional().isString().trim().isLength({ max: 1000 }),
    body('chartData').optional().isObject(),
    body('chartData.title').optional().isString().trim().isLength({ max: 120 }),
    body('chartData.labels').optional().isArray({ max: 24 }),
    body('chartData.labels.*').optional().isString().trim().isLength({ max: 60 }),
    body('chartData.values').optional().isArray({ max: 24 }),
    body('chartData.values.*').optional().isFloat(),
    body('galleryImages').optional().isArray({ max: 12 }),
    body('galleryImages.*').optional().isMongoId().withMessage('Invalid gallery image ID'),
    body('disclaimer').optional().isString().trim().isLength({ max: 1000 }),
    body('beforeImage').optional().isMongoId().withMessage('Invalid before image ID'),
    body('afterImage').optional().isMongoId().withMessage('Invalid after image ID'),
    body('keyPoints').optional().isArray({ max: 20 }).withMessage('Key points must be an array'),
    body('keyPoints.*').optional().isString().trim().isLength({ min: 1, max: 300 }),
    body('faqs').optional().isArray({ max: 30 }).withMessage('FAQs must be an array'),
    body('faqs.*.question').optional().isString().trim().isLength({ min: 1, max: 500 }),
    body('faqs.*.answer').optional().isString().trim().isLength({ min: 1 }),
    body('faqs.*.order').optional().isInt({ min: 0 }),
    body('ctaBox').optional().isObject(),
    body('ctaBox.title').optional().isString().trim().isLength({ max: 120 }),
    body('ctaBox.subtitle').optional().isString().trim().isLength({ max: 300 }),
    body('ctaBox.buttonLabel').optional().isString().trim().isLength({ max: 60 }),
    body('credentialsDisplay').optional().isString().trim().isLength({ max: 500 }),
    body('sources').optional().isArray(),
    body('sources.*.title').optional().isString().trim(),
    body('sources.*.url').optional().isURL(),
    body('sources.*.authors').optional().isString().trim(),
    body('sources.*.publishedDate').optional().isISO8601(),
    body('status').optional().isIn(['draft', 'published']).withMessage('Status must be draft or published'),
    body('seo').optional().isObject(),
    body('seo.metaTitle').optional().isString().trim().isLength({ max: 60 }),
    body('seo.metaDescription').optional().isString().trim().isLength({ max: 160 }),
    body('seo.ogImage').optional().isMongoId().withMessage('Invalid ogImage ID'),
    handleValidationErrors
  ],
  
  // Team member (single-admin draft/published - R3)
  team: [
    body('name').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Name required'),
    body('slug').optional().isString().trim().isLength({ min: 1, max: 100 }).matches(/^[a-z0-9-]+$/).withMessage('Invalid slug format'),
    body('role').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Role required'),
    body('category').isIn([
      'general',
      'orthodontics',
      'endodontics',
      'oral-surgery',
      'periodontics',
      'implantology',
      'prosthodontics',
      'cosmetic',
      'pediatric'
    ]).withMessage('Invalid category'),
    body('photo').optional({ nullable: true }).isMongoId().withMessage('Invalid photo ID'),
    body('bio').optional().isString().trim(),
    body('qualifications').optional().isArray(),
    body('qualifications.*.degree').optional().isString().trim().isLength({ max: 200 }),
    body('qualifications.*.institution').optional().isString().trim().isLength({ max: 200 }),
    body('qualifications.*.year').optional().isInt({ min: 1950, max: 2100 }),
    body('experienceYears').optional({ nullable: true }).isInt({ min: 0, max: 80 }),
    body('layout').optional().isIn(['classic-profile', 'sanctuary-editorial', 'compact-card', 'timeline', 'gallery-spotlight']).withMessage('Invalid layout'),
    body('languages').optional().isArray({ max: 20 }).withMessage('Languages must be an array'),
    body('languages.*').optional().isString().trim().isLength({ min: 1, max: 50 }),
    body('consultationFee').optional({ nullable: true }).isFloat({ min: 0, max: 1000000 }).withMessage('Invalid consultation fee'),
    body('location').optional().isString().trim().isLength({ max: 200 }),
    body('services').optional().isArray({ max: 30 }).withMessage('Services must be an array'),
    body('services.*').optional().isString().trim().isLength({ min: 1, max: 100 }),
    body('reviews').optional().isArray({ max: 30 }).withMessage('Reviews must be an array'),
    body('reviews.*.patientName').optional().isString().trim().isLength({ min: 1, max: 100 }),
    body('reviews.*.rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('reviews.*.text').optional().isString().trim().isLength({ min: 1, max: 1000 }),
    body('order').optional().isInt(),
    body('status').optional().isIn(['draft', 'published']).withMessage('Status must be draft or published'),
    handleValidationErrors
  ],

  // Team member - partial update (all fields optional)
  teamUpdate: [
    body('name').optional().isString().trim().isLength({ min: 1, max: 100 }).withMessage('Invalid name'),
    body('slug').optional().isString().trim().isLength({ min: 1, max: 100 }).matches(/^[a-z0-9-]+$/).withMessage('Invalid slug format'),
    body('role').optional().isString().trim().isLength({ min: 1, max: 100 }).withMessage('Invalid role'),
    body('category').optional().isIn([
      'general',
      'orthodontics',
      'endodontics',
      'oral-surgery',
      'periodontics',
      'implantology',
      'prosthodontics',
      'cosmetic',
      'pediatric'
    ]).withMessage('Invalid category'),
    body('photo').optional({ nullable: true }).isMongoId().withMessage('Invalid photo ID'),
    body('bio').optional().isString().trim(),
    body('qualifications').optional().isArray(),
    body('qualifications.*.degree').optional().isString().trim().isLength({ max: 200 }),
    body('qualifications.*.institution').optional().isString().trim().isLength({ max: 200 }),
    body('qualifications.*.year').optional().isInt({ min: 1950, max: 2100 }),
    body('experienceYears').optional({ nullable: true }).isInt({ min: 0, max: 80 }),
    body('layout').optional().isIn(['classic-profile', 'sanctuary-editorial', 'compact-card', 'timeline', 'gallery-spotlight']).withMessage('Invalid layout'),
    body('languages').optional().isArray({ max: 20 }).withMessage('Languages must be an array'),
    body('languages.*').optional().isString().trim().isLength({ min: 1, max: 50 }),
    body('consultationFee').optional({ nullable: true }).isFloat({ min: 0, max: 1000000 }).withMessage('Invalid consultation fee'),
    body('location').optional().isString().trim().isLength({ max: 200 }),
    body('services').optional().isArray({ max: 30 }).withMessage('Services must be an array'),
    body('services.*').optional().isString().trim().isLength({ min: 1, max: 100 }),
    body('reviews').optional().isArray({ max: 30 }).withMessage('Reviews must be an array'),
    body('reviews.*.patientName').optional().isString().trim().isLength({ min: 1, max: 100 }),
    body('reviews.*.rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('reviews.*.text').optional().isString().trim().isLength({ min: 1, max: 1000 }),
    body('order').optional().isInt(),
    body('status').optional().isIn(['draft', 'published']).withMessage('Status must be draft or published'),
    handleValidationErrors
  ],

  // ObjectId param
  objectId: (paramName = 'id') => [
    param(paramName).isMongoId().withMessage('Invalid ID format'),
    handleValidationErrors
  ],

  // Public Enquiry
  publicEnquiry: [
    body('name').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Name required'),
    body('phone').isString().trim().isLength({ min: 10, max: 20 }).matches(/^[\d\s\-\+\(\)]{10,20}$/).withMessage('Valid phone required'),
    body('treatmentInterest').optional().isMongoId().withMessage('Invalid treatment ID'),
    body('honeypot').optional().isString(),
    body('captchaToken').optional().isString(),
    handleValidationErrors
  ],

  // Profile
  profile: [
    body('qualifications').optional().isArray(),
    body('qualifications.*.degree').optional().isString().trim().isLength({ max: 200 }),
    body('qualifications.*.institution').optional().isString().trim().isLength({ max: 200 }),
    body('qualifications.*.year').optional().isInt({ min: 1950, max: 2030 }),
    body('memberships').optional().isArray(),
    body('memberships.*.organization').optional().isString().trim().isLength({ max: 200 }),
    body('memberships.*.role').optional().isString().trim().isLength({ max: 100 }),
    body('memberships.*.since').optional().isInt({ min: 1950, max: 2030 }),
    body('awards').optional().isArray(),
    body('awards.*.title').optional().isString().trim().isLength({ max: 200 }),
    body('awards.*.issuer').optional().isString().trim().isLength({ max: 200 }),
    body('awards.*.year').optional().isInt({ min: 1950, max: 2030 }),
    body('mediaAppearances').optional().isArray(),
    body('mediaAppearances.*.outlet').optional().isString().trim().isLength({ max: 200 }),
    body('mediaAppearances.*.title').optional().isString().trim().isLength({ max: 200 }),
    body('mediaAppearances.*.date').optional().isISO8601(),
    body('mediaAppearances.*.url').optional().isURL(),
    body('publications').optional().isArray(),
    body('publications.*.title').optional().isString().trim().isLength({ max: 300 }),
    body('publications.*.journal').optional().isString().trim().isLength({ max: 200 }),
    body('publications.*.year').optional().isInt({ min: 1950, max: 2030 }),
    body('publications.*.url').optional().isURL(),
    body('photo').optional().isMongoId().withMessage('Invalid photo MediaAsset ID'),
    body('video').optional().isMongoId().withMessage('Invalid video MediaAsset ID'),
    body('bio').optional().isString().trim(),
    body('locationId').optional().isMongoId().withMessage('Invalid location ID'),
    handleValidationErrors
  ],

  // Testimonial (single admin, no consent - R1)
  testimonial: [
    body('patientDisplayName').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Patient display name required'),
    body('treatmentTag').optional().isMongoId().withMessage('Invalid treatment ID'),
    body('type').optional().isIn(['text', 'video', 'audio', 'image']).withMessage('Invalid type'),
    body('content').isString().trim().notEmpty().withMessage('Content required'),
    body('status').optional().isIn(['draft', 'published']).withMessage('Status must be draft or published'),
    handleValidationErrors
  ],

  // Testimonial - partial update (all fields optional)
  testimonialUpdate: [
    body('patientDisplayName').optional().isString().trim().isLength({ min: 1, max: 100 }).withMessage('Invalid patient display name'),
    body('treatmentTag').optional().isMongoId().withMessage('Invalid treatment ID'),
    body('type').optional().isIn(['text', 'video', 'audio', 'image']).withMessage('Invalid type'),
    body('content').optional().isString().trim().notEmpty().withMessage('Invalid content'),
    body('status').optional().isIn(['draft', 'published']).withMessage('Status must be draft or published'),
    handleValidationErrors
  ],

  // GalleryItem (single admin, no consent - R1)
  galleryItem: [
    body('beforeImg').isMongoId().withMessage('Before image (MediaAsset) required'),
    body('afterImg').isMongoId().withMessage('After image (MediaAsset) required'),
    body('treatmentTag').optional().isMongoId().withMessage('Invalid treatment ID'),
    body('content').optional().isString().trim(),
    body('status').optional().isIn(['draft', 'published']).withMessage('Status must be draft or published'),
    handleValidationErrors
  ],

  // GalleryItem - partial update (all fields optional)
  galleryItemUpdate: [
    body('beforeImg').optional().isMongoId().withMessage('Invalid before image ID'),
    body('afterImg').optional().isMongoId().withMessage('Invalid after image ID'),
    body('treatmentTag').optional().isMongoId().withMessage('Invalid treatment ID'),
    body('content').optional().isString().trim(),
    body('status').optional().isIn(['draft', 'published']).withMessage('Status must be draft or published'),
    handleValidationErrors
  ],

  // Video
  video: [
    body('url').isURL().withMessage('Valid YouTube URL required'),
    body('title').isString().trim().isLength({ min: 1, max: 200 }).withMessage('Title required'),
    body('category').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Category required'),
    body('thumbnail').optional().isURL().withMessage('Valid thumbnail URL'),
    body('order').optional().isInt({ min: 0 }),
    body('status').optional().isIn(['published', 'hidden']).withMessage('Invalid status'),
    body('transcript').optional().isString().trim(),
    body('captionsUrl').optional().isMongoId().withMessage('Invalid captions MediaAsset ID'),
    handleValidationErrors
  ],

  // Video - partial update (all fields optional)
  videoUpdate: [
    body('url').optional().isURL().withMessage('Valid YouTube URL required'),
    body('title').optional().isString().trim().isLength({ min: 1, max: 200 }).withMessage('Invalid title'),
    body('category').optional().isString().trim().isLength({ min: 1, max: 100 }).withMessage('Invalid category'),
    body('thumbnail').optional().isURL().withMessage('Valid thumbnail URL'),
    body('order').optional().isInt({ min: 0 }),
    body('status').optional().isIn(['published', 'hidden']).withMessage('Invalid status'),
    body('transcript').optional().isString().trim(),
    body('captionsUrl').optional().isMongoId().withMessage('Invalid captions MediaAsset ID'),
    handleValidationErrors
  ],

  // CuratedPost (Instagram)
  curatedPost: [
    body('image').isMongoId().withMessage('Image (MediaAsset) required'),
    body('caption').optional().isString().trim(),
    body('permalink').isURL().withMessage('Valid permalink URL required'),
    body('order').optional().isInt({ min: 0 }),
    handleValidationErrors
  ],

  // CuratedPost (Instagram) - Update (all fields optional)
  curatedPostUpdate: [
    body('image').optional().isMongoId().withMessage('Invalid MediaAsset ID'),
    body('caption').optional().isString().trim(),
    body('permalink').optional().isURL().withMessage('Valid permalink URL required'),
    body('order').optional().isInt({ min: 0 }),
    handleValidationErrors
  ],

  // Announcement
  announcement: [
    body('title').isString().trim().isLength({ min: 1, max: 200 }).withMessage('Title required'),
    body('body').isString().trim().notEmpty().withMessage('Body required'),
    body('linkUrl').optional().isURL().withMessage('Valid link URL required'),
    body('status').optional().isIn(['draft', 'published']).withMessage('Status must be draft or published'),
    body('order').optional().isInt({ min: 0 }),
    body('locationId').optional().isMongoId().withMessage('Invalid location ID'),
    handleValidationErrors
  ],

  // Announcement - partial update (all fields optional)
  announcementUpdate: [
    body('title').optional().isString().trim().isLength({ min: 1, max: 200 }).withMessage('Invalid title'),
    body('body').optional().isString().trim().notEmpty().withMessage('Invalid body'),
    body('linkUrl').optional().isURL().withMessage('Valid link URL required'),
    body('status').optional().isIn(['draft', 'published']).withMessage('Status must be draft or published'),
    body('order').optional().isInt({ min: 0 }),
    body('locationId').optional().isMongoId().withMessage('Invalid location ID'),
    handleValidationErrors
  ],

  // Redirect
  redirect: [
    body('fromPath').isString().trim().isLength({ min: 1, max: 200 }).withMessage('fromPath required'),
    body('toPath').isString().trim().isLength({ min: 1, max: 500 }).withMessage('toPath required'),
    body('statusCode').optional().custom((v) => [301, 302, '301', '302'].includes(v)).withMessage('statusCode must be 301 or 302'),
    handleValidationErrors
  ],

  // Redirect - partial update (fromPath immutable)
  redirectUpdate: [
    body('toPath').optional().isString().trim().isLength({ min: 1, max: 500 }).withMessage('Invalid toPath'),
    body('statusCode').optional().custom((v) => [301, 302, '301', '302'].includes(v)).withMessage('statusCode must be 301 or 302'),
    handleValidationErrors
  ],

  // Homepage config - featured entity ID lists
  homepageConfig: [
    body('featuredTreatments').optional().isArray(),
    body('featuredTreatments.*').optional().isMongoId().withMessage('Invalid treatment ID'),
    body('featuredArticles').optional().isArray(),
    body('featuredArticles.*').optional().isMongoId().withMessage('Invalid article ID'),
    body('featuredVideos').optional().isArray(),
    body('featuredVideos.*').optional().isMongoId().withMessage('Invalid video ID'),
    body('featuredTestimonials').optional().isArray(),
    body('featuredTestimonials.*').optional().isMongoId().withMessage('Invalid testimonial ID'),
    handleValidationErrors
  ],

  // Booking provider config
  bookingProvider: [
    body('providerName').optional().isIn(['practo']).withMessage('Invalid provider'),
    body('profileUrl').optional().isURL().withMessage('Valid profile URL required'),
    body('bookingUrl').optional().isURL().withMessage('Valid booking URL required'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
    handleValidationErrors
  ],

  // Lead - admin update (name/phone/source immutable)
  leadUpdate: [
    body('leadStatus').optional().isIn(['new', 'contacted', 'scheduled', 'completed', 'lost']).withMessage('Invalid lead status'),
    body('appointmentStatus').optional().isIn(['none', 'booked', 'completed', 'cancelled', 'no_show']).withMessage('Invalid appointment status'),
    body('notes').optional().isString().trim().isLength({ max: 1000 }),
    body('treatmentInterest').optional().isMongoId().withMessage('Invalid treatment ID'),
    handleValidationErrors
  ]
};

module.exports = {
  handleValidationErrors,
  sanitizeRichText,
  sanitizeKeys,
  sanitizeBodyKeys,
  validators
};