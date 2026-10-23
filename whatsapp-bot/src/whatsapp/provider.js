"use strict";
const meta = require("./cloudApi");
const twilio = require("./twilioApi");

function isTwilio() {
  return String(process.env.PROVIDER || "meta").toLowerCase() === "twilio";
}

function sendText(to, body, previewUrl) {
  if (isTwilio()) return twilio.sendText(to, body);
  return meta.sendText(to, body, previewUrl);
}

/** Buttons (≤3): native on Meta, numbered menu on Twilio sandbox. */
function sendButtons(to, body, buttons) {
  if (isTwilio()) return twilio.sendMenu(to, body, buttons);
  return meta.sendButtons(to, body, buttons);
}

/** Lists (>3 options): native on Meta, numbered menu on Twilio sandbox. */
function sendList(to, body, buttonText, sections) {
  if (isTwilio()) {
    const options = [];
    sections.forEach((s) => (s.rows || []).forEach((r) => options.push({ id: r.id, title: r.title })));
    return twilio.sendMenu(to, body, options);
  }
  return meta.sendList(to, body, buttonText, sections);
}

/** Templates only exist on Meta — on Twilio callers fall back to text. */
function sendTemplate(to, name, lang, params) {
  if (isTwilio()) throw new Error("templates unsupported on twilio provider");
  return meta.sendTemplate(to, name, lang, params);
}

/** Twilio trial: owner/patient alerts go out via approved Content template. */
function sendBookingTemplate(to, variables) {
  const sid = process.env.TWILIO_CONTENT_SID || "";
  if (!sid) throw new Error("TWILIO_CONTENT_SID not set");
  return twilio.sendContentTemplate(to, sid, variables);
}

module.exports = { isTwilio, sendText, sendButtons, sendList, sendTemplate, sendBookingTemplate };
