"use client";

import { useState, useTransition } from "react";
import { updateProfileAction, changePasswordAction } from "@/lib/actions";
import { Toast, useToast } from "@/components/Toast";

interface ProfileClientProps {
  userId: string;
  initialName: string;
  email: string;
  role: string;
  pizzaCount: number;
  firstPizzaDate: string | null;
  earnedBadges: { emoji: string; name: string }[];
}

export default function ProfileClient({
  initialName,
  email,
  role,
  pizzaCount,
  firstPizzaDate,
  earnedBadges,
}: ProfileClientProps) {
  const [name, setName] = useState(initialName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPendingName, startNameTransition] = useTransition();
  const [isPendingPw, startPwTransition] = useTransition();
  const { toast, showToast, hideToast } = useToast();

  function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.set("name", name);
    startNameTransition(async () => {
      const result = await updateProfileAction(formData);
      if (result?.error) {
        showToast(result.error, "error");
      } else {
        showToast("Name aktualisiert!", "success");
      }
    });
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.set("currentPassword", currentPassword);
    formData.set("newPassword", newPassword);
    formData.set("confirmPassword", confirmPassword);
    startPwTransition(async () => {
      const result = await changePasswordAction(formData);
      if (result?.error) {
        showToast(result.error, "error");
      } else {
        showToast("Passwort geändert!", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-6 max-w-xl mx-auto">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#D62828]">👤 Mein Profil</h1>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#F7B731]/20 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#D62828] flex items-center justify-center text-2xl">
            🍕
          </div>
          <div>
            <p className="font-bold text-gray-800 text-lg">{initialName}</p>
            <p className="text-sm text-gray-500">{email}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {role === "ADMIN" ? "👑 Administrator" : "Benutzer"} · {pizzaCount} Pizzen
            </p>
          </div>
        </div>

        {firstPizzaDate && (
          <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
            🍕 Erste Pizza: <span className="font-medium text-gray-700">{firstPizzaDate}</span>
          </div>
        )}
      </div>

      {/* Badges */}
      {earnedBadges.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#F7B731]/20 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
            Meine Abzeichen
          </h2>
          <div className="flex flex-wrap gap-2">
            {earnedBadges.map((badge) => (
              <div
                key={badge.name}
                className="flex items-center gap-1.5 bg-[#FFF8F0] border border-[#F7B731]/40 px-3 py-1.5 rounded-xl text-sm"
              >
                <span>{badge.emoji}</span>
                <span className="text-gray-700 font-medium">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit name */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#F7B731]/20 mb-4">
        <h2 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">
          Name ändern
        </h2>
        <form onSubmit={handleNameSubmit} className="flex gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F7B731] text-sm"
            placeholder="Anzeigename"
            required
          />
          <button
            type="submit"
            disabled={isPendingName}
            className="px-4 py-3 bg-[#D62828] text-white rounded-xl text-sm font-semibold hover:bg-[#b82020] transition-colors disabled:opacity-60 min-h-[48px]"
          >
            {isPendingName ? "..." : "Speichern"}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#F7B731]/20">
        <h2 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">
          Passwort ändern
        </h2>
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
          <input
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            type="password"
            placeholder="Aktuelles Passwort"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F7B731] text-sm"
          />
          <input
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            type="password"
            placeholder="Neues Passwort (min. 6 Zeichen)"
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F7B731] text-sm"
          />
          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            placeholder="Neues Passwort bestätigen"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F7B731] text-sm"
          />
          <button
            type="submit"
            disabled={isPendingPw}
            className="w-full py-3 px-4 bg-[#D62828] text-white rounded-xl text-sm font-semibold hover:bg-[#b82020] transition-colors disabled:opacity-60 min-h-[48px]"
          >
            {isPendingPw ? "Ändern..." : "Passwort ändern"}
          </button>
        </form>
      </div>
    </div>
  );
}
