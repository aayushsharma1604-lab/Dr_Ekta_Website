"use strict";
const { v4: uuidv4 } = require("uuid");
const config = require("../config");
const logger = require("../logger");
const cloudApi = require("../whatsapp/provider");
const store = require("../store/fileStore");

function buildBookingJson(data) {
  return {
    bookingId: uuidv4(),
    createdAt: new Date().toISOString(),
    fullName: data.fullName,
    phoneNumber: data.phoneNumber,
    service: data.service,
    appointmentDate: data.appointmentDate,
    appointmentTime: data.appointmentTime,
    patientType: data.patientType,
    notes: data.notes || "",
    status: "BOOKED",
  };
}

function toE164(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return null;
  return digits.startsWith("91") && digits.length === 12 ? `+${digits}` : `+${digits}`;
}

function adminText(booking) {
  return [
    "🔔 New Appointment Booked",
    "",
    `Name: ${booking.fullName}`,
    `Phone: ${booking.phoneNumber}`,
    `Service: ${booking.service}`,
    `Date: ${booking.appointmentDate}`,
    `Time: ${booking.appointmentTime}`,
    `Patient Type: ${booking.patientType}`,
    `Notes: ${booking.notes || "-"}`,
    "",
    `Booking ID: ${booking.bookingId}`,
  ].join("\n");
}

/**
 * Owner notification over WhatsApp only (no external APIs).
 * Business-initiated messages outside the 24h window need an approved
 * template — if ADMIN_TEMPLATE_NAME is set it is tried first, then plain text.
 */
async function notifyOwner(booking) {
  const owner = toE164(config.ownerPhone);
  if (!owner) {
    logger.warn("owner phone not configured, skipping notify");
    return { sent: false, reason: "no_owner_phone" };
  }
  // Twilio trial: free-form is blocked (21654) — use the approved template.
  if (cloudApi.isTwilio && cloudApi.isTwilio() && process.env.TWILIO_CONTENT_SID) {
    try {
      await cloudApi.sendBookingTemplate(owner, {
        1: booking.fullName,
        2: booking.service,
        3: booking.appointmentDate,
        4: booking.appointmentTime,
      });
      logger.info("owner notified via twilio template", { bookingId: booking.bookingId });
      return { sent: true, via: "twilio_template" };
    } catch (e) {
      logger.error("twilio template notify failed", { error: e.message, bookingId: booking.bookingId });
      return { sent: false, reason: e.message };
    }
  }
  if (config.adminTemplate) {
    try {
      await cloudApi.sendTemplate(owner, config.adminTemplate, config.adminTemplateLang, [
        booking.fullName, booking.phoneNumber, booking.service,
        booking.appointmentDate, booking.appointmentTime, booking.bookingId,
      ]);
      logger.info("owner notified via template", { bookingId: booking.bookingId });
      return { sent: true, via: "template" };
    } catch (e) {
      logger.warn("template notify failed, falling back to text", { error: e.message });
    }
  }
  try {
    await cloudApi.sendText(owner, adminText(booking));
    logger.info("owner notified via text", { bookingId: booking.bookingId });
    return { sent: true, via: "text" };
  } catch (e) {
    logger.error("owner notify failed", { error: e.message, bookingId: booking.bookingId });
    return { sent: false, reason: e.message };
  }
}

async function finalizeBooking(data, userPhone) {
  const booking = buildBookingJson(data);
  store.saveBooking(booking);
  store.audit({ event: "booking_confirmed", bookingId: booking.bookingId, userPhone });
  const notify = await notifyOwner(booking);
  store.audit({ event: notify.sent ? "owner_notified" : "owner_notify_failed", bookingId: booking.bookingId, via: notify.via, reason: notify.reason });
  return { booking, notify };
}

module.exports = { buildBookingJson, finalizeBooking, notifyOwner, adminText };
