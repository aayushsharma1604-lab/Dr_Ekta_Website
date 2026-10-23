"use strict";

function isValidName(text) {
  const v = (text || "").trim();
  if (!v) return { ok: false, reason: "Please tell me your name to continue." };
  if (v.length < 2) return { ok: false, reason: "That looks too short — please enter your full name." };
  return { ok: true, value: v };
}

function normalizePhone(text) {
  let digits = String(text || "").replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) {
    const d = digits.slice(1).replace(/\D/g, "");
    return d.length >= 10 && d.length <= 15 ? `+${d}` : null;
  }
  const only = digits.replace(/\D/g, "");
  if (only.length === 10) return `+91${only}`;
  if (only.length === 12 && only.startsWith("91")) return `+${only}`;
  if (only.length >= 10 && only.length <= 15) return `+${only}`;
  return null;
}

function isValidPhone(text) {
  const normalized = normalizePhone(text);
  if (!normalized) {
    return { ok: false, reason: "That number doesn't look valid. Please enter a 10-digit mobile number (e.g. 98765 43210)." };
  }
  return { ok: true, value: normalized };
}

function parseDate(text) {
  const raw = String(text || "").trim();
  let y, m, d;
  let mIso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (mIso) {
    y = +mIso[1]; m = +mIso[2]; d = +mIso[3];
  } else {
    const mDmy = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (!mDmy) return null;
    d = +mDmy[1]; m = +mDmy[2]; y = +mDmy[3];
  }
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  return { y, m, d };
}

function toIsoDate(y, m, d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${y}-${p(m)}-${p(d)}`;
}

function isValidDate(text) {
  const parsed = parseDate(text);
  if (!parsed) {
    return { ok: false, reason: "Please use YYYY-MM-DD format (e.g. 2026-10-15)." };
  }
  const chosen = new Date(parsed.y, parsed.m - 1, parsed.d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (chosen < today) {
    return { ok: false, reason: "That date is in the past. Please choose today or a future date." };
  }
  return { ok: true, value: toIsoDate(parsed.y, parsed.m, parsed.d) };
}

function todayIso(offsetDays) {
  const t = new Date();
  t.setDate(t.getDate() + (offsetDays || 0));
  const p = (n) => String(n).padStart(2, "0");
  return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`;
}

module.exports = { isValidName, isValidPhone, normalizePhone, isValidDate, parseDate, toIsoDate, todayIso };
