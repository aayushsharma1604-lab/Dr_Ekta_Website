"use client";

import { ExternalLink, User, Menu } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { logoutRequest } from "@/modules/auth/auth.slice";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useEffect } from "react";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { accessToken } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!accessToken) router.push("/login");
  }, [accessToken, router]);

  const handleLogout = () => {
    const rt = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    dispatch(logoutRequest(rt ? { refreshToken: rt } : undefined));
    router.push("/login");
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 sm:px-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 lg:hidden"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base font-semibold text-zinc-900 dark:text-white sm:text-lg">
          Admin Dashboard
        </h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <a
          href="https://drektanarula.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white sm:text-sm"
        >
          <ExternalLink size={14} />
          <span className="hidden sm:inline">View Site</span>
        </a>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <User size={14} className="text-blue-600" />
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-zinc-500 hover:text-red-600 sm:text-sm"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
