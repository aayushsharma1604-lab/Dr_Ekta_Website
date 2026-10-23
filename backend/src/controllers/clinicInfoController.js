/**
 * ClinicInfo controller - Handles clinic singleton endpoints
 * Public read, admin write (allowlisted in service)
 */
const { asyncHandler } = require('../middlewares/errorHandler.middleware');
const { validators } = require('../middlewares/validate.middleware');
const clinicInfoService = require('../services/clinicInfoService');

/**
 * GET /api/public/clinic-info
 * Public endpoint for clinic info (cached)
 */
const getPublicClinicInfo = asyncHandler(async (req, res) => {
  const clinic = await clinicInfoService.getClinicInfo();
  
  // Set cache headers - ClinicInfo changes infrequently
  res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  res.set('ETag', `"${clinic.updatedAt.getTime()}"`);
  
  res.json(clinic);
});

/**
 * GET /api/admin/clinic-info
 * Admin endpoint for clinic info (no cache)
 */
const getAdminClinicInfo = asyncHandler(async (req, res) => {
  const clinic = await clinicInfoService.getClinicInfoAdmin();
  res.json(clinic);
});

/**
 * PUT /api/admin/clinic-info
 * Update clinic info (allowlisted in service)
 */
const updateClinicInfo = asyncHandler(async (req, res) => {
  const clinic = await clinicInfoService.updateClinicInfo(req.body);
  res.json(clinic);
});

module.exports = {
  getPublicClinicInfo,
  getAdminClinicInfo,
  updateClinicInfo: [validators.clinicInfo, updateClinicInfo]
};