/**
 * CuratedPost controller - Instagram posts
 */
const { asyncHandler } = require('../middlewares/errorHandler.middleware');
const { validators } = require('../middlewares/validate.middleware');
const { AppError, NotFoundError } = require('../middlewares/errorHandler.middleware');
const { CuratedPost, MediaAsset } = require('../models');

/**
 * GET /api/public/instagram-posts - Public curated posts
 */
const getPublicCuratedPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await CuratedPost.getPublished({
    page: parseInt(page),
    limit: parseInt(limit)
  });
  res.json(result);
});

/**
 * GET /api/admin/instagram-posts - All curated posts (admin)
 */
const getAdminCuratedPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await CuratedPost.getAllForAdmin({
    page: parseInt(page),
    limit: parseInt(limit)
  });
  res.json(result);
});

/**
 * GET /api/admin/instagram-posts/:id - Single curated post (admin)
 */
const getCuratedPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await CuratedPost.findById(id).populate('image');
  
  if (!post) {
    throw new NotFoundError('Instagram post not found');
  }
  
  res.json(post);
});

/**
 * POST /api/admin/instagram-posts - Create curated post (admin)
 */
const createCuratedPost = asyncHandler(async (req, res) => {
  const post = await CuratedPost.create({
    ...req.body,
    createdBy: req.user._id
  });
  
  res.status(201).json(post);
});

/**
 * PUT /api/admin/instagram-posts/:id - Update curated post (admin)
 */
const updateCuratedPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await CuratedPost.findById(id);
  
  if (!post) {
    throw new NotFoundError('Instagram post not found');
  }
  
  const allowedFields = ['image', 'caption', 'permalink', 'order'];
  
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      post[field] = req.body[field];
    }
  }
  
  const updated = await post.save();
  
  res.json(updated);
});

/**
 * DELETE /api/admin/instagram-posts/:id - Delete curated post (admin)
 */
const deleteCuratedPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await CuratedPost.findById(id);
  
  if (!post) {
    throw new NotFoundError('Instagram post not found');
  }
  
  await post.deleteOne();
  
  res.json({ message: 'Instagram post deleted successfully' });
});

module.exports = {
  getPublicCuratedPosts: [
    validators.pagination,
    getPublicCuratedPosts
  ],
  getAdminCuratedPosts,
  getCuratedPost: [
    validators.objectId(),
    getCuratedPost
  ],
  createCuratedPost: [
    validators.curatedPost,
    createCuratedPost
  ],
  updateCuratedPost: [
    validators.objectId(),
    validators.curatedPostUpdate,
    updateCuratedPost
  ],
  deleteCuratedPost: [
    validators.objectId(),
    deleteCuratedPost
  ]
};