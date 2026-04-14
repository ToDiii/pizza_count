"use client";

import { useState, useTransition } from "react";
import { setupAction } from "@/lib/actions";

export default function SetupForm() {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await setupAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Anzeigename
        </label>
        <input
          name="name"
          type="text"
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F7B731] text-sm"
          placeholder="Pizza-Meister"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          E-Mail
        </label>
        <input
          name="email"
          type="email"
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F7B731] text-sm"
          placeholder="admin@pizza.de"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Passwort (min. 6 Zeichen)
        </label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F7B731] text-sm"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="bg-red-50 text-[#D62828] text-sm px-4 py-3 rounded-xl border border-red-100">
          ❌ {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#D62828] hover:bg-[#b82020] text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-60 min-h-[48px]"
      >
        {isPending ? "Erstellen..." : "Admin-Account erstellen 🍕"}
      </button>
    </form>
  );
}
