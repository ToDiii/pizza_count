"use client";

import { useState, useTransition } from "react";
import { loginAction } from "@/lib/actions";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-3">🍕</div>
          <h1 className="text-3xl font-bold text-[#D62828]">Pizza Count</h1>
          <p className="text-gray-500 mt-1 text-sm">Verfolge jede gemeinsame Pizza</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-md p-8 border border-[#F7B731]/20">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Anmelden</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                E-Mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F7B731] focus:border-transparent text-sm"
                placeholder="pizza@beispiel.de"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Passwort
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F7B731] focus:border-transparent text-sm"
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
              className="w-full bg-[#D62828] hover:bg-[#b82020] text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-h-[48px]"
            >
              {isPending ? "Anmelden..." : "Anmelden"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
