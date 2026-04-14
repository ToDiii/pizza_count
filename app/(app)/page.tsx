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

  const [user, myAgg, allAgg, lastEntry, recentEntries, allUsers] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { avatar: true, name: true } }),
    prisma.pizzaEntry.aggregate({ where: { userId }, _sum: { amount: true } }),
    prisma.pizzaEntry.aggregate({ _sum: { amount: true } }),
    prisma.pizzaEntry.findFirst({ where: { userId }, orderBy: { date: "desc" } }),
    prisma.pizzaEntry.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 5,
    }),
    prisma.user.findMany({
      select: { id: true, name: true, avatar: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // Fetch session participants for shared entries
  const sessionIds = recentEntries
    .map((e) => e.sessionId)
    .filter((s): s is string => !!s);

  const sharedEntries =
    sessionIds.length > 0
      ? await prisma.pizzaEntry.findMany({
          where: { sessionId: { in: sessionIds }, userId: { not: userId } },
          include: { user: { select: { name: true } } },
        })
      : [];

  const sessionParticipantsMap = new Map<string, string[]>();
  for (const e of sharedEntries) {
    if (!e.sessionId) continue;
    const existing = sessionParticipantsMap.get(e.sessionId) ?? [];
    if (!existing.includes(e.user.name)) {
      sessionParticipantsMap.set(e.sessionId, [...existing, e.user.name]);
    }
  }

  const myCount = myAgg._sum.amount ?? 0;
  const totalCount = allAgg._sum.amount ?? 0;
  const lastPizzaText = lastEntry ? formatRelativeDate(lastEntry.date) : "Noch keine Pizza";

  return (
    <DashboardClient
      userName={user?.name ?? session!.user.name ?? ""}
      avatar={user?.avatar ?? "🍕"}
      myCount={myCount}
      myCountFormatted={formatPizzaCount(myCount)}
      totalCount={totalCount}
      totalCountFormatted={formatPizzaCount(totalCount)}
      lastPizzaText={lastPizzaText}
      currentUserId={userId}
      users={allUsers}
      recentEntries={recentEntries.map((e) => ({
        id: e.id,
        date: formatDate(e.date),
        relDate: formatRelativeDate(e.date),
        note: e.note,
        pizzaType: e.pizzaType,
        location: e.location,
        rating: e.rating,
        amount: e.amount,
        amountFormatted: formatPizzaCount(e.amount),
        isToday: formatRelativeDate(e.date) === "Heute",
        sessionParticipants: e.sessionId
          ? (sessionParticipantsMap.get(e.sessionId) ?? [])
          : [],
      }))}
    />
  );
}
