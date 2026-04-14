"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPizzaCount } from "@/lib/format";

interface YearEntry {
  year: number;
  count: number;
  countFormatted: string;
}

interface MonthEntry {
  month: number;
  label: string;
  count: number;
}

interface TopEntry {
  name: string;
  count: number;
  countFormatted: string;
  avgRating: number | null;
}

interface UserMonthData {
  userId: string;
  name: string;
  avatar: string;
  color: string;
  monthDataByYear: Record<number, MonthEntry[]>;
}

interface StatsClientProps {
  yearData: YearEntry[];
  monthDataByYear: Record<number, MonthEntry[]>;
  years: number[];
  bestYear: string;
  bestMonth: string;
  avgPerMonth: string;
  currentYear: number;
  currentMonth: number;
  topPizzaTypes: TopEntry[];
  topLocations: TopEntry[];
  allUsers: { id: string; name: string; avatar: string }[];
  selectedUserIds: string[];
  currentUserId: string;
  isAdmin: boolean;
  perUserMonthData?: UserMonthData[];
}

export default function StatsClient({
  yearData,
  monthDataByYear,
  years,
  bestYear,
  bestMonth,
  avgPerMonth,
  currentYear,
  currentMonth,
  topPizzaTypes,
  topLocations,
  allUsers,
  selectedUserIds,
  currentUserId,
  isAdmin,
  perUserMonthData,
}: StatsClientProps) {
  const router = useRouter();
  const defaultYear = years.includes(currentYear)
    ? currentYear
    : years[years.length - 1] ?? currentYear;
  const [selectedYear, setSelectedYear] = useState(defaultYear);

  const maxYearCount = Math.max(...yearData.map((y) => y.count), 1);
  const monthData = monthDataByYear[selectedYear] ?? [];
  const maxMonthCount = Math.max(...monthData.map((m) => m.count), 1);
  const maxCompCount = perUserMonthData
    ? Math.max(
        ...perUserMonthData.flatMap((u) =>
          (u.monthDataByYear[selectedYear] ?? []).map((m) => m.count)
        ),
        1
      )
    : 1;

  const isAllSelected = selectedUserIds.length === allUsers.length;
  const isOnlyMe =
    selectedUserIds.length === 1 && selectedUserIds[0] === currentUserId;
  const isMultiUser = selectedUserIds.length > 1;

  function navigate(newIds: string[]) {
    if (newIds.length === 0) return;
    let param: string;
    if (newIds.length === 1 && newIds[0] === currentUserId) {
      param = "me";
    } else if (
      newIds.length === allUsers.length &&
      allUsers.every((u) => newIds.includes(u.id))
    ) {
      param = "all";
    } else {
      param = newIds.join(",");
    }
    router.push(`/stats?users=${param}`);
  }

  function toggleUser(userId: string) {
    const newIds = selectedUserIds.includes(userId)
      ? selectedUserIds.filter((id) => id !== userId)
      : [...selectedUserIds, userId];
    if (newIds.length === 0) return;
    navigate(newIds);
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-6 max-w-xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[#D62828]">📊 Auswertung</h1>
      </div>

      {/* ── Filter ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#F7B731]/20 mb-5">
        {isAdmin ? (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate(allUsers.map((u) => u.id))}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors min-h-[36px] ${
                isAllSelected
                  ? "bg-[#D62828] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Alle
            </button>
            {allUsers.map((user) => {
              const selected = selectedUserIds.includes(user.id);
              return (
                <button
                  key={user.id}
                  onClick={() => toggleUser(user.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors min-h-[36px] ${
                    selected
                      ? "bg-[#D62828] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <span>{user.avatar}</span>
                  <span>{user.name}</span>
                  {user.id === currentUserId && (
                    <span className="opacity-70">(ich)</span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => navigate([currentUserId])}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors min-h-[40px] ${
                isOnlyMe
                  ? "bg-[#D62828] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Nur ich
            </button>
            <button
              onClick={() => navigate(allUsers.map((u) => u.id))}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors min-h-[40px] ${
                isAllSelected
                  ? "bg-[#D62828] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Gemeinsam
            </button>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <SummaryCard label="Bestes Jahr" value={bestYear} />
        <SummaryCard label="Bester Monat" value={bestMonth} />
        <SummaryCard label="Ø / Monat" value={avgPerMonth} />
      </div>

      {years.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🍕</div>
          <p className="text-gray-500 text-sm">Noch keine Daten vorhanden.</p>
        </div>
      ) : (
        <>
          {/* Jahresübersicht */}
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#F7B731]/20 mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Jahresübersicht
            </h2>
            <div className="flex flex-col gap-3">
              {yearData.map(({ year, count, countFormatted }) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`flex items-center gap-3 w-full text-left rounded-xl p-2 -mx-2 transition-colors ${
                    selectedYear === year ? "bg-[#FFF8F0]" : "hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`w-12 text-sm font-bold flex-shrink-0 ${
                      year === currentYear ? "text-[#D62828]" : "text-gray-600"
                    }`}
                  >
                    {year}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div
                      className="bg-[#D62828] h-full rounded-full transition-all"
                      style={{ width: `${(count / maxYearCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-sm font-bold text-gray-700 flex-shrink-0">
                    {countFormatted}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Monatsübersicht (combined) */}
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#F7B731]/20 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Monatsübersicht
              </h2>
              {years.length > 1 && (
                <div className="flex gap-1">
                  {years.map((y) => (
                    <button
                      key={y}
                      onClick={() => setSelectedYear(y)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors min-h-[32px] ${
                        selectedYear === y
                          ? "bg-[#D62828] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {monthData.map(({ month, label, count }) => {
                const isCurrentMonth =
                  selectedYear === currentYear && month === currentMonth;
                const isEmpty = count === 0;
                return (
                  <div
                    key={month}
                    className={`flex items-center gap-3 ${isEmpty ? "opacity-40" : ""}`}
                  >
                    <span
                      className={`w-20 text-xs font-medium flex-shrink-0 ${
                        isCurrentMonth ? "text-[#D62828] font-bold" : "text-gray-600"
                      }`}
                    >
                      {label}
                      {isCurrentMonth && (
                        <span className="ml-1 text-[10px] bg-[#D62828] text-white px-1 rounded">
                          jetzt
                        </span>
                      )}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      {count > 0 && (
                        <div
                          className={`h-full rounded-full transition-all ${
                            isCurrentMonth ? "bg-[#D62828]" : "bg-[#F7B731]"
                          }`}
                          style={{ width: `${(count / maxMonthCount) * 100}%` }}
                        />
                      )}
                    </div>
                    <span className="w-8 text-right text-xs font-bold text-gray-600 flex-shrink-0">
                      {count > 0 ? formatPizzaCount(count) : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Vergleichs-Chart – only when multiple users */}
          {isMultiUser && perUserMonthData && perUserMonthData.length > 0 && (
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#F7B731]/20 mb-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Vergleich
              </h2>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 mb-4">
                {perUserMonthData.map((u) => (
                  <div key={u.userId} className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: u.color }}
                    />
                    <span className="text-xs text-gray-600">
                      {u.avatar} {u.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bars per month */}
              <div className="flex flex-col gap-3">
                {(perUserMonthData[0].monthDataByYear[selectedYear] ?? []).map(
                  (m, monthIdx) => {
                    const hasAny = perUserMonthData.some(
                      (u) =>
                        (u.monthDataByYear[selectedYear]?.[monthIdx]?.count ?? 0) > 0
                    );
                    const isCurrentMonth =
                      selectedYear === currentYear && m.month === currentMonth;
                    return (
                      <div
                        key={m.month}
                        className={`flex items-start gap-3 ${!hasAny ? "opacity-30" : ""}`}
                      >
                        <span
                          className={`w-20 text-xs font-medium flex-shrink-0 pt-0.5 ${
                            isCurrentMonth
                              ? "text-[#D62828] font-bold"
                              : "text-gray-600"
                          }`}
                        >
                          {m.label}
                        </span>
                        <div className="flex-1 flex flex-col gap-1">
                          {perUserMonthData.map((u) => {
                            const count =
                              u.monthDataByYear[selectedYear]?.[monthIdx]?.count ?? 0;
                            return (
                              <div
                                key={u.userId}
                                className="flex items-center gap-2"
                              >
                                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                                  {count > 0 && (
                                    <div
                                      className="h-full rounded-full transition-all"
                                      style={{
                                        width: `${(count / maxCompCount) * 100}%`,
                                        backgroundColor: u.color,
                                      }}
                                    />
                                  )}
                                </div>
                                <span className="text-xs text-gray-500 w-6 text-right flex-shrink-0">
                                  {count > 0 ? formatPizzaCount(count) : ""}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </section>
          )}

          {/* Top Pizza-Sorten */}
          {topPizzaTypes.length > 0 && (
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#F7B731]/20 mb-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Top Pizza-Sorten
              </h2>
              <div className="flex flex-col gap-3">
                {topPizzaTypes.map(({ name, countFormatted, avgRating }) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className="text-xl flex-shrink-0">🍕</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {name}
                      </p>
                      {avgRating && (
                        <p className="text-xs text-gray-400">
                          Ø {"⭐".repeat(Math.round(avgRating))} (
                          {avgRating.toFixed(1)})
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-bold text-[#D62828] flex-shrink-0">
                      {countFormatted}×
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Top Orte */}
          {topLocations.length > 0 && (
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#F7B731]/20">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Top Orte
              </h2>
              <div className="flex flex-col gap-3">
                {topLocations.map(({ name, countFormatted, avgRating }) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className="text-xl flex-shrink-0">📍</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {name}
                      </p>
                      {avgRating && (
                        <p className="text-xs text-gray-400">
                          Ø {"⭐".repeat(Math.round(avgRating))} (
                          {avgRating.toFixed(1)})
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-bold text-[#D62828] flex-shrink-0">
                      {countFormatted}×
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm border border-[#F7B731]/20 text-center">
      <p className="text-[10px] text-gray-400 font-medium mb-1">{label}</p>
      <p className="text-xs font-bold text-gray-800 leading-tight break-words">{value}</p>
    </div>
  );
}
