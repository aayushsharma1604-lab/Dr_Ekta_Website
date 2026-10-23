"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchRequest, updateRequest } from "@/modules/clinicInfo/clinicInfo.slice";
import { SpinnerCustom } from "@/components/ui/spinner";

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const dayLabels: Record<string, string> = { monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday", thursday: "Thursday", friday: "Friday", saturday: "Saturday", sunday: "Sunday" };

export default function ClinicInfoPage() {
  const dispatch = useAppDispatch();
  const { data, loading } = useAppSelector((s) => s.clinicInfo);

  const [timings, setTimings] = useState<Record<string, { open: string; close: string; isClosed: boolean }>>({});
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("India");
  const [legalEntityName, setLegalEntityName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [practiceName, setPracticeName] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [facebook, setFacebook] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");

  useEffect(() => { dispatch(fetchRequest()); }, [dispatch]);

  useEffect(() => {
    const d = data as unknown as Record<string, never> as never;
    if (!d) return;
    const dd = d as unknown as {
      practiceName?: string; email?: string; legalEntityName?: string;
      address?: { street?: string; city?: string; state?: string; pincode?: string; country?: string };
      mapCoordinates?: { latitude?: number; longitude?: number };
      phones?: string[]; timings?: { day: string; open: string; close: string; isClosed: boolean }[];
      socialLinks?: { platform: string; url: string }[];
    };
    setPracticeName(dd.practiceName || "");
    setEmail(dd.email || "");
    setLegalEntityName(dd.legalEntityName || "");
    setStreet(dd.address?.street || "");
    setCity(dd.address?.city || "");
    setStateVal(dd.address?.state || "");
    setPincode(dd.address?.pincode || "");
    setCountry(dd.address?.country || "India");
    setLatitude(dd.mapCoordinates?.latitude?.toString() || "");
    setLongitude(dd.mapCoordinates?.longitude?.toString() || "");
    if (dd.phones?.[0]) setPhone(dd.phones[0]);
    if (dd.phones?.[1]) setWhatsapp(dd.phones[1]);
    if (dd.timings?.length) {
      const t: Record<string, { open: string; close: string; isClosed: boolean }> = {};
      dd.timings.forEach((x) => { t[x.day] = { open: x.open || "", close: x.close || "", isClosed: !!x.isClosed }; });
      setTimings(t);
    }
    if (dd.socialLinks?.length) {
      dd.socialLinks.forEach((s) => {
        if (s.platform === "instagram") setInstagram(s.url);
        if (s.platform === "youtube") setYoutube(s.url);
        if (s.platform === "facebook") setFacebook(s.url);
        if (s.platform === "linkedin") setLinkedin(s.url);
        if (s.platform === "twitter") setTwitter(s.url);
      });
    }
  }, [data]);

  const handleSaveTimings = () => {
    const payload = {
      timings: days.map((day) => ({
        day,
        open: timings[day]?.isClosed ? "" : timings[day]?.open || "10:00",
        close: timings[day]?.isClosed ? "" : timings[day]?.close || "20:00",
        isClosed: !!timings[day]?.isClosed,
      })),
    };
    dispatch(updateRequest(payload as never));
  };

  const handleSaveContact = () => {
    const payload: Record<string, unknown> = {
      practiceName: practiceName || undefined,
      phones: [phone, whatsapp].filter(Boolean),
      email: email || undefined,
      legalEntityName: legalEntityName || undefined,
      address: { street, city, state: stateVal, pincode, country },
      mapCoordinates: {
        latitude: latitude ? parseFloat(latitude) : 0,
        longitude: longitude ? parseFloat(longitude) : 0,
      },
    };
    dispatch(updateRequest(payload as never));
  };

  const handleSaveSocial = () => {
    const socialLinks = [
      instagram ? { platform: "instagram", url: instagram } : null,
      youtube ? { platform: "youtube", url: youtube } : null,
      facebook ? { platform: "facebook", url: facebook } : null,
      linkedin ? { platform: "linkedin", url: linkedin } : null,
      twitter ? { platform: "twitter", url: twitter } : null,
    ].filter(Boolean);
    dispatch(updateRequest({ socialLinks } as never));
  };

  if (loading && !data) {
    return (
      <AdminLayout>
        <div className="p-6"><SpinnerCustom /></div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Clinic Information</h2>
          <p className="text-sm text-zinc-500">Update clinic timings and contact details</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Practice Name</label>
              <input value={practiceName} onChange={(e) => setPracticeName(e.target.value)} placeholder="Dr. Ekta Narula Dental Care" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Legal Entity Name</label>
              <input value={legalEntityName} onChange={(e) => setLegalEntityName(e.target.value)} placeholder="Legal entity name" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
            </div>
          </div>
        </div>

        {/* Clinic Timings */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 font-semibold text-zinc-900 dark:text-white">Clinic Timings</h3>
          <div className="space-y-3">
            {days.map((day) => {
              const t = timings[day] || { open: "10:00", close: "20:00", isClosed: false };
              return (
                <div key={day} className="flex items-center gap-4">
                  <label className="flex w-28 items-center gap-2">
                    <input type="checkbox" checked={!t.isClosed} onChange={(e) => setTimings({ ...timings, [day]: { ...t, isClosed: !e.target.checked } })} className="rounded" />
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{dayLabels[day]}</span>
                  </label>
                  <input type="time" value={t.isClosed ? "" : t.open} disabled={t.isClosed} onChange={(e) => setTimings({ ...timings, [day]: { ...t, open: e.target.value } })} className="w-32 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white disabled:opacity-50" />
                  <span className="text-zinc-400">to</span>
                  <input type="time" value={t.isClosed ? "" : t.close} disabled={t.isClosed} onChange={(e) => setTimings({ ...timings, [day]: { ...t, close: e.target.value } })} className="w-32 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white disabled:opacity-50" />
                  {day === "saturday" && !t.isClosed && <span className="text-xs text-amber-600 dark:text-amber-400">Half day</span>}
                </div>
              );
            })}
          </div>
          <button onClick={handleSaveTimings} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save Timings</button>
        </div>

        {/* Contact Details */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 font-semibold text-zinc-900 dark:text-white">Contact Details</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Phone Number</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91-9876543210" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
              <p className="mt-1 text-xs text-zinc-400">10-20 chars, digits, spaces, + - ( )</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">WhatsApp Number</label>
              <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+91-9876543210" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="info@drektanarula.com" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Legal Entity Name</label>
              <input value={legalEntityName} onChange={(e) => setLegalEntityName(e.target.value)} placeholder="Legal entity" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Street Address</label>
              <input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Street address" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">City</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">State</label>
              <input value={stateVal} onChange={(e) => setStateVal(e.target.value)} placeholder="State" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Pincode</label>
              <input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="Pincode" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Country</label>
              <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="India" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Latitude</label>
              <input value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="e.g. 28.6139" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Longitude</label>
              <input value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="e.g. 77.2090" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
            </div>
          </div>
          <button onClick={handleSaveContact} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save Contact Info</button>
        </div>

        {/* Social Links */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 font-semibold text-zinc-900 dark:text-white">Social Media Links</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Instagram URL</label>
              <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/drektanarula" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">YouTube URL</label>
              <input value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="https://youtube.com/@drektanarula" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Facebook URL</label>
              <input value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://facebook.com/drektanarula" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">LinkedIn URL</label>
              <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/drektanarula" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Twitter URL</label>
              <input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="https://twitter.com/drektanarula" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
            </div>
          </div>
          <button onClick={handleSaveSocial} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save Social Links</button>
        </div>
      </div>
    </AdminLayout>
  );
}
