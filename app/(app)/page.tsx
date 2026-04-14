import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPizzaCount } from "@/lib/format";
import { DashboardClient } from "./DashboardClient";

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const entryDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - entryDay.getTime()) / 86400000);
  if (diffDays === 0) return "Heute";
  if (diffDays === 1) return "Gestern";
  return `Vor ${diffDays} Tagen`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [user, myAgg, allAgg, lastEntry, recentEntries] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { avatar: true, name: true } }),
    prisma.pizzaEntry.aggregate({ where: { userId }, _sum: { amount: true } }),
    prisma.pizzaEntry.aggregate({ _sum: { amount: true } }),
    prisma.pizzaEntry.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } }),
    prisma.pizzaEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const myCount = myAgg._sum.amount ?? 0;
  const totalCount = allAgg._sum.amount ?? 0;
  const lastPizzaText = lastEntry ? formatRelativeDate(lastEntry.createdAt) : "Noch keine Pizza";

  return (
    <DashboardClient
      userName={user?.name ?? session!.user.name ?? ""}
      avatar={user?.avatar ?? "🍕"}
      myCount={myCount}
      myCountFormatted={formatPizzaCount(myCount)}
      totalCount={totalCount}
      totalCountFormatted={formatPizzaCount(totalCount)}
      lastPizzaText={lastPizzaText}
      recentEntries={recentEntries.map((e) => ({
        id: e.id,
        date: formatDate(e.createdAt),
        relDate: formatRelativeDate(e.createdAt),
        note: e.note,
        pizzaType: e.pizzaType,
        location: e.location,
        rating: e.rating,
        amount: e.amount,
        amountFormatted: formatPizzaCount(e.amount),
        isToday: formatRelativeDate(e.createdAt) === "Heute",
      }))}
    />
  );
}
