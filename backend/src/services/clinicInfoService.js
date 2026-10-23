/**
 * ClinicInfo service - Business logic for clinic singleton
 * Allowlist filtering lives here so controllers stay thin (single admin, no audit - R2)
 */
const { ClinicInfo } = require('../models');

/**
 * Get clinic info (public - cached)
 * @returns {Promise<ClinicInfo>}
 */
async function getClinicInfo() {
  return ClinicInfo.getInstance();
}

/**
 * Update clinic info (admin)
 * @param {Object} data - Update data
 * @returns {Promise<ClinicInfo>}
 */
async function updateClinicInfo(data) {
  // Whitelist allowed fields
  const allowedFields = [
    'practiceName',
    'address',
    'phones',
    'timings',
    'mapCoordinates',
    'socialLinks',
    'legalEntityName',
    'email',
    'locationId'
  ];

  const filteredData = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      filteredData[field] = data[field];
    }
  }

  return ClinicInfo.updateSingleton(filteredData);
}

/**
 * Get clinic info for admin (includes all fields)
 * @returns {Promise<ClinicInfo>}
 */
async function getClinicInfoAdmin() {
  return ClinicInfo.getInstance();
}

module.exports = {
  getClinicInfo,
  updateClinicInfo,
  getClinicInfoAdmin
};