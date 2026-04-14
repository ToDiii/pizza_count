import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatPizzaCount } from "@/lib/format";
import AdminClient from "./AdminClient";

const ENTRIES_PER_PAGE = 20;

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const session = await auth();
  const currentUserId = session!.user.id;

  const me = await prisma.user.findUnique({ where: { id: currentUserId } });
  if (me?.role !== "ADMIN") redirect("/");

  const params = await searchParams;
  const page = Math.max(1, Number(params?.page ?? 1));
  const skip = (page - 1) * ENTRIES_PER_PAGE;

  const [users, entries, totalEntries] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { pizzaEntries: true } },
      },
    }),
    prisma.pizzaEntry.findMany({
      skip,
      take: ENTRIES_PER_PAGE,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, avatar: true } } },
    }),
    prisma.pizzaEntry.count(),
  ]);

  const totalPages = Math.ceil(totalEntries / ENTRIES_PER_PAGE);

  return (
    <AdminClient
      currentUserId={currentUserId}
      users={users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        pizzaCount: u._count.pizzaEntries,
        createdAt: new Intl.DateTimeFormat("de-DE").format(u.createdAt),
      }))}
      entries={entries.map((e) => ({
        id: e.id,
        createdAt: new Intl.DateTimeFormat("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(e.createdAt),
        userName: e.user.name,
        userAvatar: e.user.avatar,
        amount: e.amount,
        amountFormatted: formatPizzaCount(e.amount),
        pizzaType: e.pizzaType,
        location: e.location,
        rating: e.rating,
        note: e.note,
      }))}
      currentPage={page}
      totalPages={totalPages}
      totalEntries={totalEntries}
    />
  );
}
