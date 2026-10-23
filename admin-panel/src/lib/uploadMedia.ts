import { api } from "./api";

export interface LibraryAsset {
  _id: string;
  url: string;
  optimizedUrl?: string;
  filename: string;
  mimeType: string;
  size: number;
  [k: string]: unknown;
}

interface SignedUpload {
  uploadUrl?: string;
  publicUrl?: string;
  url?: string;
  secure_url?: string;
  publicId?: string;
  public_id?: string;
  storageKey?: string;
  apiKey?: string;
  timestamp?: number | string;
  signature?: string;
  paramsToSign?: Record<string, unknown>;
}

/**
 * Upload a file into the single Media Library and return the created asset.
 * Flow: signed URL -> direct browser POST to Cloudinary -> confirm.
 * Strict: throws on any failure so callers never store placeholder/fake URLs.
 */
export async function uploadFileToLibrary(file: File): Promise<LibraryAsset> {
  // Step 1: signed upload params from backend (validates type/size)
  const { data }: { data: SignedUpload } = await api.post("/api/media/upload", {
    filename: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
  });

  const uploadUrl = data.uploadUrl;
  if (!uploadUrl) {
    throw new Error("Upload is not configured (no signed upload URL).");
  }

  let finalUrl = data.publicUrl || data.url || data.secure_url || "";
  let finalPublicId = data.publicId || data.public_id || data.storageKey || "";

  // Step 2: browser POST straight to Cloudinary (bytes never touch our backend)
  const fd = new FormData();
  fd.append("file", file);
  if (data.apiKey) fd.append("api_key", String(data.apiKey));
  if (data.timestamp) fd.append("timestamp", String(data.timestamp));
  if (data.signature) fd.append("signature", String(data.signature));
  if (finalPublicId) fd.append("public_id", String(finalPublicId));
  if (data.paramsToSign) {
    Object.entries(data.paramsToSign).forEach(([k, v]) => {
      if (["public_id", "timestamp", "signature", "api_key"].includes(k)) return;
      if (v === undefined || v === null) return;
      fd.append(k, Array.isArray(v) ? JSON.stringify(v) : String(v));
    });
  }

  let cloudRes: Response;
  try {
    cloudRes = await fetch(uploadUrl, { method: "POST", body: fd });
  } catch (e) {
    throw new Error(`Cloudinary upload failed: ${(e as Error).message}`);
  }
  if (!cloudRes.ok) {
    const t = await cloudRes.text().catch(() => "");
    throw new Error(`Cloudinary upload failed (${cloudRes.status}). ${t.slice(0, 200)}`);
  }
  const cloudData = (await cloudRes.json()) as Record<string, unknown>;
  finalUrl = (cloudData.secure_url as string) || (cloudData.url as string) || finalUrl;
  finalPublicId = (cloudData.public_id as string) || finalPublicId;

  if (!finalUrl || !finalPublicId) {
    throw new Error("Cloudinary upload did not return a usable URL/public ID.");
  }

  // Step 3: confirm -> creates the MediaAsset in the library
  const { data: asset }: { data: LibraryAsset } = await api.post("/api/media/confirm", {
    key: finalPublicId,
    publicId: finalPublicId,
    url: finalUrl,
    filename: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
  });

  if (!asset || !asset._id) {
    throw new Error("Media confirm did not return an asset ID.");
  }
  return asset;
}
