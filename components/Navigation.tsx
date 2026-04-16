"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Settings, Info, LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions";
import { AddPizzaButton } from "./AddPizzaButton";

// Desktop sidebar links (Abzeichen merged into Rangliste page)
const sidebarItems = [
  { href: "/", label: "Zuhause", icon: "🍕" },
  { href: "/leaderboard", label: "Rangliste", icon: "🏆" },
  { href: "/stats", label: "Statistik", icon: "📊" },
  { href: "/profile", label: "Profil", icon: "👤" },
  { href: "/about", label: "Über die App", icon: "ℹ️" },
];

// Mobile bottom nav – left of the center add button
const leftTabs = [
  { href: "/", label: "Zuhause", icon: "🍕" },
  { href: "/leaderboard", label: "Rangliste", icon: "🏆" },
];

// Mobile bottom nav – right of the center add button
const rightTabs = [
  { href: "/stats", label: "Statistik", icon: "📊" },
];

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface NavigationProps {
  isAdmin?: boolean;
  users?: User[];
  currentUserId?: string;
}

export function Navigation({ isAdmin, users = [], currentUserId }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addSheetOpen, setAddSheetOpen] = useState(false);

  function handleAddSuccess() {
    router.refresh();
  }

  const navLinkClass = (href: string) =>
    `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
      pathname === href
        ? "bg-[#D62828] text-white"
        : "text-gray-700 hover:bg-[#F7B731]/20"
    }`;

  const drawerLinkClass = (href: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors mx-2 min-h-[52px] ${
      pathname === href
        ? "bg-[#D62828] text-white"
        : "text-gray-700 hover:bg-gray-50"
    }`;

  return (
    <>
      {/* ── Desktop sidebar ───────────────────────────────────────────── */}
      <nav className="hidden md:flex flex-col w-56 min-h-screen bg-white border-r border-[#F7B731]/30 p-4 gap-1 fixed left-0 top-0 bottom-0 z-40">
        <div className="mb-6 mt-2 px-2">
          <h1 className="text-xl font-bold text-[#D62828]">🍕 Pizza Count</h1>
        </div>

        {sidebarItems.map((item) => (
          <Link key={item.href} href={item.href} className={navLinkClass(item.href)}>
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </Link>
        ))}

        {isAdmin && (
          <Link href="/admin" className={navLinkClass("/admin")}>
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

      {/* ── Mobile bottom tab bar ─────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#F7B731]/30 flex items-stretch"
        style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
      >
        {/* Left tabs */}
        {leftTabs.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors min-h-[56px] ${
              pathname === item.href ? "text-[#D62828]" : "text-gray-500"
            }`}
          >
            <span className="text-[28px] leading-none">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}

        {/* Center add button – icon pops above bar, label sits below */}
        <button
          onClick={() => setAddSheetOpen(true)}
          aria-label="Pizza hinzufügen"
          className="flex-1 flex flex-col items-center justify-end pb-1 min-h-[56px]"
        >
          <div className="bg-[#D62828] rounded-full p-3 mb-1 -mt-5 shadow-lg shadow-[#D62828]/30">
            <span className="text-2xl leading-none">🍕</span>
          </div>
          <span className="text-[10px] font-medium text-[#D62828]">Eintragen</span>
        </button>

        {/* Right tabs */}
        {rightTabs.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors min-h-[56px] ${
              pathname === item.href ? "text-[#D62828]" : "text-gray-500"
            }`}
          >
            <span className="text-[28px] leading-none">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}

        {/* Hamburger */}
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Menü öffnen"
          className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 min-h-[56px] text-gray-500"
        >
          <span className="text-[28px] leading-none">☰</span>
          <span className="text-[10px] font-medium">Mehr</span>
        </button>
      </nav>

      {/* ── Controlled AddPizzaButton (opened by center nav button) ──── */}
      <AddPizzaButton
        open={addSheetOpen}
        onOpenChange={setAddSheetOpen}
        users={users}
        currentUserId={currentUserId}
        onSuccess={handleAddSuccess}
      />

      {/* ── Mobile slide-in drawer ────────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="md:hidden fixed inset-0 bg-black/40 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />

            {/* Drawer panel – slides in from right, rounded left corners */}
            <motion.div
              className="md:hidden fixed top-0 right-0 bottom-0 z-50 w-[280px] bg-white shadow-2xl flex flex-col rounded-tl-2xl rounded-bl-2xl overflow-hidden"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <h2 className="text-xl font-bold text-[#D62828]">🍕 Menü</h2>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"
                  aria-label="Menü schließen"
                >
                  ✕
                </button>
              </div>

              {/* Nav items */}
              <div className="flex flex-col gap-1 pt-3 flex-1">
                <Link
                  href="/profile"
                  onClick={() => setDrawerOpen(false)}
                  className={drawerLinkClass("/profile")}
                >
                  <User size={18} />
                  Profil
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setDrawerOpen(false)}
                    className={drawerLinkClass("/admin")}
                  >
                    <Settings size={18} />
                    Admin
                  </Link>
                )}

                <Link
                  href="/about"
                  onClick={() => setDrawerOpen(false)}
                  className={drawerLinkClass("/about")}
                >
                  <Info size={18} />
                  Über die App
                </Link>
              </div>

              {/* Divider + Logout */}
              <div className="px-2 pb-4">
                <div className="border-t border-gray-100 mb-2" />
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#D62828] hover:bg-red-50 transition-colors min-h-[52px]"
                  >
                    <LogOut size={18} />
                    Abmelden
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
