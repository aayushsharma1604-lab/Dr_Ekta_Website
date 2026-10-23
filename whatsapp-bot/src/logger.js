"use strict";

function nowIso() {
  return new Date().toISOString();
}

function log(level, msg, extra) {
  const line = { ts: nowIso(), level, msg, ...(extra || {}) };
  const out = level === "error" ? console.error : console.log;
  out(JSON.stringify(line));
}

module.exports = {
  info: (msg, extra) => log("info", msg, extra),
  warn: (msg, extra) => log("warn", msg, extra),
  error: (msg, extra) => log("error", msg, extra),
};
