"use strict";
const fs = require("fs");
const path = require("path");
const config = require("../config");
const logger = require("../logger");

function ensureDir() {
  if (!fs.existsSync(config.dataDir)) fs.mkdirSync(config.dataDir, { recursive: true });
}

function bookingsFile() {
  return path.join(config.dataDir, "bookings.json");
}

function auditFile() {
  return path.join(config.dataDir, "audit.log");
}

/** File-based booking store — plain JSON array, no database/schema. */
function readAll() {
  ensureDir();
  try {
    const raw = fs.readFileSync(bookingsFile(), "utf8");
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveBooking(booking) {
  const all = readAll();
  all.push(booking);
  fs.writeFileSync(bookingsFile(), JSON.stringify(all, null, 2));
  logger.info("booking saved", { bookingId: booking.bookingId, total: all.length });
  return booking;
}

/** Append-only audit log (JSON lines): received → validated → confirmed → notified. */
function audit(entry) {
  ensureDir();
  const line = JSON.stringify({ ts: new Date().toISOString(), ...entry }) + "\n";
  fs.appendFileSync(auditFile(), line);
}

module.exports = { readAll, saveBooking, audit };
