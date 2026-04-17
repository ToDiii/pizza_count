import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

// Konfiguration (über ENV überschreibbar)
const EMAIL_MAX_FAILS = Number(process.env.LOGIN_EMAIL_MAX_FAILS ?? 5);
const EMAIL_WINDOW_MIN = Number(process.env.LOGIN_EMAIL_WINDOW_MIN ?? 15);
const IP_MAX_FAILS = Number(process.env.LOGIN_IP_MAX_FAILS ?? 20);
const IP_WINDOW_MIN = Number(process.env.LOGIN_IP_WINDOW_MIN ?? 10);
const RETENTION_HOURS = 24;

/**
 * Ermittelt die Client-IP aus Request-Headern.
 * Bevorzugt CF-Connecting-IP (Cloudflare Tunnel), fällt auf X-Forwarded-For / X-Real-IP zurück.
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const cf = h.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xr = h.get("x-real-ip");
  if (xr) return xr.trim();
  return "unknown";
}

/**
 * Prüft, ob Login für (email, ip) gesperrt ist.
 * Lockout auf Email- UND IP-Ebene.
 */
export async function isLoginLocked(email: string, ip: string): Promise<boolean> {
  const now = Date.now();
  const emailSince = new Date(now - EMAIL_WINDOW_MIN * 60_000);
  const ipSince = new Date(now - IP_WINDOW_MIN * 60_000);

  const [emailFails, ipFails] = await Promise.all([
    prisma.loginAttempt.count({
      where: { email, success: false, createdAt: { gte: emailSince } },
    }),
    prisma.loginAttempt.count({
      where: { ip, success: false, createdAt: { gte: ipSince } },
    }),
  ]);

  return emailFails >= EMAIL_MAX_FAILS || ipFails >= IP_MAX_FAILS;
}

/**
 * Loggt einen Login-Versuch und räumt alte Einträge auf (probabilistisch).
 */
export async function recordLoginAttempt(
  email: string,
  ip: string,
  success: boolean
): Promise<void> {
  await prisma.loginAttempt.create({ data: { email, ip, success } });

  // 5 % Chance: Aufräumen alter Einträge (> RETENTION_HOURS)
  if (Math.random() < 0.05) {
    const cutoff = new Date(Date.now() - RETENTION_HOURS * 60 * 60_000);
    await prisma.loginAttempt
      .deleteMany({ where: { createdAt: { lt: cutoff } } })
      .catch(() => {});
  }
}

/**
 * Zeitkonstantes Delay zur Abschwächung von Timing-Attacks und Bot-Throughput.
 */
export async function slowDownOnFailure(failuresSoFar: number): Promise<void> {
  // exponentielles Delay, gedeckelt auf 2 s
  const base = 150;
  const delay = Math.min(base * Math.pow(2, Math.min(failuresSoFar, 4)), 2000);
  await new Promise((r) => setTimeout(r, delay));
}

export async function recentFailureCount(email: string): Promise<number> {
  const since = new Date(Date.now() - EMAIL_WINDOW_MIN * 60_000);
  return prisma.loginAttempt.count({
    where: { email, success: false, createdAt: { gte: since } },
  });
}
