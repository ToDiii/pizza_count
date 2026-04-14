"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AddPizzaButton } from "@/components/AddPizzaButton";
import { Toast, useToast } from "@/components/Toast";
import { deletePizzaEntryAction } from "@/lib/actions";

interface RecentEntry {
  id: string;
  date: string;
  relDate: string;
  note: string | null;
  pizzaType: string | null;
  location: string | null;
  rating: number | null;
  amount: number;
  amountFormatted: string;
  isToday: boolean;
  sessionParticipants: string[];
}

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface DashboardClientProps {
  userName: string;
  avatar: string;
  myCount: number;
  myCountFormatted: string;
  totalCount: number;
  totalCountFormatted: string;
  lastPizzaText: string;
  currentUserId: string;
  users: User[];
  recentEntries: RecentEntry[];
}

export function DashboardClient({
  userName,
  avatar,
  myCountFormatted,
  totalCountFormatted,
  myCount,
  totalCount,
  lastPizzaText,
  currentUserId,
  users,
  recentEntries,
}: DashboardClientProps) {
  const router = useRouter();
  const [localMyFormatted, setLocalMyFormatted] = useState(myCountFormatted);
  const [localTotalFormatted, setLocalTotalFormatted] = useState(totalCountFormatted);
  const [localMyCount, setLocalMyCount] = useState(myCount);
  const [localTotalCount, setLocalTotalCount] = useState(totalCount);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isPendingDelete, startDeleteTransition] = useTransition();
  const { toast, showToast, hideToast } = useToast();

  function formatCount(n: number): string {
    const whole = Math.floor(n);
    const isHalf = n - whole >= 0.25;
    if (!isHalf) return String(whole);
    if (whole === 0) return "½";
    return `${whole}½`;
  }

  function handleSuccess(amount: number) {
    const newMy = localMyCount + amount;
    const newTotal = localTotalCount + amount;
    setLocalMyCount(newMy);
    setLocalTotalCount(newTotal);
    setLocalMyFormatted(formatCount(newMy));
    setLocalTotalFormatted(formatCount(newTotal));
    router.refresh();
  }

  function handleDeleteConfirm(entryId: string) {
    startDeleteTransition(async () => {
      const result = await deletePizzaEntryAction(entryId);
      if (result?.error) {
        showToast(result.error, "error");
      } else {
        showToast("Eintrag gelöscht.", "success");
        router.refresh();
      }
      setDeleteConfirmId(null);
    });
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-6 max-w-xl mx-auto">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <span className="text-4xl">{avatar}</span>
        <div>
          <p className="text-gray-500 text-sm">Willkommen zurück,</p>
          <h1 className="text-2xl font-bold text-[#D62828]">{userName}</h1>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#F7B731]/20">
          <p className="text-xs text-gray-500 font-medium mb-1">Meine Pizzen</p>
          <p className="text-4xl font-black text-[#D62828]">{localMyFormatted}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#F7B731]/20">
          <p className="text-xs text-gray-500 font-medium mb-1">Gesamt alle</p>
          <p className="text-4xl font-black text-[#F7B731]">{localTotalFormatted}</p>
        </div>
      </div>

      {/* Last pizza */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#F7B731]/20 mb-6 flex items-center gap-3">
        <span className="text-2xl">🕐</span>
        <div>
          <p className="text-xs text-gray-500 font-medium">Letzte Pizza</p>
          <p className={`font-bold ${lastPizzaText === "Heute" ? "text-green-600" : "text-gray-800"}`}>
            {lastPizzaText}
          </p>
        </div>
      </div>

      {/* Add pizza button */}
      <div className="flex justify-center mb-8">
        <AddPizzaButton
          users={users}
          currentUserId={currentUserId}
          onSuccess={handleSuccess}
        />
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
                <div className="text-xl mt-0.5 flex-shrink-0">
                  {entry.rating ? "⭐".repeat(entry.rating) : "🍕"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs text-gray-400">{entry.date}</p>
                    {entry.amountFormatted !== "1" && (
                      <span className="text-xs bg-[#D62828]/10 text-[#D62828] px-1.5 py-0.5 rounded-full font-semibold">
                        ×{entry.amountFormatted}
                      </span>
                    )}
                    {entry.isToday && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        Heute
                      </span>
                    )}
                  </div>
                  {entry.pizzaType && (
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{entry.pizzaType}</p>
                  )}
                  {entry.sessionParticipants.length > 0 && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      mit {entry.sessionParticipants.join(", ")}
                    </p>
                  )}
                  {entry.location && (
                    <p className="text-xs text-gray-500">📍 {entry.location}</p>
                  )}
                  {entry.note && (
                    <p className="text-xs text-gray-500 mt-0.5 italic truncate">"{entry.note}"</p>
                  )}
                </div>

                <button
                  onClick={() => setDeleteConfirmId(entry.id)}
                  className="p-1.5 text-gray-300 hover:text-[#D62828] hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center"
                  title="Eintrag löschen"
                >
                  🗑️
                </button>
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

      {/* Delete confirmation */}
      {deleteConfirmId && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setDeleteConfirmId(null)}
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl p-6 max-w-sm mx-auto shadow-xl">
            <div className="text-center">
              <div className="text-4xl mb-3">🗑️</div>
              <h3 className="font-bold text-gray-800 mb-2">Eintrag löschen?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 min-h-[48px]"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => handleDeleteConfirm(deleteConfirmId)}
                  disabled={isPendingDelete}
                  className="flex-1 py-3 bg-[#D62828] text-white rounded-xl font-semibold text-sm hover:bg-[#b82020] disabled:opacity-60 min-h-[48px]"
                >
                  {isPendingDelete ? "..." : "Ja, löschen"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
