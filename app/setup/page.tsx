import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import SetupForm from "./SetupForm";

export default async function SetupPage() {
  const count = await prisma.user.count();
  if (count > 0) {
    notFound();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-3">🍕</div>
          <h1 className="text-3xl font-bold text-[#D62828]">Pizza Count</h1>
          <p className="text-gray-500 mt-1 text-sm">Erstmalige Einrichtung</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-md p-8 border border-[#F7B731]/20">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Admin-Account erstellen</h2>
          <p className="text-sm text-gray-500 mb-6">
            Dieser Bereich ist nur einmalig erreichbar.
          </p>
          <SetupForm />
        </div>
      </div>
    </div>
  );
}
