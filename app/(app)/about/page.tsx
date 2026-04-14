import { APP_VERSION } from "@/lib/version";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-6 max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#D62828]">ℹ️ Über die App</h1>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#F7B731]/20 text-center">
        <div className="text-7xl mb-4">🍕</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Pizza Count</h2>
        <p className="text-sm text-gray-400 mb-5">Version {APP_VERSION}</p>
        <p className="text-gray-600 text-sm leading-relaxed mb-8">
          Trackt jede gemeinsam gegessene Pizza.
          <br />
          Weil jede Pizza zählt.
        </p>
        <p className="text-gray-500 text-sm">Made with 🍕 by Max</p>
      </div>
    </div>
  );
}
