import NextAuth, { User } from "next-auth";
import github from "next-auth/providers/github";
import PostgresAdapter from "@auth/pg-adapter";
import { NextResponse } from "next/server";
import { db, pool } from "@/db/client";
import { sql } from "kysely";
import { Region } from "@/db/enums";

const isUserAuthorized = async (user: User, region: Region) => {
  console.log("entered isUserAuthorized", user);
  const roles = await db
    .selectFrom("user_roles")
    .where("userId", "=", sql<string>`${user.id}::uuid`)
    .where("region", "=", region)
    .compile();
  console.log("user roles", roles);

  return roles.length !== 0;
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [github],
  adapter: PostgresAdapter(pool),
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdminPanel = nextUrl.pathname.endsWith("/admin");
      if (isOnAdminPanel) {
        if (auth?.user && isLoggedIn) {
          return (
            (await isUserAuthorized(auth.user, "LA")) ||
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
