"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginRequest } from "@/modules/auth/auth.slice";
import { useRouter } from "next/navigation";
import { AtSign, Lock, Eye, EyeOff, ShieldCheck, FlaskConical } from "lucide-react";
import { SpinnerCustom } from "@/components/ui/spinner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error, user, accessToken } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (accessToken && user) router.push("/dashboard");
  }, [accessToken, user, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginRequest({ email, password }));
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — image panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-900 lg:flex">
        <img
          src="https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=1200&auto=format&fit=crop"
          alt="Dental care"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-blue-900/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

        <div className="relative z-10 p-8">
          <div className="flex items-center gap-2 text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 ring-1 ring-cyan-400/30">
              <FlaskConical size={16} className="text-cyan-400" />
            </div>
            <span className="font-semibold">Dr. Ekta Narula Dental Care</span>
          </div>
        </div>

        <div className="relative z-10 p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium tracking-wider text-cyan-300">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            SECURE ADMIN GATEWAY
          </div>
          <h1 className="text-4xl font-bold leading-tight text-white">
            Excellence in Dental
            <br />
            Care & Practice
            <br />
            Management
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">
            Manage patient records, appointments, clinic analytics, and administrative workflows seamlessly through our secure portal.
          </p>
        </div>

        <div className="relative z-10 p-8">
          <p className="text-xs text-slate-400">© 2026 Dr. Ekta Narula Dental Care. All rights reserved.</p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 p-6 dark:bg-zinc-950 lg:p-8">
        <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <ShieldCheck size={24} />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Admin Login</h2>
            <p className="mt-1 text-sm text-slate-500">Dr. Ekta Narula Dental Care</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wider text-zinc-700 dark:text-zinc-300">EMAIL ADDRESS</label>
              <div className="relative">
                <AtSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@drektanarula.com"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wider text-zinc-700 dark:text-zinc-300">PASSWORD</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <input type="checkbox" className="rounded border-zinc-300" /> Remember me
              </label>
              <a href="#" className="font-medium text-blue-600 hover:text-blue-700">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? <SpinnerCustom /> : "Sign In"}
            </button>
          </form>

          <div className="mt-6 border-t border-zinc-100 pt-6 text-center dark:border-zinc-800">
            <p className="text-xs text-slate-400">
              Need technical assistance? <a href="#" className="font-medium text-slate-700 dark:text-zinc-300">Contact IT Support</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
