import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  getClientIp,
  isLoginLocked,
  recentFailureCount,
  recordLoginAttempt,
  slowDownOnFailure,
} from "@/lib/brute-force";

class LockedError extends CredentialsSignin {
  code = "LOCKED";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials) {
        const emailRaw = (credentials?.email as string | undefined) ?? "";
        const password = (credentials?.password as string | undefined) ?? "";
        const email = emailRaw.trim().toLowerCase();
        if (!email || !password) return null;

        const ip = await getClientIp();

        // Lockout-Check vor bcrypt (verhindert CPU-Verbrennung bei Flood)
        if (await isLoginLocked(email, ip)) {
          console.log(
            `auth.locked email=${email} ip=${ip} ts=${new Date().toISOString()}`
          );
          await recordLoginAttempt(email, ip, false);
          throw new LockedError();
        }

        const user = await prisma.user.findUnique({ where: { email } });

        // Immer bcrypt ausführen, damit Timing keine User-Enumeration erlaubt
        const dummyHash =
          "$2a$12$CwTycUXWue0Thq9StjUM0uJ8d3v5GqFhLsp1kqHvBZpQnYlpQvMiu";
        const passwordMatch = user
          ? await bcrypt.compare(password, user.passwordHash)
          : await bcrypt.compare(password, dummyHash);

        if (!user || !passwordMatch) {
          await recordLoginAttempt(email, ip, false);
          const fails = await recentFailureCount(email);
          await slowDownOnFailure(fails);
          return null;
        }

        await recordLoginAttempt(email, ip, true);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
