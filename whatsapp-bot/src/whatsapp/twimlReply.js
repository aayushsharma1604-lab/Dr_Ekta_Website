"use strict";
const { AsyncLocalStorage } = require("async_hooks");

/**
 * Collects outbound Twilio texts during a webhook request so they can be
 * returned as TwiML <Message> replies (session messages) instead of REST
 * calls — REST free-form is blocked on trial accounts (error 21654).
 */
const storage = new AsyncLocalStorage();

function runWithCollector(fn) {
  const collected = [];
  return storage.run(collected, fn).then(() => collected);
}

function activeCollector() {
  return storage.getStore() || null;
}

function escapeXml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function toTwiml(messages) {
  const items = messages.slice(0, 5).map((body) => `<Message>${escapeXml(body)}</Message>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${items}</Response>`;
}

module.exports = { runWithCollector, activeCollector, toTwiml };
