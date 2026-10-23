import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";

/**
 * POST /api/auth/refresh — BFF proxy to backend token refresh
 * Proxies to POST {{API_BASE}}/admin/auth/refresh
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));

        const backendRes = await fetch(`${API_BASE}/admin/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                cookie: request.headers.get("cookie") || "",
            },
            body: JSON.stringify(body),
            credentials: "include",
        });

        const data = await backendRes.json();

        if (!backendRes.ok) {
            return NextResponse.json(data, { status: backendRes.status });
        }

        const response = NextResponse.json(data, { status: 200 });
        const setCookie = backendRes.headers.get("set-cookie");
        if (setCookie) {
            response.headers.set("set-cookie", setCookie);
        }

        return response;
    } catch {
        return NextResponse.json(
            { error: "Failed to refresh token" },
            { status: 502 },
        );
    }
}
