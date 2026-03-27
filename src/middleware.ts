import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/gate", "/api/auth", "/api/gate", "/_next", "/favicon.ico", "/icon.svg"];
const AUTH_PATHS = ["/login", "/signup"];
const ADMIN_PATHS = ["/admin"];
const GUEST_PATHS = ["/dashboard", "/products", "/api/products", "/api/reviews", "/api/settings", "/api/upload"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // GATE TOGGLE: To re-enable the gate page, uncomment the 4 lines below
  // const gateCookie = request.cookies.get("site_gate");
  // const isGateValid = gateCookie?.value === process.env.SITE_PASSWORD_HASH;
  // if (!isGateValid) {
  //   return NextResponse.redirect(new URL("/gate", request.url));
  // }

  // Redirect root to dashboard
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Refresh Supabase session
  const { user, supabaseResponse } = await updateSession(request);

  // Auth pages: redirect to dashboard if already logged in
  if (AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return supabaseResponse;
  }

  // Guest paths: allow everyone
  if (GUEST_PATHS.some((p) => pathname.startsWith(p))) {
    return supabaseResponse;
  }

  // All other pages require login
  if (!user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Admin paths: check role via profile query
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    // Role check happens at the page/API level, not middleware
    // Middleware just ensures user is authenticated
    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
