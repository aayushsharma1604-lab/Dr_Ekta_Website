"use strict";
const axios = require("axios");
const config = require("../config");
const logger = require("../logger");

const GRAPH = `https://graph.facebook.com/${config.whatsapp.apiVersion}`;

function headers() {
  return { Authorization: `Bearer ${config.whatsapp.token}`, "Content-Type": "application/json" };
}

function endpoint() {
  return `${GRAPH}/${config.whatsapp.phoneNumberId}/messages`;
}

async function postWithRetry(payload, attempt) {
  attempt = attempt || 1;
  try {
    const res = await axios.post(endpoint(), payload, { headers: headers(), timeout: 15000 });
    return res.data;
  } catch (err) {
    const status = err.response?.status;
    const retryable = !err.response || status === 429 || (status >= 500 && status <= 599);
    if (retryable && attempt < 3) {
      const wait = attempt * 1000;
      logger.warn("whatsapp send retry", { attempt, status, wait });
      await new Promise((r) => setTimeout(r, wait));
      return postWithRetry(payload, attempt + 1);
    }
    logger.error("whatsapp send failed", { status, body: err.response?.data, attempt });
    throw err;
  }
}

function base(to, kind, content) {
  return { messaging_product: "whatsapp", recipient_type: "individual", to, type: kind, [kind]: content };
}

async function sendText(to, body, previewUrl) {
  return postWithRetry(base(to, "text", { body, preview_url: !!previewUrl }));
}

/** Interactive reply buttons — Cloud API allows max 3. ids must be short. */
async function sendButtons(to, body, buttons) {
  const action = {
    buttons: buttons.slice(0, 3).map((b) => ({ type: "reply", reply: { id: b.id, title: String(b.title).slice(0, 20) } })),
  };
  return postWithRetry(base(to, "interactive", { type: "button", body: { text: body }, action }));
}

/** Interactive list — for >3 options (services, time slots). */
async function sendList(to, body, buttonText, sections) {
  const action = {
    button: String(buttonText).slice(0, 20),
    sections: sections.map((s) => ({
      title: String(s.title || "Options").slice(0, 24),
      rows: s.rows.slice(0, 10).map((r) => ({
        id: r.id,
        title: String(r.title).slice(0, 24),
        ...(r.description ? { description: String(r.description).slice(0, 72) } : {}),
      })),
    })),
  };
  return postWithRetry(base(to, "interactive", { type: "list", body: { text: body }, action }));
}

/** Utility/template message for business-initiated owner alerts. */
async function sendTemplate(to, name, langCode, bodyParams) {
  const template = {
    name,
    language: { code: langCode || "en" },
    ...(bodyParams && bodyParams.length ? { components: [{ type: "body", parameters: bodyParams.map((t) => ({ type: "text", text: String(t) })) }] } : {}),
  };
  return postWithRetry(base(to, "template", template));
}

module.exports = { sendText, sendButtons, sendList, sendTemplate };
