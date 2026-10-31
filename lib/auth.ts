import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = "myai_session";
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "myai-studio-dev-secret-change-me"
);

export async function createSessionToken(userId: string) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function setSessionCookie(userId: string) {
  const token = await createSessionToken(userId);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function deleteSessionCookie() {
  cookies().delete(SESSION_COOKIE);
}

export async function getSessionUserId() {
  const token = cookies().get(SESSION_COOKIE)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.userId !== "string") return null;
    return payload.userId;
  } catch {
    return null;
  }
}
