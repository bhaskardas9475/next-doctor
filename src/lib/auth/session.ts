import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const cookieName = "next-doctor-session";
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "development-only-secret-change-me",
);

export async function createSession(email: string) {
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function getSession() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  try {
    const result = await jwtVerify<{ email: string }>(token, secret);
    return result.payload;
  } catch {
    return null;
  }
}

export async function clearSession() {
  (await cookies()).delete(cookieName);
}

export { cookieName, secret };
