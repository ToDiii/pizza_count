import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPizzaCount } from "@/lib/format";
import StatsClient from "./StatsClient";

const MONTH_NAMES = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

// Deterministic colors per user position
const USER_COLORS = ["#D62828", "#F7B731", "#4CAF50", "#2196F3", "#9C27B0", "#FF9800"];

export default async function StatsPage({
  searchParams,
}: {
  searchParams?: Promise<{ users?: string }>;
}) {
  const session = await auth();
  const currentUserId = session!.user.id;

  const [currentUser, allUsers] = await Promise.all([
    prisma.user.findUnique({ where: { id: currentUserId }, select: { role: true } }),
    prisma.user.findMany({
      select: { id: true, name: true, avatar: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const isAdmin = currentUser?.role === "ADMIN";
  const params = await searchParams;
  const usersParam = params?.users;

  // Parse selected user IDs from URL
  let selectedUserIds: string[];
  if (!usersParam || usersParam === "me") {
    selectedUserIds = [currentUserId];
  } else if (usersParam === "all") {
    selectedUserIds = allUsers.map((u) => u.id);
  } else {
    const requested = usersParam
      .split(",")
      .filter((id) => allUsers.some((u) => u.id === id));
    selectedUserIds = requested.length > 0 ? requested : [currentUserId];
  }

  // Enforce permissions: standard users can only see "just me" or "everyone"
  if (!isAdmin) {
    const isAll = selectedUserIds.length === allUsers.length;
    const isSelf = selectedUserIds.length === 1 && selectedUserIds[0] === currentUserId;
    if (!isAll && !isSelf) selectedUserIds = [currentUserId];
  }

  const [entries, pizzaTypeGroups, locationGroups] = await Promise.all([
    prisma.pizzaEntry.findMany({
      where: { userId: { in: selectedUserIds } },
      select: { date: true, amount: true, userId: true },
      orderBy: { date: "asc" },
    }),
    prisma.pizzaEntry.groupBy({
      by: ["pizzaType"],
      where: { userId: { in: selectedUserIds }, pizzaType: { not: null } },
      _sum: { amount: true },
      _avg: { rating: true },
      orderBy: { _sum: { amount: "desc" } },
    }),
    prisma.pizzaEntry.groupBy({
      by: ["location"],
      where: { userId: { in: selectedUserIds }, location: { not: null } },
      _sum: { amount: true },
      _avg: { rating: true },
      orderBy: { _sum: { amount: "desc" } },
    }),
  ]);

  // Combined year/month aggregation
  const byYearMonth: Record<number, Record<number, number>> = {};
  for (const entry of entries) {
    const year = entry.date.getFullYear();
    const month = entry.date.getMonth();
    if (!byYearMonth[year]) byYearMonth[year] = {};
    byYearMonth[year][month] = (byYearMonth[year][month] ?? 0) + entry.amount;
  }

  const years = Object.keys(byYearMonth).map(Number).sort((a, b) => a - b);

  const yearData = years.map((year) => ({
    year,
    count: Object.values(byYearMonth[year]).reduce((s, n) => s + n, 0),
  }));

  const monthDataByYear: Record<number, { month: number; label: string; count: number }[]> = {};
  for (const year of years) {
    monthDataByYear[year] = MONTH_NAMES.map((label, i) => ({
      month: i,
      label,
      count: byYearMonth[year][i] ?? 0,
    }));
  }

  // Summary cards
  const bestYear = yearData.reduce(
    (best, y) => (y.count > best.count ? y : best),
    { year: 0, count: 0 }
  );

  let bestMonthLabel = "–";
  let bestMonthCount = 0;
  for (const year of years) {
    for (const m of monthDataByYear[year]) {
      if (m.count > bestMonthCount) {
        bestMonthCount = m.count;
        bestMonthLabel = `${m.label} ${year}`;
      }
    }
  }

  const monthsWithEntries = years.flatMap((y) =>
    monthDataByYear[y].filter((m) => m.count > 0)
  );
  const avgPerMonth =
    monthsWithEntries.length > 0
      ? formatPizzaCount(
          monthsWithEntries.reduce((s, m) => s + m.count, 0) / monthsWithEntries.length
        )
      : "0";

  const topPizzaTypes = pizzaTypeGroups.map((g) => ({
    name: g.pizzaType!,
    count: g._sum.amount ?? 0,
    countFormatted: formatPizzaCount(g._sum.amount ?? 0),
    avgRating: g._avg.rating ?? null,
  }));

  const topLocations = locationGroups.map((g) => ({
    name: g.location!,
    count: g._sum.amount ?? 0,
    countFormatted: formatPizzaCount(g._sum.amount ?? 0),
    avgRating: g._avg.rating ?? null,
  }));

  // Per-user monthly data for comparison chart (only when multiple users selected)
  const perUserMonthData =
    selectedUserIds.length > 1
      ? selectedUserIds.map((uid, idx) => {
          const user = allUsers.find((u) => u.id === uid)!;
          const userByYearMonth: Record<number, Record<number, number>> = {};
          for (const entry of entries.filter((e) => e.userId === uid)) {
            const year = entry.date.getFullYear();
            const month = entry.date.getMonth();
            if (!userByYearMonth[year]) userByYearMonth[year] = {};
            userByYearMonth[year][month] =
              (userByYearMonth[year][month] ?? 0) + entry.amount;
          }
          const userMonthDataByYear: Record<
            number,
            { month: number; label: string; count: number }[]
          > = {};
          for (const year of years) {
            userMonthDataByYear[year] = MONTH_NAMES.map((label, i) => ({
              month: i,
              label,
              count: userByYearMonth[year]?.[i] ?? 0,
            }));
          }
          return {
            userId: uid,
            name: user.name,
            avatar: user.avatar,
            color: USER_COLORS[idx % USER_COLORS.length],
            monthDataByYear: userMonthDataByYear,
          };
        })
      : undefined;

  return (
    <StatsClient
      yearData={yearData.map((y) => ({
        ...y,
        countFormatted: formatPizzaCount(y.count),
      }))}
      monthDataByYear={monthDataByYear}
      years={years}
      bestYear={bestYear.count > 0 ? `${bestYear.year} (${formatPizzaCount(bestYear.count)} 🍕)` : "–"}
      bestMonth={bestMonthCount > 0 ? `${bestMonthLabel} (${formatPizzaCount(bestMonthCount)} 🍕)` : "–"}
      avgPerMonth={avgPerMonth}
      currentYear={new Date().getFullYear()}
      currentMonth={new Date().getMonth()}
      topPizzaTypes={topPizzaTypes}
      topLocations={topLocations}
      allUsers={allUsers}
      selectedUserIds={selectedUserIds}
      currentUserId={currentUserId}
      isAdmin={isAdmin}
      perUserMonthData={perUserMonthData}
    />
  );
}
