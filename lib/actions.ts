"use server";

import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  addPizzaEntrySchema,
  adminCreateUserSchema,
  adminResetPasswordSchema,
  avatarSchema,
  changePasswordSchema,
  formatZodError,
  idSchema,
  optionNameSchema,
  setupSchema,
  updateProfileSchema,
} from "@/lib/validators";
import { isSetupAllowed } from "@/lib/setup-guard";

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    const errorMessage = (error as Error)?.message ?? "";
    if (errorMessage.includes("NEXT_REDIRECT")) throw error;
    if (errorMessage.includes("LOCKED")) {
      return { error: "Zu viele Fehlversuche. Bitte später erneut versuchen." };
    }
    return { error: "Ungültige E-Mail oder falsches Passwort." };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

// ─── Setup ───────────────────────────────────────────────────────────────────

export async function setupAction(formData: FormData) {
  if (!(await isSetupAllowed())) return { error: "Setup ist deaktiviert." };

  const parsed = setupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: formatZodError(parsed.error) };
  const { name, email, password } = parsed.data;

  // Atomic: only create if no user exists yet. Prevents setup race.
  try {
    await prisma.$transaction(async (tx) => {
      const count = await tx.user.count();
      if (count > 0) throw new Error("SETUP_ALREADY_DONE");
      const passwordHash = await bcrypt.hash(password, 12);
      await tx.user.create({ data: { name, email, passwordHash, role: "ADMIN" } });
    });
  } catch (e) {
    if ((e as Error).message === "SETUP_ALREADY_DONE") {
      return { error: "Setup bereits abgeschlossen." };
    }
    throw e;
  }

  await signIn("credentials", { email, password, redirectTo: "/" });
}

// ─── Pizza Entries ────────────────────────────────────────────────────────────

export async function addPizzaEntry(data: {
  amount: number;
  note?: string;
  pizzaType?: string;
  location?: string;
  rating?: number;
  selectedUserIds?: string[];
  date?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Nicht angemeldet." };

  const parsed = addPizzaEntrySchema.safeParse(data);
  if (!parsed.success) return { error: formatZodError(parsed.error) };
  const input = parsed.data;

  const entryDate = input.date
    ? new Date(`${input.date}T12:00:00`)
    : new Date();

  const requestedIds =
    input.selectedUserIds && input.selectedUserIds.length > 0
      ? input.selectedUserIds
      : [session.user.id];

  // Validate that all user IDs exist and include current user (or current user acts for self only)
  const users = await prisma.user.findMany({
    where: { id: { in: requestedIds } },
    select: { id: true },
  });
  if (users.length !== new Set(requestedIds).size) {
    return { error: "Ungültige Benutzerauswahl." };
  }
  const userIds = users.map((u) => u.id);
  if (!userIds.includes(session.user.id)) {
    return { error: "Eigener Account muss beteiligt sein." };
  }

  const splitAmount = input.amount / userIds.length;
  const sessionId = userIds.length > 1 ? crypto.randomUUID() : null;

  await prisma.$transaction(
    userIds.map((userId) =>
      prisma.pizzaEntry.create({
        data: {
          userId,
          amount: splitAmount,
          note: input.note?.trim() || null,
          pizzaType: input.pizzaType?.trim() || null,
          location: input.location?.trim() || null,
          rating: input.rating ?? null,
          date: entryDate,
          sessionId,
        },
      })
    )
  );

  for (const userId of userIds) {
    await checkAndUnlockAchievements(userId);
  }

  revalidatePath("/");
  revalidatePath("/leaderboard");
  revalidatePath("/achievements");
  revalidatePath("/stats");
  return { success: true };
}

export async function deletePizzaEntryAction(entryId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Nicht angemeldet." };

  const parsed = idSchema.safeParse(entryId);
  if (!parsed.success) return { error: "Ungültige ID." };

  const entry = await prisma.pizzaEntry.findUnique({ where: { id: parsed.data } });
  if (!entry) return { error: "Eintrag nicht gefunden." };
  if (entry.userId !== session.user.id) return { error: "Keine Berechtigung." };

  await prisma.pizzaEntry.delete({ where: { id: parsed.data } });

  revalidatePath("/");
  revalidatePath("/leaderboard");
  revalidatePath("/achievements");
  revalidatePath("/stats");
  return { success: true };
}

// ─── Autocomplete (legacy) ────────────────────────────────────────────────────

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

// ─── Smart Options ────────────────────────────────────────────────────────────

export async function getPizzaTypeOptions(): Promise<string[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const [allOptions, recentUsage] = await Promise.all([
    prisma.pizzaTypeOption.findMany({ orderBy: { name: "asc" } }),
    prisma.pizzaEntry.findMany({
      where: { userId: session.user.id, pizzaType: { not: null } },
      select: { pizzaType: true, date: true },
      orderBy: { date: "desc" },
    }),
  ]);

  const usageMap = new Map<string, Date>();
  for (const entry of recentUsage) {
    if (entry.pizzaType && !usageMap.has(entry.pizzaType)) {
      usageMap.set(entry.pizzaType, entry.date);
    }
  }

  return allOptions
    .map((o) => o.name)
    .sort((a, b) => {
      const aDate = usageMap.get(a);
      const bDate = usageMap.get(b);
      if (aDate && bDate) return bDate.getTime() - aDate.getTime();
      if (aDate) return -1;
      if (bDate) return 1;
      return a.localeCompare(b, "de");
    });
}

export async function getLocationOptions(): Promise<string[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const [allOptions, recentUsage] = await Promise.all([
    prisma.locationOption.findMany({ orderBy: { name: "asc" } }),
    prisma.pizzaEntry.findMany({
      where: { userId: session.user.id, location: { not: null } },
      select: { location: true, date: true },
      orderBy: { date: "desc" },
    }),
  ]);

  const usageMap = new Map<string, Date>();
  for (const entry of recentUsage) {
    if (entry.location && !usageMap.has(entry.location)) {
      usageMap.set(entry.location, entry.date);
    }
  }

  return allOptions
    .map((o) => o.name)
    .sort((a, b) => {
      const aDate = usageMap.get(a);
      const bDate = usageMap.get(b);
      if (aDate && bDate) return bDate.getTime() - aDate.getTime();
      if (aDate) return -1;
      if (bDate) return 1;
      return a.localeCompare(b, "de");
    });
}

export async function addPizzaTypeOption(name: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const parsed = optionNameSchema.safeParse(name);
  if (!parsed.success) return;
  await prisma.pizzaTypeOption.upsert({
    where: { name: parsed.data },
    update: {},
    create: { name: parsed.data, createdBy: session.user.id },
  });
  revalidatePath("/admin");
}

export async function addLocationOption(name: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const parsed = optionNameSchema.safeParse(name);
  if (!parsed.success) return;
  await prisma.locationOption.upsert({
    where: { name: parsed.data },
    update: {},
    create: { name: parsed.data, createdBy: session.user.id },
  });
  revalidatePath("/admin");
}

export async function deletePizzaTypeOption(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Nicht angemeldet." };
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { success: false, error: "Ungültige ID." };
  const option = await prisma.pizzaTypeOption.findUnique({ where: { id: parsed.data } });
  if (!option) return { success: false, error: "Nicht gefunden." };
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN" && option.createdBy !== session.user.id) {
    return { success: false, error: "Keine Berechtigung." };
  }
  await prisma.pizzaTypeOption.delete({ where: { id: parsed.data } });
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteLocationOption(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Nicht angemeldet." };
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { success: false, error: "Ungültige ID." };
  const option = await prisma.locationOption.findUnique({ where: { id: parsed.data } });
  if (!option) return { success: false, error: "Nicht gefunden." };
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN" && option.createdBy !== session.user.id) {
    return { success: false, error: "Keine Berechtigung." };
  }
  await prisma.locationOption.delete({ where: { id: parsed.data } });
  revalidatePath("/admin");
  return { success: true };
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

  const parsed = updateProfileSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: formatZodError(parsed.error) };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name },
  });

  revalidatePath("/profile");
  revalidatePath("/leaderboard");
  revalidatePath("/");
  return { success: true };
}

export async function updateAvatarAction(avatar: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Nicht angemeldet." };

  const parsed = avatarSchema.safeParse(avatar);
  if (!parsed.success) return { error: formatZodError(parsed.error) };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatar: parsed.data },
  });

  revalidatePath("/profile");
  revalidatePath("/leaderboard");
  revalidatePath("/");
  return { success: true };
}

export async function changePasswordAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Nicht angemeldet." };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: formatZodError(parsed.error) };
  const { currentPassword, newPassword } = parsed.data;

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

  const parsed = adminCreateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") || "USER",
  });
  if (!parsed.success) return { error: formatZodError(parsed.error) };
  const { name, email, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "E-Mail wird bereits verwendet." };

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { name, email, passwordHash, role } });

  revalidatePath("/admin");
  return { success: true };
}

export async function adminResetPasswordAction(formData: FormData) {
  await requireAdmin();

  const parsed = adminResetPasswordSchema.safeParse({
    userId: formData.get("userId"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) return { error: formatZodError(parsed.error) };
  const { userId, newPassword } = parsed.data;

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  revalidatePath("/admin");
  return { success: true };
}

export async function adminDeleteUserAction(formData: FormData) {
  const session = await requireAdmin();
  const parsed = idSchema.safeParse(formData.get("userId"));
  if (!parsed.success) return { error: "Ungültige ID." };
  const userId = parsed.data;

  if (userId === session.user.id) return { error: "Du kannst dich nicht selbst löschen." };

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/admin");
  return { success: true };
}

export async function adminDeleteEntryAction(
  entryId: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  const parsed = idSchema.safeParse(entryId);
  if (!parsed.success) return { success: false, error: "Ungültige ID." };
  await prisma.pizzaEntry.delete({ where: { id: parsed.data } });
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/leaderboard");
  return { success: true };
}
