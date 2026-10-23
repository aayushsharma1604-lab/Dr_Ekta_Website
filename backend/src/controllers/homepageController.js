/**
 * Homepage controller - Read-aggregation layer for homepage content
 * Resolves featured/auto-selected items from Treatment, Article, Video, Testimonial
 * Cache invalidates explicitly on any underlying change
 */
const { asyncHandler } = require('../middlewares/errorHandler.middleware');
const { Treatment, Article, Video, Testimonial, HomepageConfig } = require('../models');

/**
 * GET /api/public/home - Homepage content aggregate
 */
const getHomepage = asyncHandler(async (req, res) => {
  // Get featured/pinned items from HomepageConfig if exists
  const config = await HomepageConfig.getSingleton();
  
  // Fetch latest published content from each type
  const [treatments, articles, videos, testimonials] = await Promise.all([
    // Treatments: featured first, then latest
    Treatment.getPublished({ limit: 6 }),
    // Articles: featured first, then latest
    Article.getPublished({ limit: 4 }),
    // Videos: featured first, then latest
    Video.getPublished({ limit: 4 }),
    // Testimonials: featured first, then latest
    Testimonial.getPublished({ limit: 3 })
  ]);
  
  // If config has featured IDs, prioritize those
  let featuredTreatments = [];
  let featuredArticles = [];
  let featuredVideos = [];
  let featuredTestimonials = [];
  
  if (config.featuredTreatments && config.featuredTreatments.length > 0) {
    const featured = await Treatment.find({
      _id: { $in: config.featuredTreatments },
      status: 'published'
    }).populate('heroImage');
    featuredTreatments = featured;
  }
  
  if (config.featuredArticles && config.featuredArticles.length > 0) {
    const featured = await Article.find({
      _id: { $in: config.featuredArticles },
      status: 'published'
    }).populate('seo.ogImage');
    featuredArticles = featured;
  }
  
  if (config.featuredVideos && config.featuredVideos.length > 0) {
    const featured = await Video.find({
      _id: { $in: config.featuredVideos },
      status: 'published'
    }).populate('captionsUrl');
    featuredVideos = featured;
  }
  
  if (config.featuredTestimonials && config.featuredTestimonials.length > 0) {
    const featured = await Testimonial.find({
      _id: { $in: config.featuredTestimonials },
      status: 'published'
    }).populate('treatmentTag', 'title slug');
    featuredTestimonials = featured;
  }
  
  // Combine featured + auto (excluding duplicates)
  const featuredTreatmentIds = featuredTreatments.map(t => t._id.toString());
  const autoTreatments = treatments.items.filter(t => !featuredTreatmentIds.includes(t._id.toString()));
  
  const featuredArticleIds = featuredArticles.map(a => a._id.toString());
  const autoArticles = articles.items.filter(a => !featuredArticleIds.includes(a._id.toString()));
  
  const featuredVideoIds = featuredVideos.map(v => v._id.toString());
  const autoVideos = videos.items.filter(v => !featuredVideoIds.includes(v._id.toString()));
  
  const featuredTestimonialIds = featuredTestimonials.map(t => t._id.toString());
  const autoTestimonials = testimonials.items.filter(t => !featuredTestimonialIds.includes(t._id.toString()));
  
  res.json({
    treatments: [...featuredTreatments, ...autoTreatments].slice(0, 6),
    articles: [...featuredArticles, ...autoArticles].slice(0, 4),
    videos: [...featuredVideos, ...autoVideos].slice(0, 4),
    testimonials: [...featuredTestimonials, ...autoTestimonials].slice(0, 3)
  });
});

/**
 * GET /api/admin/home-config - Get homepage config
 */
const getHomepageConfig = asyncHandler(async (req, res) => {
  const config = await HomepageConfig.getSingleton();
  res.json(config);
});

/**
 * PUT /api/admin/home-config - Update homepage config
 */
const updateHomepageConfig = asyncHandler(async (req, res) => {
  const config = await HomepageConfig.updateSingleton(req.body);
  res.json(config);
});

module.exports = {
  getHomepage,
  getHomepageConfig,
  updateHomepageConfig
};