"use strict";
const config = require("../config");
const logger = require("../logger");
const engine = require("../flow/engine");
const twimlReply = require("./twimlReply");

/** Meta webhook verification handshake. */
function verify(req, res) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === config.whatsapp.verifyToken) {
    logger.info("webhook verified");
    return res.status(200).send(challenge);
  }
  logger.warn("webhook verify failed");
  return res.sendStatus(403);
}

/**
 * Receive Cloud API notifications, route each user message through the
 * conversation engine, and ACK fast (Meta retries if >20s).
 */
async function receive(req, res, sessions) {
  res.sendStatus(200);
  try {
    let body = req.body || {};
    // Dashboard "Send to server" samples arrive as { field, value } without entry[] — normalize.
    if (!body.entry && body.field) {
      body = { entry: [{ changes: [{ field: body.field, value: body.value || {} }] }] };
    }
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    if (!value || change?.field !== "messages") return;

    // Delivery/read statuses — nothing to do
    if (value.statuses && !value.messages) return;

    for (const msg of value.messages || []) {
      const phone = msg.from;
      if (!phone) continue;
      // Ignore echoes/system or very old messages (>10 min) to avoid replays
      const ageSec = msg.timestamp ? Date.now() / 1000 - Number(msg.timestamp) : 0;
      if (ageSec > 600) {
        logger.info("stale message ignored", { phone, ageSec: Math.round(ageSec) });
        continue;
      }
      try {
        await engine.handleMessage(phone, msg, sessions);
      } catch (e) {
        logger.error("engine error", { phone, error: e.message });
      }
    }
  } catch (e) {
    logger.error("webhook error", { error: e.message });
  }
}

/**
 * Twilio sandbox inbound (application/x-www-form-urlencoded):
 * From=whatsapp:+91..., Body=text, ButtonPayload=set on quick-reply taps.
 * Replies go back as TwiML session messages (works on trial accounts).
 */
async function receiveTwilio(req, res, sessions) {
  const rawFrom = String(req.body?.From || "").replace("whatsapp:", "").trim();
  const body = String(req.body?.Body || "");
  const btn = req.body?.ButtonPayload || null;
  if (!rawFrom) return res.status(200).send("<Response></Response>");
  // Static connectivity probe — bypasses the engine entirely.
  if (body.trim().toLowerCase() === "ping") {
    return res.type("text/xml").status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response><Message>pong - bot reachable</Message></Response>');
  }
  const msg = { type: "text", text: { body }, _twilioBtn: btn || undefined };
  try {
    const collected = await twimlReply.runWithCollector(() => engine.handleMessage(rawFrom, msg, sessions));
    res.type("text/xml").status(200).send(twimlReply.toTwiml(collected));
  } catch (e) {
    logger.error("twilio webhook error", { error: e.message });
    res.status(200).send("<Response></Response>");
  }
}

module.exports = { verify, receive, receiveTwilio };
