import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    // 🟢 Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: { params: { prompt: "select_account" } },
    }),

    // 🔵 Credentials Provider
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return NextResponse.json(
              { error: "Email and password are required" },
              { status: 400 }
            ) as any;
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.password) {
            return NextResponse.json(
              { error: "User not found or password missing" },
              { status: 404 }
            ) as any;
          }

          const valid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!valid) {
            return NextResponse.json(
              { error: "Invalid password" },
              { status: 401 }
            ) as any;
          }

          return user;
        } catch (err) {
          console.error("Authorize Error:", err);
          return NextResponse.json(
            { error: "Something went wrong during authentication" },
            { status: 500 }
          ) as any;
        }
      },
    }),
  ],

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/signin" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token) (session.user as any).id = token.id;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
