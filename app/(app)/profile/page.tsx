import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ACHIEVEMENT_DEFINITIONS } from "@/lib/achievements";
import ProfileClient from "./ProfileClient";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default async function ProfilePage() {
  const session = await auth();
  const userId = session!.user.id;

  const [user, pizzaCount, firstEntry, achievements] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.pizzaEntry.count({ where: { userId } }),
    prisma.pizzaEntry.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.achievement.findMany({ where: { userId } }),
  ]);

  const unlockedTypes = new Set(achievements.map((a) => a.type));
  const earnedBadges = ACHIEVEMENT_DEFINITIONS.filter((d) =>
    unlockedTypes.has(d.type)
  );

  return (
    <ProfileClient
      userId={userId}
      initialName={user?.name ?? ""}
      email={user?.email ?? ""}
      role={user?.role ?? "USER"}
      pizzaCount={pizzaCount}
      firstPizzaDate={firstEntry ? formatDate(firstEntry.createdAt) : null}
      earnedBadges={earnedBadges.map((b) => ({
        emoji: b.emoji,
        name: b.name,
      }))}
    />
  );
}
