import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const session = await auth();
  const currentUserId = session!.user.id;

  // Check admin role from DB
  const me = await prisma.user.findUnique({ where: { id: currentUserId } });
  if (me?.role !== "ADMIN") {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { pizzaEntries: true } },
    },
  });

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
    />
  );
}
