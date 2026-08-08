import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import type { UserRole } from "@prisma/client";

const adminEmails = (process.env.ADMIN_EMAILS ?? "sridushiva@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      const email = user.email.toLowerCase();
      const isAdmin = adminEmails.includes(email);

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        if (isAdmin && existing.role !== "ADMIN") {
          await prisma.user.update({
            where: { id: existing.id },
            data: { role: "ADMIN" },
          });
        }
        return true;
      }

      await prisma.user.create({
        data: {
          email,
          name: user.name,
          image: user.image,
          role: isAdmin ? "ADMIN" : "LEARNER",
        },
      });

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.onboardingStep = dbUser.onboardingStep;
          token.welcomeSeen = dbUser.welcomeSeen;
        }
      }

      if (trigger === "update" && session) {
        token.onboardingStep = session.onboardingStep;
        token.welcomeSeen = session.welcomeSeen;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.onboardingStep = token.onboardingStep as string;
        session.user.welcomeSeen = token.welcomeSeen as boolean;
      }
      return session;
    },
  },
};

export function getSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user?.id) return null;

  return prisma.user.findUnique({
    where: { id: session.user.id },
    include: { apiKeys: true },
  });
}

export function isAdmin(role: UserRole | string) {
  return role === "ADMIN";
}
