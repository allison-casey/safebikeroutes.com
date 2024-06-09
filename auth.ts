import NextAuth from "next-auth";
import github from "next-auth/providers/github";
import PostgresAdapter from "@auth/pg-adapter";
import { NextResponse } from "next/server";
import { pool } from "@/db/client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [github],
  adapter: PostgresAdapter(pool),
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdminPanel = nextUrl.pathname.endsWith("/admin");
      const isAuthorized =
        isLoggedIn && auth.user?.email === "allie.jo.casey@gmail.com";
      if (isOnAdminPanel) {
        if (isLoggedIn) {
          return (
            isAuthorized ||
            NextResponse.redirect(new URL("/la", nextUrl.origin))
          );
        } else {
          return false;
        }
      }
      return true;
    },
  },
});
