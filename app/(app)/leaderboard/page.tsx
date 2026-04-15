import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ACHIEVEMENT_DEFINITIONS } from "@/lib/achievements";
import { LeaderboardClient } from "./LeaderboardClient";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default async function LeaderboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [users, pizzaSums, unlockedList, totalAgg] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        avatar: true,
        pizzaEntries: {
          orderBy: { date: "desc" },
          take: 1,
          select: { date: true },
        },
      },
    }),
    prisma.pizzaEntry.groupBy({
      by: ["userId"],
      _sum: { amount: true },
    }),
    prisma.achievement.findMany({ where: { userId } }),
    prisma.pizzaEntry.aggregate({ where: { userId }, _sum: { amount: true } }),
  ]);

  const sumMap = new Map(pizzaSums.map((s) => [s.userId, s._sum.amount ?? 0]));
  const pizzaTotal = totalAgg._sum.amount ?? 0;
  const unlockedMap = new Map(unlockedList.map((a) => [a.type, a.unlockedAt]));

  const ranked = users
    .map((u) => ({
      id: u.id,
      name: u.name,
      avatar: u.avatar,
      count: sumMap.get(u.id) ?? 0,
      lastEntry: u.pizzaEntries[0]?.date
        ? formatDate(u.pizzaEntries[0].date)
        : null,
      isMe: u.id === userId,
    }))
    .sort((a, b) => b.count - a.count)
    .map((u, index) => ({ ...u, rank: index + 1 }));

  const achievements = ACHIEVEMENT_DEFINITIONS.map((def) => {
    const unlockedAt = unlockedMap.get(def.type);
    return {
      type: def.type,
      emoji: def.emoji,
      name: def.name,
      description: def.description,
      required: def.required,
      isUnlocked: !!unlockedAt,
      unlockedAt: unlockedAt ? formatDate(new Date(unlockedAt)) : null,
      progress: Math.min(pizzaTotal, def.required),
    };
  });

  return (
    <LeaderboardClient
      users={ranked}
      achievements={achievements}
      totalAchievements={ACHIEVEMENT_DEFINITIONS.length}
      unlockedCount={unlockedMap.size}
    />
  );
}
