"use client";

import { useState, useTransition } from "react";
import { updateProfileAction, changePasswordAction } from "@/lib/actions";
import { Toast, useToast } from "@/components/Toast";
import { AvatarPicker } from "@/components/AvatarPicker";

interface ProfileClientProps {
  userId: string;
  initialName: string;
  initialAvatar: string;
  email: string;
  role: string;
  pizzaCountFormatted: string;
  firstPizzaDate: string | null;
  earnedBadges: { emoji: string; name: string }[];
}

export default function ProfileClient({
  initialName,
  initialAvatar,
  email,
  role,
  pizzaCountFormatted,
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
      if (result?.error) showToast(result.error, "error");
      else showToast("Name aktualisiert!", "success");
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
      if (result?.error) showToast(result.error, "error");
      else {
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

      {/* Avatar + Stats card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#F7B731]/20 mb-4">
        <div className="flex items-start gap-5">
          {/* Avatar picker */}
          <AvatarPicker currentAvatar={initialAvatar} />

          {/* Info */}
          <div className="flex-1 min-w-0 pt-1">
            <p className="font-bold text-gray-800 text-lg truncate">{initialName}</p>
            <p className="text-sm text-gray-500 truncate">{email}</p>
            <p className="text-xs text-gray-400 mt-1">
              {role === "ADMIN" ? "👑 Administrator" : "Benutzer"} · {pizzaCountFormatted} Pizzen
            </p>
            {firstPizzaDate && (
              <p className="text-xs text-gray-400 mt-1">
                🍕 Erste Pizza: <span className="font-medium">{firstPizzaDate}</span>
              </p>
            )}
          </div>
        </div>
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
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F7B731]"
            placeholder="Anzeigename"
            required
            style={{ fontSize: "16px" }}
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
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F7B731]"
            style={{ fontSize: "16px" }}
          />
          <input
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            type="password"
            placeholder="Neues Passwort (min. 6 Zeichen)"
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F7B731]"
            style={{ fontSize: "16px" }}
          />
          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            placeholder="Neues Passwort bestätigen"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F7B731]"
            style={{ fontSize: "16px" }}
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
