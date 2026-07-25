import {
  canViewAdminPage,
  canViewAnyRegionEditorPage,
} from "@/permissions";
import { auth } from "@root/auth";
import { NextResponse } from "next/server";

export const config = {
  matcher: ["/admin", "/admin/:path*", "/:region/admin"],
};

export default auth((req) => {
  const session = req.auth;
  const { pathname } = req.nextUrl;
  const origin = req.nextUrl.origin;

  if (!session?.user) {
    return NextResponse.redirect(new URL("/api/auth/signin", origin));
  }

  const isGlobalAdminPath =
    pathname === "/admin" || pathname.startsWith("/admin/");

  if (isGlobalAdminPath) {
    if (!canViewAdminPage(session)) {
      return NextResponse.redirect(new URL("/", origin));
    }
    return NextResponse.next();
  }

  // /:region/admin — region scope is enforced on the page and server actions
  if (!canViewAnyRegionEditorPage(session)) {
    return NextResponse.redirect(new URL("/", origin));
  }

  return NextResponse.next();
});
