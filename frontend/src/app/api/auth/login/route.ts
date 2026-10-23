import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";

/**
 * POST /api/auth/login — BFF proxy to backend
 * Proxies to POST {{API_BASE}}/admin/auth/login
 * Keeps tokens on the client; cookie is set by backend directly.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendRes = await fetch(`${API_BASE}/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    // Forward the Set-Cookie header from backend (httpOnly refresh token)
    const response = NextResponse.json(data, { status: 200 });
    const setCookie = backendRes.headers.get("set-cookie");
    if (setCookie) {
      response.headers.set("set-cookie", setCookie);
    }

    return response;
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to authentication service" },
      { status: 502 },
    );
  }
}
