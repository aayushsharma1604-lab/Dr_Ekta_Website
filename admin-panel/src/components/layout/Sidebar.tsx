"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  BookOpen,
  Video,
  Camera,
  HelpCircle,
  MessageSquareQuote,
  Image,
  Building2,
  Megaphone,
  Search,
  Settings,
  ArrowRightLeft,
  BarChart3,
  LogOut,
  X,
} from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { logoutRequest } from "@/modules/auth/auth.slice";
import { useRouter } from "next/navigation";

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={18} />,
  Calendar: <Calendar size={18} />,
  Users: <Users size={18} />,
  Stethoscope: <Stethoscope size={18} />,
  BookOpen: <BookOpen size={18} />,
  Video: <Video size={18} />,
  Instagram: <Camera size={18} />,
  HelpCircle: <HelpCircle size={18} />,
  MessageSquareQuote: <MessageSquareQuote size={18} />,
  Image: <Image size={18} />,
  Building2: <Building2 size={18} />,
  Megaphone: <Megaphone size={18} />,
  Search: <Search size={18} />,
  ArrowRightLeft: <ArrowRightLeft size={18} />,
  BarChart3: <BarChart3 size={18} />,
  Settings: <Settings size={18} />,
};

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const handleLogout = () => {
    const rt = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    dispatch(logoutRequest(rt ? { refreshToken: rt } : undefined));
    router.push("/login");
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-zinc-200 bg-white transition-transform duration-200 dark:border-zinc-800 dark:bg-zinc-900 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">E</div>
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-white">Dr. Ekta Narula</p>
              <p className="text-[10px] text-zinc-500">Admin</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded p-1 text-zinc-400 hover:bg-zinc-100 lg:hidden">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                }`}
              >
                {iconMap[item.icon]}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-zinc-200 px-2 py-3 dark:border-zinc-800">
          <button onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
