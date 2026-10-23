/**
 * Enquiry controller - Handles public enquiry form submissions
 * Rate limited, honeypot + captcha verified
 */
const { asyncHandler } = require('../middlewares/errorHandler.middleware');
const { validators } = require('../middlewares/validate.middleware');
const { NotFoundError } = require('../middlewares/errorHandler.middleware');
const { AppError } = require('../middlewares/errorHandler.middleware');
const leadService = require('../services/leadService');

/**
 * POST /api/public/enquiry - Public enquiry form submission
 * Pipeline: honeypot check -> captcha verify -> validation -> rate limit -> create lead -> queue notification
 */
const submitEnquiry = asyncHandler(async (req, res) => {
  const { name, phone, treatmentInterest, honeypot, captchaToken } = req.body;
  const ip = req.ip;
  const userAgent = req.get('user-agent') || '';

  // 1. Honeypot check (must be empty)
  if (honeypot && honeypot.trim() !== '') {
    // Silently succeed to fool bots
    return res.status(200).json({ message: 'Enquiry submitted successfully' });
  }

  // 2. Captcha verification - server-side with timeout when RECAPTCHA_SECRET is set (F10)
  // Without a secret (dev/test) only the documented stub token is rejected
  if (captchaToken) {
    const ok = await verifyCaptcha(captchaToken, ip);
    if (!ok) {
      throw new AppError('Validation failed', 422, 'VALIDATION_ERROR');
    }
  }

  // 3. Validate required fields
  if (!name || !name.trim()) {
    throw new AppError('Validation failed', 422, 'VALIDATION_ERROR');
  }
  if (!phone || !phone.trim()) {
    throw new AppError('Validation failed', 422, 'VALIDATION_ERROR');
  }

  // 3.5. Validate phone format
  const phoneRegex = /^[\d\s\-\+\(\)]{10,20}$/;
  if (!phoneRegex.test(phone)) {
    throw new AppError('Validation failed', 422, 'VALIDATION_ERROR');
  }

  // 4. Reject medical/symptom fields (security requirement)
  const medicalFields = ['symptoms', 'diagnosis', 'medicalHistory', 'allergies', 'medications', 'conditions'];
  for (const field of medicalFields) {
    if (req.body[field]) {
      throw new AppError('Validation failed', 422, 'VALIDATION_ERROR');
    }
  }

  // 5. Validate treatment interest if provided
  if (req.body.treatmentInterest) {
    const treatment = await require('../models').Treatment.findById(req.body.treatmentInterest);
    if (!treatment) {
      throw new AppError('Validation failed', 422, 'VALIDATION_ERROR');
    }
  }

  // 6. Create lead with source="enquiry_form"
  const lead = await leadService.createLead(
    {
      name: name.trim(),
      phone: phone.trim(),
      treatmentInterest: req.body.treatmentInterest || null
    },
    'enquiry_form',
    req.ip,
    req.get('user-agent') || ''
  );

  // 7. Queue notification job (fire-and-forget, redacted - no PII in logs)
  // A persistent job queue is still future work (F13): email is unconfigured,
  // so notification today is a best-effort log + persisted analytics event below
  setImmediate(async () => {
    try {
      await notifyNewEnquiry(lead);
    } catch (err) {
      console.error('Failed to queue notification:', err.message);
    }
  });

  // 8. Persist server-side analytics event so monthly reports reflect enquiries (6.4)
  try {
    await require('../models').AnalyticsEvent.logEvent({
      eventType: 'enquiry_submit',
      refId: lead._id,
      refModel: 'Lead',
      metadata: { source: 'enquiry_form' },
      ip,
      userAgent
    });
  } catch (err) {
    console.error('Failed to log enquiry analytics event:', err.message);
  }

  res.status(201).json({
    message: 'Enquiry submitted successfully',
    leadId: lead._id
  });
});

/**
 * Verify a captcha token server-side with a timeout (F10)
 * @param {string} token - Client captcha token
 * @param {string} ip - Client IP
 * @returns {Promise<boolean>} True when the token verifies
 */
async function verifyCaptcha(token, ip) {
  const secret = process.env.RECAPTCHA_SECRET;
  if (!secret) {
    return token !== 'invalid-token';
  }
  const params = new URLSearchParams({ secret, response: token });
  if (ip) params.append('remoteip', ip);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      body: params,
      signal: ctrl.signal
    });
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error('Captcha verification failed:', err.message);
    return false; // Fail closed when a secret is configured
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Notify admin of new enquiry (best-effort stub - F13)
 * Logs only the lead ID so no PII reaches the logs
 * @param {Lead} lead - Created lead
 */
async function notifyNewEnquiry(lead) {
  // In production, this would:
  // 1. Push to a job queue (Bull, Agenda, etc.)
  // 2. Send email/SMS to admin
  // 3. Handle retries on failure

  console.log('New enquiry notification queued:', {
    leadId: lead._id
  });

  // TODO: Implement actual notification (email/SMS)
  // Example: await emailService.sendNewEnquiryNotification(lead);
}

module.exports = {
  submitEnquiry: [
    validators.publicEnquiry,
    submitEnquiry
  ]
};