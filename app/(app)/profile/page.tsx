import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ACHIEVEMENT_DEFINITIONS } from "@/lib/achievements";
import { formatPizzaCount } from "@/lib/format";
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

  const [user, pizzaAgg, firstEntry, achievements] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.pizzaEntry.aggregate({ where: { userId }, _sum: { amount: true } }),
    prisma.pizzaEntry.findFirst({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.achievement.findMany({ where: { userId } }),
  ]);

  const pizzaTotal = pizzaAgg._sum.amount ?? 0;
  const unlockedTypes = new Set(achievements.map((a) => a.type));
  const earnedBadges = ACHIEVEMENT_DEFINITIONS.filter((d) => unlockedTypes.has(d.type));

  return (
    <ProfileClient
      userId={userId}
      initialName={user?.name ?? ""}
      initialAvatar={user?.avatar ?? "🍕"}
      email={user?.email ?? ""}
      role={user?.role ?? "USER"}
      pizzaCountFormatted={formatPizzaCount(pizzaTotal)}
      firstPizzaDate={firstEntry ? formatDate(firstEntry.createdAt) : null}
      earnedBadges={earnedBadges.map((b) => ({ emoji: b.emoji, name: b.name }))}
    />
  );
}
