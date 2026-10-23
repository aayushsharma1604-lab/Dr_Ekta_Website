import { publicApi } from "../client";
import type { EnquiryPayload, EnquiryResponse } from "../types";

/**
 * POST /api/public/enquiry — creates Lead
 * Rate-limited 20/min/IP
 * Honeypot must stay empty → fake 200
 * captchaToken "invalid-token" → 422
 * Medical fields forbidden → 422
 */

export function submitEnquiry(payload: EnquiryPayload): Promise<EnquiryResponse> {
  return publicApi.post<EnquiryResponse>("/enquiry", payload);
}
