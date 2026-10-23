import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";

/**
 * POST /api/auth/logout — BFF proxy to backend logout
 * Proxies to POST {{API_BASE}}/admin/auth/logout
 * Clears httpOnly cookie.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));

        const backendRes = await fetch(`${API_BASE}/admin/auth/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                cookie: request.headers.get("cookie") || "",
            },
            body: JSON.stringify(body),
            credentials: "include",
        });

        const data = await backendRes.json().catch(() => ({ message: "Logged out" }));

        const response = NextResponse.json(data, { status: 200 });

        // Clear the refresh token cookie
        const setCookie = backendRes.headers.get("set-cookie");
        if (setCookie) {
            response.headers.set("set-cookie", setCookie);
        }

        return response;
    } catch {
        // Logout should always succeed from the frontend's perspective
        return NextResponse.json({ message: "Logged out" }, { status: 200 });
    }
}
