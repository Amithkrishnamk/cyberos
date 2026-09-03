import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { UserRole, CyberTheme } from "@/types";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid email or password");
        }

        const cleanEmail = credentials.email.toLowerCase().trim();
        const user = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });

        // Use generic error for both missing user & wrong password to prevent email enumeration
        if (!user) {
          throw new Error("Invalid email or password");
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
          theme: user.theme as CyberTheme,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.theme = (user as any).theme;
      }
      if (trigger === "update" && session) {
        if (session.theme) token.theme = session.theme;
        if (session.name) token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as UserRole;
        (session.user as any).theme = token.theme as CyberTheme;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function getAuthSession() {
  return await getServerSession(authOptions);
}
