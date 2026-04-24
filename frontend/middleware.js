import { NextResponse } from "next/server";

function hasPath(pathname, prefix) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("shopflow_accessToken")?.value;
  const role = request.cookies.get("shopflow_role")?.value;

  const requiresAuth =
    hasPath(pathname, "/cart") ||
    hasPath(pathname, "/orders") ||
    hasPath(pathname, "/profile") ||
    hasPath(pathname, "/dashboard") ||
    pathname === "/products/create";

  if (!requiresAuth) {
    return NextResponse.next();
  }

  if (!accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasPath(pathname, "/dashboard/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/products", request.url));
  }

  if (hasPath(pathname, "/dashboard/seller") && role !== "ADMIN" && role !== "SELLER") {
    return NextResponse.redirect(new URL("/products", request.url));
  }

  if (pathname === "/products/create" && role !== "ADMIN" && role !== "SELLER") {
    return NextResponse.redirect(new URL("/products", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/cart/:path*",
    "/orders/:path*",
    "/profile/:path*",
    "/dashboard/:path*",
    "/products/create",
  ],
};