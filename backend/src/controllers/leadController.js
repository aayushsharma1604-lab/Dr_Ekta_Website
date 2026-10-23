/**
 * Admin Lead controller - Handles admin lead management
 */
const { asyncHandler } = require('../middlewares/errorHandler.middleware');
const { validators } = require('../middlewares/validate.middleware');
const { NotFoundError } = require('../middlewares/errorHandler.middleware');
const leadService = require('../services/leadService');

/**
 * GET /api/admin/leads - List leads with filters and pagination
 */
const getLeads = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, source, startDate, endDate, search } = req.query;
  
  const result = await leadService.getLeads({
    page: parseInt(page),
    limit: parseInt(limit),
    status,
    source,
    startDate,
    endDate,
    search
  });
  
  res.json(result);
});

/**
 * GET /api/admin/leads/stats - Get lead statistics
 */
const getLeadStats = asyncHandler(async (req, res) => {
  const { startDate, endDate, source } = req.query;
  
  const stats = await leadService.getLeadStats({
    startDate,
    endDate,
    source
  });
  
  res.json(stats);
});

/**
 * Escape a CSV cell against formula injection (F11)
 * Prefixes cells starting with =, +, -, @, tab or carriage return
 * @param {*} value - Cell value
 * @returns {string} Escaped, quoted cell
 */
function escapeCsvCell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  const needsPrefix = /^[=+\-@\t\r]/.test(text);
  const escaped = (needsPrefix ? "'" : '') + text.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * GET /api/admin/leads/export - Stream leads as CSV (cursor, never buffered - F11)
 */
const exportLeads = asyncHandler(async (req, res) => {
  const { startDate, endDate, source, status } = req.query;

  const { Lead } = require('../models');
  const cursor = Lead.exportCursor({ startDate, endDate, source, status });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="leads-${new Date().toISOString().split('T')[0]}.csv"`);
  res.write('Name,Phone,Treatment Interest,Source,Date,Lead Status,Appointment Status,Notes,Created At\n');

  try {
    for await (const lead of cursor) {
      const treatment = lead.treatmentInterest ? lead.treatmentInterest.title : '';
      const date = lead.date ? new Date(lead.date).toISOString().split('T')[0] : '';
      const createdAt = lead.createdAt ? new Date(lead.createdAt).toISOString() : '';

      const row = [
        escapeCsvCell(lead.name),
        escapeCsvCell(lead.phone),
        escapeCsvCell(treatment),
        escapeCsvCell(lead.source),
        escapeCsvCell(date),
        escapeCsvCell(lead.leadStatus),
        escapeCsvCell(lead.appointmentStatus),
        escapeCsvCell(lead.notes || ''),
        escapeCsvCell(createdAt)
      ].join(',') + '\n';

      if (!res.write(row)) {
        await new Promise(resolve => res.once('drain', resolve));
      }
    }
  } finally {
    await cursor.close().catch(() => {});
  }

  res.end();
});

/**
 * GET /api/admin/leads/:id - Get single lead
 */
const getLead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const lead = await require('../models').Lead.findById(id)
    .populate('treatmentInterest', 'title slug');
    
  if (!lead) {
    throw new NotFoundError('Lead not found');
  }
  
  res.json(lead);
});

/**
 * PUT /api/admin/leads/:id - Update lead status/notes
 */
const updateLead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { leadStatus, appointmentStatus, notes, treatmentInterest } = req.body;
  
  const updateData = {};
  if (leadStatus !== undefined) updateData.leadStatus = leadStatus;
  if (appointmentStatus !== undefined) updateData.appointmentStatus = appointmentStatus;
  if (notes !== undefined) updateData.notes = notes;
  if (treatmentInterest !== undefined) updateData.treatmentInterest = treatmentInterest;
  
  const lead = await require('../models').Lead.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate('treatmentInterest', 'title slug');
  
  if (!lead) {
    throw new NotFoundError('Lead not found');
  }
  
  res.json(lead);
});

/**
 * DELETE /api/admin/leads/:id - Delete lead
 */
const deleteLead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const lead = await require('../models').Lead.findById(id);
  if (!lead) {
    throw new NotFoundError('Lead not found');
  }
  
  await lead.deleteOne();
  
  res.json({ message: 'Lead deleted successfully' });
});

module.exports = {
  getLeads,
  getLeadStats,
  exportLeads,
  getLead,
  updateLead,
  deleteLead
};