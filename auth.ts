import NextAuth from "next-auth";
import github from "next-auth/providers/github";
import { NextResponse } from "next/server";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [github],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdminPanel = nextUrl.pathname.endsWith('/admin');
      const isAuthorized = isLoggedIn && auth.user?.email === 'allie.jo.casey@gmail.com'
      if (isOnAdminPanel) {
        if (isAuthorized) {
          return true
        } else {
          return NextResponse.redirect(new URL('/la', nextUrl.origin))
        }
      }
      return true;
    },
  },
});
