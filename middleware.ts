import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "development-only-secret-change-me",
);
const cookieName = "next-doctor-session";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(cookieName)?.value;
  let authenticated = false;
  if (token) {
    try {
      await jwtVerify(token, secret);
      authenticated = true;
    } catch {
      authenticated = false;
    }
  }
  if (request.nextUrl.pathname === "/" && authenticated)
    return NextResponse.redirect(new URL("/dashboard", request.url));
  if (
    request.nextUrl.pathname !== "/" &&
    !request.nextUrl.pathname.startsWith("/api/health") &&
    !authenticated
  )
    return NextResponse.redirect(new URL("/", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
