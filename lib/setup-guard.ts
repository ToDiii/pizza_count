import { prisma } from "@/lib/prisma";

/**
 * Setup is only allowed if:
 *   - SETUP_ENABLED is not explicitly "false"
 *   - AND no admin user exists yet
 *
 * Once the first admin exists the route returns 404 regardless of the flag.
 */
export async function isSetupAllowed(): Promise<boolean> {
  if (process.env.SETUP_ENABLED === "false") return false;
  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  return adminCount === 0;
}
