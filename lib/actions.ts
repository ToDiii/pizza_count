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
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    // Next-auth throws a redirect - that's expected on success
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
  if (count > 0) {
    return { error: "Setup bereits abgeschlossen." };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "Alle Felder sind erforderlich." };
  }

  if (password.length < 6) {
    return { error: "Passwort muss mindestens 6 Zeichen lang sein." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { name, email, passwordHash, role: "ADMIN" },
  });

  await signIn("credentials", { email, password, redirectTo: "/" });
}

// ─── Pizza Entries ────────────────────────────────────────────────────────────

export async function addPizzaEntry(note?: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Nicht angemeldet." };

  const entry = await prisma.pizzaEntry.create({
    data: {
      userId: session.user.id,
      note: note?.trim() || null,
    },
  });

  // Check and unlock achievements
  await checkAndUnlockAchievements(session.user.id);

  revalidatePath("/");
  revalidatePath("/leaderboard");
  revalidatePath("/achievements");
  return { success: true, entry };
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export async function checkAndUnlockAchievements(userId: string) {
  const count = await prisma.pizzaEntry.count({ where: { userId } });

  const milestones: { type: string; required: number }[] = [
    { type: "ERSTE_PIZZA", required: 1 },
    { type: "ZEHNER_CLUB", required: 10 },
    { type: "FUENFZIGER_CLUB", required: 50 },
    { type: "CENTURION", required: 100 },
    { type: "PIZZA_ROYALE", required: 200 },
  ];

  const newAchievements: string[] = [];

  for (const milestone of milestones) {
    if (count >= milestone.required) {
      const existing = await prisma.achievement.findUnique({
        where: { userId_type: { userId, type: milestone.type } },
      });
      if (!existing) {
        await prisma.achievement.create({
          data: { userId, type: milestone.type },
        });
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
  return { success: true };
}

export async function changePasswordAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Nicht angemeldet." };

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (newPassword !== confirmPassword) {
    return { error: "Neue Passwörter stimmen nicht überein." };
  }

  if (newPassword.length < 6) {
    return { error: "Neues Passwort muss mindestens 6 Zeichen lang sein." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) return { error: "Benutzer nicht gefunden." };

  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match) return { error: "Aktuelles Passwort ist falsch." };

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash },
  });

  return { success: true };
}

// ─── Admin ────────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (user?.role !== "ADMIN") redirect("/");
  return session;
}

export async function adminCreateUserAction(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) || "USER";

  if (!name || !email || !password) {
    return { error: "Alle Felder sind erforderlich." };
  }

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

  if (!newPassword || newPassword.length < 6) {
    return { error: "Passwort muss mindestens 6 Zeichen lang sein." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function adminDeleteUserAction(formData: FormData) {
  const session = await requireAdmin();
  const userId = formData.get("userId") as string;

  if (userId === session.user.id) {
    return { error: "Du kannst dich nicht selbst löschen." };
  }

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/admin");
  return { success: true };
}
