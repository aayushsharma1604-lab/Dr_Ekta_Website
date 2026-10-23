"use client";

import { useEffect, useState } from "react";
import { submitEnquiry } from "@/lib/api/services/enquiry";
import { getTreatments } from "@/lib/api/services/treatments";
import type { Treatment } from "@/lib/api/types";
import { TREATMENTS as FB_TREAT } from "@/shared/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EnquiryForm({ compact = false }: { compact?: boolean }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [treatmentInterest, setTreatmentInterest] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [treatments, setTreatments] = useState<{ id: string; _id?: string; title: string }[]>(FB_TREAT.map((t) => ({ id: t.id, title: t.title })));
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    getTreatments({ page: 1, limit: 50 })
      .then((res) => {
        if (res.items?.length) {
          setTreatments(res.items.map((t: Treatment) => ({ id: t._id, _id: t._id, title: t.title })));
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) {
      setStatus("success");
      setMessage("Enquiry submitted successfully");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const res = await submitEnquiry({
        name,
        phone,
        treatmentInterest: treatmentInterest || undefined,
        honeypot,
      });
      setStatus("success");
      setMessage(res.message || "Enquiry submitted successfully");
      setName("");
      setPhone("");
      setTreatmentInterest("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit";
      // Surface validation details
      const details = (err as { details?: Array<{ message: string }> })?.details;
      setStatus("error");
      setMessage(details ? details.map((d) => d.message).join(", ") : msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={compact ? "flex flex-col gap-3" : "card flex flex-col gap-4"}>
      {!compact && (
        <>
          <h3 className="heading-sm">Send an Enquiry</h3>
          <p className="body-sm">Fill this form and we’ll call you back. No medical history please.</p>
        </>
      )}

      {/* Honeypot hidden */}
      <input type="text" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <div className="flex flex-col gap-2">
        <Label htmlFor="enq-name">Name *</Label>
        <Input id="enq-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} placeholder="Your full name" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="enq-phone">Phone *</Label>
        <Input id="enq-phone" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+91-9876543210" pattern="^[\d\s\-\+\(\)]{10,20}$" />
        {!compact && <p className="text-xs text-zinc-400">10-20 chars, digits, +, -, spaces, ()</p>}
      </div>
      {!compact && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="enq-treatment">Treatment Interest</Label>
          <select id="enq-treatment" value={treatmentInterest} onChange={(e) => setTreatmentInterest(e.target.value)} className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
            <option value="">Select a treatment (optional)</option>
            {treatments.map((t) => (
              <option key={t.id || t._id} value={t._id || t.id}>{t.title}</option>
            ))}
          </select>
        </div>
      )}

      {message && (
        <div className={`rounded-lg px-4 py-3 text-sm ${status === "success" ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" : status === "error" ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400" : "bg-zinc-50 text-zinc-600"}`}>
          {message}
        </div>
      )}

      <Button type="submit" disabled={status === "loading"} className={compact ? "h-11 w-full" : "w-full"}>
        {status === "loading" ? "Submitting..." : compact ? "Book Appointment" : "Submit Enquiry"}
      </Button>
      {!compact && <p className="text-xs text-zinc-400 text-center">By submitting you agree to be contacted. No medical data required here.</p>}
    </form>
  );
}
