import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Navigation } from "@/components/Navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isAdmin = (session.user as { role?: string }).role === "ADMIN";

  return (
    <div className="flex min-h-screen">
      <Navigation isAdmin={isAdmin} />
      <main className="flex-1 md:ml-56 pb-16 md:pb-0">
        {children}
      </main>
    </div>
  );
}
