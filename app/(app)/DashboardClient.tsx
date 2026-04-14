"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AddPizzaButton } from "@/components/AddPizzaButton";

interface RecentEntry {
  id: string;
  date: string;
  note: string | null;
  isToday: boolean;
}

interface DashboardClientProps {
  userName: string;
  myCount: number;
  totalCount: number;
  lastPizzaText: string;
  recentEntries: RecentEntry[];
}

export function DashboardClient({
  userName,
  myCount,
  totalCount,
  lastPizzaText,
  recentEntries,
}: DashboardClientProps) {
  const router = useRouter();
  const [localMyCount, setLocalMyCount] = useState(myCount);
  const [localTotalCount, setLocalTotalCount] = useState(totalCount);

  function handleSuccess() {
    setLocalMyCount((c) => c + 1);
    setLocalTotalCount((c) => c + 1);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-gray-500 text-sm">Willkommen zurück,</p>
        <h1 className="text-2xl font-bold text-[#D62828]">{userName} 🍕</h1>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#F7B731]/20">
          <p className="text-xs text-gray-500 font-medium mb-1">Meine Pizzen</p>
          <p className="text-4xl font-black text-[#D62828]">{localMyCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#F7B731]/20">
          <p className="text-xs text-gray-500 font-medium mb-1">Gesamt alle</p>
          <p className="text-4xl font-black text-[#F7B731]">{localTotalCount}</p>
        </div>
      </div>

      {/* Last pizza */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#F7B731]/20 mb-6 flex items-center gap-3">
        <span className="text-2xl">🕐</span>
        <div>
          <p className="text-xs text-gray-500 font-medium">Letzte Pizza</p>
          <p
            className={`font-bold ${
              lastPizzaText === "Heute"
                ? "text-green-600"
                : "text-gray-800"
            }`}
          >
            {lastPizzaText}
          </p>
        </div>
      </div>

      {/* Add pizza button */}
      <div className="flex justify-center mb-8">
        <AddPizzaButton onSuccess={handleSuccess} />
      </div>

      {/* Recent entries */}
      {recentEntries.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
            Letzte Einträge
          </h2>
          <div className="flex flex-col gap-2">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-[#F7B731]/20 flex items-start gap-3"
              >
                <span className="text-xl mt-0.5">🍕</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">{entry.date}</p>
                  {entry.note && (
                    <p className="text-sm text-gray-700 mt-0.5 truncate">
                      {entry.note}
                    </p>
                  )}
                </div>
                {entry.isToday && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                    Heute
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {recentEntries.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">🍕</div>
          <p className="text-gray-500 text-sm">
            Noch keine Pizzen eingetragen.
            <br />
            Drück den Knopf!
          </p>
        </div>
      )}
    </div>
  );
}
