import { auth } from "@root/auth";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export default auth((req) => {
  const isLoggedIn = !!req.auth?.user;
  const isOnAdminPanel = req.nextUrl.pathname.endsWith("/admin");
  if (isOnAdminPanel && !isLoggedIn) {
    return Response.redirect(new URL("/api/auth/signin", req.nextUrl.origin));
  }
});
