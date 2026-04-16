"use client";

import { useState } from "react";
import { formatPizzaCount } from "@/lib/format";

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  count: number;
  lastEntry: string | null;
  isMe: boolean;
  rank: number;
}

interface AchievementItem {
  type: string;
  emoji: string;
  name: string;
  description: string;
  required: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
  progress: number;
}

interface LeaderboardClientProps {
  users: LeaderboardUser[];
  achievements: AchievementItem[];
  totalAchievements: number;
  unlockedCount: number;
}

const medals = ["🥇", "🥈", "🥉"];

export function LeaderboardClient({
  users,
  achievements,
  totalAchievements,
  unlockedCount,
}: LeaderboardClientProps) {
  const [activeTab, setActiveTab] = useState<"rangliste" | "abzeichen">("rangliste");

  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-6 max-w-xl mx-auto">
      {/* Tab switcher */}
      <div className="flex gap-2 mb-6 bg-gray-100 rounded-full p-1">
        <button
          onClick={() => setActiveTab("rangliste")}
          className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === "rangliste"
              ? "bg-[#D62828] text-white"
              : "text-gray-500"
          }`}
        >
          🏆 Rangliste
        </button>
        <button
          onClick={() => setActiveTab("abzeichen")}
          className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === "abzeichen"
              ? "bg-[#D62828] text-white"
              : "text-gray-500"
          }`}
        >
          🎖️ Abzeichen
        </button>
      </div>

      {/* ── Tab 1: Rangliste ──────────────────────────────────────────── */}
      {activeTab === "rangliste" && (
        <>
          <div className="mb-5">
            <h1 className="text-2xl font-bold text-[#D62828]">🏆 Rangliste</h1>
            <p className="text-gray-500 text-sm mt-1">Wer hat mehr Pizzen gegessen?</p>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">🍕</div>
              <p className="text-gray-500">Noch keine Einträge.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-4 transition-all ${
                    user.isMe
                      ? "border-[#D62828] ring-2 ring-[#D62828]/20"
                      : "border-[#F7B731]/20"
                  }`}
                >
                  <div className="w-10 text-center flex-shrink-0">
                    {user.rank <= 3 ? (
                      <span className="text-2xl">{medals[user.rank - 1]}</span>
                    ) : (
                      <span className="text-lg font-bold text-gray-400">
                        #{user.rank}
                      </span>
                    )}
                  </div>
                  <div className="text-2xl flex-shrink-0">{user.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                      {user.isMe && (
                        <span className="text-xs bg-[#D62828] text-white px-2 py-0.5 rounded-full flex-shrink-0">
                          Du
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {user.lastEntry ? `Zuletzt: ${user.lastEntry}` : "Noch keine Pizza"}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-black text-[#D62828]">
                      {formatPizzaCount(user.count)}
                    </p>
                    <p className="text-xs text-gray-400">Pizzen</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Tab 2: Abzeichen ─────────────────────────────────────────── */}
      {activeTab === "abzeichen" && (
        <>
          <div className="mb-5">
            <h1 className="text-2xl font-bold text-[#D62828]">🎖️ Abzeichen</h1>
            <p className="text-gray-500 text-sm mt-1">
              {unlockedCount} von {totalAchievements} freigeschaltet
            </p>
          </div>

          {/* Progress bar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#F7B731]/20 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Fortschritt</span>
              <span className="text-sm font-bold text-[#D62828]">
                {unlockedCount}/{totalAchievements}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="bg-[#D62828] h-3 rounded-full transition-all"
                style={{
                  width: `${(unlockedCount / totalAchievements) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {achievements.map((ach) => (
              <div
                key={ach.type}
                className={`bg-white rounded-2xl p-5 shadow-sm border transition-all ${
                  ach.isUnlocked
                    ? "border-[#F7B731] ring-2 ring-[#F7B731]/30"
                    : "border-gray-100 opacity-60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`text-4xl ${ach.isUnlocked ? "" : "grayscale"}`}>
                    {ach.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800">{ach.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {ach.isUnlocked ? (
                        <>Freigeschaltet am {ach.unlockedAt}</>
                      ) : (
                        <>
                          {ach.description} ({formatPizzaCount(ach.progress)}/{ach.required})
                        </>
                      )}
                    </p>
                    {!ach.isUnlocked && (
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-[#F7B731] h-1.5 rounded-full transition-all"
                          style={{ width: `${(ach.progress / ach.required) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                  {ach.isUnlocked && (
                    <span className="text-[#F7B731] text-xl flex-shrink-0">✨</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
