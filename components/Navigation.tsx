"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions";

const navItems = [
  { href: "/", label: "Zuhause", icon: "🍕" },
  { href: "/leaderboard", label: "Rangliste", icon: "🏆" },
  { href: "/achievements", label: "Abzeichen", icon: "🎖️" },
  { href: "/stats", label: "Statistik", icon: "📊" },
  { href: "/profile", label: "Profil", icon: "👤" },
];

interface NavigationProps {
  isAdmin?: boolean;
}

export function Navigation({ isAdmin }: NavigationProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col w-56 min-h-screen bg-white border-r border-[#F7B731]/30 p-4 gap-1 fixed left-0 top-0 bottom-0 z-40">
        <div className="mb-6 mt-2 px-2">
          <h1 className="text-xl font-bold text-[#D62828]">🍕 Pizza Count</h1>
        </div>

        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
              pathname === item.href
                ? "bg-[#D62828] text-white"
                : "text-gray-700 hover:bg-[#F7B731]/20"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </Link>
        ))}

        {isAdmin && (
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
              pathname === "/admin"
                ? "bg-[#D62828] text-white"
                : "text-gray-700 hover:bg-[#F7B731]/20"
            }`}
          >
            <span className="text-xl">⚙️</span>
            Admin
          </Link>
        )}

        <div className="mt-auto">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-[#D62828] transition-colors"
            >
              <span className="text-xl">🚪</span>
              Abmelden
            </button>
          </form>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#F7B731]/30 flex">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors min-h-[56px] ${
              pathname === item.href
                ? "text-[#D62828]"
                : "text-gray-500"
            }`}
          >
            <span className="text-2xl leading-none">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
        {isAdmin && (
          <Link
            href="/admin"
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors min-h-[56px] ${
              pathname === "/admin" ? "text-[#D62828]" : "text-gray-500"
            }`}
          >
            <span className="text-2xl leading-none">⚙️</span>
            <span className="text-[10px] font-medium">Admin</span>
          </Link>
        )}
      </nav>
    </>
  );
}
