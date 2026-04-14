import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default async function LeaderboardPage() {
  const session = await auth();

  // Get all users with their pizza counts and last entry
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      _count: { select: { pizzaEntries: true } },
      pizzaEntries: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
    orderBy: {
      pizzaEntries: { _count: "desc" },
    },
  });

  const ranked = users.map((u, index) => ({
    rank: index + 1,
    id: u.id,
    name: u.name,
    count: u._count.pizzaEntries,
    lastEntry: u.pizzaEntries[0]?.createdAt ?? null,
    isMe: u.id === session!.user.id,
  }));

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-6 max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#D62828]">🏆 Rangliste</h1>
        <p className="text-gray-500 text-sm mt-1">Wer hat mehr Pizzen gegessen?</p>
      </div>

      {ranked.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🍕</div>
          <p className="text-gray-500">Noch keine Einträge.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {ranked.map((user) => (
            <div
              key={user.id}
              className={`bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-4 transition-all ${
                user.isMe
                  ? "border-[#D62828] ring-2 ring-[#D62828]/20"
                  : "border-[#F7B731]/20"
              }`}
            >
              {/* Rank */}
              <div className="w-10 text-center flex-shrink-0">
                {user.rank <= 3 ? (
                  <span className="text-2xl">{medals[user.rank - 1]}</span>
                ) : (
                  <span className="text-lg font-bold text-gray-400">
                    #{user.rank}
                  </span>
                )}
              </div>

              {/* Name & last entry */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-800 truncate">
                    {user.name}
                  </p>
                  {user.isMe && (
                    <span className="text-xs bg-[#D62828] text-white px-2 py-0.5 rounded-full flex-shrink-0">
                      Du
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {user.lastEntry
                    ? `Zuletzt: ${formatDate(user.lastEntry)}`
                    : "Noch keine Pizza"}
                </p>
              </div>

              {/* Count */}
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-black text-[#D62828]">
                  {user.count}
                </p>
                <p className="text-xs text-gray-400">Pizzen</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
