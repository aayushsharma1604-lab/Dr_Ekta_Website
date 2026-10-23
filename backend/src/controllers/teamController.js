/**
 * Team controller - Handles "Our Team" doctor endpoints
 * Single-admin draft/published model (R3): status is set directly, no review workflow
 */
const { asyncHandler, NotFoundError } = require('../middlewares/errorHandler.middleware');
const { sanitizeRichText } = require('../middlewares/validate.middleware');
const { TeamMember } = require('../models');

// Fields the single admin may set (mass-assignment guard - F3)
const WRITABLE_FIELDS = [
  'name', 'slug', 'role', 'category', 'photo', 'bio',
  'qualifications', 'experienceYears', 'order', 'status', 'locationId',
  'layout', 'languages', 'consultationFee', 'location', 'services', 'reviews'
];

/**
 * Sanitize the free-text bio with the shared allowlist (XSS guard - F7)
 * @param {Object} data - Team write payload (mutated)
 */
function sanitizeTeamFields(data) {
  if (typeof data.bio === 'string') {
    data.bio = sanitizeRichText(data.bio);
  }
  if (Array.isArray(data.reviews)) {
    data.reviews = data.reviews
      .filter((r) => r && typeof r === 'object')
      .map((r) => {
        const out = { ...r };
        if (typeof out.patientName === 'string') out.patientName = sanitizeRichText(out.patientName);
        if (typeof out.text === 'string') out.text = sanitizeRichText(out.text);
        return out;
      });
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
 * GET /api/public/team - List published team members
 */
const getPublishedTeam = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;

    const result = await TeamMember.getPublished({
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      search
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/public/team/:slug - Get published team member by slug
 */
const getPublishedTeamMember = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;

  const member = await TeamMember.getBySlug(slug);
  if (!member) {
    throw new NotFoundError('Team member not found');
  }

  res.json(member);
});

/**
 * GET /api/admin/team - List all team members (admin)
 */
const getAllTeam = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, category, search } = req.query;

    const result = await TeamMember.getAllForAdmin({
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
 * GET /api/admin/team/:id - Get team member by ID (admin)
 */
const getTeamMemberById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const member = await TeamMember.findById(id).populate('photo');

    if (!member) {
      throw new NotFoundError('Team member not found');
    }

    res.json(member);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/team - Create new team member (draft or published)
 */
const createTeamMember = async (req, res, next) => {
  try {
    const memberData = pickWritable(req.body);
    sanitizeTeamFields(memberData);

    const member = await TeamMember.create(memberData);
    TeamMember.stampPublishedAt(member);
    if (member.isModified('publishedAt')) {
      await member.save();
    }

    res.status(201).json(member);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/team/:id - Update team member (status set directly)
 */
const updateTeamMember = async (req, res, next) => {
  try {
    const { id } = req.params;

    const member = await TeamMember.findById(id);
    if (!member) {
      throw new NotFoundError('Team member not found');
    }

    const updateData = pickWritable(req.body);
    sanitizeTeamFields(updateData);

    Object.assign(member, updateData);
    TeamMember.stampPublishedAt(member);
    await member.save();

    res.json(member);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/team/:id - Delete team member
 */
const deleteTeamMember = async (req, res, next) => {
  try {
    const { id } = req.params;

    const member = await TeamMember.findById(id);
    if (!member) {
      throw new NotFoundError('Team member not found');
    }

    await member.deleteOne();

    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublishedTeam,
  getPublishedTeamMember,
  getAllTeam,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember
};
