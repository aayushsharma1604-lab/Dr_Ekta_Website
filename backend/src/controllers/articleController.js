/**
 * Article controller - Handles Knowledge Centre endpoints
 * Single-admin draft/published model (R3): status is set directly, no review workflow
 */
const { asyncHandler, NotFoundError } = require('../middlewares/errorHandler.middleware');
const { sanitizeRichText } = require('../middlewares/validate.middleware');
const { Article } = require('../models');

// Fields the single admin may set (mass-assignment guard - F3)
const WRITABLE_FIELDS = [
  'title', 'slug', 'category', 'tags', 'body', 'excerpt', 'author',
  'reviewer', 'reviewedAt', 'credentialsDisplay', 'sources', 'status',
  'seo', 'locationId', 'coverImage', 'layout', 'beforeImage', 'afterImage',
  'keyPoints', 'faqs', 'ctaBox', 'quickSummary', 'pullQuote', 'warnings',
  'checklist', 'pros', 'cons', 'whenToConsult', 'chartData', 'galleryImages',
  'disclaimer', 'abstract', 'audience', 'preparation', 'keyFindings',
  'dos', 'donts', 'symptoms', 'causes', 'riskFactors', 'warningSigns', 'markers'
];

/**
 * Sanitize the rich-text article body with the shared allowlist (XSS guard - F7)
 * @param {Object} data - Article write payload (mutated)
 */
function sanitizeArticleFields(data) {
  if (typeof data.body === 'string') {
    data.body = sanitizeRichText(data.body);
  }
  for (const key of ['excerpt', 'quickSummary', 'pullQuote', 'whenToConsult', 'disclaimer', 'abstract', 'audience', 'preparation']) {
    if (typeof data[key] === 'string') {
      data[key] = sanitizeRichText(data[key]);
    }
  }
  for (const key of ['keyPoints', 'warnings', 'checklist', 'pros', 'cons', 'symptoms', 'causes', 'riskFactors', 'warningSigns', 'dos', 'donts', 'keyFindings']) {
    if (Array.isArray(data[key])) {
      data[key] = data[key].filter((v) => typeof v === 'string').map((v) => sanitizeRichText(v));
    }
  }
  if (data.chartData && typeof data.chartData === 'object' && typeof data.chartData.title === 'string') {
    data.chartData.title = sanitizeRichText(data.chartData.title);
  }
  if (Array.isArray(data.markers)) {
    data.markers = data.markers
      .filter((m) => m && typeof m === 'object')
      .map((m) => {
        const out = { ...m };
        for (const key of ['name', 'description', 'unit', 'range', 'interpretation', 'factors']) {
          if (typeof out[key] === 'string') out[key] = sanitizeRichText(out[key]);
        }
        return out;
      });
  }
  if (data.ctaBox && typeof data.ctaBox === 'object') {
    for (const key of ['title', 'subtitle', 'buttonLabel']) {
      if (typeof data.ctaBox[key] === 'string') {
        data.ctaBox[key] = sanitizeRichText(data.ctaBox[key]);
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
 * GET /api/public/articles - List published articles
 */
const getPublishedArticles = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, tags, search } = req.query;

    const tagArray = tags ? (Array.isArray(tags) ? tags : [tags]) : [];

    const result = await Article.getPublished({
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      tags: tagArray,
      search
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/public/articles/:slug - Get published article by slug
 */
const getPublishedArticle = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;

  const article = await Article.getBySlug(slug);
  if (!article) {
    throw new NotFoundError('Article not found');
  }

  res.json(article);
});

/**
 * GET /api/admin/articles - List all articles (admin)
 */
const getAllArticles = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, category, search } = req.query;

    const result = await Article.getAllForAdmin({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      category,
      search
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/articles/:id - Get article by ID (admin)
 */
const getArticleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id)
      .populate('reviewer', 'name email')
      .populate('seo.ogImage');

    if (!article) {
      throw new NotFoundError('Article not found');
    }

    res.json(article);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/articles - Create new article (draft or published)
 */
const createArticle = async (req, res, next) => {
  try {
    const articleData = pickWritable(req.body);
    sanitizeArticleFields(articleData);

    const article = await Article.create(articleData);
    Article.stampPublishedAt(article);
    if (article.isModified('publishedAt')) {
      await article.save();
    }

    res.status(201).json(article);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/articles/:id - Update article (status set directly)
 */
const updateArticle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);
    if (!article) {
      throw new NotFoundError('Article not found');
    }

    const updateData = pickWritable(req.body);
    sanitizeArticleFields(updateData);

    Object.assign(article, updateData);
    Article.stampPublishedAt(article);
    await article.save();

    res.json(article);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/articles/:id - Delete article
 */
const deleteArticle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);
    if (!article) {
      throw new NotFoundError('Article not found');
    }

    await article.deleteOne();

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublishedArticles,
  getPublishedArticle,
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle
};
