"use client";

import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { loginSuccess } from "@/store/slices/authSlice";
import { setTokens } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Call real backend directly (admin prefix)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api"}/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || "Invalid credentials");
      }
      // data: { user, accessToken, refreshToken }
      const { user, accessToken, refreshToken } = data as { user: { id: string; name: string; email: string }; accessToken: string; refreshToken: string };
      if (accessToken && refreshToken) {
        setTokens(accessToken, refreshToken);
        dispatch(loginSuccess({ user }));
        router.push("/dashboard");
      } else {
        throw new Error("Missing tokens in response");
      }
    } catch (err: unknown) {
      const msg = err instanceof ApiClientError ? err.message : err instanceof Error ? err.message : "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>Admin Login</CardTitle><p className="text-sm text-zinc-500">Use backend at {process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api"}</p></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20">{error}</div>}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
            </div>
            <Button type="submit" disabled={loading}>{loading ? "Signing in..." : "Login"}</Button>
            <p className="text-xs text-zinc-400 text-center">Demo: call POST /api/admin/auth/login with email+password. 5 fails → 15m lock.</p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
