"use strict";
const express = require("express");
const config = require("./config");
const logger = require("./logger");
const SessionStore = require("./session/store");
const webhook = require("./whatsapp/webhook");

const app = express();
app.use(express.json({ limit: "256kb" }));
app.use(express.urlencoded({ extended: false }));

const sessions = new SessionStore(config.sessionTimeoutMinutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "whatsapp-booking-bot", timestamp: new Date().toISOString() });
});

// Meta Cloud API webhook (verification + incoming messages)
app.get("/webhook", webhook.verify);
app.post("/webhook", (req, res) => webhook.receive(req, res, sessions));

// Twilio sandbox webhook — set this URL in the sandbox WhatsApp settings
app.post("/webhook/twilio", (req, res) => webhook.receiveTwilio(req, res, sessions));

app.use((req, res) => res.status(404).json({ error: "Not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error("unhandled error", { error: err.message });
  res.status(500).json({ error: "Internal server error" });
});

if (!config.whatsapp.token || !config.whatsapp.phoneNumberId) {
  logger.warn("WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID not set — webhook will run but sending will fail until configured");
}

app.listen(config.port, () => {
  logger.info(`booking bot listening on :${config.port}`);
});

module.exports = app;
