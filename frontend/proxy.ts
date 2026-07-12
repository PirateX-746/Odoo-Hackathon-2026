import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_TOKEN_KEY, ROUTES } from "@/libs/constant";

const PUBLIC_ROUTES = [ROUTES.LOGIN];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Presence-only check (no signature/expiry verification here — that's the
  // backend's job on each request); an expired token still redirects
  // correctly once the client-side AuthProvider fails its refresh attempt.
  const hasSession = Boolean(request.cookies.get(ACCESS_TOKEN_KEY)?.value);
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  if (!hasSession && !isPublicRoute) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isPublicRoute) {
    return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
