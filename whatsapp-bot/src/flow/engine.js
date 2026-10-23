"use strict";
const config = require("../config");
const logger = require("../logger");
const cloudApi = require("../whatsapp/provider");
const validation = require("../validation");
const bookingService = require("../services/bookingService");
const store = require("../store/fileStore");

const { businessName, supportPhone, flow } = config;

const FIELD_LABELS = {
  fullName: "Full name",
  phoneNumber: "Contact number",
  service: "Service",
  appointmentDate: "Preferred date",
  appointmentTime: "Preferred time",
  patientType: "Patient type",
  notes: "Notes",
};

function isRestart(text) {
  return flow.restartKeywords.some((k) => text.trim().toLowerCase() === k);
}

async function sendWelcome(to) {
  await cloudApi.sendText(
    to,
    `${flow.welcomeEmoji} Welcome to ${businessName}.\n\nI can help you book an appointment in just a few steps.\n\nLet's get started.`
  );
}

async function askName(to) {
  await cloudApi.sendText(to, "What is your full name?");
}

async function askPhone(to) {
  await cloudApi.sendText(to, "Please enter your contact number.");
}

async function askService(to) {
  await cloudApi.sendList(to, "Which service would you like to book?", "Choose service", [
    { title: "Dental services", rows: flow.services.map((s, i) => ({ id: `service_${i}`, title: s })) },
  ]);
}

function dateChoiceButtons() {
  return [
    { id: "date_today", title: "Today" },
    { id: "date_tomorrow", title: "Tomorrow" },
    { id: "date_type", title: "Type a date" },
  ];
}

async function askDate(to) {
  await cloudApi.sendButtons(to, "Select your preferred appointment date (or type YYYY-MM-DD).", dateChoiceButtons());
}

async function askTime(to) {
  await cloudApi.sendList(to, "Select your preferred appointment time.", "Choose time", [
    { title: "Available slots", rows: flow.timeSlots.map((t, i) => ({ id: `time_${i}`, title: t })) },
  ]);
}

async function askPatientType(to) {
  await cloudApi.sendButtons(to, "Are you a new patient or an existing patient?", [
    { id: "pt_new", title: "New Patient" },
    { id: "pt_existing", title: "Existing Patient" },
  ]);
}

async function askNotes(to) {
  await cloudApi.sendText(to, "Please describe your concern or appointment requirement.\n\n(Reply with - to skip.)");
}

function summaryText(d) {
  return ["📋 Appointment Summary", "", `Name: ${d.fullName}`, `Phone: ${d.phoneNumber}`, `Service: ${d.service}`, `Date: ${d.appointmentDate}`, `Time: ${d.appointmentTime}`, `Patient Type: ${d.patientType}`, `Notes: ${d.notes || "-"}`].join("\n");
}

async function askConfirm(to, data) {
  await cloudApi.sendButtons(to, summaryText(data), [
    { id: "confirm_yes", title: "Confirm Booking" },
    { id: "confirm_edit", title: "Edit Details" },
  ]);
}

async function askEditField(to) {
  await cloudApi.sendList(to, "Which detail would you like to change?", "Choose field", [
    {
      title: "Booking details",
      rows: Object.keys(FIELD_LABELS).map((key) => ({ id: `edit_${key}`, title: FIELD_LABELS[key] })),
    },
  ]);
}

async function sendThankYou(to, booking) {
  await cloudApi.sendButtons(
    to,
    ["✅ Appointment Booked Successfully", "", `Thank you, ${booking.fullName}.`, "", "Your appointment request has been submitted successfully.", "", "Our team will contact you shortly to confirm your appointment.", "", `Booking Reference: ${booking.bookingId}`].join("\n"),
    [
      { id: "done_rebook", title: "Book Another" },
      { id: "done_support", title: "Contact Support" },
    ]
  );
}

function nextStepAfter(step) {
  const order = ["name", "phone", "service", "date", "time", "patientType", "notes", "confirm"];
  return order[order.indexOf(step) + 1] || "confirm";
}

async function askStep(to, step) {
  if (step === "name") return askName(to);
  if (step === "phone") return askPhone(to);
  if (step === "service") return askService(to);
  if (step === "date") return askDate(to);
  if (step === "time") return askTime(to);
  if (step === "patientType") return askPatientType(to);
  if (step === "notes") return askNotes(to);
  return askConfirm(to, {});
}

/** Extract readable text + interactive payload id from a Cloud API message. */
function parseIncoming(msg) {
  if (!msg || msg.type === "unsupported") return null;
  if (msg._twilioBtn) return { text: msg.text?.body || "", buttonId: msg._twilioBtn, listId: null };
  if (msg.type === "text") return { text: msg.text?.body || "", buttonId: null, listId: null };
  if (msg.type === "interactive") {
    const r = msg.interactive || {};
    if (r.type === "button_reply") return { text: r.button_reply?.title || "", buttonId: r.button_reply?.id || null, listId: null };
    if (r.type === "list_reply") return { text: r.list_reply?.title || "", buttonId: null, listId: r.list_reply?.id || null };
  }
  return { text: "", buttonId: null, listId: null };
}

/** Steps where a Twilio digit reply is meaningful. */
function sessionDigitStep(session) {
  if (!session) return false;
  return ["service", "date", "time", "patientType", "confirm", "edit_pick", "done"].includes(session.step);
}

/**
 * Map a Twilio digit to the same ids the Meta buttons/lists would send,
 * so the rest of the state machine stays untouched.
 */
function resolveTwilioDigit(step, digit) {
  const n = parseInt(digit, 10);
  const fields = ["fullName", "phoneNumber", "service", "appointmentDate", "appointmentTime", "patientType", "notes"];
  if (step === "service" && flow.services[n - 1]) return { text: flow.services[n - 1] };
  if (step === "time" && flow.timeSlots[n - 1]) return { text: flow.timeSlots[n - 1] };
  if (step === "patientType" && flow.patientTypes[n - 1]) return { text: flow.patientTypes[n - 1] };
  if (step === "date" && (n === 1 || n === 2)) return { choiceId: n === 1 ? "date_today" : "date_tomorrow" };
  if (step === "date" && n === 3) return { text: "" };
  if (step === "confirm" && n === 1) return { choiceId: "confirm_yes" };
  if (step === "confirm" && n === 2) return { choiceId: "confirm_edit" };
  if (step === "edit_pick" && fields[n - 1]) return { listId: `edit_${fields[n - 1]}` };
  if (step === "done" && n === 1) return { choiceId: "done_rebook" };
  if (step === "done" && n === 2) return { choiceId: "done_support" };
  return {};
}

async function handleMessage(phone, msg, sessions) {
  const parsed = parseIncoming(msg);
  if (!parsed) return;
  let { text, buttonId, listId } = parsed;
  let choiceId = buttonId || listId;

  // Twilio sandbox: menus are numbered text — translate digits per step.
  if (cloudApi.isTwilio && cloudApi.isTwilio() && /^\d+$/.test(text.trim()) && sessionDigitStep(sessions.get(phone))) {
    const mapped = resolveTwilioDigit(sessions.get(phone).step, text.trim());
    if (mapped.text) text = mapped.text;
    if (mapped.choiceId) choiceId = mapped.choiceId;
    if (mapped.listId) listId = mapped.listId;
  }

  let session = sessions.get(phone);
  if (!session || isRestart(text) || session.step === "done") {
    session = sessions.create(phone);
    store.audit({ event: "flow_started", userPhone: phone });
    await sendWelcome(phone);
    await askName(phone);
    return;
  }
  sessions.touch(session);
  const d = session.data;

  // Global post-booking actions
  if (session.step === "done") {
    if (choiceId === "done_rebook") {
      sessions.finish(phone);
      return handleMessage(phone, { type: "text", text: { body: "hi" } }, sessions);
    }
    if (choiceId === "done_support") {
      await cloudApi.sendText(phone, `You can reach us directly at ${supportPhone}. We are happy to help!`);
      return;
    }
  }

  // Date shortcut buttons
  if (session.step === "date" && choiceId && choiceId.startsWith("date_")) {
    if (choiceId === "date_today" || choiceId === "date_tomorrow") {
      d.appointmentDate = validation.todayIso(choiceId === "date_today" ? 0 : 1);
      session.step = session.returnToConfirm ? "confirm" : "time";
      session.returnToConfirm = false;
      if (session.step === "confirm") return askConfirm(phone, d);
      return askTime(phone);
    }
    await cloudApi.sendText(phone, "Please type the date as YYYY-MM-DD (e.g. 2026-10-15).");
    return;
  }

  // Confirm screen actions
  if (session.step === "confirm" && choiceId) {
    if (choiceId === "confirm_yes") {
      try {
        const { booking } = await bookingService.finalizeBooking(d, phone);
        session.step = "done";
        await sendThankYou(phone, booking);
      } catch (e) {
        logger.error("finalize failed", { error: e.message, phone });
        await cloudApi.sendText(phone, "Something went wrong while saving your booking. Please tap Confirm Booking again, or type *restart* to start over.");
      }
      return;
    }
    if (choiceId === "confirm_edit") {
      session.step = "edit_pick";
      return askEditField(phone);
    }
  }

  // Edit-field picker
  if (session.step === "edit_pick" && listId && listId.startsWith("edit_")) {
    const field = listId.replace("edit_", "");
    const map = { fullName: "name", phoneNumber: "phone", service: "service", appointmentDate: "date", appointmentTime: "time", patientType: "patientType", notes: "notes" };
    if (map[field]) {
      session.step = map[field];
      session.returnToConfirm = true;
      return askStep(phone, session.step);
    }
  }

  // Step handlers
  switch (session.step) {
    case "name": {
      const v = validation.isValidName(text);
      if (!v.ok) { sessions.bumpAttempts(session); return cloudApi.sendText(phone, `⚠️ ${v.reason}`); }
      d.fullName = v.value;
      session.step = "phone";
      return askPhone(phone);
    }
    case "phone": {
      const v = validation.isValidPhone(text);
      if (!v.ok) { sessions.bumpAttempts(session); return cloudApi.sendText(phone, `⚠️ ${v.reason}`); }
      d.phoneNumber = v.value;
      session.step = session.returnToConfirm ? "confirm" : "service";
      session.returnToConfirm = false;
      if (session.step === "confirm") return askConfirm(phone, d);
      return askService(phone);
    }
    case "service": {
      const idx = listId && listId.startsWith("service_") ? parseInt(listId.split("_")[1], 10) : NaN;
      const match = !Number.isNaN(idx) ? flow.services[idx] : flow.services.find((s) => s.toLowerCase() === text.trim().toLowerCase());
      if (!match) {
        sessions.bumpAttempts(session);
        await cloudApi.sendText(phone, "⚠️ Please pick a service from the list.");
        return askService(phone);
      }
      d.service = match;
      session.step = session.returnToConfirm ? "confirm" : "date";
      session.returnToConfirm = false;
      if (session.step === "confirm") return askConfirm(phone, d);
      return askDate(phone);
    }
    case "date": {
      const v = validation.isValidDate(text);
      if (!v.ok) { sessions.bumpAttempts(session); return cloudApi.sendText(phone, `⚠️ ${v.reason}`); }
      d.appointmentDate = v.value;
      session.step = session.returnToConfirm ? "confirm" : "time";
      session.returnToConfirm = false;
      if (session.step === "confirm") return askConfirm(phone, d);
      return askTime(phone);
    }
    case "time": {
      const idx = listId && listId.startsWith("time_") ? parseInt(listId.split("_")[1], 10) : NaN;
      const match = !Number.isNaN(idx) ? flow.timeSlots[idx] : flow.timeSlots.find((t) => t.toLowerCase() === text.trim().toLowerCase());
      if (!match) {
        sessions.bumpAttempts(session);
        await cloudApi.sendText(phone, "⚠️ Please pick a time slot from the list.");
        return askTime(phone);
      }
      d.appointmentTime = match;
      session.step = session.returnToConfirm ? "confirm" : "patientType";
      session.returnToConfirm = false;
      if (session.step === "confirm") return askConfirm(phone, d);
      return askPatientType(phone);
    }
    case "patientType": {
      let match = null;
      if (choiceId === "pt_new") match = "New Patient";
      else if (choiceId === "pt_existing") match = "Existing Patient";
      else match = flow.patientTypes.find((t) => t.toLowerCase() === text.trim().toLowerCase());
      if (!match) {
        sessions.bumpAttempts(session);
        await cloudApi.sendText(phone, "⚠️ Please tap New Patient or Existing Patient.");
        return askPatientType(phone);
      }
      d.patientType = match;
      session.step = session.returnToConfirm ? "confirm" : "notes";
      session.returnToConfirm = false;
      if (session.step === "confirm") return askConfirm(phone, d);
      return askNotes(phone);
    }
    case "notes": {
      d.notes = text.trim() === "-" ? "" : text.trim().slice(0, 500);
      session.step = "confirm";
      session.returnToConfirm = false;
      return askConfirm(phone, d);
    }
    case "confirm": {
      await cloudApi.sendText(phone, "Please tap *Confirm Booking* or *Edit Details* to continue. (Or type *restart* to start over.)");
      return askConfirm(phone, d);
    }
    case "edit_pick": {
      return askEditField(phone);
    }
    default: {
      await sendWelcome(phone);
      session.step = "name";
      return askName(phone);
    }
  }
}

module.exports = { handleMessage, parseIncoming, summaryText };
