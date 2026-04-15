"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChangelogSection {
  category: string;
  items: string[];
}

interface ChangelogEntry {
  version: string;
  date: string;
  sections: ChangelogSection[];
}

interface AboutClientProps {
  version: string;
  changelogEntries: ChangelogEntry[];
}

const CATEGORY_STYLES: Record<
  string,
  { emoji: string; colorClass: string; bgClass: string }
> = {
  Added: { emoji: "✨", colorClass: "text-green-700", bgClass: "bg-green-100" },
  Fixed: { emoji: "🐛", colorClass: "text-orange-700", bgClass: "bg-orange-100" },
  Changed: { emoji: "🔧", colorClass: "text-blue-700", bgClass: "bg-blue-100" },
};

type ItemStatus = "done" | "in_progress" | "planned";

const STATUS_BADGES: Record<ItemStatus, { label: string; className: string }> = {
  done: { label: "✅ Fertig", className: "bg-green-100 text-green-700" },
  in_progress: { label: "🔄 In Arbeit", className: "bg-blue-100 text-blue-700" },
  planned: { label: "⬜ Geplant", className: "bg-gray-100 text-gray-600" },
};

const roadmap: {
  phase: string;
  overallStatus: ItemStatus;
  items: { name: string; status: ItemStatus }[];
}[] = [
  {
    phase: "Phase 1 – MVP",
    overallStatus: "done",
    items: [
      { name: "Basis-Setup (Next.js, Prisma, Auth.js, SQLite)", status: "done" },
      { name: "Login & Benutzerverwaltung (Admin/User)", status: "done" },
      { name: "+1 Pizza Button mit Konfetti-Animation", status: "done" },
      { name: "Dashboard, Leaderboard, Achievements & Badges", status: "done" },
      { name: "Profil-Seite", status: "done" },
      { name: "Docker Compose Deployment", status: "done" },
    ],
  },
  {
    phase: "Phase 2 – Bewertungssystem",
    overallStatus: "done",
    items: [
      { name: "Halbe Pizzen (½, 1, 1½, 2)", status: "done" },
      { name: "Avatar-Picker mit Emoji-Mart", status: "done" },
      { name: "Sterne-Bewertung (1–5) beim Eintragen", status: "done" },
      { name: "Pizza-Sorte & Ort als Felder", status: "done" },
      { name: "Statistik-Seite (Jahres-/Monatsübersicht)", status: "done" },
      { name: "Einträge löschen (eigene + Admin)", status: "done" },
      { name: "Admin: Alle Einträge verwalten", status: "done" },
    ],
  },
  {
    phase: "Phase 3 – Polish & PWA",
    overallStatus: "done",
    items: [
      { name: "PWA Icons & Manifest (Homebildschirm)", status: "done" },
      { name: "Safe Area Fix (iPhone Home-Indikator)", status: "done" },
      { name: "Smart Dropdowns (global geteilt)", status: "done" },
      { name: "Pizza teilen mit mehreren Usern", status: "done" },
      { name: "Datum rückdatieren beim Eintragen", status: "done" },
      { name: "Build-Version & /about Seite mit Changelog", status: "done" },
    ],
  },
  {
    phase: "Phase 4 – Geplant",
    overallStatus: "planned",
    items: [
      { name: "Statistik-Filter (Nur ich / Alle / individuelle User)", status: "planned" },
      { name: "Admin-Badges manuell erstellen & vergeben", status: "planned" },
      { name: "Merge/Edit für Listen-Einträge", status: "planned" },
      { name: "Dark Mode", status: "planned" },
      { name: "PWA Push Notifications", status: "planned" },
      { name: "Statistik Export als CSV", status: "planned" },
    ],
  },
];

export function AboutClient({ version, changelogEntries }: AboutClientProps) {
  const [activeTab, setActiveTab] = useState<"app" | "changelog" | "geplant">("app");
  // Phase 4 (index 3) open by default
  const [openPhases, setOpenPhases] = useState<Record<number, boolean>>({ 3: true });

  function togglePhase(index: number) {
    setOpenPhases((prev) => ({ ...prev, [index]: !prev[index] }));
  }

  const tabs = [
    { id: "app" as const, label: "App" },
    { id: "changelog" as const, label: "Changelog" },
    { id: "geplant" as const, label: "Geplant" },
  ];

  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-6 max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#D62828]">ℹ️ Über die App</h1>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 mb-5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-colors min-h-[44px] ${
              activeTab === tab.id
                ? "bg-[#D62828] text-white"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: App ─────────────────────────────────────────────── */}
      {activeTab === "app" && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#F7B731]/20 text-center">
          <div className="text-7xl mb-4">🍕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Pizza Count</h2>
          <span className="inline-block bg-[#D62828]/10 text-[#D62828] text-xs font-semibold px-3 py-1 rounded-full mb-5">
            v{version}
          </span>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            Trackt jede gemeinsam gegessene Pizza. 🍕
            <br />
            Weil jede Pizza zählt.
          </p>
          <p className="text-gray-500 text-sm mb-5">Made with 🍕 by Max</p>
          <a
            href="https://github.com/ToDiii/pizza_count"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#D62828] transition-colors border border-gray-200 rounded-xl px-4 py-2 hover:border-[#D62828]/30"
          >
            <span>⭐</span>
            GitHub
          </a>
        </div>
      )}

      {/* ── Tab 2: Changelog ───────────────────────────────────────── */}
      {activeTab === "changelog" && (
        <div className="flex flex-col gap-4">
          {changelogEntries.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm shadow-sm border border-[#F7B731]/20">
              Kein Changelog gefunden.
            </div>
          ) : (
            changelogEntries.map((entry) => (
              <div
                key={entry.version}
                className="bg-white rounded-2xl p-5 shadow-sm border border-[#F7B731]/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-lg font-bold text-[#D62828]">
                    v{entry.version}
                  </span>
                  <span className="text-xs text-gray-400">{entry.date}</span>
                </div>
                <div className="flex flex-col gap-3">
                  {entry.sections.map((section) => {
                    const style = CATEGORY_STYLES[section.category] ?? {
                      emoji: "📝",
                      colorClass: "text-gray-700",
                      bgClass: "bg-gray-100",
                    };
                    return (
                      <div key={section.category}>
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full mb-2 ${style.bgClass} ${style.colorClass}`}
                        >
                          {style.emoji} {section.category}
                        </span>
                        <ul className="flex flex-col gap-1 pl-1">
                          {section.items.map((item, i) => (
                            <li key={i} className="text-sm text-gray-700 flex gap-2">
                              <span className="text-gray-300 flex-shrink-0">–</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Tab 3: Geplant ─────────────────────────────────────────── */}
      {activeTab === "geplant" && (
        <div className="flex flex-col gap-3">
          {roadmap.map((phase, index) => {
            const isOpen = openPhases[index] ?? false;
            const overallBadge = STATUS_BADGES[phase.overallStatus];

            return (
              <div
                key={phase.phase}
                className="bg-white rounded-2xl shadow-sm border border-[#F7B731]/20 overflow-hidden"
              >
                <button
                  onClick={() => togglePhase(index)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors min-h-[56px]"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="font-semibold text-gray-800 text-sm">
                      {phase.phase}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${overallBadge.className}`}
                    >
                      {overallBadge.label}
                    </span>
                  </div>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-gray-400 flex-shrink-0 ml-2 inline-block"
                  >
                    ▾
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 border-t border-gray-100">
                        <ul className="flex flex-col gap-2 pt-3">
                          {phase.items.map((item) => {
                            const badge = STATUS_BADGES[item.status];
                            return (
                              <li
                                key={item.name}
                                className="flex items-center justify-between gap-3 min-h-[32px]"
                              >
                                <span className="text-sm text-gray-700">
                                  {item.name}
                                </span>
                                <span
                                  className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${badge.className}`}
                                >
                                  {badge.label}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
