import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuthenticated = !!token;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isAdminPage = pathname.startsWith("/admin");
  const isDashboardPage =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/notes") ||
    pathname.startsWith("/labs") ||
    pathname.startsWith("/sessions") ||
    pathname.startsWith("/settings");

  if (isAuthPage) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (isDashboardPage || isAdminPage) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAdminPage && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/notes",
    "/notes/:path*",
    "/labs",
    "/labs/:path*",
    "/sessions",
    "/sessions/:path*",
    "/settings",
    "/settings/:path*",
    "/admin",
    "/admin/:path*",
    "/login",
    "/signup",
  ],
};
