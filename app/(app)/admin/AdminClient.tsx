"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  adminCreateUserAction,
  adminDeleteUserAction,
  adminResetPasswordAction,
} from "@/lib/actions";
import { Toast, useToast } from "@/components/Toast";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  pizzaCount: number;
  createdAt: string;
}

interface AdminClientProps {
  currentUserId: string;
  users: UserRow[];
}

export default function AdminClient({ currentUserId, users: initialUsers }: AdminClientProps) {
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast, showToast, hideToast } = useToast();

  // Create user form state
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState("USER");

  function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.set("name", createName);
    formData.set("email", createEmail);
    formData.set("password", createPassword);
    formData.set("role", createRole);

    startTransition(async () => {
      const result = await adminCreateUserAction(formData);
      if (result?.error) {
        showToast(result.error, "error");
      } else {
        showToast("Benutzer erstellt!", "success");
        setShowCreateForm(false);
        setCreateName("");
        setCreateEmail("");
        setCreatePassword("");
        setCreateRole("USER");
        router.refresh();
      }
    });
  }

  function handleDelete(userId: string) {
    const formData = new FormData();
    formData.set("userId", userId);
    startTransition(async () => {
      const result = await adminDeleteUserAction(formData);
      if (result?.error) {
        showToast(result.error, "error");
      } else {
        showToast("Benutzer gelöscht.", "success");
        setDeleteConfirmId(null);
        router.refresh();
      }
    });
  }

  function handleResetPassword(userId: string) {
    const formData = new FormData();
    formData.set("userId", userId);
    formData.set("newPassword", resetPassword);
    startTransition(async () => {
      const result = await adminResetPasswordAction(formData);
      if (result?.error) {
        showToast(result.error, "error");
      } else {
        showToast("Passwort zurückgesetzt!", "success");
        setResetUserId(null);
        setResetPassword("");
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-6 max-w-2xl mx-auto">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#D62828]">⚙️ Admin-Panel</h1>
          <p className="text-gray-500 text-sm mt-1">Benutzerverwaltung</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-[#D62828] text-white rounded-xl text-sm font-semibold hover:bg-[#b82020] transition-colors min-h-[44px]"
        >
          + Benutzer
        </button>
      </div>

      {/* Create user form */}
      {showCreateForm && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#F7B731]/20 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">
            Neuer Benutzer
          </h2>
          <form onSubmit={handleCreateUser} className="flex flex-col gap-3">
            <input
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="Anzeigename"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F7B731] text-sm"
            />
            <input
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              type="email"
              placeholder="E-Mail"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F7B731] text-sm"
            />
            <input
              value={createPassword}
              onChange={(e) => setCreatePassword(e.target.value)}
              type="password"
              placeholder="Passwort (min. 6 Zeichen)"
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F7B731] text-sm"
            />
            <select
              value={createRole}
              onChange={(e) => setCreateRole(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F7B731] text-sm bg-white"
            >
              <option value="USER">Benutzer</option>
              <option value="ADMIN">Administrator</option>
            </select>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 min-h-[48px]"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 py-3 bg-[#D62828] text-white rounded-xl text-sm font-semibold hover:bg-[#b82020] disabled:opacity-60 min-h-[48px]"
              >
                {isPending ? "Erstellen..." : "Erstellen"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users list */}
      <div className="flex flex-col gap-3">
        {initialUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-[#F7B731]/20"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-800">{user.name}</p>
                  {user.role === "ADMIN" && (
                    <span className="text-xs bg-[#D62828] text-white px-2 py-0.5 rounded-full">
                      Admin
                    </span>
                  )}
                  {user.id === currentUserId && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      Du
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  🍕 {user.pizzaCount} Pizzen · Erstellt: {user.createdAt}
                </p>
              </div>

              {user.id !== currentUserId && (
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setResetUserId(user.id === resetUserId ? null : user.id)}
                    className="p-2 text-gray-500 hover:text-[#D62828] hover:bg-red-50 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Passwort zurücksetzen"
                  >
                    🔑
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(user.id)}
                    className="p-2 text-gray-500 hover:text-[#D62828] hover:bg-red-50 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Benutzer löschen"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>

            {/* Reset password inline */}
            {resetUserId === user.id && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex gap-3">
                <input
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  type="password"
                  placeholder="Neues Passwort"
                  minLength={6}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F7B731] text-sm"
                />
                <button
                  onClick={() => handleResetPassword(user.id)}
                  disabled={isPending || resetPassword.length < 6}
                  className="px-4 py-2.5 bg-[#D62828] text-white rounded-xl text-sm font-semibold hover:bg-[#b82020] disabled:opacity-60 min-h-[44px]"
                >
                  Setzen
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      {deleteConfirmId && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setDeleteConfirmId(null)}
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl p-6 max-w-sm mx-auto shadow-xl">
            <div className="text-center">
              <div className="text-4xl mb-3">🗑️</div>
              <h3 className="font-bold text-gray-800 mb-2">Benutzer löschen?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Diese Aktion kann nicht rückgängig gemacht werden. Alle Pizzaeinträge werden ebenfalls gelöscht.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 min-h-[48px]"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  disabled={isPending}
                  className="flex-1 py-3 bg-[#D62828] text-white rounded-xl font-semibold text-sm hover:bg-[#b82020] disabled:opacity-60 min-h-[48px]"
                >
                  {isPending ? "Löschen..." : "Löschen"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
