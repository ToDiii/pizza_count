"use client";

import { useState } from "react";

interface YearEntry {
  year: number;
  count: number;
}

interface MonthEntry {
  month: number;
  label: string;
  count: number;
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
}: StatsClientProps) {
  const defaultYear = years.includes(currentYear)
    ? currentYear
    : years[years.length - 1] ?? currentYear;
  const [selectedYear, setSelectedYear] = useState(defaultYear);

  const maxYearCount = Math.max(...yearData.map((y) => y.count), 1);
  const monthData = monthDataByYear[selectedYear] ?? [];
  const maxMonthCount = Math.max(...monthData.map((m) => m.count), 1);

  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-6 max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#D62828]">📊 Auswertung</h1>
        <p className="text-gray-500 text-sm mt-1">Deine Pizza-Statistiken</p>
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
              {yearData.map(({ year, count }) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`flex items-center gap-3 w-full text-left rounded-xl p-2 -mx-2 transition-colors ${
                    selectedYear === year ? "bg-[#FFF8F0]" : "hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`w-12 text-sm font-bold flex-shrink-0 ${
                      year === currentYear
                        ? "text-[#D62828]"
                        : "text-gray-600"
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
                  <span className="w-8 text-right text-sm font-bold text-gray-700 flex-shrink-0">
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Monatsübersicht */}
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#F7B731]/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Monatsübersicht
              </h2>
              {/* Year tabs */}
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
                    <span className="w-6 text-right text-xs font-bold text-gray-600 flex-shrink-0">
                      {count > 0 ? count : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
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
