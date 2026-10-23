"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchRequest, updateRequest } from "@/modules/profile/profile.slice";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { SpinnerCustom } from "@/components/ui/spinner";

// local types
type Qualification = { degree: string; institution: string; year: string | number };
type Membership = { organization: string; role: string; since: string | number };
type Award = { title: string; issuer: string; year: string | number };
type MediaAppearance = { outlet: string; title: string; date: string; url: string };
type Publication = { title: string; journal: string; year: string | number; url: string };

function yearInvalid(y: string | number | undefined | null): boolean {
  if (y === "" || y === undefined || y === null) return false;
  const n = Number(y);
  return Number.isNaN(n) || n < 1950 || n > 2030;
}

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  // profile not yet wired in store, fallback gracefully
  const raw = useAppSelector((s: any) => s.profile) as { data: any; loading: boolean; error: string | null } | undefined;
  const data = raw?.data ?? null;
  const loading = raw?.loading ?? false;

  const [bio, setBio] = useState("");
  const [photoId, setPhotoId] = useState<string>("");
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [videoId, setVideoId] = useState<string>("");
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [videoUploading, setVideoUploading] = useState(false);

  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [mediaAppearances, setMediaAppearances] = useState<MediaAppearance[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);

  useEffect(() => {
    dispatch(fetchRequest());
  }, [dispatch]);

  useEffect(() => {
    if (!data) return;
    const d: any = data;
    setBio(typeof d.bio === "string" ? d.bio : "");

    // photo - can be string id or populated object { _id, url }
    if (typeof d.photo === "string" && d.photo) {
      setPhotoId(d.photo);
    } else if (d.photo && typeof d.photo === "object") {
      setPhotoId(d.photo._id || d.photo.id || "");
      if (d.photo.url) setPhotoPreview(d.photo.url);
      else if (d.photo.secure_url) setPhotoPreview(d.photo.secure_url);
    }

    if (typeof d.video === "string" && d.video) {
      setVideoId(d.video);
    } else if (d.video && typeof d.video === "object") {
      setVideoId(d.video._id || d.video.id || "");
      if (d.video.url) setVideoPreview(d.video.url);
      else if (d.video.secure_url) setVideoPreview(d.video.secure_url);
    }

    if (Array.isArray(d.qualifications)) {
      setQualifications(
        d.qualifications.map((q: any) => ({
          degree: q.degree || "",
          institution: q.institution || "",
          year: q.year ?? "",
        }))
      );
    }
    if (Array.isArray(d.memberships)) {
      setMemberships(
        d.memberships.map((m: any) => ({
          organization: m.organization || "",
          role: m.role || "",
          since: m.since ?? "",
        }))
      );
    }
    if (Array.isArray(d.awards)) {
      setAwards(
        d.awards.map((a: any) => ({
          title: a.title || "",
          issuer: a.issuer || "",
          year: a.year ?? "",
        }))
      );
    }
    if (Array.isArray(d.mediaAppearances)) {
      setMediaAppearances(
        d.mediaAppearances.map((ma: any) => ({
          outlet: ma.outlet || "",
          title: ma.title || "",
          date: ma.date ? String(ma.date).slice(0, 10) : "",
          url: ma.url || "",
        }))
      );
    }
    if (Array.isArray(d.publications)) {
      setPublications(
        d.publications.map((p: any) => ({
          title: p.title || "",
          journal: p.journal || "",
          year: p.year ?? "",
          url: p.url || "",
        }))
      );
    }
  }, [data]);

  const uploadMedia = async (file: File, folder = "profile") => {
    const key = `${folder}/${Date.now()}_${file.name}`;
    // placeholder pattern used across admin (gallery) – confirms via backend
    const payload = {
      key,
      publicId: key,
      url: `https://via.placeholder.com/600x400?text=${encodeURIComponent(file.name)}`,
      filename: file.name,
      mimeType: file.type || "image/jpeg",
      size: file.size,
    };
    const res: any = await api.post("/api/media/confirm", payload);
    const returned = res.data?.data ?? res.data;
    const id = returned?._id || returned?.id || returned?.data?._id;
    if (!id) throw new Error("Media confirm failed - no id returned");
    return id as string;
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoPreview(URL.createObjectURL(f));
    setPhotoUploading(true);
    try {
      const id = await uploadMedia(f, "profile/photo");
      setPhotoId(id);
      toast.success("Photo uploaded");
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || "Photo upload failed";
      toast.error(msg);
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // for video preview, use object URL if image fallback won't show video but we store id
    setVideoPreview(URL.createObjectURL(f));
    setVideoUploading(true);
    try {
      const id = await uploadMedia(f, "profile/video");
      setVideoId(id);
      toast.success("Video uploaded");
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || "Video upload failed";
      toast.error(msg);
    } finally {
      setVideoUploading(false);
    }
  };

  const handleSave = () => {
    // validate years 1950-2030
    for (let i = 0; i < qualifications.length; i++) {
      if (yearInvalid(qualifications[i].year)) {
        toast.error(`Qualification #${i + 1} year must be between 1950 and 2030`);
        return;
      }
    }
    for (let i = 0; i < memberships.length; i++) {
      if (yearInvalid(memberships[i].since)) {
        toast.error(`Membership #${i + 1} since year must be between 1950 and 2030`);
        return;
      }
    }
    for (let i = 0; i < awards.length; i++) {
      if (yearInvalid(awards[i].year)) {
        toast.error(`Award #${i + 1} year must be between 1950 and 2030`);
        return;
      }
    }
    for (let i = 0; i < publications.length; i++) {
      if (yearInvalid(publications[i].year)) {
        toast.error(`Publication #${i + 1} year must be between 1950 and 2030`);
        return;
      }
    }

    // Build whitelist payload with exact field names
    const payload: Record<string, any> = {
      bio: bio,
      qualifications: qualifications
        .filter((q) => q.degree.trim() || q.institution.trim() || q.year !== "")
        .map((q) => ({
          degree: q.degree.trim(),
          institution: q.institution.trim(),
          ...(q.year !== "" && q.year !== undefined && q.year !== null ? { year: Number(q.year) } : {}),
        })),
      memberships: memberships
        .filter((m) => m.organization.trim() || m.role.trim() || m.since !== "")
        .map((m) => ({
          organization: m.organization.trim(),
          role: m.role.trim(),
          ...(m.since !== "" && m.since !== undefined && m.since !== null ? { since: Number(m.since) } : {}),
        })),
      awards: awards
        .filter((a) => a.title.trim() || a.issuer.trim() || a.year !== "")
        .map((a) => ({
          title: a.title.trim(),
          issuer: a.issuer.trim(),
          ...(a.year !== "" && a.year !== undefined && a.year !== null ? { year: Number(a.year) } : {}),
        })),
      mediaAppearances: mediaAppearances
        .filter((ma) => ma.outlet.trim() || ma.title.trim() || ma.date.trim() || ma.url.trim())
        .map((ma) => ({
          outlet: ma.outlet.trim(),
          title: ma.title.trim(),
          ...(ma.date ? { date: ma.date } : {}),
          ...(ma.url.trim() ? { url: ma.url.trim() } : {}),
        })),
      publications: publications
        .filter((p) => p.title.trim() || p.journal.trim() || p.year !== "" || p.url.trim())
        .map((p) => ({
          title: p.title.trim(),
          journal: p.journal.trim(),
          ...(p.year !== "" && p.year !== undefined && p.year !== null ? { year: Number(p.year) } : {}),
          ...(p.url.trim() ? { url: p.url.trim() } : {}),
        })),
    };

    if (photoId) payload.photo = photoId;
    if (videoId) payload.video = videoId;

    dispatch(updateRequest(payload as never));
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Doctor Profile</h2>
            <p className="text-sm text-zinc-500">About / Meet Dr. Ekta</p>
          </div>
          <button
            onClick={handleSave}
            disabled={loading || photoUploading || videoUploading}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? <SpinnerCustom /> : "Save Profile"}
          </button>
        </div>

        {/* Bio */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-3 font-semibold text-zinc-900 dark:text-white">Bio</h3>
          <textarea
            rows={5}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Short biography / about Dr. Ekta..."
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </div>

        {/* Photo & Video */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-3 font-semibold text-zinc-900 dark:text-white">Photo</h3>
            {photoPreview ? (
              <img src={photoPreview} alt="photo preview" className="mb-3 h-40 w-full rounded-lg object-cover" />
            ) : (
              <div className="mb-3 flex h-40 items-center justify-center rounded-lg bg-zinc-100 text-xs text-zinc-500 dark:bg-zinc-800">No photo</div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
            {photoUploading && <p className="mt-1 text-xs text-blue-600">Uploading...</p>}
            {photoId && (
              <button onClick={() => { setPhotoId(""); setPhotoPreview(""); }} className="mt-2 text-xs text-red-600 hover:underline">Remove photo</button>
            )}
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-3 font-semibold text-zinc-900 dark:text-white">Video</h3>
            {videoPreview ? (
              <div className="mb-3 flex h-40 items-center justify-center rounded-lg bg-zinc-900 text-xs text-white">
                {videoPreview.startsWith("blob:") ? "Video selected" : videoPreview}
                {/* if preview is blob, show text; real video URL would be in populated object */}
              </div>
            ) : (
              <div className="mb-3 flex h-40 items-center justify-center rounded-lg bg-zinc-100 text-xs text-zinc-500 dark:bg-zinc-800">No video</div>
            )}
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
            {videoUploading && <p className="mt-1 text-xs text-blue-600">Uploading...</p>}
            {videoId && (
              <button onClick={() => { setVideoId(""); setVideoPreview(""); }} className="mt-2 text-xs text-red-600 hover:underline">Remove video</button>
            )}
          </div>
        </div>

        {/* Qualifications */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-zinc-900 dark:text-white">Qualifications</h3>
            <button
              onClick={() => setQualifications([...qualifications, { degree: "", institution: "", year: "" }])}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
            >
              <Plus size={14} /> Add
            </button>
          </div>
          {qualifications.length === 0 && <p className="text-sm text-zinc-500">No qualifications — add one.</p>}
          <div className="space-y-3">
            {qualifications.map((q, idx) => (
              <div key={idx} className="grid gap-3 md:grid-cols-[1fr_1fr_120px_40px] rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Degree</label>
                  <input
                    value={q.degree}
                    onChange={(e) => setQualifications(qualifications.map((x, i) => (i === idx ? { ...x, degree: e.target.value } : x)))}
                    placeholder="e.g. BDS, MDS"
                    maxLength={200}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Institution</label>
                  <input
                    value={q.institution}
                    onChange={(e) => setQualifications(qualifications.map((x, i) => (i === idx ? { ...x, institution: e.target.value } : x)))}
                    placeholder="e.g. AIIMS"
                    maxLength={200}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Year (1950-2030)</label>
                  <input
                    type="number"
                    min={1950}
                    max={2030}
                    value={q.year}
                    onChange={(e) => setQualifications(qualifications.map((x, i) => (i === idx ? { ...x, year: e.target.value } : x)))}
                    placeholder="e.g. 2010"
                    className={`w-full rounded-lg border px-3 py-1.5 text-sm dark:bg-zinc-800 dark:text-white ${yearInvalid(q.year) ? "border-red-400 dark:border-red-600" : "border-zinc-300 dark:border-zinc-700"}`}
                  />
                  {yearInvalid(q.year) && <p className="mt-1 text-[10px] text-red-600">Year must be 1950-2030</p>}
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => setQualifications(qualifications.filter((_, i) => i !== idx))}
                    className="rounded-lg p-2 text-zinc-400 hover:bg-white hover:text-red-600 dark:hover:bg-zinc-700"
                    aria-label="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Memberships */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-zinc-900 dark:text-white">Memberships</h3>
            <button
              onClick={() => setMemberships([...memberships, { organization: "", role: "", since: "" }])}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
            >
              <Plus size={14} /> Add
            </button>
          </div>
          {memberships.length === 0 && <p className="text-sm text-zinc-500">No memberships — add one.</p>}
          <div className="space-y-3">
            {memberships.map((m, idx) => (
              <div key={idx} className="grid gap-3 md:grid-cols-[1fr_1fr_120px_40px] rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Organization</label>
                  <input
                    value={m.organization}
                    onChange={(e) => setMemberships(memberships.map((x, i) => (i === idx ? { ...x, organization: e.target.value } : x)))}
                    placeholder="e.g. IDA"
                    maxLength={200}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Role</label>
                  <input
                    value={m.role}
                    onChange={(e) => setMemberships(memberships.map((x, i) => (i === idx ? { ...x, role: e.target.value } : x)))}
                    placeholder="e.g. Member"
                    maxLength={100}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Since (1950-2030)</label>
                  <input
                    type="number"
                    min={1950}
                    max={2030}
                    value={m.since}
                    onChange={(e) => setMemberships(memberships.map((x, i) => (i === idx ? { ...x, since: e.target.value } : x)))}
                    placeholder="e.g. 2015"
                    className={`w-full rounded-lg border px-3 py-1.5 text-sm dark:bg-zinc-800 dark:text-white ${yearInvalid(m.since) ? "border-red-400 dark:border-red-600" : "border-zinc-300 dark:border-zinc-700"}`}
                  />
                  {yearInvalid(m.since) && <p className="mt-1 text-[10px] text-red-600">Year must be 1950-2030</p>}
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => setMemberships(memberships.filter((_, i) => i !== idx))}
                    className="rounded-lg p-2 text-zinc-400 hover:bg-white hover:text-red-600 dark:hover:bg-zinc-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Awards */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-zinc-900 dark:text-white">Awards</h3>
            <button
              onClick={() => setAwards([...awards, { title: "", issuer: "", year: "" }])}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
            >
              <Plus size={14} /> Add
            </button>
          </div>
          {awards.length === 0 && <p className="text-sm text-zinc-500">No awards — add one.</p>}
          <div className="space-y-3">
            {awards.map((a, idx) => (
              <div key={idx} className="grid gap-3 md:grid-cols-[1fr_1fr_120px_40px] rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Title</label>
                  <input
                    value={a.title}
                    onChange={(e) => setAwards(awards.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)))}
                    placeholder="e.g. Best Dentist Award"
                    maxLength={200}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Issuer</label>
                  <input
                    value={a.issuer}
                    onChange={(e) => setAwards(awards.map((x, i) => (i === idx ? { ...x, issuer: e.target.value } : x)))}
                    placeholder="e.g. IDA"
                    maxLength={200}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Year (1950-2030)</label>
                  <input
                    type="number"
                    min={1950}
                    max={2030}
                    value={a.year}
                    onChange={(e) => setAwards(awards.map((x, i) => (i === idx ? { ...x, year: e.target.value } : x)))}
                    placeholder="e.g. 2020"
                    className={`w-full rounded-lg border px-3 py-1.5 text-sm dark:bg-zinc-800 dark:text-white ${yearInvalid(a.year) ? "border-red-400 dark:border-red-600" : "border-zinc-300 dark:border-zinc-700"}`}
                  />
                  {yearInvalid(a.year) && <p className="mt-1 text-[10px] text-red-600">Year must be 1950-2030</p>}
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => setAwards(awards.filter((_, i) => i !== idx))}
                    className="rounded-lg p-2 text-zinc-400 hover:bg-white hover:text-red-600 dark:hover:bg-zinc-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Media Appearances */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-zinc-900 dark:text-white">Media Appearances</h3>
            <button
              onClick={() => setMediaAppearances([...mediaAppearances, { outlet: "", title: "", date: "", url: "" }])}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
            >
              <Plus size={14} /> Add
            </button>
          </div>
          {mediaAppearances.length === 0 && <p className="text-sm text-zinc-500">No media appearances — add one.</p>}
          <div className="space-y-3">
            {mediaAppearances.map((ma, idx) => (
              <div key={idx} className="grid gap-3 md:grid-cols-[1fr_1fr] rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Outlet</label>
                  <input
                    value={ma.outlet}
                    onChange={(e) => setMediaAppearances(mediaAppearances.map((x, i) => (i === idx ? { ...x, outlet: e.target.value } : x)))}
                    placeholder="e.g. NDTV"
                    maxLength={200}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Title</label>
                  <input
                    value={ma.title}
                    onChange={(e) => setMediaAppearances(mediaAppearances.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)))}
                    placeholder="e.g. Interview on oral health"
                    maxLength={200}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Date</label>
                  <input
                    type="date"
                    value={ma.date}
                    onChange={(e) => setMediaAppearances(mediaAppearances.map((x, i) => (i === idx ? { ...x, date: e.target.value } : x)))}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">URL</label>
                    <input
                      value={ma.url}
                      onChange={(e) => setMediaAppearances(mediaAppearances.map((x, i) => (i === idx ? { ...x, url: e.target.value } : x)))}
                      placeholder="https://..."
                      className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                  </div>
                  <button
                    onClick={() => setMediaAppearances(mediaAppearances.filter((_, i) => i !== idx))}
                    className="mt-6 rounded-lg p-2 text-zinc-400 hover:bg-white hover:text-red-600 dark:hover:bg-zinc-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Publications */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-zinc-900 dark:text-white">Publications</h3>
            <button
              onClick={() => setPublications([...publications, { title: "", journal: "", year: "", url: "" }])}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
            >
              <Plus size={14} /> Add
            </button>
          </div>
          {publications.length === 0 && <p className="text-sm text-zinc-500">No publications — add one.</p>}
          <div className="space-y-3">
            {publications.map((p, idx) => (
              <div key={idx} className="rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Title</label>
                    <input
                      value={p.title}
                      onChange={(e) => setPublications(publications.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)))}
                      placeholder="e.g. Advances in Dental Implants"
                      maxLength={300}
                      className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Journal</label>
                    <input
                      value={p.journal}
                      onChange={(e) => setPublications(publications.map((x, i) => (i === idx ? { ...x, journal: e.target.value } : x)))}
                      placeholder="e.g. Journal of Dental Research"
                      maxLength={200}
                      className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Year (1950-2030)</label>
                    <input
                      type="number"
                      min={1950}
                      max={2030}
                      value={p.year}
                      onChange={(e) => setPublications(publications.map((x, i) => (i === idx ? { ...x, year: e.target.value } : x)))}
                      placeholder="e.g. 2021"
                      className={`w-full rounded-lg border px-3 py-1.5 text-sm dark:bg-zinc-800 dark:text-white ${yearInvalid(p.year) ? "border-red-400 dark:border-red-600" : "border-zinc-300 dark:border-zinc-700"}`}
                    />
                    {yearInvalid(p.year) && <p className="mt-1 text-[10px] text-red-600">Year must be 1950-2030</p>}
                  </div>
                  <div className="flex gap-2 md:col-span-2">
                    <div className="flex-1">
                      <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">URL</label>
                      <input
                        value={p.url}
                        onChange={(e) => setPublications(publications.map((x, i) => (i === idx ? { ...x, url: e.target.value } : x)))}
                        placeholder="https://..."
                        className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      />
                    </div>
                    <button
                      onClick={() => setPublications(publications.filter((_, i) => i !== idx))}
                      className="mt-6 rounded-lg p-2 text-zinc-400 hover:bg-white hover:text-red-600 dark:hover:bg-zinc-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading || photoUploading || videoUploading}
            className="rounded-lg bg-blue-600 px-8 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? <SpinnerCustom /> : "Save Profile"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
