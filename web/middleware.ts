import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes and static files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  // If root path, redirect to /sv (Swedish is default)
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/sv", request.url));
  }

  // If pathname doesn't start with /en or /sv, redirect to /sv + pathname
  if (!pathname.startsWith("/en") && !pathname.startsWith("/sv")) {
    return NextResponse.redirect(new URL(`/sv${pathname}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

