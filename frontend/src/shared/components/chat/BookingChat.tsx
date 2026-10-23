"use client";

import { useEffect, useRef, useState } from "react";
import { SITE_CONFIG } from "@/shared/constants";

const SERVICES = [
  "Dental Consultation",
  "Teeth Cleaning",
  "Root Canal Treatment",
  "Braces Consultation",
  "Teeth Whitening",
  "Other",
];

const TIME_SLOTS = ["10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];

type Step = "name" | "phone" | "service" | "date" | "time" | "patientType" | "notes" | "confirm" | "done";

interface ChatMsg {
  id: number;
  from: "bot" | "user";
  text: string;
}

interface BookingData {
  fullName: string;
  phoneNumber: string;
  service: string;
  appointmentDate: string;
  appointmentTime: string;
  patientType: string;
  notes: string;
}

const EMPTY: BookingData = { fullName: "", phoneNumber: "", service: "", appointmentDate: "", appointmentTime: "", patientType: "", notes: "" };

function todayIso(offset: number): string {
  const t = new Date();
  t.setDate(t.getDate() + offset);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`;
}

function validPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (/^\+/.test(raw.trim())) {
    const d = raw.replace(/[^\d]/g, "");
    return d.length >= 10 && d.length <= 15 ? `+${d}` : null;
  }
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length >= 10 && digits.length <= 15) return `+${digits}`;
  return null;
}

function validDate(raw: string): string | null {
  const m = raw.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/) || raw.trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (!m) return null;
  let y: number, mo: number, d: number;
  if (m[1].length === 4) { y = +m[1]; mo = +m[2]; d = +m[3]; }
  else { d = +m[1]; mo = +m[2]; y = +m[3]; }
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (dt < today) return null;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${y}-${p(mo)}-${p(d)}`;
}

let msgId = 0;
const msg = (from: "bot" | "user", text: string): ChatMsg => ({ id: ++msgId, from, text });

/**
 * Floating appointment booking chat (bottom-right).
 * Mirrors the WhatsApp bot flow in-browser — no API calls.
 * On confirm, hands the booking JSON to WhatsApp via wa.me deep link.
 */
export function BookingChat() {
  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState<Step>("name");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [data, setData] = useState<BookingData>(EMPTY);
  const [bookingId, setBookingId] = useState("");
  const [returnToConfirm, setReturnToConfirm] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const push = (...ms: ChatMsg[]) => setMessages((prev) => [...prev, ...ms]);

  const start = () => {
    setStarted(true);
    push(
      msg("bot", `👋 Welcome to ${SITE_CONFIG.name}.\nI can help you book an appointment in just a few steps.`),
      msg("bot", "What is your full name?")
    );
    setStep("name");
  };

  const goConfirm = (d: BookingData) => {
    setStep("confirm");
    push(msg("bot", `📋 Appointment Summary\n\nName: ${d.fullName}\nPhone: ${d.phoneNumber}\nService: ${d.service}\nDate: ${d.appointmentDate}\nTime: ${d.appointmentTime}\nPatient Type: ${d.patientType}\nNotes: ${d.notes || "-"}`));
  };

  const afterStep = (next: Step, d: BookingData) => {
    if (returnToConfirm) { setReturnToConfirm(false); goConfirm(d); return; }
    setStep(next);
    if (next === "service") push(msg("bot", "Which service would you like to book?"));
    if (next === "date") push(msg("bot", "Select your preferred appointment date."));
    if (next === "time") push(msg("bot", "Select your preferred appointment time."));
    if (next === "patientType") push(msg("bot", "Are you a new patient or an existing patient?"));
    if (next === "notes") push(msg("bot", "Please describe your concern or appointment requirement. (Reply - to skip.)"));
  };

  const finishBooking = (d: BookingData) => {
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `BK-${Date.now()}`;
    setBookingId(id);
    setStep("done");
    push(msg("bot", `✅ Appointment Booked Successfully\n\nThank you, ${d.fullName}.\nYour appointment request has been submitted successfully.\nOur team will contact you shortly.\n\nBooking Reference: ${id}`));
  };

  const handleChip = (value: string) => {
    push(msg("user", value));
    const d = { ...data };
    if (step === "service" && SERVICES.includes(value)) { d.service = value; setData(d); afterStep("date", d); }
    else if (step === "date") {
      if (value === "Today" || value === "Tomorrow") { d.appointmentDate = todayIso(value === "Today" ? 0 : 1); setData(d); afterStep("time", d); }
      else push(msg("bot", "Please type the date as YYYY-MM-DD (e.g. 2026-10-15)."));
    }
    else if (step === "time" && TIME_SLOTS.includes(value)) { d.appointmentTime = value; setData(d); afterStep("patientType", d); }
    else if (step === "patientType" && (value === "New Patient" || value === "Existing Patient")) { d.patientType = value; setData(d); afterStep("notes", d); }
    else if (step === "confirm" && value === "Confirm Booking") finishBooking(d);
    else if (step === "confirm" && value === "Edit Details") { setStep("name"); setReturnToConfirm(true); push(msg("bot", "Let's update your details. What is your full name?")); }
    else if (step === "done" && value === "Book Another") { setData(EMPTY); setBookingId(""); setReturnToConfirm(false); setStep("name"); push(msg("bot", "What is your full name?")); }
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    push(msg("user", text));
    const d = { ...data };
    if (step === "name") {
      if (text.length < 2) { push(msg("bot", "⚠️ That looks too short — please enter your full name.")); return; }
      d.fullName = text; setData(d); afterStep("phone", d);
      push(msg("bot", "Please enter your contact number."));
      setStep("phone");
    } else if (step === "phone") {
      const p = validPhone(text);
      if (!p) { push(msg("bot", "⚠️ That number doesn't look valid. Please enter a 10-digit mobile number.")); return; }
      d.phoneNumber = p; setData(d); afterStep("service", d);
    } else if (step === "service") {
      const m = SERVICES.find((s) => s.toLowerCase() === text.toLowerCase());
      if (!m) { push(msg("bot", "⚠️ Please pick a service from the options above.")); return; }
      d.service = m; setData(d); afterStep("date", d);
    } else if (step === "date") {
      const v = validDate(text);
      if (!v) { push(msg("bot", "⚠️ Please use YYYY-MM-DD format and choose today or a future date.")); return; }
      d.appointmentDate = v; setData(d); afterStep("time", d);
    } else if (step === "time") {
      const m = TIME_SLOTS.find((t) => t.toLowerCase() === text.toLowerCase());
      if (!m) { push(msg("bot", "⚠️ Please pick a time slot from the options above.")); return; }
      d.appointmentTime = m; setData(d); afterStep("patientType", d);
    } else if (step === "patientType") {
      const m = ["New Patient", "Existing Patient"].find((t) => t.toLowerCase() === text.toLowerCase());
      if (!m) { push(msg("bot", "⚠️ Please tap New Patient or Existing Patient.")); return; }
      d.patientType = m; setData(d); afterStep("notes", d);
    } else if (step === "notes") {
      d.notes = text === "-" ? "" : text.slice(0, 500); setData(d); goConfirm(d);
    } else if (step === "confirm") {
      push(msg("bot", "Please tap Confirm Booking or Edit Details to continue."));
    }
  };

  const chipsForStep = (): string[] => {
    if (step === "service") return SERVICES;
    if (step === "date") return ["Today", "Tomorrow"];
    if (step === "time") return TIME_SLOTS;
    if (step === "patientType") return ["New Patient", "Existing Patient"];
    if (step === "confirm") return ["Confirm Booking", "Edit Details"];
    if (step === "done") return ["Book Another"];
    return [];
  };

  const waHandoff = `https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(
    `🔔 New Appointment Booked\n\nName: ${data.fullName}\nPhone: ${data.phoneNumber}\nService: ${data.service}\nDate: ${data.appointmentDate}\nTime: ${data.appointmentTime}\nPatient Type: ${data.patientType}\nNotes: ${data.notes || "-"}\n\nBooking ID: ${bookingId}`
  )}`;

  const downloadCard = () => {
    const win = window.open("", "_blank", "width=640,height=800");
    if (!win) return;
    const row = (k: string, v: string) => `<tr><td style="padding:8px 12px;color:#71717a;font-size:13px;width:130px;">${k}</td><td style="padding:8px 12px;color:#18181b;font-size:14px;font-weight:600;">${v}</td></tr>`;
    win.document.write(`<!DOCTYPE html><html><head><title>Appointment Card - ${bookingId}</title><style>
      *{box-sizing:border-box;font-family:Arial,sans-serif}body{background:#f4f4f5;display:flex;justify-content:center;padding:32px;margin:0}
      .card{background:#fff;border-radius:16px;max-width:480px;width:100%;overflow:hidden;border:1px solid #e4e4e7}
      .head{background:#003875;color:#fff;padding:24px;text-align:center}
      .head h1{margin:0;font-size:20px}.head p{margin:6px 0 0;font-size:12px;letter-spacing:2px;opacity:.8}
      table{width:100%;border-collapse:collapse;margin:8px 0}
      tr+tr td{border-top:1px solid #f4f4f5}
      .foot{padding:16px 24px 24px;color:#71717a;font-size:12px;text-align:center}
      .ref{margin:0 24px 8px;background:#f4f4f5;border-radius:8px;padding:10px;font-size:12px;color:#52525b;text-align:center}
      @media print{body{background:#fff;padding:0}.card{border:none}}
    </style></head><body><div class="card">
      <div class="head"><p>APPOINTMENT CARD</p><h1>${SITE_CONFIG.name}</h1></div>
      <table>${row("Patient", data.fullName)}${row("Phone", data.phoneNumber)}${row("Service", data.service)}${row("Date", data.appointmentDate)}${row("Time", data.appointmentTime)}${row("Type", data.patientType)}${row("Notes", data.notes || "-")}</table>
      <div class="ref">Booking Reference: ${bookingId}</div>
      <div class="foot">Please arrive 10 minutes early · ${SITE_CONFIG.phone}<br/>Thank you — see you soon!</div>
    </div><script>window.onload=()=>window.print()</script></body></html>`);
    win.document.close();
  };

  return (
    <div className="fixed bottom-5 right-5 z-[90] flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[520px] w-[calc(100vw-2.5rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
          {/* Header */}
          <div className="flex items-center gap-3 bg-primary px-4 py-3 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-lg font-bold">E</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{SITE_CONFIG.name}</p>
              <p className="flex items-center gap-1 text-xs text-white/80"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Online — replies instantly</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-full p-1 hover:bg-white/10"><span className="material-icons">close</span></button>
          </div>
          {/* Messages */}
          <div className="flex-1 space-y-2.5 overflow-y-auto bg-zinc-50 p-4 dark:bg-zinc-950">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${m.from === "user" ? "rounded-br-md bg-primary text-white" : "rounded-bl-md bg-white text-zinc-800 shadow-sm ring-1 ring-zinc-900/5 dark:bg-zinc-800 dark:text-zinc-100"}`}>{m.text}</div>
              </div>
            ))}
            {step === "done" && bookingId && (
              <div className="flex flex-col items-start gap-2">
                <a href={waHandoff} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                  <span className="material-icons text-base">chat</span>Send via WhatsApp
                </a>
                <button onClick={downloadCard} className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white">
                  <span className="material-icons text-base">download</span>Download Appointment Card (PDF)
                </button>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          {/* Quick replies */}
          {chipsForStep().length > 0 && (
            <div className="flex gap-2 overflow-x-auto border-t border-zinc-100 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
              {chipsForStep().map((c) => (
                <button key={c} onClick={() => handleChip(c)} className="shrink-0 rounded-full border border-primary/40 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary hover:text-white">{c}</button>
              ))}
            </div>
          )}
          {/* Input */}
          <div className="flex items-center gap-2 border-t border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
              placeholder="Type your answer…"
              className="min-w-0 flex-1 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm outline-none focus:border-primary dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
            <button onClick={handleSend} aria-label="Send" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90"><span className="material-icons text-lg">send</span></button>
          </div>
        </div>
      )}
      {/* Launcher */}
      <button
        onClick={() => { setOpen(!open); if (!started && !open) start(); }}
        aria-label="Open booking chat"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-xl transition-transform hover:scale-105"
      >
        <span className="material-icons text-3xl">{open ? "close" : "chat"}</span>
        {!open && <span className="absolute right-0.5 top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />}
      </button>
    </div>
  );
}
