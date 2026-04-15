"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

        {/* Center add button
            The icon is absolutely positioned above its layout placeholder so it
            visually pops up while the label stays on the same baseline as sibling
            tab labels. The placeholder (h-7 = 28px) matches the emoji icon height
            used in sibling tabs, keeping justify-center centring identical. */}
        <button
          onClick={() => setAddSheetOpen(true)}
          aria-label="Pizza hinzufügen"
          className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 min-h-[56px]"
        >
          <div className="relative h-7 w-12 flex items-center justify-center">
            <div className="absolute -top-2 w-12 h-12 bg-[#D62828] rounded-2xl flex items-center justify-center shadow-lg shadow-[#D62828]/30">
              <span className="text-2xl leading-none">🍕</span>
            </div>
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
            <motion.div
              className="md:hidden fixed inset-0 bg-black/40 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              className="md:hidden fixed top-0 right-0 bottom-0 z-50 w-64 bg-white shadow-2xl flex flex-col p-5"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#D62828]">🍕 Menü</h2>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100"
                  aria-label="Menü schließen"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <Link
                  href="/profile"
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                    pathname === "/profile"
                      ? "bg-[#D62828] text-white"
                      : "text-gray-700 hover:bg-[#F7B731]/20"
                  }`}
                >
                  <span className="text-xl">👤</span>
                  Profil
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setDrawerOpen(false)}
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

                <Link
                  href="/about"
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                    pathname === "/about"
                      ? "bg-[#D62828] text-white"
                      : "text-gray-700 hover:bg-[#F7B731]/20"
                  }`}
                >
                  <span className="text-xl">ℹ️</span>
                  Über die App
                </Link>
              </div>

              <div className="mt-auto">
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-[#D62828] transition-colors min-h-[48px]"
                  >
                    <span className="text-xl">🚪</span>
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
