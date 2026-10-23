"use strict";
require("dotenv").config();
const flow = require("./flow.json");

function pick(name, fallback) {
  const v = process.env[name];
  return v !== undefined && v !== "" ? v : fallback;
}

const config = {
  port: parseInt(pick("PORT", "5000"), 10),
  whatsapp: {
    token: pick("WHATSAPP_TOKEN", ""),
    phoneNumberId: pick("WHATSAPP_PHONE_NUMBER_ID", ""),
    verifyToken: pick("WHATSAPP_VERIFY_TOKEN", "change_me"),
    apiVersion: pick("WHATSAPP_API_VERSION", "v21.0"),
  },
  businessName: pick("BUSINESS_NAME", flow.businessName),
  ownerPhone: pick("OWNER_PHONE", flow.ownerPhone),
  supportPhone: pick("SUPPORT_PHONE", flow.supportPhone),
  adminTemplate: pick("ADMIN_TEMPLATE_NAME", ""),
  adminTemplateLang: pick("ADMIN_TEMPLATE_LANG", "en"),
  dataDir: pick("DATA_DIR", "./data"),
  sessionTimeoutMinutes: parseInt(pick("SESSION_TIMEOUT_MINUTES", String(flow.sessionTimeoutMinutes)), 10),
  flow,
};

module.exports = config;
