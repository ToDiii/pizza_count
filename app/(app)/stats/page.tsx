import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPizzaCount } from "@/lib/format";
import StatsClient from "./StatsClient";

const MONTH_NAMES = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

export default async function StatsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [entries, pizzaTypeGroups, locationGroups] = await Promise.all([
    prisma.pizzaEntry.findMany({
      where: { userId },
      select: { createdAt: true, amount: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.pizzaEntry.groupBy({
      by: ["pizzaType"],
      where: { userId, pizzaType: { not: null } },
      _sum: { amount: true },
      _avg: { rating: true },
      orderBy: { _sum: { amount: "desc" } },
    }),
    prisma.pizzaEntry.groupBy({
      by: ["location"],
      where: { userId, location: { not: null } },
      _sum: { amount: true },
      _avg: { rating: true },
      orderBy: { _sum: { amount: "desc" } },
    }),
  ]);

  // Group by year and month, summing amounts
  const byYearMonth: Record<number, Record<number, number>> = {};
  for (const entry of entries) {
    const year = entry.createdAt.getFullYear();
    const month = entry.createdAt.getMonth();
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

  // Top pizza types
  const topPizzaTypes = pizzaTypeGroups.map((g) => ({
    name: g.pizzaType!,
    count: g._sum.amount ?? 0,
    countFormatted: formatPizzaCount(g._sum.amount ?? 0),
    avgRating: g._avg.rating ?? null,
  }));

  // Top locations
  const topLocations = locationGroups.map((g) => ({
    name: g.location!,
    count: g._sum.amount ?? 0,
    countFormatted: formatPizzaCount(g._sum.amount ?? 0),
    avgRating: g._avg.rating ?? null,
  }));

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

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
      currentYear={currentYear}
      currentMonth={currentMonth}
      topPizzaTypes={topPizzaTypes}
      topLocations={topLocations}
    />
  );
}
