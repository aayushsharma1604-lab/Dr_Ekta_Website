import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";

/**
 * POST /api/enquiry — BFF proxy to backend enquiry form
 * Proxies to POST {{API_BASE}}/public/enquiry
 * Rate-limited on backend (20/min/IP).
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const backendRes = await fetch(`${API_BASE}/public/enquiry`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Forward client IP for backend rate limiting
                "x-forwarded-for": request.headers.get("x-forwarded-for") || "",
            },
            body: JSON.stringify(body),
        });

        const data = await backendRes.json();

        return NextResponse.json(data, { status: backendRes.status });
    } catch {
        return NextResponse.json(
            { error: "Failed to submit enquiry" },
            { status: 502 },
        );
    }
}
