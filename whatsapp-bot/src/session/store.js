"use strict";
const logger = require("../logger");

/**
 * In-memory session store with inactivity TTL.
 * Keyed by sender phone (wa_id). No database — sessions live in process memory.
 * Finished/expired sessions are dropped; next message starts a fresh flow.
 */
class SessionStore {
  constructor(timeoutMinutes) {
    this.timeoutMs = timeoutMinutes * 60 * 1000;
    this.sessions = new Map();
  }

  get(phone) {
    const s = this.sessions.get(phone);
    if (!s) return null;
    if (Date.now() - s.updatedAt > this.timeoutMs) {
      this.sessions.delete(phone);
      logger.info("session expired", { phone });
      return null;
    }
    return s;
  }

  create(phone) {
    const s = {
      phone,
      step: "name",
      returnToConfirm: false,
      data: { fullName: "", phoneNumber: "", service: "", appointmentDate: "", appointmentTime: "", patientType: "", notes: "" },
      attempts: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.sessions.set(phone, s);
    return s;
  }

  touch(session) {
    session.updatedAt = Date.now();
    session.attempts = 0;
  }

  bumpAttempts(session) {
    session.attempts = (session.attempts || 0) + 1;
    session.updatedAt = Date.now();
    return session.attempts;
  }

  finish(phone) {
    this.sessions.delete(phone);
  }
}

module.exports = SessionStore;
