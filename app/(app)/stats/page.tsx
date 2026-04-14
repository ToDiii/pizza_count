import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import StatsClient from "./StatsClient";

const MONTH_NAMES = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

export default async function StatsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const entries = await prisma.pizzaEntry.findMany({
    where: { userId },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Group by year and month
  const byYearMonth: Record<number, Record<number, number>> = {};

  for (const entry of entries) {
    const year = entry.createdAt.getFullYear();
    const month = entry.createdAt.getMonth(); // 0-indexed
    if (!byYearMonth[year]) byYearMonth[year] = {};
    byYearMonth[year][month] = (byYearMonth[year][month] ?? 0) + 1;
  }

  const years = Object.keys(byYearMonth)
    .map(Number)
    .sort((a, b) => a - b);

  // Build year summary
  const yearData = years.map((year) => ({
    year,
    count: Object.values(byYearMonth[year]).reduce((s, n) => s + n, 0),
  }));

  // Build month data for each year (all 12 months, 0 for empty)
  const monthDataByYear: Record<
    number,
    { month: number; label: string; count: number }[]
  > = {};
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
      ? (
          monthsWithEntries.reduce((s, m) => s + m.count, 0) /
          monthsWithEntries.length
        ).toFixed(1)
      : "0";

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  return (
    <StatsClient
      yearData={yearData}
      monthDataByYear={monthDataByYear}
      years={years}
      bestYear={bestYear.count > 0 ? `${bestYear.year} (${bestYear.count} 🍕)` : "–"}
      bestMonth={bestMonthCount > 0 ? `${bestMonthLabel} (${bestMonthCount} 🍕)` : "–"}
      avgPerMonth={avgPerMonth}
      currentYear={currentYear}
      currentMonth={currentMonth}
    />
  );
}
