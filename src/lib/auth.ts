import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import bcrypt from "bcryptjs";
import clientPromise, { getDb, COLLECTIONS } from "@/lib/mongodb";
import type { UserRole } from "@/types";

declare module "next-auth" {
  interface User {
    role?: UserRole;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role: UserRole;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: UserRole;
    id?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
    error: "/",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const db = await getDb();
        const user = await db
          .collection(COLLECTIONS.USERS)
          .findOne({ email: (credentials.email as string).toLowerCase() });

        if (!user) return null;
        if (user.deletedAt) return null;
        if (!user.isActive) return null;

        // Check if maintenance mode is enabled
        const settingsDoc = await db.collection(COLLECTIONS.SETTINGS).findOne({ key: "global_config" });
        const isMaintenance = settingsDoc?.value?.maintenanceMode === true;
        const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
        if (isMaintenance && !isAdmin) {
          throw new Error("Portal is currently undergoing system maintenance. Please try again later.");
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password as string
        );

        if (!passwordMatch) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image || null,
          role: user.role as UserRole,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as UserRole;
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
});
