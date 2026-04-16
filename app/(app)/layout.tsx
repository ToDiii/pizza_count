import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { prisma } from "@/lib/prisma";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isAdmin = (session.user as { role?: string }).role === "ADMIN";
  const currentUserId = session.user.id;

  const users = await prisma.user.findMany({
    select: { id: true, name: true, avatar: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex min-h-screen">
      <Navigation isAdmin={isAdmin} users={users} currentUserId={currentUserId} />
      <main
        className="flex-1 min-w-0 overflow-x-hidden md:ml-56 md:pb-0"
        style={{ paddingBottom: "calc(4rem + env(safe-area-inset-bottom))" }}
      >
        {children}
      </main>
    </div>
  );
}
