import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextRequest, NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = ["/gate", "/api/auth", "/api/gate", "/_next", "/favicon.ico"];
const AUTH_PATHS = ["/login", "/signup"];
const ADMIN_PATHS = ["/admin"];
const GUEST_PATHS = ["/dashboard", "/products"];

export default auth(function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const req = request as NextRequest & { auth?: { user?: { role?: string } } | null };

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const gateCookie = request.cookies.get("site_gate");
  const isGateValid = gateCookie?.value === process.env.SITE_PASSWORD_HASH;

  if (!isGateValid) {
    return NextResponse.redirect(new URL("/gate", request.url));
  }

  // Redirect root to dashboard
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const session = req.auth;

  if (AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    if (session?.user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Allow guest access to dashboard and product pages
  if (GUEST_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // All other pages require login — redirect to dashboard (not login)
  if (!session?.user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    if (session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
