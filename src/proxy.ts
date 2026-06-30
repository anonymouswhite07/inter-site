import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import type { UserRole } from "@/types";

const publicRoutes = ["/", "/api/auth", "/api/certificates/verify"];
const authRoutes = ["/"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* Allow public assets */
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".") 
  ) {
    return NextResponse.next();
  }

  // Fetch the authenticated session
  const session = await auth();
  const user = session?.user;

  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"));
  const isAuthRoute = authRoutes.some((route) => pathname === route);

  /* Redirect authenticated users away from the login page */
  if (isAuthRoute && user) {
    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    }
    if (user.role === "MENTOR") {
      return NextResponse.redirect(new URL("/dashboard/mentor", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard/intern", request.url));
  }

  /* Allow public routes */
  if (isPublicRoute) {
    return NextResponse.next();
  }

  /* Redirect unauthenticated users to login */
  if (!user) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = user.role as UserRole;

  /* ─── Role-Based Access Control (RBAC) Guards ─── */

  // 1. Restrict Admin routes
  if (pathname.startsWith("/dashboard/admin")) {
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      // Redirect unauthorized mentors or interns
      const redirectUrl = role === "MENTOR" ? "/dashboard/mentor" : "/dashboard/intern";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  // 2. Restrict Mentor routes
  if (pathname.startsWith("/dashboard/mentor")) {
    if (role !== "MENTOR" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/intern", request.url));
    }
  }

  // 3. Restrict Intern routes
  if (pathname.startsWith("/dashboard/intern")) {
    if (role !== "INTERN" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
      const redirectUrl = role === "MENTOR" ? "/dashboard/mentor" : "/dashboard/admin";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
