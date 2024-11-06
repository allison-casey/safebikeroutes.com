import { db, pool } from "@/db/client";
import PostgresAdapter from "@auth/pg-adapter";
import NextAuth from "next-auth";
import github from "next-auth/providers/github";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [github],
  adapter: PostgresAdapter(pool),
  callbacks: {
    async session({ session, user }) {
      const userRoles = await db
        .selectFrom("user_roles")
        .selectAll()
        .where("userId", "=", user.id)
        .execute();

      session.user.roles = userRoles;
      return session;
    },
  },
});
