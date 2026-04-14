import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AddPizzaButton } from "@/components/AddPizzaButton";
import { DashboardClient } from "./DashboardClient";

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const entryDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffMs = today.getTime() - entryDay.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

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

  const [myEntries, allEntries, lastEntry] = await Promise.all([
    prisma.pizzaEntry.count({ where: { userId } }),
    prisma.pizzaEntry.count(),
    prisma.pizzaEntry.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),

  ]);

  const recentEntries = await prisma.pizzaEntry.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const lastPizzaText = lastEntry
    ? formatRelativeDate(lastEntry.createdAt)
    : "Noch keine Pizza";

  return (
    <DashboardClient
      userName={session!.user.name ?? ""}
      myCount={myEntries}
      totalCount={allEntries}
      lastPizzaText={lastPizzaText}
      recentEntries={recentEntries.map((e) => ({
        id: e.id,
        date: formatDate(e.createdAt),
        note: e.note,
        isToday: formatRelativeDate(e.createdAt) === "Heute",
      }))}
    />
  );
}
