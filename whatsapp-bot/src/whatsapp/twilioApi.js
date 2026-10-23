"use strict";
const axios = require("axios");
const logger = require("../logger");
const twimlReply = require("./twimlReply");

function creds() {
  const sid = process.env.TWILIO_ACCOUNT_SID || "";
  const token = process.env.TWILIO_AUTH_TOKEN || "";
  const from = process.env.TWILIO_WHATSAPP_NUMBER || "";
  if (!sid || !token || !from) throw new Error("Twilio not configured (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_WHATSAPP_NUMBER)");
  return { sid, token, from };
}

async function postForm(url, params, sid, token, attempt) {
  attempt = attempt || 1;
  try {
    const body = new URLSearchParams(params).toString();
    const res = await axios.post(url, body, {
      auth: { username: sid, password: token },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 15000,
    });
    return res.data;
  } catch (err) {
    const status = err.response?.status;
    const retryable = !err.response || status === 429 || (status >= 500 && status <= 599);
    if (retryable && attempt < 3) {
      await new Promise((r) => setTimeout(r, attempt * 1000));
      return postForm(url, params, sid, token, attempt + 1);
    }
    logger.error("twilio send failed", { status, body: err.response?.data, attempt });
    throw err;
  }
}

async function sendText(to, body) {
  // Inside a webhook request: queue as TwiML session reply (trial-safe).
  const collector = twimlReply.activeCollector();
  if (collector) {
    collector.push(String(body).slice(0, 1500));
    return { sid: "twiml-collected" };
  }
  const { sid, token, from } = creds();
  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const clean = String(body).slice(0, 1500);
  return postForm(url, { From: from, To: `whatsapp:${to}`, Body: clean }, sid, token);
}

/** Template send for trial accounts (free-form is blocked with 21654). */
async function sendContentTemplate(to, contentSid, variables) {
  const { sid, token, from } = creds();
  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  return postForm(
    url,
    { From: from, To: `whatsapp:${to}`, ContentSid: contentSid, ContentVariables: JSON.stringify(variables || {}) },
    sid,
    token
  );
}

/** Sandbox has no list/button widgets — send a numbered menu, user replies with a digit. */
async function sendMenu(to, body, options) {
  const lines = options.slice(0, 10).map((o, i) => `${i + 1}. ${o.title}`).join("\n");
  return sendText(to, `${body}\n\nReply with the number:\n${lines}`);
}

module.exports = { sendText, sendMenu, sendContentTemplate };
