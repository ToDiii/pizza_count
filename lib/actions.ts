"use server";

import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    const errorMessage = (error as Error)?.message ?? "";
    if (errorMessage.includes("NEXT_REDIRECT")) throw error;
    return { error: "Ungültige E-Mail oder falsches Passwort." };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

// ─── Setup ───────────────────────────────────────────────────────────────────

export async function setupAction(formData: FormData) {
  const count = await prisma.user.count();
  if (count > 0) return { error: "Setup bereits abgeschlossen." };

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) return { error: "Alle Felder sind erforderlich." };
  if (password.length < 6) return { error: "Passwort muss mindestens 6 Zeichen lang sein." };

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { name, email, passwordHash, role: "ADMIN" } });
  await signIn("credentials", { email, password, redirectTo: "/" });
}

// ─── Pizza Entries ────────────────────────────────────────────────────────────

export async function addPizzaEntry(data: {
  amount: number;
  note?: string;
  pizzaType?: string;
  location?: string;
  rating?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Nicht angemeldet." };

  const entry = await prisma.pizzaEntry.create({
    data: {
      userId: session.user.id,
      amount: data.amount,
      note: data.note?.trim() || null,
      pizzaType: data.pizzaType?.trim() || null,
      location: data.location?.trim() || null,
      rating: data.rating ?? null,
    },
  });

  await checkAndUnlockAchievements(session.user.id);

  revalidatePath("/");
  revalidatePath("/leaderboard");
  revalidatePath("/achievements");
  revalidatePath("/stats");
  return { success: true, entry };
}

export async function deletePizzaEntryAction(entryId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Nicht angemeldet." };

  const entry = await prisma.pizzaEntry.findUnique({ where: { id: entryId } });
  if (!entry) return { error: "Eintrag nicht gefunden." };
  if (entry.userId !== session.user.id) return { error: "Keine Berechtigung." };

  await prisma.pizzaEntry.delete({ where: { id: entryId } });

  revalidatePath("/");
  revalidatePath("/leaderboard");
  revalidatePath("/achievements");
  revalidatePath("/stats");
  return { success: true };
}

// ─── Autocomplete ─────────────────────────────────────────────────────────────

export async function getPizzaTypeSuggestions(): Promise<string[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const entries = await prisma.pizzaEntry.findMany({
    where: { userId: session.user.id, pizzaType: { not: null } },
    select: { pizzaType: true },
    distinct: ["pizzaType"],
    orderBy: { createdAt: "desc" },
  });
  return entries.map((e) => e.pizzaType!);
}

export async function getLocationSuggestions(): Promise<string[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const entries = await prisma.pizzaEntry.findMany({
    where: { userId: session.user.id, location: { not: null } },
    select: { location: true },
    distinct: ["location"],
    orderBy: { createdAt: "desc" },
  });
  return entries.map((e) => e.location!);
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export async function checkAndUnlockAchievements(userId: string) {
  const result = await prisma.pizzaEntry.aggregate({
    where: { userId },
    _sum: { amount: true },
  });
  const total = result._sum.amount ?? 0;

  const milestones = [
    { type: "ERSTE_PIZZA", required: 1 },
    { type: "ZEHNER_CLUB", required: 10 },
    { type: "FUENFZIGER_CLUB", required: 50 },
    { type: "CENTURION", required: 100 },
    { type: "PIZZA_ROYALE", required: 200 },
  ];

  const newAchievements: string[] = [];
  for (const milestone of milestones) {
    if (total >= milestone.required) {
      const existing = await prisma.achievement.findUnique({
        where: { userId_type: { userId, type: milestone.type } },
      });
      if (!existing) {
        await prisma.achievement.create({ data: { userId, type: milestone.type } });
        newAchievements.push(milestone.type);
      }
    }
  }
  return newAchievements;
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function updateProfileAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Nicht angemeldet." };

  const name = formData.get("name") as string;
  if (!name?.trim()) return { error: "Name darf nicht leer sein." };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: name.trim() },
  });

  revalidatePath("/profile");
  revalidatePath("/leaderboard");
  revalidatePath("/");
  return { success: true };
}

export async function updateAvatarAction(avatar: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Nicht angemeldet." };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatar },
  });

  revalidatePath("/profile");
  revalidatePath("/leaderboard");
  revalidatePath("/");
  return { success: true };
}

export async function changePasswordAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Nicht angemeldet." };

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (newPassword !== confirmPassword) return { error: "Neue Passwörter stimmen nicht überein." };
  if (newPassword.length < 6) return { error: "Neues Passwort muss mindestens 6 Zeichen lang sein." };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "Benutzer nicht gefunden." };

  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match) return { error: "Aktuelles Passwort ist falsch." };

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash } });
  return { success: true };
}

// ─── Admin ────────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") redirect("/");
  return session;
}

export async function adminCreateUserAction(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) || "USER";

  if (!name || !email || !password) return { error: "Alle Felder sind erforderlich." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "E-Mail wird bereits verwendet." };

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { name, email, passwordHash, role } });

  revalidatePath("/admin");
  return { success: true };
}

export async function adminResetPasswordAction(formData: FormData) {
  await requireAdmin();

  const userId = formData.get("userId") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!newPassword || newPassword.length < 6) return { error: "Passwort muss mindestens 6 Zeichen lang sein." };

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  revalidatePath("/admin");
  return { success: true };
}

export async function adminDeleteUserAction(formData: FormData) {
  const session = await requireAdmin();
  const userId = formData.get("userId") as string;

  if (userId === session.user.id) return { error: "Du kannst dich nicht selbst löschen." };

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/admin");
  return { success: true };
}

export async function adminDeleteEntryAction(
  entryId: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  await prisma.pizzaEntry.delete({ where: { id: entryId } });
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/leaderboard");
  return { success: true };
}
