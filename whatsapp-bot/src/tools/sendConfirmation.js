"use strict";
/**
 * Send a clinic confirmation to the PATIENT's own number.
 *
 * Usage:
 *   node src/tools/sendConfirmation.js <bookingId> [extraNote]
 *
 * Reads the booking from data/bookings.json, then messages the patient's
 * phoneNumber over WhatsApp Cloud API. Outside the 24h customer-service
 * window Meta requires an approved template — set PATIENT_TEMPLATE_NAME
 * (e.g. "appointment_confirmed" with {{1}}=name {{2}}=date {{3}}=time).
 * Without it, plain text is attempted (works inside the window).
 */
require("dotenv").config();
const config = require("../config");
const logger = require("../logger");
const cloudApi = require("../whatsapp/provider");
const store = require("../store/fileStore");

const PATIENT_TEMPLATE = process.env.PATIENT_TEMPLATE_NAME || "";

async function main() {
  const bookingId = process.argv[2];
  const extraNote = process.argv.slice(3).join(" ") || "";
  if (!bookingId) {
    console.error("Usage: node src/tools/sendConfirmation.js <bookingId> [extraNote]");
    process.exit(1);
  }
  const booking = store.readAll().find((b) => b.bookingId === bookingId);
  if (!booking) {
    console.error(`No booking found with ID ${bookingId}`);
    process.exit(1);
  }

  const text = [
    `Hello ${booking.fullName} 👋,`,
    "",
    "Your appointment at Dr. Ekta Narula Dental Care is *confirmed*:",
    "",
    `📅 Date: ${booking.appointmentDate}`,
    `⏰ Time: ${booking.appointmentTime}`,
    `🦷 Service: ${booking.service}`,
    extraNote ? `\nNote: ${extraNote}` : "",
    `\nBooking Reference: ${booking.bookingId}`,
    "",
    "Please arrive 10 minutes early. Reply here to reschedule.",
  ].join("\n");

  try {
    if (PATIENT_TEMPLATE) {
      try {
        await cloudApi.sendTemplate(booking.phoneNumber, PATIENT_TEMPLATE, "en", [booking.fullName, booking.appointmentDate, booking.appointmentTime]);
        logger.info("patient confirmation sent via template", { bookingId });
      } catch (e) {
        logger.warn("template failed, trying plain text", { error: e.message });
        await cloudApi.sendText(booking.phoneNumber, text);
        logger.info("patient confirmation sent via text", { bookingId });
      }
    } else {
      await cloudApi.sendText(booking.phoneNumber, text);
      logger.info("patient confirmation sent via text", { bookingId });
    }
    store.audit({ event: "patient_confirmation_sent", bookingId, to: booking.phoneNumber });
    console.log(`Confirmation sent to ${booking.phoneNumber}`);
  } catch (e) {
    store.audit({ event: "patient_confirmation_failed", bookingId, error: e.message });
    console.error("Send failed:", e.response?.data || e.message);
    process.exit(1);
  }
}

main();
