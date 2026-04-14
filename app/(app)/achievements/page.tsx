import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ACHIEVEMENT_DEFINITIONS } from "@/lib/achievements";
import { formatPizzaCount } from "@/lib/format";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default async function AchievementsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [unlockedList, totalAgg] = await Promise.all([
    prisma.achievement.findMany({ where: { userId } }),
    prisma.pizzaEntry.aggregate({ where: { userId }, _sum: { amount: true } }),
  ]);

  const pizzaTotal = totalAgg._sum.amount ?? 0;
  const unlockedMap = new Map(unlockedList.map((a) => [a.type, a.unlockedAt]));

  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-6 max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#D62828]">🎖️ Abzeichen</h1>
        <p className="text-gray-500 text-sm mt-1">
          {unlockedMap.size} von {ACHIEVEMENT_DEFINITIONS.length} freigeschaltet
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#F7B731]/20 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Fortschritt</span>
          <span className="text-sm font-bold text-[#D62828]">
            {unlockedMap.size}/{ACHIEVEMENT_DEFINITIONS.length}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-[#D62828] h-3 rounded-full transition-all"
            style={{ width: `${(unlockedMap.size / ACHIEVEMENT_DEFINITIONS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ACHIEVEMENT_DEFINITIONS.map((def) => {
          const unlockedAt = unlockedMap.get(def.type);
          const isUnlocked = !!unlockedAt;
          const progress = Math.min(pizzaTotal, def.required);

          return (
            <div
              key={def.type}
              className={`bg-white rounded-2xl p-5 shadow-sm border transition-all ${
                isUnlocked
                  ? "border-[#F7B731] ring-2 ring-[#F7B731]/30"
                  : "border-gray-100 opacity-60"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`text-4xl ${isUnlocked ? "" : "grayscale"}`}>
                  {def.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800">{def.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isUnlocked ? (
                      <>Freigeschaltet am {formatDate(new Date(unlockedAt))}</>
                    ) : (
                      <>
                        {def.description} ({formatPizzaCount(progress)}/{def.required})
                      </>
                    )}
                  </p>
                  {!isUnlocked && (
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-[#F7B731] h-1.5 rounded-full transition-all"
                        style={{ width: `${(progress / def.required) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
                {isUnlocked && (
                  <span className="text-[#F7B731] text-xl flex-shrink-0">✨</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
